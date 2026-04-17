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

  // 1. Git Prerelease Checks

  // 1.1 Check git accessibility.
  if (!(await git.isAccessible())) {
    s.cancel(
      "Git is not accessible. Please ensure git is installed and any pending licenses (e.g. Xcode) are accepted.",
    );
    return 1;
  }

  // 1.2 Check for uncommitted changes
  if (!(await git.isClean())) {
    s.cancel("You have uncommitted changes.");
    return 1;
  }

  // 1.3 Check branch
  const branch = await git.getBranch();
  if (branch !== "main") {
    s.cancel(
      `You are on the ${pc.bold(branch)} branch. Releases must be from ${pc.bold("main")}.`,
    );
    return 1;
  }

  // 1.4 Check remote sync
  if (await git.hasRemote()) {
    if (await git.isBehindRemote()) {
      s.cancel("Your local branch is behind the remote.");
      return 1;
    }
  }

  // 2. Check for FTP credentials
  s.message("Testing FTP connection...");
  try {
    const ftpClient = await new FtpClient().testConnection(5000, s);
    ftpClient.close();
  } catch {
    // Spinner cancellation is handled by testConnection
    return 1;
  }

  s.stop("Pre-release checks passed");
  outro(pc.green("Ready for release!"));
  return 0;
}
