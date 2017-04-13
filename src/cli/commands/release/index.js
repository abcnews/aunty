// Ours
const {
  createTag, getCurrentTags, getRemotes, hasChanges, hasTag, isRepo, pushTag
} = require('../../../git');
const {throws} = require('../../../utils/async');
const {log} = require('../../../utils/console');
const {build} = require('../build');
const {deploy} = require('../deploy');
const {
  DEFAULTS: DEPLOY_DEFAULTS, MESSAGES: DEPLOY_MESSAGES
} = require('../deploy/constants');
const {command} = require('../');
const {OPTIONS, USAGE, MESSAGES} = require('./constants');

const release = command({
  name: 'release',
  options: OPTIONS,
  usage: USAGE,
  configRequired: true
}, async function (argv, config) {
  const id = config.version;

  // 1) Ensure the project is a git repo

  if (!(await isRepo())) {
    throw MESSAGES.NOT_REPO;
  }

  // 2) Ensure the project has a deployment config

  if (!config.deploy && !DEPLOY_DEFAULTS.has(config.type)) {
    throw DEPLOY_MESSAGES.NO_TARGETS;
  }

  // 3) Ensure the project no un-committed changes (skippable)

  if (!argv.force && await hasChanges()) {
    throw MESSAGES.HAS_CHANGES;
  }

  // 4) Build the project

  throws(await build([]));

  // 5) Tag a new release (skippable)

  if (!argv.force) {
    if (await hasTag(id)) {
      throw MESSAGES.hasTag(id, (await getCurrentTags()).has(id));
    }

    await createTag(id);

    log(MESSAGES.createdTag(id));

    const remotes = await getRemotes();

    for (const remote of remotes.values()) {
      throws(await pushTag(remote, id));

      log(MESSAGES.pushedTag(id, remote));
    }
  }

  // 6) Deploy

  throws(await deploy(argv.$.concat(['--id', id, '--shouldRespectTargetSymlinks'])));
});

module.exports = {
  release
};
