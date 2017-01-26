// Native
const {resolve} = require('path');

// Packages
const merge = require('merge');

// Ours
const {getPackage} = require('./package');
const {hvy} = require('./text');

const ERRORS = {
  NO_CONFIG: `This project has no ${hvy('aunty.config.js')} file or ${hvy('aunty')} property in its ${hvy('package.json')} file.`,
  noProperty: property => `This project's ${hvy('aunty')} configuration has no ${hvy(property)} property.`
};

const getConfig = command => {
  let pkgConfig = getPackage('aunty');
  let standaloneConfig;

  try {
    standaloneConfig = require(resolve('aunty.config'));
  } catch (err) {
    /* do nothing */
  }

  if (typeof pkgConfig !== 'object' && typeof standaloneConfig !== 'object') {
    throw new Error(ERRORS.NO_CONFIG);
  }

  if (typeof pkgConfig !== 'object') {
    pkgConfig = {};
  }

  if (typeof standaloneConfig !== 'object') {
    standaloneConfig = {};
  }

  const config = merge.recursive(true, pkgConfig, standaloneConfig);

  if (command == null) {
    return config;
  }

  if (config[command] == null) {
    throw new Error(ERRORS.noProperty(command));
  }

  return config[command];
};

module.exports = {
  getConfig
};
