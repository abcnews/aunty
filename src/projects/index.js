// External
const pkgDir = require('pkg-dir');
const readPkg = require('read-pkg');

// Ours
const {packs, prequire, unpack} = require('../utils/async');
const {hvy} = require('../utils/color');
const {isRepo, getCurrentLabel} = require('../utils/git');
const {pretty} = require('../utils/logging');
const {CONFIG_FILE_NAME, DEFAULTS, KNOWN_TARGETS} = require('./constants');

// Wrapped
const getPkg = packs(readPkg);
const getPkgDir = packs(pkgDir);

// Cached
let root;
let pkg;
let config;

const MESSAGES = {
  NO_CONFIG: `This project has no ${hvy(CONFIG_FILE_NAME)} file or ${hvy('aunty')} property in its ${hvy('package.json')}.`,
  NOT_PACKAGE: `This command can only be run inside a project with a ${hvy('package.json')} file.`
};

module.exports.getConfig = packs(async argv => {
  if (!root) {
    root = unpack(await getPkgDir());
  }

  if (root === null) {
    throw (MESSAGES.NOT_PACKAGE);
  }

  if (!pkg) {
    pkg = unpack(await getPkg(root));
  }

  if (!config) {
    const pkgConfig = pkg.aunty;

    const [err, configFileConfig] = await prequire(`${root}/${CONFIG_FILE_NAME}`);

    // The standalone config file is optional, but it may have syntax problems
    if (err && err.code !== 'MODULE_NOT_FOUND') {
      throw pretty(err);
    }

    if (typeof pkgConfig !== 'object' && typeof configFileConfig !== 'object') {
      throw MESSAGES.NO_CONFIG;
    }

    const id = argv.id || (await isRepo() && await getCurrentLabel()) || 'default';

    config = Object.assign({
      name: pkg.name,
      version: pkg.version,
      root,
      id
    }, configFileConfig || pkgConfig);

    resolveDeployConfig(config);
  }

  return config;
});

function resolveDeployConfig(config) {
  config.deploy = config.deploy || DEFAULTS.deploy;

  Object.keys(config.deploy)
  .forEach(key => {
    const target = config.deploy[key];

    target.from = `${config.root}/${target.from}`;
    target.to = target.to.replace('<name>', config.name).replace('<id>', config.id);
    target.publicURL = KNOWN_TARGETS[key] ? target.to.replace(
      KNOWN_TARGETS[key].publicPathRewritePattern,
      `${KNOWN_TARGETS[key].publicURLRoot}$1/`
    ) : null;
  });
}
