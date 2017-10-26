// External
const pify = require('pify');
const webpack = require('webpack');

// Ours
const { command } = require('../../cli');
const { createConfig } = require('../../projects/webpack');
const { packs, throws, unpack } = require('../../utils/async');
const { dry, info, spin, warn } = require('../../utils/logging');
const { clean } = require('../clean');
const { MESSAGES } = require('./constants');
const Chalk = require('chalk');

/**
 * Do a Webpack build
 * @param {object} webpackConfig 
 * @param {string} label Show a message with the spinner
 */
async function builder(webpackConfig, label) {
  const spinner = spin(label);
  const compiler = webpack(webpackConfig);
  const stats = unpack(await packs(pify(compiler.run.bind(compiler)))());

  if (stats.hasErrors()) {
    spinner.fail();
    throw stats.toJson({}, true).errors[0];
  }

  if (stats.hasWarnings()) {
    spinner.warn();
    stats.toJson({}, true).warnings.forEach(warn);
  } else {
    spinner.succeed();
  }
}

module.exports.build = command(
  {
    name: 'build',
    isConfigRequired: true,
    usage: MESSAGES.usage
  },
  async (argv, config) => {
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }

    const webpackConfig = createConfig(argv, config);

    if (argv.dry) {
      return dry({
        'Webpack config': webpackConfig
      });
    }

    if (!argv.preflight) {
      info(MESSAGES.build(process.env.NODE_ENV, argv.target, webpackConfig.output.publicPath));
    }

    throws(await clean());

    if (argv.preflight) {
      await builder(webpackConfig, 'Preflight');
    } else {
      if (argv['no-modules']) {
        // Just build the one file
        await builder(webpackConfig, 'Building ES5 version ' + Chalk.gray('(index.js)'));
      } else {
        // Build a modern version with fewer pollyfills
        const webpackConfigE6 = createConfig(argv, Object.assign({}, config, { buildWithModules: true }));
        await builder(webpackConfigE6, 'Building modules version ' + Chalk.gray('(index.modules.js)'));
        // Build a legacy version as well
        await builder(webpackConfig, 'Building ES5 version too ' + Chalk.gray('(index.js)'));
      }
    }
  }
);
