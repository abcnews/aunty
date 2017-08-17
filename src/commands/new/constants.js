// Ours
const {PROJECT_TYPES, PROJECT_TYPE_DESCRIPTIONS} = require('../../projects/constants');
const {cmd, hvy, opt, req, sec} = require('../../utils/color');
const {indented, listPairs} = require('../../utils/strings');

module.exports.OPTIONS = {
  boolean: 'help',
  string: 'name',
  alias: {
    help: 'h',
    name: 'n'
  }
};

module.exports.MESSAGES = {
  NOT_ENOUGH_ARGUMENTS: `You didn't provide enough arguments.`,
  UNKNOWN_PROJECT_TYPE: `Project type must be one of: ${[...PROJECT_TYPES].map(type => hvy(type)).join(', ')}`,
  invalidProjectName: name => `Project name "${name}" is invalid.${
    name.indexOf('.') > -1 ? ` Did you mean to use ${cmd('aunty init')}?` : ''}`,
  usage: name => `
Usage: ${cmd(`aunty ${name}`)} ${req('<project_type>')} ${req('<directory_name>')} ${opt('[options]')}

${sec('Arguments')}

  ${req('project_type')}    Type of project you want to create (see below).
  ${req('directory_name')}  Name of the directory which will contain your project
                  (which will be created if it doesn't exist).

  Available project templates:
    ${indented(listPairs(PROJECT_TYPE_DESCRIPTIONS, req), 4)}

${sec('Options')}

  ${opt('-n SLUG')}, ${opt('--name=SLUG')}  Project name ${opt(`[default: ${req('directory_name')}]`)}
  ${opt('-h')}, ${opt('--help')}            Display this help message and exit
`
};

module.exports.PATTERNS = {
  SLUG: /^[a-z0-9\-_]+$/i
};
