// External
const jest = require('jest');

// Ours
const { command } = require('../../cli');
const { createConfig } = require('../../config/jest');
const { dry, spin } = require('../../utils/logging');
const { MESSAGES } = require('./constants');

module.exports.test = command(
  {
    name: 'test',
    isProjectConfigRequired: true,
    usage: MESSAGES.usage
  },
  async (argv, config) => {
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'test';
    }

    const jestConfig = createConfig(config);

    const jestArgs = argv._.concat(['--config', JSON.stringify(jestConfig)]);

    if (argv.dry) {
      return dry({
        'Jest config': jestConfig,
        'Jest args': jestArgs
      });
    }

    await jest.run(jestArgs);
  }
);
