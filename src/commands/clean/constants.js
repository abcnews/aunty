// Ours
const {BUILD_DIR} = require('../../projects/constants');
const {cmd, ok, opt, req, sec} = require('../../utils/color');
const {bulleted, styleLastSegment} = require('../../utils/strings');

module.exports.MESSAGES = {
  deletion: paths =>
    paths.length < 1 ? `Nothing to delete` : `Deleted:
${bulleted(paths.map(path => styleLastSegment(path, ok)))}`,
  usage: name => `
Usage: ${cmd(`aunty ${name}`)} ${opt(`[${req('glob(s)')}]`)}

${sec('Optional arguments')}

  ${req('glob(s)')} File globs to delete ${opt(`[default: config 'clean' property | "${BUILD_DIR}"]`)}
`
};
