// Native
const {resolve} = require('path');

// External
const minimist = require('minimist');
const updateNotifier = require('update-notifier');

// Ours
const pkg = require('../../package');
const {packs, throws} = require('../utils/async');
const {log} = require('../utils/console');
const {slugToCamel} = require('../utils/strings');
const {OPTIONS, ALIASES, COMMANDS, MESSAGES} = require('./constants');

module.exports.cli = packs(async (args, isGlobal) => {
  const argv = minimist(args, OPTIONS);

  if (isGlobal) {
    updateNotifier({pkg, updateCheckInterval: 36e5}).notify();
  }

  if (argv.version) {
    return log(MESSAGES.version(pkg.version, !isGlobal));
  }

  let commandName = argv._[0] || '';
  const isHelp = (ALIASES[commandName] || commandName) === 'help';

  if (!commandName || (isHelp && argv._.length === 1)) {
    return log(MESSAGES.usage());
  }

  if (isHelp) {
    commandName = argv._[1] || '';
  }

  if (!COMMANDS.has(commandName)) {
    throw MESSAGES.unrecognised(commandName);
  }

  commandName = ALIASES[commandName] || commandName;

  const commandFn = require(
    resolve(__dirname, `./commands/${commandName}`)
  )[slugToCamel(commandName)];
  const commandFnArgs = isHelp ? ['--help'] : args.slice(1);

  throws(await commandFn(commandFnArgs));
});
