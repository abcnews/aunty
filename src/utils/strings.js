// Ours
const {getLongest, identity} = require('./');

const EMPTY = '';
const SPACE = ' ';
const SLASH = '/';
const COLON = ':';
const NEWLINE = '\n';

function indented(str, indent = 2) {
  return str.split(`${NEWLINE}`)
  .join(`${NEWLINE}${SPACE.repeat(indent)}`);
}

function bulleted(strs) {
  return strs.map(str => `• ${str}`).join(NEWLINE);
}

function inlineList(strs) {
  return strs.reduce((acc, str, index) => {
    return [acc, str].join(index === strs.length - 1 ? ' & ' : ', ');
  });
}

function padding(str, len, char = SPACE) {
  return char.repeat(len > str.length ? len - str.length : 0);
}

function padLeft(str, len, char = SPACE) {
  return padding(str, len, char) + String(str);
}

function padRight(str, len, char = SPACE) {
  return String(str) + padding(str, len, char);
}

function listPairs(obj, style = identity) {
  const keys = Object.keys(obj);
  const longest = getLongest(keys).length;

  return keys.map(key => {
    return `${style(padRight(key, longest))}  ${obj[key]}`;
  }).join(NEWLINE);
}

function zipTemplateLiterals(literals, separator = EMPTY) {
  const literalsLines = literals.map(literal => literal.split(NEWLINE));

  return literalsLines[0].reduce((memo, _, index) => [memo, NEWLINE].join(
    literalsLines.map(lines => lines[index]).join(separator)
  ), EMPTY);
}

function styleLastSegment(str, style = identity, separator = SLASH) {
  return str.split(separator).map((segment, index, segments) => {
    return (index === segments.length - 1) ? style(segment) : segment;
  }).join(separator);
}

module.exports = {
  EMPTY,
  SPACE,
  SLASH,
  COLON,
  NEWLINE,
  indented,
  bulleted,
  inlineList,
  padding,
  padLeft,
  padRight,
  listPairs,
  zipTemplateLiterals,
  styleLastSegment
};
