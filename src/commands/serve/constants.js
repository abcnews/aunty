// Ours
const { cmd, opt, sec } = require('../../utils/color');
const { DEV_SERVER_PORT } = require('../../projects/constants');

module.exports.OPTIONS = {
  string: ['host', 'hot', 'port']
};

module.exports.MESSAGES = {
  usage: name => `
Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')}

${sec('Options')}

  ${opt('-d')}, ${opt('--dry')}      Output the generated webpack & dev server configuration, then exit
  ${opt('--(no-)hot')}     Turn hot-reloading on/off ${opt('[default: on]')}
  ${opt('--host=DOMAIN')}  Hostname for development server ${opt(`[default: ${cmd('hostname')}]`)}
  ${opt('--port=NUMBER')}  Port for development server ${opt(`[default: ${DEV_SERVER_PORT}]`)}

  • Builds will assume you have set ${cmd('NODE_ENV=development')}, unless you specify otherwise.
`
};
