// External
const chalk = require('chalk');

chalk.bad = chalk.red;
chalk.cmd = chalk.yellow;
chalk.hvy = chalk.bold;
chalk.ok = chalk.green;
chalk.opt = chalk.cyan;
chalk.req = chalk.magenta;
chalk.sec = chalk.magenta;

module.exports = chalk;
