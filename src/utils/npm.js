// External
const execa = require('execa');

function npm(args = [], options = {}) {
  args = typeof args === 'string' ? args.split(' ') : args;

  return execa('npm', args, options);
}

module.exports.install = (args = [], cwd) => {
  args = ['install', '--silent', '--no-progress'].concat(args);

  return npm(args, { cwd });
};
