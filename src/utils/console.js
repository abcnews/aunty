// Global
const {error, log, warn} = console;

// Ours
const {identity} = require('./misc');

function createLogger(namespace, style = identity) {
  return message => log(`${style(namespace)}: ${message}`);
}

module.exports = {
  createLogger,
  error,
  log,
  warn
};
