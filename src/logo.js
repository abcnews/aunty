// Ours
const stringStyles = require('./string-styles');
const {zipTemplateLiterals} = require('./utils/strings');

const THEMES = [
  'blue',
  'cyan',
  'green',
  'magenta',
  'red',
  'yellow'
];

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
    `${$1} ${stringStyles.dim($2)}` :
    `${stringStyles.dim($1)} ${$2}`
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
  const theme = stringStyles[
    THEMES[
      Math.floor(Math.random() * THEMES.length)
    ]
  ];

  return zipTemplateLiterals([
    WORM.replace(LINE_PATTERN, (match, $1) => `\n${theme($1)}`),
    AUNTY
  ], '   ');
}

module.exports = {
  getLogo
};
