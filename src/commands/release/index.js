// External
const semver = require('semver');
const writePkg = require('write-pkg');

// Ours
const { command } = require('../../cli');
const { packs, throws } = require('../../utils/async');
const {
  commitAll,
  createTag,
  getCurrentLabel,
  getCurrentTags,
  getRemotes,
  hasChanges,
  hasTag,
  isRepo,
  push,
  pushTag
} = require('../../utils/git');
const { dry, spin } = require('../../utils/logging');
const { build } = require('../build');
const { deploy } = require('../deploy');
const { MESSAGES: DEPLOY_MESSAGES } = require('../deploy/constants');
const { MESSAGES, OPTIONS, VALID_BUMPS } = require('./constants');

// Wrapped
const setPkg = packs(writePkg);

module.exports.release = command(
  {
    name: 'release',
    options: OPTIONS,
    usage: MESSAGES.usage,
    isConfigRequired: true
  },
  async (argv, config) => {
    if (argv.bump && !VALID_BUMPS.has(argv.bump)) {
      throw MESSAGES.invalidBump(argv.bump);
    }

    const id =
      argv.bump && VALID_BUMPS.has(argv.bump) && semver.valid(config.pkg.version)
        ? semver.inc(config.pkg.version, argv.bump)
        : config.pkg.version;
    const remote = argv['git-remote'];
    const targets = argv.target ? [argv.target] : Object.keys(config.deploy);
    let remotes;
    let spinner;

    if (argv.dry) {
      return dry({
        'Release version': id
      });
    }

    // 1) Ensure the project is a git repo and discover remotes

    if (!await isRepo()) {
      throw MESSAGES.NOT_REPO;
    }

    remotes = await getRemotes();

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

    // 5) Do a quick build to see that there are no build errors before we tag

    throws(await build(['--id', id, '--target', targets[0], '--preflight']));

    // 6) Bump the project's version number (optional, skippable)

    if (!argv.force && argv.bump) {
      spinner = spin(MESSAGES.createBump(argv.bump, config.pkg.version, id));
      config.pkg.version = id;
      await writePkg(config.root, config.pkg);
      await commitAll(id);
      spinner.succeed();

      if (remotes.has(remote)) {
        spinner = spin(MESSAGES.pushBump(remote));
        await push();
        spinner.succeed();
      }
    }

    // 7) Tag a new release (skippable)

    if (!argv.force) {
      spinner = spin(MESSAGES.createTag(id));
      await createTag(id);
      spinner.succeed();

      if (remotes.has(remote)) {
        spinner = spin(MESSAGES.pushTag(id, remote));
        await pushTag(remote, id);
        spinner.succeed();
      }
    }

    // 8) For each target, build the project and deploy it

    await Promise.all(
      targets.map(async (target, index) => {
        const args = ['--id', id, '--target', target];
        throws(await build(args));
        throws(await deploy(args.concat(['--shouldRespectTargetSymlinks'])));
      })
    );
  }
);
