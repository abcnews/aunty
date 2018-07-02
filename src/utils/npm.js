// Native
const path = require('path');

// External
const guessRootPath = require('guess-root-path');
const execa = require('execa');

// Ours
const { cmd } = require('./color');
const { log: _log, spin } = require('./logging');

/**
 * Take a list of dependencies and filter out any that are already in the package.json
 * @param {Array} dependencies
 * @param {boolean} isDev
 */
const onlyNewDependencies = (dependencies, isDev) => {
  try {
    const config = require(path.join(guessRootPath(), 'package.json'));
    const deps = Object.keys(config[isDev ? 'devDependencies' : 'dependencies']);

    return dependencies.filter(dep => !deps.includes(dep) && dep !== null);
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
    `installing ${dependencies.length}${args.includes('--save-dev')
      ? ' development'
      : ''} dependenc${dependencies.length == 1 ? 'y' : 'ies'}`
  );

  args = ['install', '--silent', '--no-progress'].concat(args).concat(dependencies);

  await execa('npm', args);

  spinner.stop();
  dependencies.forEach(d => {
    log(cmd('      npm'), d);
  });
};
