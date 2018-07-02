// Native
const path = require('path');

// External
const yeoman = require('yeoman-environment');

// Ours
const { announce } = require('../utils/audio');

const CREATE_HERE_ARGS = ['init', 'i'];
const CREATE_ARGS = ['new', 'n'].concat(CREATE_HERE_ARGS);
const ANNOUNCE_ARGS = ['--announce', '-a'];
const MESSAGES = {
  generatorNameMissing: 'Generator name missing',
  generatorDoesNotExist: name => `The generator '${name}' does not exist.`
};

module.exports.run = args => {
  return new Promise((resolve, reject) => {
    const env = yeoman.createEnv();
    const commandArg = args.shift();
    let commandName = 'aunty';
    let generatorPath = path.resolve(__dirname + '/../generators');
    let generatorName = 'app';
    let generator;

    if (['f', 'fragment'].includes(commandArg)) {
      generatorName = 'fragment';
    } else if (!CREATE_ARGS.includes(commandArg) && args[0] !== '--help') {
      generatorName = args.shift();

      if (!generatorName || generatorName.indexOf('-') === 0) {
        return reject(new Error(MESSAGES.generatorNameMissing));
      }

      commandName += ':' + generatorName;
    } else if (CREATE_HERE_ARGS.includes(commandArg)) {
      args.push('--here');
    }

    generatorPath += '/' + generatorName;

    try {
      generator = require.resolve(generatorPath);
    } catch (error) {
      return reject(new Error(MESSAGES.generatorDoesNotExist(generatorName)));
    }

    args.push('--aunty');
    env.register(generator, commandName);
    env.run(`${commandName} ${args.join(' ')}`, () => {
      if (ANNOUNCE_ARGS.some(x => args.includes(x))) {
        announce();
      }

      resolve();
    });
  });
};
