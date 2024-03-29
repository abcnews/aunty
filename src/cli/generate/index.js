// External
const importLazy = require('import-lazy')(require);
const yeoman = importLazy('yeoman-environment');

// Ours
const { pack } = require('../../utils/async');
const { announce } = require('../../utils/audio');
const { createCommandLogo } = require('../../utils/branding');
const { log } = require('../../utils/logging');
const { command } = require('../');
const { GENERATOR_ALIASES, GENERATORS, MESSAGES, OPTIONS } = require('./constants');

const generate = async argv => {
  if (argv.dry) {
    throw MESSAGES.noDryRuns;
  }

  const generatorName = GENERATOR_ALIASES[argv._[0]] || argv._[0];

  // If we didn't supply a known generator name, blow up, unless we wanted
  // the generate command's usage message (in which case, print it, then exit).

  if (!GENERATORS.has(generatorName)) {
    if (!generatorName || generatorName.indexOf('-') === 0 || argv.help) {
      return log(MESSAGES.usage);
    }

    throw MESSAGES.generatorDoesNotExist(generatorName);
  }

  log(createCommandLogo(`generate ${generatorName}`));

  // If we're in a test environment, insert the auto adapter with the provided answers
  const env = global.auntyYeomanAnswers
    ? yeoman.createEnv([], {}, new (require('yeoman-automation-adapter').AutoAdapter)(global.auntyYeomanAnswers, true))
    : yeoman.createEnv();

  // Register the generator

  const generatorPath = require.resolve(`../../generators/${generatorName}`);

  env.register(generatorPath, generatorName);

  // Run the generator, including known arguments

  const runArgs = [generatorName]
    .concat(argv['--'])
    .concat(argv.help ? ['--help'] : [])
    .join(' ');

  const [err] = await pack(env.run(runArgs));

  if (err) {
    throw err;
  }

  if (argv.announce) {
    announce();
  }
};

module.exports = command(
  {
    name: 'generate',
    hasSubcommands: true,
    options: OPTIONS
  },
  generate
);

// Expose this for the tests
module.exports._testGenerate = generate;
