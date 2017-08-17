// External
const del = require('del');

// Ours
const {packs, unpack} = require('../../utils/async');
const {log} = require('../../utils/console');
const {command} = require('../');
const {OPTIONS, DEFAULTS, USAGE, MESSAGES} = require('./constants');

// Wrapped
const rm = packs(del);

module.exports.clean = command({
  name: 'clean',
  options: OPTIONS,
  usage: USAGE,
  configRequired: ['type']
}, async (argv, config) => {
  let globs = argv._.length ? argv._ : config.clean;

  if (!Array.isArray(globs) && typeof globs !== 'string') {
    globs = DEFAULTS[config.type];
  }

  const paths = unpack(await rm(globs, {cwd: config.root}));

  log(MESSAGES.deletion(paths.map(path => path.replace(config.root, ''))));
});
