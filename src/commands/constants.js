// Ours
const {cmd, hvy, opt, sec} = require('../utils/color');

module.exports.DEFAULTS = {
  NAME: '__command__',
  OPTIONS: {
    boolean: 'help',
    alias: {
      help: 'h'
    }
  }
};

module.exports.MESSAGES = {
  unrecognised: type => `\nUnrecognised project type: ${hvy(type)}`,
  usage: name => `
Usage: ${cmd('aunty')} ${cmd(name)} ${opt('[options]')}

${sec('Options')}

  ${opt('-h')}, ${opt('--help')}  Display this help message and exit
`
};
