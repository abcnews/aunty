// Ours
const {DEFAULT_OPTIONS, PROJECT_TYPE_DESCRIPTIONS} = require('../../constants');
const {cmd, opt, req, sec} = require('../../string-styles');
const {indented, listPairs} = require('../../utils/strings');

module.exports.OPTIONS = DEFAULT_OPTIONS;

module.exports.USAGE = `
Usage: ${cmd('aunty init')} ${req('<project_type>')} ${opt('[options]')}

${sec('Arguments')}

  ${req('project_type')}    Type of project you want to create (see below).

  Available project templates:
    ${indented(listPairs(PROJECT_TYPE_DESCRIPTIONS, req), 4)}

${sec('Options')}

  ${opt('-n SLUG')}, ${opt('--name=SLUG')}  Project name ${opt(`[default: current directory name]`)}
  ${opt('-h')}, ${opt('--help')}            Display this help message and exit
`;
