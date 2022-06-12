// Native
const { existsSync } = require('fs');
const { join } = require('path');

// External
const importLazy = require('import-lazy')(require);
const cliSelect = importLazy('cli-select');
const loadJsonFile = importLazy('load-json-file');
const semver = importLazy('semver');
const writeJsonFile = importLazy('write-json-file');

// Ours
const { getProjectConfig } = require('../../config/project');
const { throws } = require('../../utils/async');
const { dim, opt } = require('../../utils/color');
const {
  commitAll,
  createTag,
  getChangelog,
  getCurrentLabel,
  getDefaultBranch,
  getRemotes,
  getSemverTags,
  hasChanges,
  isRepo,
  push,
  pushTag
} = require('../../utils/git');
const { dry, log, spin } = require('../../utils/logging');
const { combine } = require('../../utils/structures');
const { command } = require('../');
const buildCommand = require('../build');
const deployCommand = require('../deploy');
const { MESSAGES, OPTIONS, VALID_BUMPS } = require('./constants');

module.exports = command(
  {
    name: 'release',
    options: OPTIONS,
    usage: MESSAGES.usage
  },
  async argv => {
    const { pkg, root } = getProjectConfig();

    // 1) Ensure the project is a git repo and determine remotes

    if (!(await isRepo())) {
      throw MESSAGES.notRepo;
    }

    const remotes = await getRemotes();
    const remote = argv['git-remote'];

    // 2) Ensure the default branch is checked out (skippable)

    const label = await getCurrentLabel();
    const defaultBranch = await getDefaultBranch(remote);

    if (!argv.force && label !== defaultBranch) {
      throw MESSAGES.notDefaultBranch(label, defaultBranch);
    }

    // 3) Ensure the project no un-committed changes (skippable)

    if (!argv.force && (await hasChanges())) {
      throw MESSAGES.hasChanges;
    }

    // 4) Determine the release version

    if (argv.bump && !VALID_BUMPS.has(argv.bump)) {
      throw MESSAGES.invalidBump(argv.bump);
    }

    const pkgVersion = pkg.version;
    const isPrerelease = semver.prerelease(pkgVersion);
    let bump = !argv.force && VALID_BUMPS.has(argv.bump) && argv.bump;

    if (!argv.force && !isPrerelease && !bump) {
      log(MESSAGES.changes(pkgVersion, await getSemverTags(), await getChangelog(pkgVersion)));
      log(MESSAGES.bumpQuestion(argv.dry));

      const bumpSelection = (
        await cliSelect({
          defaultValue: 0,
          selected: opt('❯'),
          unselected: ' ',
          values: [...VALID_BUMPS].reverse().map(bump => ({
            bump,
            label: `${bump.replace(/^\w/, c => c.toUpperCase())} (${semver.inc(pkgVersion, bump)})`
          })),
          valueRenderer: ({ label }, selected) => (selected ? opt(label) : label)
        })
      ).value;
      bump = bumpSelection.bump;
      log(`${dim(bumpSelection.label)}\n`);
    }

    const version =
      (isPrerelease || bump) && semver.valid(pkgVersion)
        ? isPrerelease
          ? pkgVersion.split('-')[0]
          : semver.inc(pkgVersion, bump)
        : pkgVersion;

    if (argv.dry) {
      return dry({
        Release: {
          bump,
          version,
          'git-remote': remote
        }
      });
    }

    // 5) Build with the new version to ensure there are no errors

    throws(await buildCommand(['--id', version]));

    // 6) Bump the project's version number (optional, skippable)

    let spinner;

    if (!argv.force && version !== pkgVersion) {
      spinner = spin(MESSAGES.createCommit(pkgVersion, version));
      updateJsonFile(join(root, 'package.json'), { version });
      updateJsonFile(join(root, 'package-lock.json'), { version });
      await commitAll(version);
      spinner.succeed();

      if (remotes.has(remote)) {
        spinner = spin(MESSAGES.pushCommit(remote));
        await push();
        spinner.succeed();
      }
    }

    // 7) Tag a new release (skippable)

    if (!argv.force) {
      spinner = spin(MESSAGES.createTag(version));
      await createTag(version);
      spinner.succeed();

      if (remotes.has(remote)) {
        spinner = spin(MESSAGES.pushTag(version, remote));
        await pushTag(remote, version);
        spinner.succeed();
      }
    }

    // 8) Deploy

    throws(await deployCommand());
  }
);

const updateJsonFile = (path, source) => {
  if (existsSync(path)) {
    writeJsonFile.sync(path, combine(loadJsonFile.sync(path), source));
  }
};
