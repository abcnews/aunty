// Ours
const {dim, blue, cyan, green, magenta, red, yellow} = require('./string-styles');
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

function getLogo() {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  return zipTemplateLiterals([
    WORM.replace(LINE_PATTERN, (match, $1) => `\n${color($1)}`),
    AUNTY
  ], '   ');
}

module.exports = {
  getLogo
};
