// Ours
const {hvy} = require('../../utils/color');
const {pretty} = require('../../utils/misc');
const {indented} = require('../../utils/strings');

module.exports.MESSAGES = {
  found: config => indented(pretty`
The following ${hvy('aunty')} config was found for this project:

${config}`)
};
