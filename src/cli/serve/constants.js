// Ours
const { cmd, hvy, opt, sec } = require('../../utils/color');

module.exports.MESSAGES = {
  serve: ({ hot, publicPath }) => `Serve (${hvy(process.env.NODE_ENV)}):
  ┣ ${hvy('hot')}: ${cmd(hot ? 'yes' : 'no')}
  ┗ ${hvy('publicPath')}: ${publicPath}`,
  // TODO: Add aunty config section to usage
  usage: name => `Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')}

${sec('Options')}

  ${opt('-d')}, ${opt('--dry')} Output the generated webpack & dev server configuration, then exit

${sec('Environment variables')}

  • Builds will assume you have set ${cmd('NODE_ENV=development')}, unless you specify otherwise.
  • You can override the host and port the server listens on by setting ${cmd('AUNTY_HOST')} and ${cmd('AUNTY_PORT')}.
`
};
