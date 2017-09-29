// External
const del = require('del');

// Ours
const { command } = require('../../cli');
const { BUILD_DIR } = require('../../projects/constants');
const { dry, spin } = require('../../utils/logging');
const { MESSAGES } = require('./constants');

module.exports.clean = command({
  name: 'clean',
  usage: MESSAGES.usage,
  isConfigRequired: true
}, async (argv, config) => {
  const cwd = config.root;
  let globs = argv._.length ? argv._ : config.clean;

  if (!Array.isArray(globs) && typeof globs !== 'string') {
    globs = [BUILD_DIR];
  }

  if (argv.dry) {
    return dry({
      'Deletion paths': {globs, cwd}
    });
  }

  const spinner = spin('Clean');

  await del(globs, {cwd});

  spinner.succeed();
});
