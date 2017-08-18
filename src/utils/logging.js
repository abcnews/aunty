// Global
const {error, log, warn} = console;

// Native
const {inspect} = require('util');

// Ours
const {hvy} = require('./color');

inspect.styles.name = 'blue';

const UTIL_INSPECT_OPTIONS = {colors: true, depth: null};

module.exports.error = error;
module.exports.log = log;
module.exports.warn = warn;

module.exports.createLogger = namespace =>
  message => log(`${hvy(namespace)}: ${message}`);

// Can be used as a funtion or a tagged template literal;
module.exports.pretty = (inputs, ...values) => {
  if (
    values.length === 0 ||
    !Array.isArray(inputs) ||
    inputs.filter(str => typeof str !== 'string').length > 0
  ) {
    values = [...arguments];
    inputs = values.map(() => '');
  }

  const pairWithValue = (str, index) => {
    const value = values[index];
    const valueStr = (
      value == null ? '' :
      typeof value === 'string' ? value :
      inspect(value, UTIL_INSPECT_OPTIONS)
    );

    return str + valueStr;
  };

  return inputs.map(pairWithValue).join('');
};
