// External
const pify = require('pify');
const webpack = require('webpack');

// Ours
const {command} = require('../../cli');
const {createConfig} = require('../../projects/webpack');
const {packs, throws, unpack} = require('../../utils/async');
const {dry, info, spin, warn} = require('../../utils/logging');
const {clean} = require('../clean');
const {MESSAGES} = require('./constants');

module.exports.build = command({
  name: 'build',
  isConfigRequired: true,
  usage: MESSAGES.usage
}, async (argv, config) => {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

  const webpackConfig = createConfig(argv, config);

  if (argv.dry) {
    return dry({
      'Webpack config': webpackConfig
    });
  }

  info(MESSAGES.build(
    process.env.NODE_ENV,
    argv.target,
    webpackConfig.output.publicPath
  ));

  throws(await clean());

  const spinner = spin('Build');
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
});
