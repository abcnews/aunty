// External
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

// Ours
const { command } = require('../../cli');
const { createConfig } = require('../../projects/webpack');
const { throws } = require('../../utils/async');
const { cmd } = require('../../utils/color');
const { dry, info, spin } = require('../../utils/logging');
const { MESSAGES: BUILD_MESSAGES } = require('../build/constants');
const { clean } = require('../clean');
const { MESSAGES, OPTIONS } = require('./constants');

module.exports.serve = command(
  {
    name: 'serve',
    options: OPTIONS,
    usage: MESSAGES.usage,
    isConfigRequired: true
  },
  async (argv, config) => {
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development';
    }

    const [webpackConfig, devServerConfig] = createConfig(argv, config, true);

    const { port } = devServerConfig;

    delete devServerConfig.host;
    delete devServerConfig.port;

    if (argv.dry) {
      return dry({
        'Webpack config': webpackConfig,
        'Dev server config': devServerConfig
      });
    }

    info(BUILD_MESSAGES.build(process.env.NODE_ENV, argv.target, webpackConfig[0].output.publicPath));

    throws(await clean());

    const spinner = spin(`Serve${devServerConfig.hot ? ` (${cmd('hot')})` : ''}`);
    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(compiler, devServerConfig);

    return new Promise((resolve, reject) => {
      server.listen(port, '0.0.0.0', err => {
        if (err) {
          spinner.fail();
          reject(err);
        }
      });
    });
  }
);
