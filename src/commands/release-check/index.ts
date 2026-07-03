import { intro } from "@clack/prompts";
import pc from "picocolors";
import { getHeader, spin } from "../../lib/terminal.ts";
import { testFtpConnection, isProjectNameAndVersionAvailable } from "../../lib/ftp.ts";
import { runBuild } from "../../lib/util.ts";
import * as git from "../../lib/git.ts";

const renderSuccess = (message: string) =>
  `${pc.gray("│")}  ${pc.green("✔")}  ${pc.bold(message)}`;
const renderError = (message: string) =>
  `${pc.gray("│")}  ${pc.red("✘")}  ${pc.bold(message)}`;

/**
 * Release checks that must pass before running an `aunty release`.
 */
export async function run(
  options: {
    skipHeader?: boolean;
    quiet?: boolean;
    projectName?: string;
    version?: string;
  } = {},
): Promise<number> {
  if (!options.skipHeader) {
    intro(getHeader(pc.dim("aunty"), "release-check", { colour: "purple" }));
  }

  const s = spin("Performing pre-release checks...");

  /** A list of string results to be printed to the console, formatted via renderSuccess, or renderError */
  const checks: string[] = [];

  // 1. Check git cleanliness and push status
  const gitAccessible = await git.isAccessible();
  const insideRepo = gitAccessible ? await git.isInsideRepo() : false;

  if (!gitAccessible) {
    checks.push(
      renderError(
        "Git is not accessible (please ensure git is installed and Xcode/licenses are accepted)",
      ),
    );
  } else if (!insideRepo) {
    checks.push(renderError("The current directory is not a git repository"));
  } else {
    // 1.1 Check for uncommitted changes
    checks.push(
      (await git.isClean())
        ? renderSuccess("Changes are all committed")
        : renderError("You have uncommitted changes"),
    );

    // 1.2 Check branch
    const branch = await git.getBranch();
    const isMain = branch === "main";
    checks.push(
      isMain
        ? renderSuccess("On the release branch (main)")
        : renderError(
            `You are on the ${pc.bold(branch)} branch (releases must be from ${pc.bold("main")})`,
          ),
    );

    // 1.3 Check remote sync
    if (await git.hasRemote()) {
      checks.push(
        !(await git.isBehindRemote())
          ? renderSuccess("Synchronised with remote branch")
          : renderError("Your local branch is behind the remote"),
      );
    } else {
      checks.push(
        renderError("Your local branch has no remote tracking branch"),
      );
    }
  }

  // 2. Check FTP connection
  s.message("Testing FTP connection...");
  const {
    success: ftpSuccess,
    error: ftpError,
    ftpClient,
  } = await testFtpConnection(5000);
  checks.push(
    ftpSuccess
      ? renderSuccess("FTP is reachable")
      : renderError(`FTP connection failed: ${ftpError}`),
  );

  // 2.1 Make sure destination folder doesn't exist
  if (ftpSuccess) {
    if (options.projectName && options.version) {
      s.message("Checking project version availability...");
      const availability = await isProjectNameAndVersionAvailable(
        options.projectName,
        options.version,
        ftpClient,
      );
      if (availability === "exists") {
        checks.push(
          renderError(
            `Project version ${pc.bold(options.version)} already exists on the FTP server`,
          ),
        );
      } else if (availability === "error") {
        checks.push(
          renderError(
            "Failed to check project version availability on the FTP server",
          ),
        );
      } else {
        checks.push(renderSuccess("Project version is available"));
      }
    }
    ftpClient?.close();
  }

  // 3. Run build check
  s.message("Running npm run build check...");
  try {
    await runBuild({ stdio: "pipe" });
    checks.push(renderSuccess("Project built successfully"));
  } catch (err: any) {
    if (err.stdout) {
      process.stdout.write(err.stdout);
    }
    if (err.stderr) {
      process.stderr.write(err.stderr);
    }
    checks.push(
      renderError(
        `Project build failed: ${err instanceof Error ? err.message : String(err)}`,
      ),
    );
  }

  // 4. Check whether any checks failed
  const haveChecksFailed = checks.some((c) => c.includes("✘"));
  if (haveChecksFailed) {
    s.cancel("Release checks failed");
  } else {
    s.stop("Release checks passed");
  }

  // 5. Print messages (except in quiet mode)
  if (haveChecksFailed || !options.quiet) {
    if (checks.length > 0) {
      console.log(`${pc.gray("│")}`);
      checks.forEach((check) => console.log(check));
      console.log(`${pc.gray("│")}`);
    }
  }

  if (haveChecksFailed) {
    return 1;
  }

  return 0;
}
