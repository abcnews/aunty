// External
const chalk = require('chalk');

const MAPPINGS = {
  bad: chalk.red,
  cmd: chalk.yellow,
  hvy: chalk.bold,
  ok: chalk.green,
  opt: chalk.cyan,
  req: chalk.magenta,
  sec: chalk.underline
};

module.exports = Object.assign(chalk, MAPPINGS);
