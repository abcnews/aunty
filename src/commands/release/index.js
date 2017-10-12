// External
const semver = require('semver');

// Ours
const { command } = require('../../cli');
const { throws } = require('../../utils/async');
const { createTag, getCurrentTags, getRemotes, hasChanges, hasTag, isRepo, pushTag } = require('../../utils/git');
const { dry, spin } = require('../../utils/logging');
const { build } = require('../build');
const { deploy } = require('../deploy');
const { MESSAGES: DEPLOY_MESSAGES } = require('../deploy/constants');
const { MESSAGES, OPTIONS } = require('./constants');

module.exports.release = command(
  {
    name: 'release',
    options: OPTIONS,
    usage: MESSAGES.usage,
    isConfigRequired: true
  },
  async (argv, config) => {
    const id = config.pkg.version;
    let spinner;

    const targets = argv.target ? [argv.target] : Object.keys(config.deploy);

    if (argv.dry) {
      return dry({
        'Release version': id
      });
    }

    // 1) Ensure the project is a git repo

    if (!await isRepo()) {
      throw MESSAGES.NOT_REPO;
    }

    // 2) Ensure the project has a deployment config

    if (typeof config.deploy !== 'object') {
      throw DEPLOY_MESSAGES.NO_TARGETS;
    }

    // 3) Ensure the project no un-committed changes (skippable)

    if (!argv.force && (await hasChanges())) {
      throw MESSAGES.HAS_CHANGES;
    }

    // 4) Do a quick build to see that there are no build errors before we tag

    throws(await build(['--id', id, '--target', targets[0], '--preflight']));

    // 5) Tag a new release (skippable)

    if (!argv.force) {
      if (await hasTag(id)) {
        throw MESSAGES.hasTag(id, (await getCurrentTags()).has(id));
      }

      spinner = spin(MESSAGES.createTag(id));
      await createTag(id);
      spinner.succeed();

      const remotes = await getRemotes();
      const remote = argv['git-remote'];

      if (remotes.has(remote)) {
        spinner = spin(MESSAGES.pushTag(id, remote));
        await pushTag(remote, id);
        spinner.succeed();
      }
    }

    // 6) For each target, build the project and deploy it

    await Promise.all(
      targets.map(async (target, index) => {
        const args = ['--id', id, '--target', target];

        // Skip the first one, it was already built in the preflight
        if (index === 0) {
          // Pretend to build it just for the logging
          const spinner = spin('Build');
          spinner.succeed();
        } else {
          throws(await build(args));
        }

        throws(await deploy(args.concat(['--shouldRespectTargetSymlinks'])));
      })
    );
  }
);
