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

module.exports.unpack = (packed, ignoreErrors) =>
  ignoreErrors ? packed[1] : throws(packed)[1];

const requireAsync = async path => require(path);

module.exports.prequire = path => pack(requireAsync(path));
