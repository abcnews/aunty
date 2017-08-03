// Ours
const {log} = require('../../../utils/console');
const {command} = require('../');
const {MESSAGES} = require('./constants');

module.exports.view = command({
  name: 'view',
  configRequired: true
}, async (argv, config) => log(MESSAGES.found(config)));
