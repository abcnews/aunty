// Packages
const {bad} = require('./text');

function error (message) {
  console.error(`> ${bad('Error!')} ${message}`);
}

function abort (message) {
  error(message);
  process.exit(1);
}

module.exports = {
  error,
  abort
};
