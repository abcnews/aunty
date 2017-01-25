// Packages
const jsonfile = require('jsonfile');

const getCredentials = path => {
  return new Promise((resolve, reject) => {
    jsonfile.readFile(path, (err, obj) => {
      if (err) {
        return reject(err);
      }

      resolve(obj);
    });
  });
};

module.exports = {
  getCredentials
};
