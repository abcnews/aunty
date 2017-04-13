// External
const pify = require('pify');
const pump = require('pump');

// Wrapped
const pumpAsync = pify(pump);

const pack = module.exports.pack = promise =>
  promise
  .then(result => [null, result])
  .catch(err => [err]);

module.exports.packs = fn =>
  (...fnArgs) => pack(fn(...fnArgs));

const throws = module.exports.throws = packed => {
  if (packed[0]) {
    throw packed[0];
  }

  return packed;
};

module.exports.unpack = (packed, ignoreErrors) => {
  if (ignoreErrors) {
    return packed[1];
  }

  return throws(packed)[1];
};

const requireAsync = async path => require(path);

module.exports.prequire = path => pack(requireAsync(path));

module.exports.pumped = (...streams) =>
  pack(pumpAsync(Array.isArray(streams[0]) ? streams[0] : streams));
