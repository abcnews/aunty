import pc from "picocolors";
import { FtpClient } from "../deploy/ftp.ts";
import * as git from "./git.ts";

/**
 * Release checks that must pass before running an `aunty release`.
 */
export async function run(options = {}) {
  console.log(`${pc.bold("Aunty Release Check")}`);

  // 1. Git Prerelease Checks
  const gitErrors: string[] = [];

  // 1.1 Check git accessibility.
  // On MacOS the `git` command is behind a paywall and the user must
  // accept the xcode license agreement before using it. If this isn't
  // done our commands will return unexpected results. Let's check git -v first.
  if (!(await git.isAccessible())) {
    gitErrors.push(
      `Git is not accessible. Please ensure git is installed and any pending licenses (e.g. Xcode) are accepted.`,
    );
  } else {
    // 1.2 Check for uncommitted changes
    if (!(await git.isClean())) {
      gitErrors.push(`You have uncommitted changes.`);
    }

    // 1.3 Check branch
    const branch = await git.getBranch();
    if (branch !== "main") {
      gitErrors.push(
        `You are on the ${pc.bold(branch)} branch. Releases must be from ${pc.bold("main")}.`,
      );
    }

    // 1.4 Check remote sync
    if (await git.hasRemote()) {
      if (await git.isBehindRemote()) {
        gitErrors.push(`Your local branch is behind the remote.`);
      }
    }
  }

  if (gitErrors.length > 0) {
    console.log();
    gitErrors.forEach((error) =>
      console.error(`${pc.red("[ERROR]")} ${error}`),
    );
    console.log(`${pc.bold(pc.red("Pre-release checks failed."))}`);
    return;
  }

  // 2. Check for FTP credentials
  try {
    const ftpClient = await new FtpClient().testConnection();
    ftpClient.close();
  } catch (err) {
    return;
  }

  console.log(`${pc.bold(pc.green("Pre-release checks passed."))}`);
}
