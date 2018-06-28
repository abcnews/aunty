// Ours
const { cmd, opt, sec } = require('../../utils/color');

module.exports.MESSAGES = {
  usage: name => `
Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')}

${sec('Options')}

  ${opt('-d')}, ${opt('--dry')}   Output the generated jest configuration, then exit

  • Tests will assume you have set ${cmd('NODE_ENV=test')}, unless you specify otherwise.
  • Options not recognised by aunty will be passed into jest, (e.g. ${opt('--watch')})
`
};

module.exports.USED_ARGS = ['--dry', '-d'];
