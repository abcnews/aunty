// External
const importLazy = require('import-lazy')(require);
const pify = importLazy('pify');
const yeoman = importLazy('yeoman-environment');

// Ours
const { pack } = require('../../utils/async');
const { announce } = require('../../utils/audio');
const { createCommandLogo } = require('../../utils/branding');
const { log } = require('../../utils/logging');
const { command } = require('../');
const { GENERATOR_ALIASES, GENERATORS, MESSAGES, OPTIONS } = require('./constants');

module.exports = command(
  {
    name: 'generate',
    hasSubcommands: true,
    options: OPTIONS
  },
  async argv => {
    if (argv.dry) {
      throw MESSAGES.noDryRuns;
    }

    const generatorName = GENERATOR_ALIASES[argv._[0]] || argv._[0];
    const generatorArgs = argv['--'];

    // If we didn't supply a known generator name, blow up, unless we wanted
    // the generate command's usage message (in which case, print it, then exit).

    if (!GENERATORS.has(generatorName)) {
      if (argv.help) {
        return log(MESSAGES.usage);
      }

      throw generatorName.indexOf('-') === 0
        ? MESSAGES.generatorNameMissing
        : MESSAGES.generatorDoesNotExist(generatorName);
    }

    log(createCommandLogo(`generate ${generatorName}`));

    const env = yeoman.createEnv();

    // Register the generator

    const generatorPath = require.resolve(`../../generators/${generatorName}`);

    env.register(generatorPath, generatorName);

    // Run the generator, including known arguments

    const runArgs = [generatorName]
      .concat(argv['--'])
      .concat(argv.help ? ['--help'] : [])
      .join(' ');

    const [err] = await pack(pify(env.run.bind(env))(runArgs));

    if (err) {
      throw err;
    }

    if (argv.announce) {
      announce();
    }
  }
);
