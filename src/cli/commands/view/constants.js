// Ours
const {hvy} = require('../../../string-styles');
const {indented} = require('../../../utils/strings');
const {pretty} = require('../../../utils');

const MESSAGES = {
  found: config => indented(pretty`
The following ${hvy('aunty')} config was found for this project:

${config}`)
};

module.exports = {
  MESSAGES
};
