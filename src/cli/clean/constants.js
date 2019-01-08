// Ours
const { cmd, hvy } = require('../../utils/color');
const { inlineList } = require('../../utils/text');

module.exports.MESSAGES = {
  clean: paths => `Clean:
  ┗ ${hvy('paths')} ${inlineList(paths)}`,
  usage: name => `Usage: ${cmd(`aunty ${name}`)}
`
};
