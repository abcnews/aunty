// Ours
const { createLogo } = require('../utils/branding');
const { cmd, dim, hvy, opt, req, sec } = require('../utils/color');
const { combine, setOfValues } = require('../utils/structures');

const COMMAND_ALIASES = (module.exports.COMMAND_ALIASES = {
  b: 'build',
  c: 'clean',
  d: 'deploy',
  g: 'generate',
  r: 'release',
  s: 'serve',
  t: 'test'
});

module.exports.COMMANDS = setOfValues(COMMAND_ALIASES);

module.exports.DEFAULTS = {
  name: '__command__',
  options: {
    '--': true,
    boolean: ['dry', 'force', 'help', 'quiet'],
    string: [],
    alias: {
      dry: 'd',
      force: 'f',
      help: 'h',
      quiet: 'q'
    }
  },
  usage: name => `Usage: ${cmd('aunty')} ${cmd(name)} ${opt('[options]')}
`
};

module.exports.DRY_VARIATIONS = ['--dry', '-d'];
module.exports.HELP_VARIATIONS = ['--help', '-h', 'h', 'help'];
module.exports.VERSION_VARIATIONS = ['--version', '-v'];

module.exports.MESSAGES = {
  version: versionNumber => `
${cmd('aunty')} v${versionNumber}`,
  unrecognised: commandName => `Unrecognised command: ${req(commandName)}`,
  usage: isProject => `${createLogo()}

Usage: ${cmd('aunty')} ${req('<command>')} ${opt('[options]')} ${opt('[command_options]')}

${sec('Options')}

  ${opt('-v')}, ${opt('--version')}  Print ${hvy('aunty')}'s version

${sec('Project creation commands')}

  ${
    !isProject
      ? `${cmd('aunty new')} ${req('<project_name>')}
    Create a project in a new directory

  ${cmd('aunty init')}
    Create a project in the current directory`
      : dim(`[available outside project directory]`)
  }

${sec('Development commands')}

  ${
    isProject
      ? `${cmd('aunty generate')} ${req('<generator>')}
    Generate code for your project or Core Media 

  ${cmd('aunty clean')}
    Delete the current project's build output directories.

  ${cmd('aunty build')}
    Clean & build the current project.

  ${cmd('aunty serve')}
    Build & serve the current project, re-building as files change

  ${cmd('aunty test')}
    Run any tests in the current project.`
      : dim(`[available inside project directory]`)
  }

${sec('Deployment commands')}

  ${
    isProject
      ? `${cmd('aunty deploy')}
    Deploy the current project.

  ${cmd('aunty release')}
    Build, version bump, then deploy the current project.`
      : dim(`[available inside project directory]`)
  }

${sec('Helper commands')}

  ${cmd('aunty help')} ${req('<command>')}
    Display complete help for this ${req('command')}.
`
};

const NEW_SHORTHAND_EXPANSION = ['generate', 'project'];
const INIT_SHORTHAND_EXPANSION = NEW_SHORTHAND_EXPANSION.concat(['--', '--here']);

module.exports.SHORTHANDS = {
  i: INIT_SHORTHAND_EXPANSION,
  init: INIT_SHORTHAND_EXPANSION,
  n: NEW_SHORTHAND_EXPANSION,
  new: NEW_SHORTHAND_EXPANSION
};
