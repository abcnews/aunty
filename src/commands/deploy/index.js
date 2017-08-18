// Native
const {existsSync, statSync} = require('fs');

// External
const loadJsonFile = require('load-json-file');

// Ours
const {command} = require('../../cli');
const {packs, throws, unpack} = require('../../utils/async');
const {ftp, rsync, symlink} = require('../../utils/deployment');
const {log} = require('../../utils/logging');
const {OPTIONS, MESSAGES, REQUIRED_PROPERTIES, VALID_TYPES} = require('./constants');

// Wrapped
const getJSON = packs(loadJsonFile);

const deployToServer = packs(async target => {
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

  if (target.publicURL) {
    log(MESSAGES.publicURL(target.publicURL));
  }
});

module.exports.deploy = command({
  name: 'deploy',
  options: OPTIONS,
  usage: MESSAGES.usage,
  isConfigRequired: true
}, async (argv, config) => {
  // 1) Get known/specified deployment target(s)

  let keys = Object.keys(config.deploy);

  if (argv.target) {
    keys = keys.filter(key => key === argv.target);

    if (keys.length < 1) {
      throw MESSAGES.targetDoesNotExist(argv.target);
    }
  }

  if (keys.length < 1) {
    throw MESSAGES.NO_TARGETS;
  }

  // 2) Create an array of config objects for each target we know about

  const credentials = unpack(await getJSON(argv.credentials));

  const targets = keys.map(key => Object.assign(
    {
      __key__: key,
      id: config.id,
      name: config.name,
      files: '**'
    },
    credentials[key],
    config.deploy[key],
    (argv.shouldRespectTargetSymlinks ? {} : {symlink: null})
  ));

  // 3) Validate & normalise those configs (in parallel)

  await Promise.all(targets.map(async target => {
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

    // 3.3) Check 'from' directory exists
    if (!existsSync(target.from) || !statSync(target.from).isDirectory()) {
      throw (MESSAGES.sourceIsNotDirectory(target.from));
    }
  }));

  for (const target of targets) {
    throws(await deployToServer(target));
  }
});
