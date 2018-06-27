const path = require('path');
const execa = require('execa');
const ora = require('ora');
const Chalk = require('chalk');
const guessRootPath = require('guess-root-path');
const { SPINNER_FRAMES } = require('./branding');

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
const installDependencies = async (dependencies, args, log) => {
  log = log || console.log;
  args = args || [];
  dependencies = onlyNewDependencies(dependencies, args.includes('--save-dev'));

  if (dependencies.length === 0) return;

  let spinner = ora(SPINNER).start();
  spinner.text = Chalk.gray(
    'installing ' +
      dependencies.length +
      `${args.includes('--save-dev') ? ' development ' : ' '}dependenc${dependencies.length == 1 ? 'y' : 'ies'}`
  );

  args = ['install', '--silent', '--no-progress'].concat(args).concat(dependencies);

  await execa('npm', args);

  spinner.stop();
  dependencies.forEach(d => {
    log(Chalk.yellow('      npm'), d);
  });
};

/**
 * Look up the current master version of a thing
 */
const getGithubVersion = async repo => {
  let spinner = ora(SPINNER).start();
  spinner.color = 'white';
  spinner.text = Chalk.gray('Fetching latest version of ' + repo);
  const p = await fetch(`https://raw.githubusercontent.com/${repo}/master/package.json`).then(r => r.json());
  spinner.stop();

  return p.version;
};

const SPINNER = {
  color: 'yellow',
  spinner: {
    interval: 80,
    frames: SPINNER_FRAMES.map(f => '     ' + f + ' ')
  }
};

module.exports = { installDependencies, getGithubVersion, SPINNER };
