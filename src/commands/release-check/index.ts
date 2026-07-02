import { intro, outro } from "@clack/prompts";
import pc from "picocolors";
import { getHeader, spin, renderClackMoji } from "../../lib/terminal.ts";
import { testFtpConnection } from "../../lib/ftp.ts";
import { runBuild } from "../../lib/util.ts";
import * as git from "./git.ts";

/**
 * Release checks that must pass before running an `aunty release`.
 */
export async function run(): Promise<number> {
  intro(getHeader(pc.dim("aunty"), "release-check"));

  const s = spin("Performing pre-release checks...");

  interface Check {
    label: string;
    emoji: string;
    colour: "green" | "red" | "yellow" | "cyan" | "magenta" | "blue" | "gray";
  }
  const checks: Check[] = [];

  // 1. Git Prerelease Checks
  const gitAccessible = await git.isAccessible();
  const insideRepo = gitAccessible ? await git.isInsideRepo() : false;

  if (!gitAccessible) {
    checks.push({
      label: pc.bold(
        "Git is not accessible (please ensure git is installed and Xcode/licenses are accepted)",
      ),
      emoji: "✘",
      colour: "red",
    });
  } else if (!insideRepo) {
    checks.push({
      label: pc.bold("The current directory is not a git repository"),
      emoji: "✘",
      colour: "red",
    });
  } else {
    // 1.1 Check for uncommitted changes
    const isClean = await git.isClean();
    checks.push(
      isClean
        ? {
            label: pc.dim("Changes are all committed"),
            emoji: "✔",
            colour: "green",
          }
        : {
            label: pc.bold("You have uncommitted changes"),
            emoji: "✘",
            colour: "red",
          },
    );

    // 1.2 Check branch
    const branch = await git.getBranch();
    const isMain = branch === "main";
    checks.push(
      isMain
        ? {
            label: pc.dim("On the release branch (main)"),
            emoji: "✔",
            colour: "green",
          }
        : {
            label: pc.bold(
              `You are on the ${pc.bold(branch)} branch (releases must be from ${pc.bold("main")})`,
            ),
            emoji: "✘",
            colour: "red",
          },
    );

    // 1.3 Check remote sync
    const hasRemote = await git.hasRemote();
    if (hasRemote) {
      const isBehind = await git.isBehindRemote();
      checks.push(
        !isBehind
          ? {
              label: pc.dim("Synchronised with remote branch"),
              emoji: "✔",
              colour: "green",
            }
          : {
              label: pc.bold("Your local branch is behind the remote"),
              emoji: "✘",
              colour: "red",
            },
      );
    }
  }

  // 2. Check for FTP credentials
  s.message("Testing FTP connection...");
  const { success: ftpSuccess, error: ftpError } =
    await testFtpConnection(5000);
  checks.push(
    ftpSuccess
      ? {
          label: pc.dim("FTP is reachable"),
          emoji: "✔",
          colour: "green",
        }
      : {
          label: pc.bold(`FTP connection failed: ${ftpError}`),
          emoji: "✘",
          colour: "red",
        },
  );

  // 3. Run build check
  s.message("Running npm run build check...");
  let buildSuccess = false;
  let buildError: string | undefined;
  try {
    await runBuild({ stdio: "pipe" });
    buildSuccess = true;
  } catch (err: any) {
    if (err.stdout) {
      process.stdout.write(err.stdout);
    }
    if (err.stderr) {
      process.stderr.write(err.stderr);
    }
    buildError = err.message || "Build failed.";
  }
  checks.push(
    buildSuccess
      ? {
          label: pc.dim("Project built successfully"),
          emoji: "✔",
          colour: "green",
        }
      : {
          label: pc.bold(`Project build failed: ${buildError}`),
          emoji: "✘",
          colour: "red",
        },
  );

  const failed = checks.some((c) => c.colour === "red");
  if (failed) {
    s.cancel("Release check failed");
  } else {
    s.stop("Release check passed");
  }

  console.log(`${pc.gray("│")}`);
  checks.forEach((check) =>
    renderClackMoji(check.emoji, check.colour, check.label),
  );
  console.log(`${pc.gray("│")}`);

  if (failed) {
    return 1;
  }

  return 0;
}
