#!/usr/bin/env node

// Ours
const cli = require('../lib/cli');
const {bad} = require('../lib/text');
const pkg = require('../package');

const exit = status => {
  if (typeof status === 'string') {
    console.error(`${bad('Error!')} ${status}`);
    process.exit(1);
  }

  process.exit(status || 0);
};

cli(process.argv.slice(2), pkg, exit);
