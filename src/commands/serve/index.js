// External
const pify = require('pify');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

// Ours
const {command} = require('../../cli');
const {createConfig} = require('../../projects/webpack');
const {throws} = require('../../utils/async');
const {dry, info} = require('../../utils/logging');
const {MESSAGES} = require('../build/constants');
const {clean} = require('../clean');
const {OPTIONS} = require('./constants');

module.exports.serve = command({
  name: 'serve',
  options: OPTIONS,
  isConfigRequired: true
}, async (argv, config) => {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }

  const [webpackConfig, devServerConfig] = createConfig(argv, config, true);

  const {port} = devServerConfig;

  delete devServerConfig.port;

  if (argv.dry) {
    return dry({
      'Webpack config': webpackConfig,
      'Dev server config': devServerConfig,
      'Dev server public URL': devServerConfig.publicPath
    });
  }

  info(MESSAGES.build(
    process.env.NODE_ENV,
    argv.target,
    webpackConfig.output.publicPath
  ));

  throws(await clean());

  info('Serving…');

  const compiler = webpack(webpackConfig);
  const server = new WebpackDevServer(compiler, devServerConfig);

  return new Promise((resolve, reject) => {
    server.listen(port, '0.0.0.0', err => {
      if (err) {
        reject(err);
      }
    });
  });
});

