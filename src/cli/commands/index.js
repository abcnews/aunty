// External
const minimist = require('minimist');

// Ours
const {getConfig} = require('../../projects');
const {pack, packs, throws} = require('../../utils/async');
const {log} = require('../../utils/console');
const {LOGO} = require('../constants');
const {DEFAULTS, MESSAGES} = require('./constants');

const stack = [];

const command = module.exports.command = ({
  name,
  options,
  usage,
  isProxy,
  configRequired
}, fn) => {
  name = name || DEFAULTS.COMMAND_NAME;
  options = options || DEFAULTS.OPTIONS;
  usage = usage || MESSAGES.usage(name);

  return packs(async (args = [], ...misc) => {
    const argv = minimist(args, options);
    const fnArgs = [argv, ...misc];
    let err;
    let config;
    let requiredProps;

    if (usage && argv.help) {
      log(LOGO);
      log(usage);
      return;
    }

    argv.$ = args;

    if (!isProxy) {
      stack.push(name);
      log(MESSAGES.started(stack));
    }

    if (configRequired) {
      requiredProps = Array.isArray(configRequired) ? configRequired : [];
      [err, config] = await getConfig(requiredProps);
      fnArgs.splice(1, 0, config);
    }

    if (!err) {
      [err] = await pack(fn(...fnArgs));
    }

    if (err) {
      if (!isProxy) {
        log(MESSAGES.failed(stack));
        stack.pop();
      }

      throw err;
    }

    if (!isProxy) {
      log(MESSAGES.completed(stack));
      stack.pop();
    }
  });
};

module.exports.projectTypeRouter = ({name, isProxy}, commands) =>
  command({
    name: name,
    isProxy: isProxy,
    configRequired: ['type']
  }, async (argv, config) => {
    if (!commands[config.type]) {
      throw MESSAGES.unrecognised(config.type);
    }

    throws(await commands[config.type](argv.$));
  });
