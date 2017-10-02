// External
const pkgDir = require('pkg-dir');
const readPkg = require('read-pkg');

// Ours
const { packs, prequire, unpack } = require('../utils/async');
const { isRepo, getCurrentLabel } = require('../utils/git');
const { pretty } = require('../utils/logging');
const { CONFIG_FILE_NAME, DEFAULTS, KNOWN_TARGETS, MESSAGES } = require('./constants');

// Wrapped
const getPkg = packs(readPkg);
const getPkgDir = packs(pkgDir);

// Cached
let root;
let pkg;
let config;

function resolveDeployConfig(config) {
  config.deploy = config.deploy || DEFAULTS.deploy;

  Object.keys(config.deploy).forEach(key => {
    const target = config.deploy[key];

    if (!target._from) {
      target._from = target.from;
    }

    if (!target._to) {
      target._to = target.to;
    }

    target.from = `${config.root}/${target._from}`;
    target.to = target._to.replace('<name>', config.name).replace('<id>', config.id);
    target.publicURL = KNOWN_TARGETS[key]
      ? target.to.replace(KNOWN_TARGETS[key].publicPathRewritePattern, `${KNOWN_TARGETS[key].publicURLRoot}$1/`)
      : null;
  });

  return config;
}

module.exports.getConfig = packs(async argv => {
  if (!root) {
    root = unpack(await getPkgDir());
  }

  if (root === null) {
    throw MESSAGES.NOT_PACKAGE;
  }

  if (!pkg) {
    pkg = unpack(await getPkg(root));
  }

  if (!config) {
    const [err, configFileConfig] = await prequire(`${root}/${CONFIG_FILE_NAME}`);

    // The standalone config file is optional, but it may have syntax problems
    if (err && err.code !== 'MODULE_NOT_FOUND') {
      throw pretty(err);
    }

    let auntyConfig = configFileConfig || pkg.aunty || {};

    if (typeof auntyConfig === 'string') {
      auntyConfig = { type: auntyConfig };
    }

    config = Object.assign(
      {
        name: pkg.name,
        version: pkg.version,
        root
      },
      auntyConfig
    );
  }

  return resolveDeployConfig(
    Object.assign(
      {
        id: argv.id || ((await isRepo()) && (await getCurrentLabel())) || 'default'
      },
      config
    )
  );
});
