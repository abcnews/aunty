#!/usr/bin/env node

// External
const resolve = require('resolve');

// Ours
const {name} = require('../../package');
const {bad, ok} = require('../string-styles');

let cli;
let isGlobal;

// Always prefer local CLI
try {
  cli = require(resolve.sync(`${name}/src/cli`, {basedir: process.cwd()}));
} catch (err) {
  isGlobal = true;
  cli = require('../cli');
}

(async function () {
  const [err, wasCommandExecuted] = await cli(process.argv.slice(2), isGlobal);

  if (err) {
    console.error(bad('\nExit-causing error:\n'));
    console.error(err);
    process.exit(1);
  }

  if (wasCommandExecuted) {
    console.log(ok('\nAll Done!'));
  }

  process.exit(0);
})();
