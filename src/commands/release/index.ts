import { intro, outro, select, cancel, isCancel, log } from "@clack/prompts";
import pc from "picocolors";
import semver from "semver";
import { $ } from "zx";
import { getHeader, spin } from "../../lib/terminal.ts";
import { findProjectDetails } from "../../lib/util.ts";
import { getVersionOptions } from "../../lib/semver.ts";
import { run as runReleaseCheck } from "../release-check/index.ts";
import { run as runDeploy } from "../deploy/index.ts";
import * as git from "../../lib/git.ts";

interface ReleaseOptions {
  version?: string;
}

/**
 * The main entry point for the 'aunty release' command.
 */
export async function run(options: ReleaseOptions = {}): Promise<number> {
  intro(getHeader(pc.dim("aunty"), "release"));

  // 1. Load project details
  const details = await findProjectDetails(process.cwd());
  if (!details) {
    return 1;
  }

  const { pkg } = details;
  const currentVersion = pkg.version;

  if (!currentVersion) {
    cancel("No version found in package.json, please set up your project.");
    return 1;
  }

  if (!semver.valid(currentVersion)) {
    cancel(
      `Current version ${pc.bold(currentVersion)} is not a valid semver version`,
    );
    return 1;
  }

  let nextVersion: string | undefined = undefined;

  // 2. Handle override version option if provided
  if (options.version) {
    if (!semver.valid(options.version)) {
      cancel(
        `The version specified (${pc.bold(options.version)}) is not a valid semver version`,
      );
      return 1;
    }
    nextVersion = options.version;
    log.info(`Using specified version: ${pc.green(nextVersion)}`);
  }

  // 3. Determine version bump options dynamically
  if (!nextVersion) {
    const selectOptions = getVersionOptions(currentVersion);

    const bumpSelection = await select({
      message: "What package version bump is this release?",
      options: selectOptions,
    });

    if (isCancel(bumpSelection)) {
      cancel("Release cancelled");
      return 1;
    }

    nextVersion = bumpSelection as string;
  }

  // 4. Run pre-release checks
  const checkResult = await runReleaseCheck({
    skipHeader: true,
    quiet: true,
    projectName: details.pkg.name,
    version: nextVersion,
  });

  if (checkResult !== 0) {
    outro(pc.red("Release checks failed."));
    return checkResult;
  }

  // 5. Bump version locally
  try {
    await $`npm version ${nextVersion}`;
  } catch (err) {
    outro(
      pc.red(
        `Failed to set version: ${err instanceof Error ? err.message : String(err)}`,
      ),
    );
    return 1;
  }

  // 6. Push local changes and version tag to remote
  const pushSpinner = spin("Pushing release & tag to remote...");
  try {
    await $`git push origin HEAD --follow-tags`.quiet();
    pushSpinner.stop("Pushed to remote");
  } catch (err) {
    pushSpinner.cancel("Push failed");
    outro(
      pc.red(
        `Failed to push to remote: ${err instanceof Error ? err.message : String(err)}`,
      ),
    );
    await git.rollback(nextVersion);
    return 1;
  }

  // 7. Deploy the release
  const deployResult = await runDeploy({ skipHeader: true });

  if (deployResult !== 0) {
    outro(
      pc.red(
        "Deployment failed. You can retry manually with `npm run deploy`.",
      ),
    );
    return deployResult;
  }
  return 0;
}
