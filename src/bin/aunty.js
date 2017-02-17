#!/usr/bin/env node

// External
const resolve = require('resolve');

// Ours
const {name} = require('../../package');
const {bad, ok} = require('../string-styles');

let cli;
let isLocal;

// Always prefer local CLI to global
try {
  cli = require(resolve.sync(`${name}/lib/cli`, {basedir: process.cwd()}));
  isLocal = true;
} catch (err) {
  cli = require('../cli');
}

(async function () {
  const [err, wasCommandExecuted] = await cli(process.argv.slice(2), isLocal);

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
