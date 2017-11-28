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
    const value = config.deploy[key];
    const partialTargets = Array.isArray(value) ? value : [value];

    partialTargets.forEach((partialTarget, index) => {
      if (!partialTarget._from) {
        partialTarget._from = partialTarget.from;
      }

      if (!partialTarget._to) {
        partialTarget._to = partialTarget.to;
      }

      partialTarget.from = `${config.root}/${partialTarget._from}`;
      partialTarget.to = partialTarget._to.replace('<name>', config.pkg.name).replace('<id>', config.id);
      partialTarget.publicURL = KNOWN_TARGETS[key]
        ? partialTarget.to.replace(
            KNOWN_TARGETS[key].publicPathRewritePattern,
            `${KNOWN_TARGETS[key].publicURLRoot}$1/`
          )
        : null;
    });
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
    pkg = unpack(await getPkg(root, { normalize: false }));
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
        root,
        pkg
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
