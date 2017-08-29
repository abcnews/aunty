// External
const chalk = require('chalk');

module.exports = Object.assign(chalk, {
  bad: chalk.red,
  cmd: chalk.yellow,
  hvy: chalk.bold,
  ok: chalk.green,
  opt: chalk.cyan,
  req: chalk.magenta,
  sec: chalk.underline
});
