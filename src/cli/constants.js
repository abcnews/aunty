// Ours
const {PROJECT_TYPE_DESCRIPTIONS} = require('../constants');
const {createLogo} = require('../logo');
const {cmd, dim, hvy, opt, req, sec} = require('../string-styles');
const {indented, listPairs} = require('../utils/strings');

module.exports.OPTIONS = {
  boolean: [
    'help',
    'version'
  ],
  alias: {
    help: 'h',
    version: 'v'
  }
};

const ALIASES = module.exports.ALIASES = {
  b: 'build',
  bbs: 'build-basic-story',
  c: 'clean',
  cs: 'clean-story',
  d: 'deploy',
  h: 'help',
  i: 'init',
  n: 'new',
  r: 'release',
  sbs: 'serve-basic-story',
  s: 'serve',
  v: 'view'
};

module.exports.COMMANDS = new Set(
  []
  .concat(Object.keys(ALIASES).map(key => ALIASES[key]))
  .concat(Object.keys(ALIASES))
);

module.exports.MESSAGES = {
  version: (versionNumber, isLocal) => `
${cmd('aunty')} v${versionNumber}${isLocal ? dim(' (local)') : ''}`,
  unrecognised: commandName => `Unrecognised command: ${req(commandName)}`,
  usage: () => `${createLogo()}
Usage: ${cmd('aunty')} ${req('<command>')} ${opt('[options]')} ${opt('[command_options]')}

${sec('Options')}

  ${opt('-h')}, ${opt('--help')}     Display this help message and exit
  ${opt('-v')}, ${opt('--version')}  Print ${hvy('aunty')}'s version

${sec('Project creation commands')}

  ${cmd('aunty new')} ${req('<project_type>')} ${req('<directory_name>')} ${opt('[options]')}
    Create a project in a new directory

  ${cmd('aunty init')} ${req('<project_type>')} ${opt('[options]')}
    Create a project in the current directory

  Available project templates:
    ${indented(listPairs(PROJECT_TYPE_DESCRIPTIONS, req), 4)}

${sec('Generic development commands')}

  These commands will either execute in their own capacity, or defer to
  specific commands based on the project's configuration. Project type-specific
  commands are listed further down.

  ${cmd('aunty clean')}
    Delete the current project's build output directories.

  ${cmd('aunty build')}
    Clean & build the current project.

  ${cmd('aunty serve')} ${opt('[options]')}
    Clean, build & serve the current project.

${sec('Project type-specific development commands')}

  These commands will be run automatically by the generic development commands
  if your config's project ${hvy('type')} is recognised.

  ${cmd('aunty build-basic-story')}
    Clean & build a ${hvy('basic-story')} project.

  ${cmd('aunty serve-basic-story')} ${opt('[options]')}
    Clean, build & serve a ${hvy('basic-story')} project, then rebuild when files change.

${sec('Deployment commands')}

  ${cmd('aunty deploy')} ${opt('[options]')}
    Deploy the current project.

  ${cmd('aunty release')} ${opt('[options]')} ${opt('[deploy_options]')}
    Build, \`${hvy('git tag <package.json:version>')}\`, then deploy the current project.

${sec('Helper commands')}

  ${cmd('aunty help')} ${req('<command>')}
    Display complete help for this ${req('command')}.

  ${cmd('aunty view')}
    View the current project's known configuration.
`
};
