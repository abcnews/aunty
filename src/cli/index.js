// Native
const {resolve} = require('path');

// Packages
const minimist = require('minimist');

// Ours
const {getLogo} = require('../logo');
const {cmd, hvy, opt, req, sec} = require('../text');

const OPTIONS = {
  boolean: [
    'help',
    'version'
  ],
  alias: {
    help: 'h',
    version: 'v'
  }
};

const USAGE = `
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
`;

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

const cli = (args, pkg, exit) => {
  const argv = minimist(args, OPTIONS);

  if (argv.version) {
    console.log(`${hvy('aunty')} v${pkg.version}`);
    exit();
  }

  console.log(getLogo());

  if (argv._.length === 0 || (
    argv._.length === 1 && argv._[0] === 'help')
  ) {
    console.log(USAGE);
    exit();
  }

  let command = argv._[0];
  let isHelpOnly;

  if (command === 'help') {
    isHelpOnly = true;
    command = argv._[1];
  }

  if (COMMANDS.indexOf(command) < 0) {
    console.log(USAGE);
    exit(1);
  }

  command = COMMANDS_ALIASES[command] || command;

  const commandPath = resolve(__dirname, './commands/' + command);

  require(commandPath)((isHelpOnly ? ['--help'] : args.slice(1)), exit);
};

module.exports = cli;
