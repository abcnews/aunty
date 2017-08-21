// Ours
const {hvy} = require('../../utils/color');

module.exports.MESSAGES = {
  build: (nodeEnv, target, publicPath) => `Build (${hvy(nodeEnv)}):
  ┣ ${hvy('target')}     ${target || 'none'}
  ┗ ${hvy('publicPath')} ${publicPath}`
};
