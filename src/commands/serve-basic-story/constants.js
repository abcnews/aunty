// Native
const {hostname} = require('os');

// Ours
const {cmd, hvy} = require('../../utils/color');
const {inlineList, styleLastSegment} = require('../../utils/strings');

module.exports.OPTIONS = {
  boolean: [
    'debug'
  ]
};

const HOSTNAME = hostname();

module.exports.MESSAGES = {
  STILL_WATCHING: `Still watching…`,
  watching: taskNames =>
    `Watching files in ${inlineList(taskNames.map(taskName => hvy(taskName)))} build configs…`,
  watchEvent: (taskName, eventName, path) => `${cmd(`${taskName}:${eventName}`)} ${styleLastSegment(path, cmd)}`,
  server: port => `Server listening at ${hvy(`http://${HOSTNAME}:${port}`)}`
};
