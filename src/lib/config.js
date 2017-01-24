// Ours
const {abort} = require('./error');
const {getPackage} = require('./package');
const {hvy} = require('./text');

const ERROR_MESSAGE = property => `This project has no ${hvy('aunty' + (property ? property : ''))} property in its ${hvy('package.json')} file.`;

const getConfig = command => {
  const config = getPackage('aunty');

  if (typeof config !== 'object') {
    abort(ERROR_MESSAGE());
  }

  if (command == null) {
    return config;
  }

  if (typeof config[command] !== 'object') {
    abort(ERROR_MESSAGE(command));
  }

  return config[command];
}

module.exports = {
  getConfig
};
