// Global
const { error, log, time, timeEnd } = console;

// Native
const { inspect } = require('util');

// External
const logSymbols = require('log-symbols');
const ora = require('ora');

// Ours
const { SPINNER_FRAMES } = require('./branding');
const { cmd, opt, sec } = require('./color');

inspect.styles.name = 'blue';

const DEBUG_SYMBOL = cmd('»');
const UTIL_INSPECT_OPTIONS = { colors: true, depth: null };

module.exports.debug = (...args) => log(...[DEBUG_SYMBOL].concat(args));
module.exports.error = (...args) => error(...[logSymbols.error].concat(args));
module.exports.info = (...args) => log(...[logSymbols.info].concat(args));
module.exports.log = log;
module.exports.success = (...args) => log(...[logSymbols.success].concat(args));
module.exports.warn = (...args) => error(...[logSymbols.warning].concat(args));

module.exports.timer = name => {
  const label = `${DEBUG_SYMBOL} ${opt(name)} time`;

  time(label);

  return () => timeEnd(label);
};

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

module.exports.spin = (text, { color = 'cyan', frames = SPINNER_FRAMES } = {}) => {
  const spinner = ora({
    color,
    spinner: {
      frames,
      interval: 80
    },
    text
  });

  return spinner.start();
};
