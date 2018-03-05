var yeoman = require('yeoman-environment');
var { announce } = require('../utils/audio');

module.exports.run = args => {
  return new Promise((resolve, reject) => {
    var env = yeoman.createEnv();

    // Work out if it was just the 'new' command
    let command = args.shift();

    if (command === 'new') {
      command = 'aunty';
      generator = require.resolve(`@abcnews/generator-aunty`);
    } else if (command === 'init') {
      command = 'aunty';
      generator = require.resolve(`@abcnews/generator-aunty`);
      args.push('--here');
    } else {
      // Command is actually the next arg (after generate)
      command = args.shift();
      generator = require.resolve(`@abcnews/generator-aunty/generators/${command}`);
      command = `aunty:${command}`;
    }

    args.push('--aunty');

    env.register(generator, command);
    env.run(`${command} ${args.join(' ')}`, () => {
      if (args.indexOf('--announce') > -1 || args.indexOf('-a') > -1) {
        announce();
      }

      resolve();
    });
  });
};
