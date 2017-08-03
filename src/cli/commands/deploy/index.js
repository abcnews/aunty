// Native
const {stat} = require('fs');

// External
const loadJsonFile = require('load-json-file');
const pify = require('pify');

// Ours
const {ftp, rsync, symlink} = require('../../../deploy-tasks');
const {isRepo, getCurrentLabel} = require('../../../git');
const {packs, throws, unpack} = require('../../../utils/async');
const {log} = require('../../../utils');
const {command} = require('../');
const {
  OPTIONS,
  USAGE,
  DEFAULTS,
  REQUIRED_PROPERTIES,
  VALID_TYPES,
  RECOGNISED_HOST_PATH_TO_URL_MAPPINGS,
  MESSAGES
} = require('./constants');

// Wrapped
const getJSON = packs(loadJsonFile);
const getStats = packs(pify(stat));

const deployToServer = packs(async function (target) {
  let err;

  log(MESSAGES.deploying(target.type, target.from, target.to, target.host));

  if (target.type === 'ftp') {
    throws(await ftp(target));
  } else if (target.type === 'ssh') {
    throws(await rsync(target));

    if (!err && target.symlink) {
      throws(await symlink(target));
    }
  }

  const mapping = RECOGNISED_HOST_PATH_TO_URL_MAPPINGS[target.host];

  if (mapping) {
    const publicURL = target.to.replace(mapping[0], mapping[1]);

    if (target.to !== publicURL) {
      log(MESSAGES.publicURL(target.to.replace(mapping[0], mapping[1])));
    }
  }
});

module.exports = command({
  name: 'deploy',
  options: OPTIONS,
  usage: USAGE,
  configRequired: true
}, async function (argv, config) {
  // 1) Get config for target(s), using available defaults

  const deployConfig = config.deploy || DEFAULTS.get(config.type);

  if (typeof deployConfig !== 'object') {
    throw MESSAGES.NO_TARGETS;
  }

  let keys = Object.keys(deployConfig);

  if (argv.target) {
    keys = keys.filter(key => key === argv.target);

    if (keys.length < 1) {
      throw MESSAGES.targetDoesNotExist(argv.target);
    }
  }

  if (keys.length < 1) {
    throw MESSAGES.NO_TARGETS;
  }

  let credentials = unpack(await getJSON(argv.credentials));

  let id = argv.id || (await isRepo() && await getCurrentLabel()) || 'default';

  // 2) Create an array of config objects fot each target we know about

  const targets = keys.map(key => Object.assign(
    {
      __key__: key,
      id,
      name: config.name,
      files: '**'
    },
    credentials[key],
    deployConfig[key],
    (argv.shouldRespectTargetSymlinks ? {} : {symlink: null})
  ));

  // 3) Validate & normalise those configs (in parallel)

  await Promise.all(targets.map(async function (target) {
    // 3.1) Check 'type' is valid
    if (!VALID_TYPES.has(target.type)) {
      throw MESSAGES.unrecognisedType(target.__key__, target.type);
    }

    // 3.2) Check all properties are present
    REQUIRED_PROPERTIES.forEach(prop => {
      if (target[prop] == null) {
        throw MESSAGES.targetNotConfigured(target.__key__, prop);
      }
    });

    // 3.3) Complete 'from' & 'to' paths
    target.from = `${config.root}/${target.from}`;
    target.to = target.to.replace('<name>', target.name).replace('<id>', id);

    // 3.4) Check 'from' directory exists
    const stats = unpack(await getStats(target.from));

    if (!stats.isDirectory()) {
      throw (MESSAGES.sourceIsNotDirectory(target.from));
    }
  }));

  // 4) Deploy to each target (in series)

  for (const target of targets) {
    throws(await deployToServer(target));
  }
});
