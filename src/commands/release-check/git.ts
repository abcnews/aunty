import { $ } from "zx";

/**
 * Checks if git is accessible and functional. Important on macOS where git
 * may be paywalled by the Xcode license agreement.
 */
export async function isAccessible(): Promise<boolean> {
  try {
    await $`git --version`.quiet();
    return true;
  } catch (err) {
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
  } catch (err) {
    return false;
  }
}
