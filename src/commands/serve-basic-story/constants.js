// Native
const {hostname} = require('os');

// Ours
const {inlineList, styleLastSegment} = require('../../utils/strings');
const {cmd, hvy, opt, sec} = require('../../string-styles');

module.exports.OPTIONS = {
  boolean: [
    'debug',
    'help'
  ],
  alias: {
    debug: 'd',
    help: 'h'
  }
};

const HOSTNAME = hostname();

module.exports.MESSAGES = {
  STILL_WATCHING: `
  Still watching...`,
  watching: taskNames => `
  Watching files in ${
    inlineList(taskNames.map(taskName => hvy(taskName)))
  } build configs...`,
  watchEvent: (taskName, eventName, path) => `
  ${cmd(`${taskName}:${eventName}`)} ${styleLastSegment(path, cmd)}`,
  server: port => `
  Server listening at ${hvy(`http://${HOSTNAME}:${port}`)}`
};
