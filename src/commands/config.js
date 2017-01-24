#!/usr/bin/env node

// Packages
const minimist = require('minimist');

// Ours
const {getConfig} = require('../config');
const {cmd, hvy, opt, req, sec} = require('../text');

const argv = minimist(process.argv.slice(2), {
  string: [
    'property'
  ],
  boolean: [
    'help'
  ],
  alias: {
    property: 'p',
    help: 'h'
  }
});

const help = () => {
  console.log(`
Usage: ${cmd('aunty config')} ${opt('[options]')}

${sec('Options')}

  ${opt('-p PROP')}, ${opt('--property=PROP')}  Get a single property
  ${opt('-h')}, ${opt('--help')}                Display this help message and exit
  `);

  process.exit(0);
}

if (argv.help) {
  help();
}

const config = getConfig(argv.property || null);

console.log(`
The following ${hvy('aunty' + (argv.property ? `.${argv.property}` : ''))} config was found for this project:

${req(JSON.stringify(config, null, '  '))}
`);
