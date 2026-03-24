import { intro, outro } from "@clack/prompts";
import pc from "picocolors";
import { getHeader, spin } from "../../lib/terminal.ts";
import { FtpClient } from "../deploy/ftp.ts";
import * as git from "./git.ts";

/**
 * Release checks that must pass before running an `aunty release`.
 */
export async function run(): Promise<number> {
  intro(getHeader(pc.dim("aunty"), "release-check"));

  const s = spin("Performing pre-release checks...");
  const errors: string[] = [];

  // 1. Git Prerelease Checks
  const gitAccessible = await git.isAccessible();

  if (!gitAccessible) {
    errors.push(
      "Git is not accessible. Please ensure git is installed and any pending licenses (e.g. Xcode) are accepted.",
    );
  } else if (!(await git.isInsideRepo())) {
    errors.push("The current directory is not a git repository.");
  } else {
    // 1.1 Check for uncommitted changes
    const isClean = await git.isClean();
    if (!isClean) {
      errors.push("You have uncommitted changes.");
    }

    // 1.2 Check branch
    const branch = await git.getBranch();
    if (branch !== "main") {
      errors.push(
        `You are on the ${pc.bold(branch)} branch. Releases must be from ${pc.bold("main")}.`,
      );
    }

    // 1.3 Check remote sync
    const hasRemote = await git.hasRemote();
    if (hasRemote) {
      const isBehind = await git.isBehindRemote();
      if (isBehind) {
        errors.push("Your local branch is behind the remote.");
      }
    }
  }

  // 2. Check for FTP credentials
  s.message("Testing FTP connection...");
  const ftpClient = new FtpClient();
  try {
    await ftpClient.connect(5000);
    ftpClient.close();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`FTP connection failed: ${message}`);
  }

  if (errors.length > 0) {
    s.cancel(
      `${pc.red("Pre-release checks failed:")}\n${errors.map((e) => `  ${pc.red("•")} ${e}`).join("\n")}`,
    );
    return 1;
  }

  s.stop("Pre-release checks passed");
  outro(pc.green("Ready for release!"));
  return 0;
}
