// Packages
const minimist = require('minimist');

// Ours
const {getConfig} = require('../../config');
const {cmd, hvy, opt, req, sec} = require('../../text');

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

const config = (args, exit) => {
  const argv = minimist(args, OPTIONS);

  if (argv.help) {
    console.log(USAGE);
    exit();
  }

  let config;

  try {
    config = getConfig(argv.property);
  } catch (err) {
    exit(err.message);
  }

  console.log(`
The following ${hvy('aunty' + (argv.property ? `.${argv.property}` : ''))} config was found for this project:

${req(JSON.stringify(config, null, '  '))}
`);
};

module.exports = config;
