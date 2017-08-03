// Global
const {error, log, warn} = console;

// Ours
const {identity} = require('./misc');

module.exports.error = error;
module.exports.log = log;
module.exports.warn = warn;

module.exports.createLogger = (namespace, style = identity) =>
  message => log(`${style(namespace)}: ${message}`);
