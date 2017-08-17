// Ours
const {cmd, opt, req, sec} = require('../../string-styles');

const WEBPACK_USAGE = `Usage: ${cmd('aunty')} ${req('build')} ${opt('[ftp]')}

${sec('Building for FTP')}

  When using the ${opt('ftp')} flag Aunty will look in your FTP config to try and guess the resulting
  URL and use that as your Webpack asset public path.
`;

module.exports = {
  WEBPACK_USAGE
};
