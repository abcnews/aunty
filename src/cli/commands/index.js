// External
const minimist = require('minimist');

// Ours
const {getConfig} = require('../../projects');
const {pack, packs, throws} = require('../../utils/async');
const {log} = require('../../utils/console');
const {LOGO} = require('../constants');
const {DEFAULTS, MESSAGES} = require('./constants');

let stack = [];

function command({name, options, usage, isProxy, configRequired}, fn) {
  name = name || DEFAULTS.COMMAND_NAME;
  options = options || DEFAULTS.OPTIONS;
  usage = usage || MESSAGES.usage(name);

  return packs(async function (args = [], ...misc) {
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
}

function projectTypeRouter({name, isProxy}, commands) {
  return command({
    name: name,
    isProxy: isProxy,
    configRequired: ['type']
  }, async function (argv, config) {
    if (!commands[config.type]) {
      throw MESSAGES.unrecognised(config.type);
    }

    throws(await commands[config.type](argv.$));
  });
}

module.exports = {
  command,
  projectTypeRouter
};
