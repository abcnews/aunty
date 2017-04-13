// Native
const {inspect} = require('util');

inspect.styles.name = 'blue';

const UTIL_INSPECT_OPTIONS = {colors: true, depth: null};

function getLongest(items) {
  return items.reduce((a, b) => a.length > b.length ? a : b);
}

function identity(x) {
  return x;
}

// Can be used as a funtion or a tagged template literal;
function pretty(inputs, ...values) {
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
}

module.exports = {
  getLongest,
  identity,
  pretty
};
