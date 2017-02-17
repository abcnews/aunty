// Native
const {resolve} = require('path');

// External
const minimist = require('minimist');

// Ours
const {packs, throws} = require('../utils/async');
const {log} = require('../utils');
const {OPTIONS, USAGE, ALIASES, COMMANDS, MESSAGES} = require('./constants');

module.exports = packs(async function (args, isLocal) {
  const argv = minimist(args, OPTIONS);

  if (argv.version) {
    return log(MESSAGES.version(require('../../package').version, isLocal));
  }

  let commandName = argv._[0] || '';
  const isHelp = (ALIASES[commandName] || commandName) === 'help';

  if (!commandName || (isHelp && argv._.length === 1)) {
    return log(USAGE);
  }

  if (isHelp) {
    commandName = argv._[1] || '';
  }

  if (!COMMANDS.has(commandName)) {
    throw MESSAGES.unrecognised(commandName);
  }

  commandName = ALIASES[commandName] || commandName;

  const fn = require(resolve(__dirname, `./commands/${commandName}`));
  const fnArgs = isHelp ? ['--help'] : args.slice(1);

  throws(await fn(fnArgs));

  if (!isHelp) {
    return true;
  }
});
