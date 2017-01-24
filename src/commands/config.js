#!/usr/bin/env node

// Packages
const minimist = require('minimist');

// Ours
const {getConfig} = require('../config');
const {cmd, hvy, opt, req, sec} = require('../text');

const argv = minimist(process.argv.slice(2), {
  boolean: [
    'help'
  ],
  alias: {
    help: 'h'
  }
});

const help = () => {
  console.log(`
Usage: ${cmd('aunty config')} ${opt('[options]')}

${sec('Options')}

  ${opt('-h')}, ${opt('--help')}  Display this help message and exit
  `);

  process.exit(0);
}

if (argv.help) {
  help();
}

const config = getConfig();

console.log(`
The following ${hvy('aunty')} config was found in this project's ${hvy('package.json')}:

${req(JSON.stringify(config, null, '  '))}
`);
