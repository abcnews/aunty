// Ours
const { cmd, hvy, opt, sec } = require('../../utils/color');

const BUNDLE_ANALYZER_CONFIG = (module.exports.BUNDLE_ANALYZER_CONFIG = {
  analyzerHost: '127.0.0.1',
  logLevel: 'warn',
  openAnalyzer: false
});

module.exports.MESSAGES = {
  analysis: ({ analyzerHost, analyzerPort }) => `http://${analyzerHost}:${analyzerPort}`,
  serve: ({ hot, bundleAnalysisPath }) => `Serve (${hvy(process.env.NODE_ENV)}):
  ┣ ${hvy('hot')}: ${cmd(hot ? 'yes' : 'no')}
  ┗ ${hvy('bundle analysis')}: ${bundleAnalysisPath}`,
  // TODO: Add aunty config section to usage
  usage: name => `Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')}

${sec('Options')}

  ${opt('-d')}, ${opt('--dry')} Output the generated webpack & dev server configuration, then exit

${sec('Environment variables')}

  • Builds will assume you have set ${cmd('NODE_ENV=development')}, unless you specify otherwise.
  • You can override the host and port the server listens on by setting ${cmd('AUNTY_HOST')} and ${cmd('AUNTY_PORT')}.
`
};
