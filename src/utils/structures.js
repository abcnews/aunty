const deepmerge = require('deepmerge');

const combine = (target, source, isDeep) =>
  typeof source === 'function'
    ? source(target)
    : typeof source === 'object'
    ? isDeep === true
      ? deepmerge(target, source, { clone: false })
      : Object.assign(target, source)
    : target;

const combineDeep = (memo, source) => combine(memo, source, true);

module.exports.combine = (...sources) => sources.reduce(combine, {});

module.exports.merge = (...sources) => sources.reduce(combineDeep, {});

module.exports.setOfKeysAndValues = source =>
  new Set([].concat(Object.keys(source).map(key => source[key])).concat(Object.keys(source)));

module.exports.setOfValues = source => new Set(Object.keys(source).map(key => source[key]));
