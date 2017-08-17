// Native
const {basename} = require('path');

// Ours
const {command} = require('../../cli');
const {throws} = require('../../utils/async');
const {new: _new} = require('../new');
const {OPTIONS, MESSAGES} = require('./constants');

module.exports.init = command({
  name: 'init',
  options: OPTIONS,
  usage: MESSAGES.usage
}, async argv => {
  const args = argv.$.slice(0, 1)
    .concat(['.', `--name=${basename(process.cwd())}`])
    .concat(argv.$.slice(1));

  throws(await _new(args));
});
