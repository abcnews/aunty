// External
const guessRootPath = require('guess-root-path');

// Ours
const { isRepoSync, getCurrentLabelSync } = require('../utils/git');
const { pretty, warn } = require('../utils/logging');
const { CONFIG_FILE_NAME, DEFAULTS, KNOWN_TARGETS, MESSAGES } = require('./constants');

// Cached
let root;
let pkg;
let config;

function resolveDeployConfig(config) {
  config.deploy = config.deploy || DEFAULTS.deploy;

  Object.keys(config.deploy).forEach(key => {
    const value = config.deploy[key];
    const partialTargets = Array.isArray(value) ? value : [value];

    partialTargets.forEach(partialTarget => {
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

module.exports.getConfig = argv => {
  if (!root) {
    root = guessRootPath();
  }

  if (root === null) {
    throw MESSAGES.NOT_PACKAGE;
  }

  if (!pkg) {
    try {
      pkg = require(`${root}/package.json`);
    } catch (err) {
      throw pretty(err);
    }
  }

  if (!config) {
    let configFileConfig;

    try {
      configFileConfig = require(`${root}/${CONFIG_FILE_NAME}`);
    } catch (err) {
      // The standalone config file is optional, but it may have syntax problems
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw pretty(err);
      }
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

    if (config.type && config.type.indexOf('-app') > -1) {
      // This notice can be removed in a later major bump. Introduced for 9.0.0.
      warn(
        `It looks like your aunty config has an outdated project type. Remove the '-app' suffix and you should be good.\n`
      );
    }
  }

  return resolveDeployConfig(
    Object.assign(
      {
        id: (argv && argv.id) || (isRepoSync() && getCurrentLabelSync()) || 'default'
      },
      config
    )
  );
};
