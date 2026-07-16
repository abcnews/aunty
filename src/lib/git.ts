import { $ } from "zx";
import { log } from "@clack/prompts";

/**
 * Checks if git is accessible and functional. Important on macOS where git
 * may be paywalled by the Xcode license agreement.
 */
export async function isAccessible(): Promise<boolean> {
  try {
    await $`git --version`.quiet();
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the current directory is an initialized git repository.
 */
export async function isInsideRepo(): Promise<boolean> {
  try {
    await $`git rev-parse --is-inside-work-tree`.quiet();
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the working directory is clean.
 */
export async function isClean(): Promise<boolean> {
  const result = await $`git status --porcelain`.quiet();
  return result.stdout.trim() === "";
}

/**
 * Gets the current branch name.
 */
export async function getBranch(): Promise<string> {
  const result = await $`git branch --show-current`.quiet();
  return result.stdout.trim();
}

/**
 * Checks if the current branch is behind its remote tracking branch.
 */
export async function isBehindRemote(): Promise<boolean> {
  await $`git fetch`.quiet();
  const result = await $`git rev-list --count HEAD..@{u}`.quiet();
  return Number(result.stdout.trim()) > 0;
}

/**
 * Checks if the current branch has a remote tracking branch.
 */
export async function hasRemote(): Promise<boolean> {
  try {
    await $`git rev-parse --abbrev-ref @{u}`.quiet();
    return true;
  } catch {
    return false;
  }
}

/**
 * Rolls back local version bump commit and version tag in case of push failure.
 */
export async function rollback(version: string): Promise<void> {
  try {
    // Check the commit name matches the version we want to roll back. This
    // should never be different… but just in case, we don't want to lose data.
    const lastCommitMsg = (
      await $`git log -1 --pretty=%B`.quiet()
    ).stdout.trim();
    if (lastCommitMsg !== `v${version}` && lastCommitMsg !== version) {
      log.warn(
        `Abort rollback: Last commit message "${lastCommitMsg}" does not match version v${version}.`,
      );
      return;
    }

    log.info("Rolling back local version bump commit and tag...");
    await $`git tag -d v${version}`;
    await $`git reset --hard HEAD~1`;
    log.info(
      "This release has been rolled back, your workspace is clean to try again.",
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log.error(`Failed to completely roll back: ${errorMessage}`);
  }
}
