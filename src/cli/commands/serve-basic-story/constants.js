// Native
const {hostname} = require('os');

// Ours
const {inlineList, styleLastSegment} = require('../../../utils/strings');
const {cmd, hvy, opt, sec} = require('../../../string-styles');

const OPTIONS = {
  boolean: [
    'debug',
    'help'
  ],
  alias: {
    debug: 'd',
    help: 'h'
  }
};

const USAGE = `
Usage: ${cmd('aunty serve-basic-story')} ${opt('[options]')}

${sec('Options')}

  ${opt('-d')}, ${opt('--debug')}  Use the ${hvy('build_debug')} config instead of ${hvy('build')}
  ${opt('-h')}, ${opt('--help')}   Display this help message and exit

`;

const MESSAGES = {
  STILL_WATCHING: `
  Still watching...`,
  watching: taskNames => `
  Watching files in ${
    inlineList(taskNames.map(taskName => hvy(taskName)))
  } build configs...`,
  watchEvent: (taskName, eventName, path) => `
  ${cmd(`${taskName}:${eventName}`)} ${styleLastSegment(path, cmd)}`,
  server: (hostname, port) => `
  Server listening at ${hvy(`http://${hostname}:${port}`)}`
};

const HOSTNAME = hostname();

module.exports = {
  OPTIONS,
  USAGE,
  MESSAGES,
  HOSTNAME
};
