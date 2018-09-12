// Native
const path = require('path');

// External
const cliSelect = require('cli-select');
const jsonFileUpdater = require('jsonfile-updater');
const semver = require('semver');

// Ours
const { command } = require('../../cli');
const { throws } = require('../../utils/async');
const { bad, dim, opt } = require('../../utils/color');
const {
  commitAll,
  createTag,
  getChangelog,
  getCurrentLabel,
  getRemotes,
  getTags,
  hasChanges,
  isRepo,
  push,
  pushTag
} = require('../../utils/git');
const { dry, log, spin } = require('../../utils/logging');
const { build } = require('../build');
const { deploy } = require('../deploy');
const { MESSAGES: DEPLOY_MESSAGES } = require('../deploy/constants');
const { MESSAGES, OPTIONS, VALID_BUMPS } = require('./constants');

module.exports.release = command(
  {
    name: 'release',
    options: OPTIONS,
    usage: MESSAGES.usage,
    isProjectConfigRequired: true
  },
  async (argv, config) => {
    // 1) Ensure the project is a git repo and determine remotes

    if (!(await isRepo())) {
      throw MESSAGES.NOT_REPO;
    }

    const remotes = await getRemotes();
    const remote = argv['git-remote'];

    // 2) Ensure the master branch is checked out (skippable)

    const label = await getCurrentLabel();

    if (!argv.force && label !== 'master') {
      throw MESSAGES.invalidHead(label);
    }

    // 3) Ensure the project no un-committed changes (skippable)

    if (!argv.force && (await hasChanges())) {
      throw MESSAGES.HAS_CHANGES;
    }

    // 4) Ensure the project has a deployment config

    if (typeof config.deploy !== 'object') {
      throw DEPLOY_MESSAGES.NO_TARGETS;
    }

    // 5) Determine the release version

    if (argv.bump && !VALID_BUMPS.has(argv.bump)) {
      throw MESSAGES.invalidBump(argv.bump);
    }

    const isPrerelease = semver.prerelease(config.pkg.version);
    let bump = !argv.force && VALID_BUMPS.has(argv.bump) && argv.bump;

    if (!argv.force && !isPrerelease && !bump) {
      log(MESSAGES.changes(config.pkg.version, await getTags(), await getChangelog(config.pkg.version)));
      log(MESSAGES.BUMP_QUESTION);

      const bumpSelection = (await cliSelect({
        defaultValue: 0,
        selected: opt('❯'),
        unselected: ' ',
        values: [...VALID_BUMPS].reverse().map(bump => ({
          bump,
          label: `${bump.replace(/^\w/, c => c.toUpperCase())} (${semver.inc(config.pkg.version, bump)})`
        })),
        valueRenderer: ({ label }, selected) => (selected ? opt(label) : label)
      })).value;
      bump = bumpSelection.bump;
      log(`${dim(bumpSelection.label)}\n`);
    }

    const version =
      (isPrerelease || bump) && semver.valid(config.pkg.version)
        ? isPrerelease
          ? config.pkg.version.split('-')[0]
          : semver.inc(config.pkg.version, bump)
        : config.pkg.version;

    if (argv.dry) {
      return dry({
        'Release version': `${version}${bump ? ` ${bump}` : ''}`,
        'Git remote': remote
      });
    }

    // 6) Do a quick build to see that there are no build errors before we tag

    const targets = argv.target ? [argv.target] : Object.keys(config.deploy);

    throws(await build(['--id', version, '--target', targets[0], '--preflight']));

    // 7) Bump the project's version number (optional, skippable)

    let spinner;

    if (!argv.force && version !== config.pkg.version) {
      spinner = spin(MESSAGES.createCommit(config.pkg.version, version));
      await jsonFileUpdater(path.join(config.root, 'package.json')).set('version', version);
      await jsonFileUpdater(path.join(config.root, 'package-lock.json')).set('version', version);
      await commitAll(version);
      spinner.succeed();

      if (remotes.has(remote)) {
        spinner = spin(MESSAGES.pushCommit(remote));
        await push();
        spinner.succeed();
      }
    }

    // 8) Tag a new release (skippable)

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

    // 9) For each target, build the project and deploy it

    await Promise.all(
      targets.map(async (target, index) => {
        const args = ['--id', version, '--target', target];

        // Don't rebuild the target we built in the preflight
        if (index === 0) {
          spinner = spin('Build');
          spinner.succeed();
        } else {
          throws(await build(args));
        }

        throws(await deploy(args.concat(['--shouldRespectTargetSymlinks'])));
      })
    );
  }
);
