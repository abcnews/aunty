// Ours
const {PROJECT_TYPES, PROJECT_TYPE_DESCRIPTIONS} = require('../../../constants');
const {cmd, hvy, opt, req, sec} = require('../../../string-styles');
const {indented, listPairs} = require('../../../utils/strings');

const OPTIONS = {
  boolean: 'help',
  string: 'name',
  alias: {
    help: 'h',
    name: 'n'
  }
};

const USAGE = `
Usage: ${cmd('aunty new')} ${req('<project_type>')} ${req('<directory_name>')} ${opt('[options]')}

${sec('Arguments')}

  ${req('project_type')}    Type of project you want to create (see below).
  ${req('directory_name')}  Name of the directory which will contain your project
                  (which will be created if it doesn't exist).

  Available project templates:
    ${indented(listPairs(PROJECT_TYPE_DESCRIPTIONS, req), 4)}

${sec('Options')}

  ${opt('-n SLUG')}, ${opt('--name=SLUG')}  Project name ${opt(`[default: ${req('directory_name')}]`)}
  ${opt('-h')}, ${opt('--help')}            Display this help message and exit
`;

const MESSAGES = {
  NOT_ENOUGH_ARGUMENTS: `You didn't provide enough arguments.`,
  UNKNOWN_PROJECT_TYPE: `Project type must be one of: ${[...PROJECT_TYPES].map(type => hvy(type)).join(', ')}`,
  invalidProjectName: (name, usage) => `Project name "${name}" is invalid.${
    name.indexOf('.') > -1 ? ` Did you mean to use ${cmd('aunty init')}?` : ''}
${usage}`
};

const PATTERNS = {
  SLUG: /^[a-z0-9\-_]+$/i
};

module.exports = {
  OPTIONS,
  USAGE,
  MESSAGES,
  PATTERNS
};
