// Ours
const {log} = require('../../../utils/console');
const {command} = require('../');
const {MESSAGES} = require('./constants');

const view = command({
  name: 'view',
  configRequired: true
}, async function (argv, config) {
  log(MESSAGES.found(config));
});

module.exports = {
  view
};
