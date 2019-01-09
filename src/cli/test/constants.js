// Ours
const { cmd, opt, sec } = require('../../utils/color');

module.exports.MESSAGES = {
  usage: name => `Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')} -- ${opt('[jest_options]')}

${sec('Options')}

  ${opt('-d')}, ${opt('--dry')}  Output the generated jest configuration, then exit

${sec('Environment variables')}

  • Tests will assume you have set ${cmd('NODE_ENV=test')}, unless you specify otherwise.
`
};
