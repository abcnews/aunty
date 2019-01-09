// Native
const { resolve } = require('path');

// External
const importLazy = require('import-lazy')(require);
const minimist = importLazy('minimist');
const updateNotifier = importLazy('update-notifier');

// Ours
const pkg = require('../../package');
const { getProjectConfig } = require('../config/project');
const { pack, packs, throws } = require('../utils/async');
const { createCommandLogo } = require('../utils/branding');
const { log, timer } = require('../utils/logging');
const { merge } = require('../utils/structures');
const {
  COMMAND_ALIASES,
  COMMANDS,
  DEFAULTS,
  DRY_VARIATIONS,
  HELP_VARIATIONS,
  MESSAGES,
  SHORTHANDS,
  VERSION_VARIATIONS
} = require('./constants');

module.exports.cli = packs(async args => {
  const __DEBUG__stopTimer = timer('CLI');

  updateNotifier({ pkg, updateCheckInterval: 36e5 }).notify();

  // If we just want aunty's version number, print it, then exit

  if (args.some(arg => VERSION_VARIATIONS.includes(arg))) {
    return log(MESSAGES.version(pkg.version));
  }

  // Normalise the arguments (see function) and split them

  args = normalise(args);
  const [commandName, ...commandArgs] = args;

  // If we didn't supply a known command name, blow up, unless we wanted
  // aunty's usage message (in which case, print it, then exit).

  if (!COMMANDS.has(commandName)) {
    if (!commandName || args.includes(HELP_VARIATIONS[0])) {
      let isProject = true;

      try {
        const { type } = getProjectConfig();

        isProject = !!type;
      } catch (e) {
        isProject = false;
      }

      return log(MESSAGES.usage(isProject));
    }

    throw MESSAGES.unrecognised(commandName);
  }

  // Import the command

  const __DEBUG__stopImportTimer = timer(`CLI.import(${commandName})`);

  const commandFn = require(resolve(__dirname, `./${commandName}`));

  if (process.env.AUNTY_DEBUG) {
    __DEBUG__stopImportTimer();
  }

  // Execute the command with the remaining arguments

  const __DEBUG__stopExecuteTimer = timer(`CLI.execute(${commandName})`);

  throws(await commandFn(commandArgs, true));

  if (process.env.AUNTY_DEBUG) {
    __DEBUG__stopExecuteTimer();
    __DEBUG__stopTimer();
  }
});

const normalise = args => {
  // 1) Move any dry argument variation to second position, as '--dry'

  const dryArgIndex = args.findIndex(arg => DRY_VARIATIONS.includes(arg));

  if (dryArgIndex > -1) {
    args.splice(dryArgIndex, 1);
    args.splice(1, 0, DRY_VARIATIONS[0]);
  }

  // 2) Move any help argument variation to second position, as '--help'

  const helpArgIndex = args.findIndex(arg => HELP_VARIATIONS.includes(arg));

  if (helpArgIndex > -1) {
    args.splice(helpArgIndex, 1);
    args.splice(1, 0, HELP_VARIATIONS[0]);
  }

  // 3) If the first argument is a command alias, expand it

  args[0] = COMMAND_ALIASES[args[0]] || args[0];

  // 4) If the first argument is a shorthand, expand it

  const shorthand = SHORTHANDS[args[0]];

  if (shorthand) {
    args.splice.apply(args, [0, 1].concat(shorthand));
  }

  // 5) Return the normalised arguments

  return args;
};

module.exports.command = ({ name, nodeEnv, options, usage, hasSubcommands }, fn) => {
  name = name || DEFAULTS.name;
  options = merge(DEFAULTS.options, options);
  usage = usage || DEFAULTS.usage;

  return packs(async (args = [], isEntryCommand) => {
    const argv = minimist(args, options);

    if (!hasSubcommands) {
      if (argv.help) {
        return log(typeof usage === 'function' ? usage(name) : usage);
      }

      if (isEntryCommand) {
        log(createCommandLogo(name, argv.dry));
      }
    }

    if (!process.env.NODE_ENV && nodeEnv) {
      process.env.NODE_ENV = nodeEnv;
    }

    let [err] = await pack(fn(argv));

    if (err) {
      throw err;
    }
  });
};
