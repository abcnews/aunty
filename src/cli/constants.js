// Ours
const { PROJECT_TYPE_DESCRIPTIONS } = require('../projects/constants');
const { createLogo } = require('../utils/branding');
const { cmd, dim, hvy, opt, req, sec } = require('../utils/color');
const { indented, listPairs } = require('../utils/strings');

module.exports.OPTIONS = {
  boolean: ['help', 'version'],
  alias: {
    help: 'h',
    version: 'v'
  }
};

const ALIASES = (module.exports.ALIASES = {
  b: 'build',
  c: 'clean',
  d: 'deploy',
  h: 'help',
  i: 'init',
  n: 'new',
  r: 'release',
  s: 'serve'
});

module.exports.COMMANDS = new Set(
  [].concat(Object.keys(ALIASES).map(key => ALIASES[key])).concat(Object.keys(ALIASES))
);

module.exports.DEFAULTS = {
  name: '__command__',
  options: {
    boolean: ['dry', 'force', 'help'],
    string: ['id', 'target'],
    alias: {
      dry: 'd',
      id: 'i',
      force: 'f',
      help: 'h',
      target: 't'
    }
  }
};

module.exports.MESSAGES = {
  version: versionNumber => `
${cmd('aunty')} v${versionNumber}`,
  unrecognised: commandName => `Unrecognised command: ${req(commandName)}`,
  usage: () => `${createLogo()}

Usage: ${cmd('aunty')} ${req('<command>')} ${opt('[options]')} ${opt('[command_options]')}

${sec('Options')}

  ${opt('-v')}, ${opt('--version')}  Print ${hvy('aunty')}'s version

${sec('Project creation commands')}

  ${cmd('aunty new')} ${req('<directory_name>')} ${opt('[options]')}
    Create a project in a new directory

  ${cmd('aunty init')} ${opt('[options]')}
    Create a project in the current directory

${sec('Development commands')}

  ${cmd('aunty generate component')}
    Generate a new component (and tests)

  ${cmd('aunty clean')}
    Delete the current project's build output directories.

  ${cmd('aunty build')} ${opt('[options]')}
    Clean & build the current project.

  ${cmd('aunty serve')} ${opt('[options]')}
    Build & serve the current project, re-building as files change

${sec('Deployment commands')}

  ${cmd('aunty deploy')} ${opt('[options]')}
    Deploy the current project.

  ${cmd('aunty release')} ${opt('[options] [build_options] [deploy_options]')}
    Build, \`${hvy('git tag <package.json:version>')}\`, then deploy the current project.

${sec('Helper commands')}

  ${cmd('aunty help')} ${req('<command>')}
    Display complete help for this ${req('command')}.
`,
  usageFallback: name => `
Usage: ${cmd('aunty')} ${cmd(name)} ${opt('[options]')}
`
};
