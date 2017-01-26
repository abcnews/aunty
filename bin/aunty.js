#!/usr/bin/env node

// Ours
const {bad} = require('../lib/text');
const cli = require('../lib/cli');

const exit = status => {
  if (typeof status === 'string') {
    console.error(`${bad('Error!')} ${status}`);
    process.exit(1);
  }

  process.exit(status || 0);
};

cli(process.argv.slice(2), exit);
