#!/usr/bin/env node

// Packages
const updateNotifier = require('update-notifier');

// Ours
const cli = require('../lib/cli');
const {bad} = require('../lib/text');
const pkg = require('../package');

const ONE_HOUR = 1000 * 60 * 60;

const exit = status => {
  if (typeof status === 'string') {
    console.error(`${bad('Error!')} ${status}`);
    process.exit(1);
  }

  process.exit(status || 0);
};

updateNotifier({pkg, updateCheckInterval: ONE_HOUR}).notify();

cli(process.argv.slice(2), pkg, exit);
