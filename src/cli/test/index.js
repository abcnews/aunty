// External
const importLazy = require('import-lazy')(require);
const jest = importLazy('jest');

// Ours
const { command } = require('../');
const { getJestConfig } = require('../../config/jest');
const { dry } = require('../../utils/logging');
const { MESSAGES } = require('./constants');

module.exports = command(
  {
    name: 'test',
    nodeEnv: 'test',
    usage: MESSAGES.usage
  },
  async argv => {
    const config = getJestConfig();
    const jestArgs = ['--config', JSON.stringify(config)].concat(argv['--']);

    if (argv.dry) {
      return dry({
        'Jest config': config,
        'Jest args': jestArgs
      });
    }

    await jest.run(jestArgs);
  }
);
