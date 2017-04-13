// Global
const {error, log, warn} = console;

// Ours
const {delay} = require('./async');
const {EMPTY, NEWLINE, padRight} = require('./strings');

function createLogger(namespace, style = identity) {
  return message => log(`${style(namespace)}: ${message}`);
}

async function slog(message) {
  const parts = message.split(NEWLINE);
  
  while (parts.length > 0) {
    log(parts.shift());

    await Promise.resolve(delay(40));
  }
}

module.exports = {
  createLogger,
  error,
  log,
  slog,
  warn
};
