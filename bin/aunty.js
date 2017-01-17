#!/usr/bin/env node

// Native
const {resolve} = require('path');

// Packages
const chalk = require('chalk');
const nodeVersion = require('node-version');

// Ours
const {error, abort} = require('../lib/error');

let config;

try {
  config = require(resolve('package')).aunty;
} catch (err) {
  abort(`Aunty should be run in the root directory of a project with a valid ${chalk.dim('package.json')} file.`);
}

if (typeof config !== 'object') {
  abort(`This project has no ${chalk.dim('aunty')} property in its ${chalk.dim('package.json')} file.`);
}

// Support for keywords "async" and "await"
require('async-to-gen/register')({excludes: null});

// Throw an error if node version is too low
if (nodeVersion.major < 6) {
  abort('Aunty requires at least version 6 of Node');
}

const usage = () => {
  console.log(`
  ${chalk.bold('aunty')} <command> [options]

  ${chalk.dim('Commands:')}
    deploy        Deploy the project in the current directory
    release       Tag a new release (using ${chalk.dim('package.json:version')}), then deploy it
    help [cmd]    Display complete help for [cmd]

  ${chalk.dim('Examples:')}
  ${chalk.gray('–')} Deploy the project in the current directory
    ${chalk.cyan('$ aunty deploy')}
  ${chalk.gray('–')} Display comprehensive help for the subcommand ${chalk.dim('`release`')}
    ${chalk.cyan('$ aunty help release')}
  `);

  process.exit(0);
}

const commands = new Set([
  'deploy',
  'release',
  'config',
  'help',
  'd',
  'r',
  'c'
]);

const aliases = new Map([
  ['d', 'deploy'],
  ['r', 'release'],
  ['c', 'config']
]);

let cmd;
const args = process.argv.slice(2);
const index = args.findIndex(a => commands.has(a));

if (index < 0) {
  usage();
}

cmd = args[index];
args.splice(index, 1);

if (cmd === 'help') {
  if (index < args.length && commands.has(args[index])) {
    cmd = args[index];
    args.splice(index, 1);
    args.unshift('--help');
  } else {
    error('Unrecognised command. No help avaialble.');
    usage();
  }
}

cmd = aliases.get(cmd) || cmd;

const bin = resolve(__dirname, 'aunty-' + cmd + '.js');

// Prepare process.argv for subcommand
process.argv = process.argv.slice(0, 2).concat(args);

// Load sub command
require(bin, 'may-exclude');
