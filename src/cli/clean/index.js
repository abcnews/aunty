// External
const importLazy = require('import-lazy')(require);
const del = importLazy('del');

// Ours
const { getProjectConfig } = require('../../config/project');
const { OUTPUT_DIRECTORY_NAME } = require('../../constants');
const { hvy } = require('../../utils/color');
const { dry, info, spin } = require('../../utils/logging');
const { inlineList } = require('../../utils/text');
const { command } = require('../');
const { MESSAGES } = require('./constants');

module.exports = command(
  {
    name: 'clean',
    usage: MESSAGES.usage
  },
  async argv => {
    const { root } = getProjectConfig();
    const globs = [OUTPUT_DIRECTORY_NAME];

    if (argv.dry) {
      return dry({
        'Deletion paths': { globs, cwd: root }
      });
    }

    let spinner;

    if (!argv.quiet) {
      info(MESSAGES.clean(globs));
      spinner = spin(`Cleaning`);
    }

    await del(globs, { cwd: root });

    if (!argv.quiet) {
      spinner.succeed('Cleaned');
    }
  }
);
