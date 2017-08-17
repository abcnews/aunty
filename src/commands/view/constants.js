// Ours
const {hvy} = require('../../utils/color');
const {pretty} = require('../../utils/misc');

module.exports.MESSAGES = {
  found: config =>
    pretty`The following ${hvy('aunty')} config was found for this project:\n\n${config}`
};
