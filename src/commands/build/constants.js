// Ours
const {cmd, hvy, opt, sec} = require('../../utils/color');

module.exports.MESSAGES = {
  build: (nodeEnv, target, publicPath) => `Build (${hvy(nodeEnv)}):
  ┣ ${hvy('target')}     ${target || 'none'}
  ┗ ${hvy('publicPath')} ${publicPath}`,
  usage: name => `
Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')}

${sec('Options')}

  ${opt('-c PATH')}, ${opt('--credentials=PATH')}  File where target credentials/config is held ${opt('[default: "~/.abc-credentials"]')}
  ${opt('-i NAME')}, ${opt('--id=NAME')}           Id for this build (can be used to generate public root URL) ${opt(`[default: ${cmd('git branch')}]`)}
  ${opt('-t NAME')}, ${opt('--target=NAME')}       Target to build for (can be used to generate public root URL) ${opt('[default: ------]')}

  • If no ${opt('--target')} is specified, builds will assume the app will be available at the public root URL.
  • Builds will assume you have set ${cmd('NODE_ENV=production')}, unless you specify otherwise.
`
};
