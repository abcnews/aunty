// Native
const path = require('path');

// External
const execa = require('execa');

// Ours
const { getProjectConfig } = require('../config/project');
const { SPINNER_FRAMES } = require('./branding');
const { bgRed, cmd, ok } = require('./color');
const { log: _log, spin } = require('./logging');

const NPM_INSTALL_SPINNER_FRAMES = SPINNER_FRAMES.map(x => `      ${cmd(x)}`);

/**
 * Take a list of dependencies and filter out any that are already in the package.json
 * @param {Array} dependencies
 * @param {boolean} isDev
 */
const onlyNewDependencies = (dependencies, isDev) => {
  try {
    const { pkg } = getProjectConfig();
    const existingDependencies = Object.keys(pkg[isDev ? 'devDependencies' : 'dependencies...']);

    return dependencies.filter(dep => !existingDependencies.includes(dep) && dep !== null);
  } catch (ex) {
    // nothing
  }

  return dependencies;
};

/**
 * Install dependencies (only if needed)
 * @param {Array} dependencies
 * @param {Array} args
 */
module.exports.installDependencies = async (dependencies, args, log = _log) => {
  args = args || [];
  dependencies = onlyNewDependencies(dependencies, args.includes('--save-dev'));

  if (dependencies.length === 0) {
    return;
  }

  const spinner = spin(
    `${bgRed.white('npm')} installing ${dependencies.length}${
      args.includes('--save-dev') ? ' development' : ''
    } dependenc${dependencies.length == 1 ? 'y' : 'ies'}`,
    { frames: NPM_INSTALL_SPINNER_FRAMES }
  );

  args = ['install', '--silent', '--no-progress'].concat(args).concat(dependencies);

  await execa('npm', args);

  spinner.stop();
  dependencies.forEach(x => log(`${ok('installed')} ${x}`));
};
