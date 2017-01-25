// Packages
const minimist = require('minimist');

// Ours
const {getConfig} = require('../config');
const {cmd, hvy, opt, req, sec} = require('../text');

const OPTIONS = {
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
};

const USAGE = `
Usage: ${cmd('aunty config')} ${opt('[options]')}

${sec('Options')}

${opt('-p PROP')}, ${opt('--property=PROP')}  Get a single property
${opt('-h')}, ${opt('--help')}                Display this help message and exit
`;

const help = () => {
  console.log(USAGE);
  process.exit(0);
}

const output = (config, property) => {
  console.log(`
The following ${hvy('aunty' + (property ? `.${property}` : ''))} config was found for this project:

${req(JSON.stringify(config, null, '  '))}
`);
};

const config = args => {
  const argv = minimist(args, OPTIONS);

  if (argv.help) {
    help();
  }

  output(getConfig(argv.property), argv.property);
};

module.exports = config;
