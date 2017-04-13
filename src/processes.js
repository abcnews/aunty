// Native
const {exec} = require('child_process');

// External
const pify = require('pify');

// Ours
const {packs} = require('./utils/async');

// Wrapped
const execute = packs(pify(exec, {multiArgs: true}));

module.exports.exec = packs(async (rawCommand, options, isStderrIgnored) => {
  const [err, [stdout, stderr]] = await execute(rawCommand, options);

  if (err || (stderr && !isStderrIgnored)) {
    throw err || stderr;
  }

  return stdout;
});
