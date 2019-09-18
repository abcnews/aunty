// External
const importLazy = require('import-lazy')(require);
const webpack = importLazy('webpack');
const WebpackDevServer = importLazy('webpack-dev-server');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Ours
const { getServeConfig } = require('../../config/serve');
const { getWebpackConfig } = require('../../config/webpack');
const { getWebpackDevServerConfig } = require('../../config/webpackDevServer');
const { throws } = require('../../utils/async');
const { cmd } = require('../../utils/color');
const { dry, info, spin } = require('../../utils/logging');
const { combine } = require('../../utils/structures');
const { command } = require('../');
const cleanCommand = require('../clean');
const { BUNDLE_ANALYZER_CONFIG, MESSAGES } = require('./constants');

module.exports = command(
  {
    name: 'serve',
    nodeEnv: 'development',
    usage: MESSAGES.usage
  },
  async argv => {
    const { port } = getServeConfig();
    const webpackConfig = getWebpackConfig();
    const webpackDevServerConfig = getWebpackDevServerConfig();
    const { hot, publicPath } = webpackDevServerConfig;
    const bundleAnalyzerConfig = combine(BUNDLE_ANALYZER_CONFIG, {
      analyzerPort: +port + Math.floor(port / 1000) * 100 // e.g. 8000 -> 8800
    });

    webpackConfig.forEach((config, index) => {
      config.output.publicPath = publicPath;

      if (hot) {
        config.entry = upgradeEntryToHot(config.entry, config.output.publicPath);
        config.plugins.push(new webpack.HotModuleReplacementPlugin());
      }

      config.plugins.push(
        new BundleAnalyzerPlugin(
          combine(bundleAnalyzerConfig, {
            analyzerPort: bundleAnalyzerConfig.analyzerPort + index * 10 // e.g. 8800, 8810...
          })
        )
      );
    });

    if (argv.dry) {
      return dry({
        'Webpack config': webpackConfig,
        'WebpackDevServer config': webpackDevServerConfig,
        'BundleAnalyzerPlugin config': bundleAnalyzerConfig
      });
    }

    throws(await cleanCommand(['--quiet']));

    info(MESSAGES.serve({ hot, bundleAnalysisPath: MESSAGES.analysis(bundleAnalyzerConfig) }));

    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(compiler, webpackDevServerConfig);

    return new Promise((resolve, reject) => {
      let spinner;

      server.listen(port, '0.0.0.0', err => {
        if (err) {
          return reject(err);
        }

        spinner = spin('Server running');
      });

      process.on('SIGINT', function() {
        server.close(function() {
          if (spinner) {
            spinner.succeed('Server closed');
          }

          resolve();
        });
      });
    });
  }
);

function upgradeEntryToHot(entry, publicPath) {
  const heat = [`webpack-dev-server/client?${publicPath}`, 'webpack/hot/dev-server'];

  if (Array.isArray(entry) || typeof entry === 'string') {
    return heat.concat(Array.isArray(entry) ? entry : [entry]);
  }

  return Object.keys(entry).reduce((memo, key) => {
    const value = entry[key];

    memo[key] = heat.concat(Array.isArray(value) ? value : [value]);

    return memo;
  }, {});
}
