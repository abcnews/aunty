// Ours
const {dim, bad, blue, cyan, green, magenta, red, yellow} = require('./string-styles');
const {zipTemplateLiterals} = require('./utils/strings');

const COLORS = [blue, cyan, green, magenta, red, yellow];

const LINE_PATTERN = /\n(.*)/g;

const WORM_GAP_PATTERN = /([▗▙])\s([▜▘])/g;

const FLAT_WORM = `
 ▗▓▓▓▓▙   ▟▓▓▓▓▙   ▟▓▓▓▓▖
 ▓▓▓▓▓▓▙ ▜▓▓▓▓▓▓▙ ▜▓▓▓▓▓▓
 ▓▓▓ ▜▓▓▙ ▜▛  ▜▓▓▙ ▜▛ ▓▓▓
 ▓▓▓ ▝▓▓▓▙ ▘  ▝▓▓▓▙ ▘ ▓▓▓
 ▓▓▓  ▝▓▓▓▖    ▝▓▓▓▖  ▓▓▓
 ▓▓▓ ▗ ▜▓▓▓▖  ▗ ▜▓▓▓▖ ▓▓▓
 ▓▓▓ ▟▙ ▜▓▓▙  ▟▙ ▜▓▓▙ ▓▓▓
 ▓▓▓▓▓▓▙ ▜▓▓▓▓▓▓▙ ▜▓▓▓▓▓▓
 ▝▓▓▓▓▛   ▜▓▓▓▓▛   ▜▓▓▓▓▘`;

const WORM = FLAT_WORM
.split('\n')
.map((line, index, lines) => line.replace(
  WORM_GAP_PATTERN,
  (match, $1, $2) => (index < (lines.length / 2)) ?
    `${$1} ${dim($2)}` :
    `${dim($1)} ${$2}`
  ))
.join('\n');

const ERROR_WORM = FLAT_WORM.replace(/(.)/g, (match, $1) => `${randomColor()($1)}`);

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

const ERROR = '  ERROЯ  '.replace(/(.)/g, (match, $1) => `\n ${bad($1)}`);

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

module.exports.getLogo = () => {
  const color = randomColor();

  return zipTemplateLiterals([
    WORM.replace(LINE_PATTERN, (match, $1) => `\n${color($1)}`),
    AUNTY
  ], '   ');
};

module.exports.getErrorLogo = () => zipTemplateLiterals([
  ERROR_WORM,
  ERROR,
  ERROR_WORM,
  ERROR,
  ERROR_WORM
], '');
