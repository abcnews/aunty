// Ours
const { bad, blue, cyan, dim, green, hvy, magenta, red, yellow } = require('./color');
const { NEWLINE, zipTemplateLiterals } = require('./strings');

const COLORS = [blue, cyan, green, magenta, yellow];

function pickRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const createLogo = (module.exports.createLogo = color =>
  (color || pickRandomColor())(`
⣾${dim('⢷')}⡾⢷${dim('⡾')}⣷ 
⢿⡾${dim('⢷⡾')}⢷⡿ `));

module.exports.createCommandLogo = commandName =>
  zipTemplateLiterals([
    createLogo(),
    `
${dim('aunty')}
${hvy(commandName)}`
  ]);

module.exports.createErrorLogo = commandName =>
  zipTemplateLiterals([
    createLogo(red),
    `
${red(dim('ERROR'))}
${red(hvy('ЯOЯЯƎ'))}`
  ]);

module.exports.SPINNER_FRAMES = [
  '⣏⠀⠀',
  '⡟⠀⠀',
  '⠟⠄⠀',
  '⠛⡄⠀',
  '⠙⣄⠀',
  '⠘⣤⠀',
  '⠐⣤⠂',
  '⠀⣤⠃',
  '⠀⣠⠋',
  '⠀⢠⠛',
  '⠀⠠⠻',
  '⠀⠀⢻',
  '⠀⠀⣹',
  '⠀⠀⣼',
  '⠀⠐⣴',
  '⠀⠘⣤',
  '⠀⠙⣄',
  '⠀⠛⡄',
  '⠠⠛⠄',
  '⢠⠛⠀',
  '⣠⠋⠀',
  '⣤⠃⠀',
  '⣦⠂⠀',
  '⣧⠀⠀'
];
