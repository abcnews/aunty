const EMPTY = '';
const NEWLINE = '\n';
const SLASH = '/';
const SPACE = ' ';

const identity = x => x;

const getLongest = items => items.reduce((a, b) => (a.length > b.length ? a : b));

module.exports.indented = (str, indent = 2) => str.split(`${NEWLINE}`).join(`${NEWLINE}${SPACE.repeat(indent)}`);

module.exports.bulleted = strs => strs.map(str => `• ${str}`).join(NEWLINE);

module.exports.inlineList = strs =>
  strs.reduce((acc, str, index) => [acc, str].join(index === strs.length - 1 ? ' & ' : ', '));

const padding = (module.exports.padding = (str, len, char = SPACE) =>
  char.repeat(len > str.length ? len - str.length : 0));

module.exports.padLeft = (str, len, char = SPACE) => padding(str, len, char) + String(str);

const padRight = (module.exports.padRight = (str, len, char = SPACE) => String(str) + padding(str, len, char));

module.exports.listPairs = (x, style = identity) => {
  const keys = Object.keys(x);
  const longest = getLongest(keys).length;

  return keys
    .map(key => {
      return `${style(padRight(key, longest))}  ${x[key]}`;
    })
    .join(NEWLINE);
};

module.exports.zipTemplateLiterals = (literals, numSpacesBetween) => {
  const literalsLines = literals.map(literal => literal.split(NEWLINE));

  return literalsLines[0].reduce(
    (memo, _, index) =>
      [memo, NEWLINE].join(literalsLines.map(lines => lines[index]).join(SPACE.repeat(numSpacesBetween))),
    EMPTY
  );
};

module.exports.styleLastSegment = (str, style = identity, separator = SLASH) => {
  return str
    .split(separator)
    .map((segment, index, segments) => {
      return index === segments.length - 1 ? style(segment) : segment;
    })
    .join(separator);
};

/**
 * Return a sluggified version of the string
 *
 * @param {string} input - The string to convert
 * @returns {string}
 */
module.exports.sluggify = input =>
  input
    .toLowerCase()
    .replace(/\s/g, '-')
    .replace(/[^0-9a-z\-\_]/g, '');
