// Native
const { resolve } = require('path');

// External
const merge = require('webpack-merge');
const minimist = require('minimist');
const updateNotifier = require('update-notifier');

// Ours
const pkg = require('../../package');
const { getConfig: getProjectConfig } = require('../config/project');
const { pack, packs, throws } = require('../utils/async');
const { createCommandLogo } = require('../utils/branding');
const { log } = require('../utils/logging');
const { slugToCamel } = require('../utils/strings');
const { ALIASES, COMMANDS, YEOMAN_COMMANDS, DEFAULTS, OPTIONS, MESSAGES } = require('./constants');

const isArgHelpCommand = arg => {
  return (ALIASES[arg] || arg) === 'help';
};

module.exports.cli = packs(async args => {
  const argv = minimist(args, OPTIONS);

  updateNotifier({ pkg, updateCheckInterval: 36e5 }).notify();

  if (argv.version) {
    return log(MESSAGES.version(pkg.version));
  }

  let commandName = argv._[0] || '';
  const isHelp = isArgHelpCommand(commandName);

  let yeomanArgs;

  if (YEOMAN_COMMANDS.has(commandName)) {
    yeomanArgs = args;
  } else if (isHelp && YEOMAN_COMMANDS.has(argv._[1])) {
    yeomanArgs = args.slice(1).concat('--help');
  }

  if (yeomanArgs) {
    return await require('../commands/yeoman').run(yeomanArgs);
  }

  if (!commandName || (isHelp && (argv._.length === 1 || isArgHelpCommand(argv._[1])))) {
    return log(MESSAGES.usage());
  }

  if (isHelp) {
    commandName = argv._[1] || '';
  }

  if (!COMMANDS.has(commandName)) {
    throw MESSAGES.unrecognised(commandName);
  }

  commandName = ALIASES[commandName] || commandName;

  const commandFn = require(resolve(__dirname, `../commands/${commandName}`))[slugToCamel(commandName)];
  const commandFnArgs = isHelp ? ['--help'] : args.slice(1);

  throws(await commandFn(commandFnArgs));
});

let isEntryCommand;

module.exports.command = ({ name, options, usage, isProjectConfigRequired }, fn) => {
  name = name || DEFAULTS.name;
  options = merge(options || {}, DEFAULTS.options);
  usage = usage || MESSAGES.usageFallback;

  return packs(async (args = [], ...misc) => {
    const argv = minimist(args, options);
    const fnArgs = [argv, ...misc];
    let err;
    let config;

    if (argv.help) {
      return log(typeof usage === 'function' ? usage(name) : usage);
    }

    if (!isEntryCommand) {
      isEntryCommand = true;
      log(createCommandLogo(name));
    }

    argv.$ = args;

    if (isProjectConfigRequired) {
      config = getProjectConfig(argv);
      fnArgs.splice(1, 0, config);
    }

    if (!err) {
      [err] = await pack(fn(...fnArgs));
    }

    if (err) {
      throw err;
    }
  });
};
