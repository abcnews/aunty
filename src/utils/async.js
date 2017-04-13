// External
const pify = require('pify');
const pump = require('pump');

// Wrapped
const pumpAsync = pify(pump);

function pack(promise) {
  return promise
  .then(result => [null, result])
  .catch(err => [err]);
}

function packs(fn) {
  return (...fnArgs) => pack(fn(...fnArgs));
}

function throws(packed) {
  if (packed[0]) {
    throw packed[0];
  }

  return packed;
}

function unpack(packed, ignoreErrors) {
  if (ignoreErrors) {
    return packed[1];
  }

  return throws(packed)[1];
}

async function requireAsync(path) {
  return require(path);
}

function prequire(path) {
  return pack(requireAsync(path));
}

function pumped(...streams) {
  return pack(pumpAsync(Array.isArray(streams[0]) ?
    streams[0] : streams));
}

module.exports = {
  pack,
  packs,
  throws,
  unpack,
  prequire,
  pumped
};
