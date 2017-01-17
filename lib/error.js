// Packages
const chalk = require('chalk');

function error (message) {
  console.error(`> ${chalk.red('Error!')} ${message}`);
}

function abort (message) {
  error(message);
  process.exit(1);
}

module.exports = {
  error,
  abort
};
