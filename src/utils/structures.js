const deepmerge = require('deepmerge');

/**
 * Merge a function or object into the target object
 * @param target an object to merge into
 * @param source an object to merge with `target`, or a function that takes `target` as an argument
 * @param isDeep use deepmerge to merge
 * @returns
 */
const combine = (target, source, isDeep) =>
  typeof source === 'function'
    ? source(target)
    : typeof source === 'object'
    ? isDeep === true
      ? deepmerge(target, source, { clone: false })
      : Object.assign(target, source)
    : target;

const combineDeep = (memo, source) => combine(memo, source, true);

/**
 * Shallow merge an array of objects. Earlier values overwritten by later values
 * @param sources Array of objects and functions to be merged using `combine`
 * @see combine
 */
module.exports.combine = (...sources) => sources.reduce(combine, {});

/**
 * Deep merge an array of objects. Earlier values overwritten by later values.
 * @param sources Array of objects and functions to be merged using `combine`
 * @see combine
 */
module.exports.merge = (...sources) => sources.reduce(combineDeep, {});
