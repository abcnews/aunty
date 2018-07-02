// Global
const { error, info, log, warn } = console;

// Native
const { inspect } = require('util');

// External
const logSymbols = require('log-symbols');
const ora = require('ora');

// Ours
const { SPINNER_FRAMES } = require('./branding');
const { opt, sec } = require('./color');

inspect.styles.name = 'blue';

const UTIL_INSPECT_OPTIONS = { colors: true, depth: null };

module.exports.log = log;
module.exports.info = (...args) => info(...[logSymbols.info].concat(args));
module.exports.success = (...args) => info(...[logSymbols.success].concat(args));
module.exports.warn = (...args) => warn(...[logSymbols.warning].concat(args));
module.exports.error = (...args) => error(...[logSymbols.error].concat(args));

// Can be used as a funtion or a tagged template literal;
const pretty = (module.exports.pretty = (inputs, ...values) => {
  if (values.length === 0 || !Array.isArray(inputs) || inputs.filter(str => typeof str !== 'string').length > 0) {
    values = [...arguments];
    inputs = values.map(() => '');
  }

  const pairWithValue = (str, index) => {
    const value = values[index];
    const valueStr = value == null ? '' : typeof value === 'string' ? value : inspect(value, UTIL_INSPECT_OPTIONS);

    return str + valueStr;
  };

  return inputs.map(pairWithValue).join('');
});

module.exports.dry = config => {
  Object.keys(config).forEach(key =>
    log(
      `${opt('[dry]')} ${sec(key)}

${pretty`${config[key]}`}
`
    )
  );
};

module.exports.spin = (text, color) => {
  const spinner = ora({
    color: color || 'cyan',
    spinner: {
      frames: SPINNER_FRAMES,
      interval: 80
    },
    text
  });

  return spinner.start();
};
