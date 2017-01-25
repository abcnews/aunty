// Packages
const chalk = require('chalk');

const joinLines = (literals, separator) => {
  const literalsLines = literals.map(literal => literal.split('\n'));

  return literalsLines[0].reduce((memo, _, index) => [memo, '\n'].join(
    literalsLines.map(lines => lines[index]).join(separator)
  ), '');
};

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
    `${$1} ${chalk.dim($2)}` :
    `${chalk.dim($1)} ${$2}`
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

const getLogo = () => {
  const theme = chalk[
    THEMES[
      Math.floor(Math.random() * THEMES.length)
    ]
  ];

  return joinLines([
    WORM.replace(LINE_PATTERN, (match, $1) => `\n${theme($1)}`),
    AUNTY
  ], '   ');
};

module.exports = {
  getLogo
};
