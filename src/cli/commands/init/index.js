// Native
const {basename} = require('path');

// Ours
const {throws} = require('../../../utils/async');
const _new = require('../new');
const {command} = require('../');
const {OPTIONS, USAGE} = require('./constants');

module.exports = command({
  name: 'init',
  options: OPTIONS,
  usage: USAGE
}, async argv => {
  const args = argv.$.slice(0, 1)
    .concat(['.', `--name=${basename(process.cwd())}`])
    .concat(argv.$.slice(1));

  throws(await _new(args));
});
