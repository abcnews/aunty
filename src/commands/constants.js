// Ours
const {bad, cmd, dim, hvy, ok, opt, sec} = require('../utils/color');
const {COLON} = require('../utils/strings');

const BOXES = module.exports.BOXES = {
  EMPTY: cmd('☐'),
  BAD: bad('☒'),
  OK: ok('☑︎')
};

module.exports.DEFAULTS = {
  NAME: '__command__',
  OPTIONS: {
    boolean: 'help',
    alias: {
      help: 'h'
    }
  }
};

function formatStack(stack, style) {
  const [...items] = stack;
  const last = items.pop();

  return `${sec(style(last))} ${dim(items.reverse().join(COLON))}`;
}

module.exports.MESSAGES = {
  usage: name => `
Usage: ${cmd('aunty')} ${cmd(name)} ${opt('[options]')}

${sec('Options')}

  ${opt('-h')}, ${opt('--help')}  Display this help message and exit
`,
  started: stack => `\n${BOXES.EMPTY} ${formatStack(stack, cmd)}`,
  failed: stack => `\n${BOXES.BAD} ${formatStack(stack, bad)}`,
  completed: stack => `\n${BOXES.OK} ${formatStack(stack, ok)}`,
  unrecognised: type => `\nUnrecognised project type: ${hvy(type)}`
};
