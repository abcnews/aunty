// Ours
const {bad, blue, cyan, dim, green, hvy, magenta, red, yellow} = require('./string-styles');
const {NEWLINE, zipTemplateLiterals} = require('./utils/strings');

const COLORS = [blue, cyan, green, magenta, red, yellow];

const SHADED_PATTERN = /([▗▙])\s([▜▘])/g;

const WORM = `
 ▗▓▓▓▓▙   ▟▓▓▓▓▙   ▟▓▓▓▓▖
 ▓▓▓▓▓▓▙ ▜▓▓▓▓▓▓▙ ▜▓▓▓▓▓▓
 ▓▓▓ ▜▓▓▙ ▜▛  ▜▓▓▙ ▜▛ ▓▓▓
 ▓▓▓ ▝▓▓▓▙ ▘  ▝▓▓▓▙ ▘ ▓▓▓
 ▓▓▓  ▝▓▓▓▖    ▝▓▓▓▖  ▓▓▓
 ▓▓▓ ▗ ▜▓▓▓▖  ▗ ▜▓▓▓▖ ▓▓▓
 ▓▓▓ ▟▙ ▜▓▓▙  ▟▙ ▜▓▓▙ ▓▓▓
 ▓▓▓▓▓▓▙ ▜▓▓▓▓▓▓▙ ▜▓▓▓▓▓▓
 ▝▓▓▓▓▛   ▜▓▓▓▓▛   ▜▓▓▓▓▘`;

const AUNTY = `
                                   ▗▄▄
                                   ▓▓▓
 ▜▓▓▓▓▓▙▖  ▓▓▓    ▓▓▓  ▓▓▙▟▓▓▓▓▙▖ ▓▓▓▓▓▛ ▜▓▙    ▗▓▓▘
     ▝▓▓▓  ▓▓▓    ▓▓▓  ▓▓▓▛  ▝▓▓▓  ▓▓▓    ▜▓▙  ▗▓▓▘
▗▟▓▓▓▓▓▓▓  ▓▓▓    ▓▓▓  ▓▓▓    ▓▓▓  ▓▓▓     ▜▓▙▗▓▓▘
▓▓▓  ▗▓▓▓  ▓▓▓▖  ▟▓▓▓  ▓▓▓    ▓▓▓  ▓▓▓▖     ▜▓▓▓▘
▝▜▓▓▓▛▜▓▓▓  ▜▓▓▓▓▛▜▓▓  ▓▓▓    ▓▓▓  ▝▓▓▓▓▖   ▗▓▓▘
                                           ▗▓▓▘
                                         ▟▓▓▛`;

function pickRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const color = pickRandomColor();

module.exports.createLogo = () => {
  const worm = WORM
  .split(NEWLINE)
  .map((line, index, lines) => color(line.replace(
    SHADED_PATTERN,
    (match, $1, $2) => (index < (lines.length / 2)) ?
      `${$1} ${dim($2)}` : `${dim($1)} ${$2}`
    )))
  .join(NEWLINE);

  return zipTemplateLiterals([worm, dim(AUNTY)], '   ');
};

module.exports.createCommandLogo = commandName => zipTemplateLiterals([color(`
⣾${dim('⢷')}⡾⢷${dim('⡾')}⣷ 
⢿⡾${dim('⢷⡾')}⢷⡿ `), `
${dim('aunty')}
${hvy(commandName)}`]);

module.exports.createErrorLogo = () => {
  const worm = WORM.replace(/(.)/g, (match, $1) => `${pickRandomColor()($1)}`);
  const text = '  ERROЯ  '.replace(/(.)/g, (match, $1) => `${NEWLINE} ${bad($1)}`);

  return zipTemplateLiterals([worm, text, worm, text, worm], '');
};
