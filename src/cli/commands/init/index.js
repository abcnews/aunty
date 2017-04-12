// Native
const {basename} = require('path');

// Ours
const {throws} = require('../../../utils/async');
const {'new': _new} = require('../new');
const {command} = require('../');
const {OPTIONS, USAGE} = require('./constants');

const init = command({
  name: 'init',
  options: OPTIONS,
  usage: USAGE
}, async function (argv) {
  const args = argv.$.slice(0, 1)
    .concat(['.', `--name=${basename(process.cwd())}`])
    .concat(argv.$.slice(1));

  throws(await _new(args));
});

module.exports = {
  init
};
