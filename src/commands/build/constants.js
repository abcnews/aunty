// Ours
const {cmd, opt, req, sec} = require('../../utils/color');

module.exports.MESSAGES = {
  usage: name => `
Usage: ${cmd('aunty')} ${req(name)} ${opt('[ftp]')}

${sec('Building for FTP')}

  When using the ${opt('ftp')} flag Aunty will look in your FTP config to try and guess the resulting
  URL and use that as your Webpack asset public path.
`
};
