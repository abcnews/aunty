// Ours
const {PROJECT_TYPE_DESCRIPTIONS} = require('../../projects/constants');
const {cmd, opt, req, sec} = require('../../utils/color');
const {indented, listPairs} = require('../../utils/strings');

module.exports.MESSAGES = {
  usage: name => `
Usage: ${cmd(`aunty ${name}`)} ${req('<project_type>')} ${opt('[options]')}

${sec('Arguments')}

  ${req('project_type')}  Type of project you want to create (see below).

  Available project templates:
    ${indented(listPairs(PROJECT_TYPE_DESCRIPTIONS, req), 4)}

${sec('Options')}

  ${opt('-n SLUG')}, ${opt('--name=SLUG')}  Project name ${opt(`[default: ${cmd('cwd')}]`)}
`
};
