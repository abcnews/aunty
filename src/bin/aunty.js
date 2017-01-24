#!/usr/bin/env node

// Native
const {resolve} = require('path');

// Packages
const minimist = require('minimist');
const nodeVersion = require('node-version');

// Ours
const pkg = require('../../package');
const {abort, error} = require('../lib/error');
const {abc, cmd, hvy, opt, req, sec} = require('../lib/text');

// Support for keywords "async" and "await"
require('async-to-gen/register')({excludes: null});

// Throw an error if node version is too low
if (nodeVersion.major < 6) {
  abort(`${hvy('aunty')} requires at least version 6 of Node`);
}

const argv = minimist(process.argv.slice(2), {
  boolean: [
    'help',
    'version'
  ],
  alias: {
    help: 'h',
    version: 'v'
  }
});

const COMMANDS = [
  'config',
  'deploy',
  'help',
  'release',
  'c',
  'd',
  'r'
];

const COMMANDS_ALIASES = {
  c: 'config',
  d: 'deploy',
  r: 'release'
};

if (argv.version) {
  console.log(`${hvy('aunty')} v${pkg.version}`);
  process.exit(0);
}

const help = () => {
  console.log(`
 ${cmd('▗▓▓▓▓▙   ▟▓▓▓▓▙   ▟▓▓▓▓▖')}                                     ▗▄▄
 ${cmd('▓▓▓▓▓▓▙ ▜▓▓▓▓▓▓▙ ▜▓▓▓▓▓▓')}                                     ▓▓▓
 ${cmd('▓▓▓ ▜▓▓▙ ▜▛  ▜▓▓▙ ▜▛ ▓▓▓')}   ▜▓▓▓▓▓▙▖  ▓▓▓    ▓▓▓  ▓▓▙▟▓▓▓▓▙▖ ▓▓▓▓▓▛ ▜▓▙    ▗▓▓▘
 ${cmd('▓▓▓ ▝▓▓▓▙ ▘  ▝▓▓▓▙ ▘ ▓▓▓')}       ▝▓▓▓  ▓▓▓    ▓▓▓  ▓▓▓▛  ▝▓▓▓  ▓▓▓    ▜▓▙  ▗▓▓▘
 ${cmd('▓▓▓  ▝▓▓▓▖    ▝▓▓▓▖  ▓▓▓')}  ▗▟▓▓▓▓▓▓▓  ▓▓▓    ▓▓▓  ▓▓▓    ▓▓▓  ▓▓▓     ▜▓▙▗▓▓▘
 ${cmd('▓▓▓ ▗ ▜▓▓▓▖  ▗ ▜▓▓▓▖ ▓▓▓')}  ▓▓▓  ▗▓▓▓  ▓▓▓▖  ▟▓▓▓  ▓▓▓    ▓▓▓  ▓▓▓▖     ▜▓▓▓▘
 ${cmd('▓▓▓ ▟▙ ▜▓▓▙  ▟▙ ▜▓▓▙ ▓▓▓')}  ▝▜▓▓▓▛▜▓▓▓  ▜▓▓▓▓▛▜▓▓  ▓▓▓    ▓▓▓  ▝▓▓▓▓▖   ▗▓▓▘
 ${cmd('▓▓▓▓▓▓▙ ▜▓▓▓▓▓▓▙ ▜▓▓▓▓▓▓')}                                             ▗▓▓▘
 ${cmd('▝▓▓▓▓▛   ▜▓▓▓▓▛   ▜▓▓▓▓▘')}                                           ▟▓▓▛

Usage: ${cmd('aunty')} ${req('<command>')} ${opt('[options]')} ${opt('[command_options]')}

${sec('Options')}

  ${opt('-h')}, ${opt('--help')}     Display this help message and exit
  ${opt('-v')}, ${opt('--version')}  Print ${hvy('aunty')}'s version

${sec('Commands')}

  ${cmd('aunty config')}
    Output the current project's known configuration.

  ${cmd('aunty deploy')}
    Deploy the project in the current directory.

  ${cmd('aunty release')}
    Tag and deploy the project in the current directory.

  ${cmd('aunty help')} ${req('<command>')}
    Display complete help for ${req('command')}.
  `);

  process.exit(0);
}

if (argv._.length === 0 || argv._.length === 1 && argv._[0] === 'help') {
  help();
}

let command = argv._[0];
let isHelpOnly;

if (command === 'help') {
  isHelpOnly = true;
  command = argv._[1];
}

if (COMMANDS.indexOf(command) < 0) {
  help();
}

command = COMMANDS_ALIASES[command] || command;

const bin = resolve(__dirname, '../commands/' + command + '.js');
const binArgv = process.argv.slice(0, 2);

if (isHelpOnly) {
  process.argv = process.argv.slice(0, 2).concat('--help');
} else {
  process.argv = process.argv.slice(0, 2).concat(process.argv.slice(3));
}

// Load sub command
require(bin, 'may-exclude');
