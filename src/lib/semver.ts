import semver from "semver";

const PRERELEASE_LABEL = "prerelease";

export interface VersionOption {
  value: string;
  label: string;
}

/**
 * Returns options for potential next package versions based on the current version.
 * If the current version is already a prerelease, only options to release it
 * or increment the prerelease sequence are returned.
 *
 * @param currentVersion The current package version
 */
export function getVersionOptions(currentVersion: string): VersionOption[] {
  const prereleaseParts = semver.prerelease(currentVersion);
  const isPrerelease = !!prereleaseParts;
  const preid =
    prereleaseParts && typeof prereleaseParts[0] === "string"
      ? prereleaseParts[0]
      : PRERELEASE_LABEL;

  if (isPrerelease) {
    const releaseVersion = semver.inc(currentVersion, "patch")!;
    const nextPrerelease = semver.inc(currentVersion, "prerelease", preid)!;

    return [
      { value: releaseVersion, label: `Release (${releaseVersion})` },
      { value: nextPrerelease, label: `Prerelease (${nextPrerelease})` },
    ];
  }

  const patch = semver.inc(currentVersion, "patch")!;
  const minor = semver.inc(currentVersion, "minor")!;
  const major = semver.inc(currentVersion, "major")!;
  const prepatch = semver.inc(currentVersion, "prepatch", PRERELEASE_LABEL)!;
  const preminor = semver.inc(currentVersion, "preminor", PRERELEASE_LABEL)!;
  const premajor = semver.inc(currentVersion, "premajor", PRERELEASE_LABEL)!;

  return [
    { value: patch, label: `Patch (${patch})` },
    { value: minor, label: `Minor (${minor})` },
    { value: major, label: `Major (${major})` },
    { value: prepatch, label: `Prerelease Patch (${prepatch})` },
    { value: preminor, label: `Prerelease Minor (${preminor})` },
    { value: premajor, label: `Prerelease Major (${premajor})` },
  ];
}
