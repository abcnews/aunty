// Ours
const {BASIC_STORY, DEFAULT_OPTIONS} = require('../../../constants');
const {cmd, ok, opt, sec} = require('../../../string-styles');
const {
  bulleted,
  indented,
  listPairs,
  styleLastSegment
} = require('../../../utils/strings');

const DEFAULTS = {
  [BASIC_STORY]: ['build']
};

const USAGE = `
Usage: ${cmd('aunty clean')} ${opt('[glob(s)]')} ${opt('[options]')}

${sec('Arguments')}

  ${opt('glob(s)')} File globs to delete ${opt(`[default: config \`clean\` property | project type defaults* | ""]`)}

  Project type defaults:
    ${indented(listPairs(DEFAULTS, opt), 4)}

${sec('Options')}

  ${opt('-h')}, ${opt('--help')}  Display this help message and exit
`;

const MESSAGES = {
  deletion: paths => indented(paths.length < 1 ? `
Nothing to delete` : `
Deleted:
${bulleted(paths.map(path => styleLastSegment(path, ok)))}`)
};

module.exports = {
  OPTIONS: DEFAULT_OPTIONS,
  DEFAULTS,
  USAGE,
  MESSAGES
};
