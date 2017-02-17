// Ours
const {log} = require('../../../utils');
const {command} = require('../');
const {MESSAGES} = require('./constants');

module.exports = command({
  name: 'view',
  configRequired: true
}, async function (argv, config) {
  log(MESSAGES.found(config));
});
