// Ours
const {getLongest, identity} = require('./misc');

const CAMELABLE_PATTERN = /-\w/g;
const EMPTY = '';
const NEWLINE = '\n';
const SLASH = '/';
const SPACE = ' ';

module.exports.EMPTY = EMPTY;
module.exports.NEWLINE = NEWLINE;
module.exports.SLASH = SLASH;
module.exports.SPACE = SPACE;

module.exports.indented = (str, indent = 2) =>
  str.split(`${NEWLINE}`).join(`${NEWLINE}${SPACE.repeat(indent)}`);

module.exports.bulleted = strs =>
  strs.map(str => `• ${str}`).join(NEWLINE);

module.exports.inlineList = strs =>
  strs.reduce((acc, str, index) =>
    [acc, str].join(index === strs.length - 1 ? ' & ' : ', '));

const padding = module.exports.padding = (str, len, char = SPACE) =>
  char.repeat(len > str.length ? len - str.length : 0);

module.exports.padLeft = (str, len, char = SPACE) =>
  padding(str, len, char) + String(str);

const padRight = module.exports.padRight = (str, len, char = SPACE) =>
  String(str) + padding(str, len, char);

module.exports.listPairs = (obj, style = identity) => {
  const keys = Object.keys(obj);
  const longest = getLongest(keys).length;

  return keys.map(key => {
    return `${style(padRight(key, longest))}  ${obj[key]}`;
  }).join(NEWLINE);
};

module.exports.zipTemplateLiterals = (literals, numSpacesBetween) => {
  const literalsLines = literals.map(literal => literal.split(NEWLINE));

  return literalsLines[0].reduce((memo, _, index) => [memo, NEWLINE].join(
    literalsLines.map(lines => lines[index]).join(SPACE.repeat(numSpacesBetween))
  ), EMPTY);
};

module.exports.styleLastSegment = (str, style = identity, separator = SLASH) => {
  return str.split(separator).map((segment, index, segments) => {
    return (index === segments.length - 1) ? style(segment) : segment;
  }).join(separator);
};

module.exports.slugToCamel = slug =>
  slug.replace(CAMELABLE_PATTERN, x => x.slice(1).toUpperCase());
