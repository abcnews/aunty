// Native
const {resolve} = require('path');

// Ours
const {abort} = require('./error');
const {hvy} = require('./text');

const ERROR_MESSAGE = `This command can only be run in the root directory of a project containing ${hvy('package.json')} file.`;

const getPackage = (property) => {
  let pkg;

  try {
    pkg = require(resolve('package'));
  } catch (err) {
    abort(ERROR_MESSAGE);
  }

  if (property) {
    return pkg[property];
  }

  return pkg;
}

module.exports = {
  getPackage
};
