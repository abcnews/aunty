// Native
const {resolve} = require('path');

// Packages
const merge = require('merge');

// Ours
const {abort} = require('./error');
const {getPackage} = require('./package');
const {hvy} = require('./text');

const ERRORS = {
  NO_CONFIG: `This project has no ${hvy('aunty.config.js')} file or ${hvy('aunty')} property in its ${hvy('package.json')} file.`,
  NO_PROPERTY: property => `This project's ${hvy('aunty')} configuration has no ${hvy(property)} property.`
};

const getConfig = command => {
  let pkgConfig = getPackage('aunty');
  let standaloneConfig;
  let config;

  try {
    standaloneConfig = require(resolve('aunty.config'));
  } catch (err) {
    /* do nothing */
  }

  if (typeof pkgConfig !== 'object' && typeof standaloneConfig !== 'object') {
    abort(ERRORS.NO_CONFIG);
  }

  if (typeof pkgConfig !== 'object') {
    pkgConfig = {};
  }

  if (typeof standaloneConfig !== 'object') {
    standaloneConfig = {};
  }

  config = merge.recursive(true, pkgConfig, standaloneConfig);

  if (command == null) {
    return config;
  }

  if (typeof config[command] == null) {
    abort(ERRORS.NO_PROPERTY(command));
  }

  return config[command];
}

module.exports = {
  getConfig
};
