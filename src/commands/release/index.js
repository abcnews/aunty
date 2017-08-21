// Ours
const {command} = require('../../cli');
const {throws} = require('../../utils/async');
const {
  createTag, getCurrentTags, getRemotes, hasChanges, hasTag, isRepo, pushTag
} = require('../../utils/git');
const {dry, spin} = require('../../utils/logging');
const {build} = require('../build');
const {deploy} = require('../deploy');
const {MESSAGES: DEPLOY_MESSAGES} = require('../deploy/constants');
const {MESSAGES} = require('./constants');

module.exports.release = command({
  name: 'release',
  usage: MESSAGES.usage,
  isConfigRequired: true
}, async (argv, config) => {
  const id = config.version;
  let spinner;

  if (argv.dry) {
    return dry({
      'Release version': id
    });
  }

  // 1) Ensure the project is a git repo

  if (!(await isRepo())) {
    throw MESSAGES.NOT_REPO;
  }

  // 2) Ensure the project has a deployment config

  if (typeof config.deploy !== 'object') {
    throw DEPLOY_MESSAGES.NO_TARGETS;
  }

  // 3) Ensure the project no un-committed changes (skippable)

  if (!argv.force && await hasChanges()) {
    throw MESSAGES.HAS_CHANGES;
  }

  // 4) Tag a new release (skippable)

  if (!argv.force) {
    if (await hasTag(id)) {
      throw MESSAGES.hasTag(id, (await getCurrentTags()).has(id));
    }

    spinner = spin(MESSAGES.createTag(id));
    await createTag(id);
    spinner.succeed();

    const remotes = await getRemotes();

    for (const remote of remotes.values()) {
      spinner = spin(MESSAGES.pushTag(id));
      await pushTag(remote, id);
      spinner.succeed();
    }
  }

  // 4) For each target, build the project and deploy it

  await Promise.all(Object.keys(config.deploy).map(async target => {
    const args = ['--id', id, '--target', target];

    throws(await build(args));
    throws(await deploy(args.concat(['--shouldRespectTargetSymlinks'])));
  }));
});
