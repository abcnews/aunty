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
    const { hasBundleAnalysis, port } = await getServeConfig();
    const webpackConfig = getWebpackConfig();
    const webpackDevServerConfig = await getWebpackDevServerConfig();
    const { hot, devMiddleware } = webpackDevServerConfig;
    const { publicPath } = devMiddleware;
    const bundleAnalyzerConfig = hasBundleAnalysis
      ? combine(BUNDLE_ANALYZER_CONFIG, {
          analyzerPort: +port + Math.floor(port / 1000) * 100 // e.g. 8000 -> 8800
        })
      : null;

    webpackConfig.forEach((config, index) => {
      config.output.publicPath = publicPath;

      config.infrastructureLogging = {
        level: 'warn'
      };

      if (bundleAnalyzerConfig) {
        config.plugins.push(
          new BundleAnalyzerPlugin(
            combine(bundleAnalyzerConfig, {
              analyzerPort: bundleAnalyzerConfig.analyzerPort + index * 10 // e.g. 8800, 8810...
            })
          )
        );
      }
    });

    if (argv.dry) {
      return dry({
        'Webpack config': webpackConfig,
        'WebpackDevServer config': webpackDevServerConfig,
        ...(bundleAnalyzerConfig
          ? {
              'BundleAnalyzerPlugin config': bundleAnalyzerConfig
            }
          : {})
      });
    }

    throws(await cleanCommand(['--quiet']));

    info(
      MESSAGES.serve({
        bundleAnalysisPath: bundleAnalyzerConfig ? MESSAGES.analysis(bundleAnalyzerConfig) : null,
        hot,
        publicPath
      })
    );

    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(webpackDevServerConfig, compiler);
    const [gracefullyInterrupt, restore] = gracefullyHandleLogging();

    return new Promise((resolve, reject) => {
      server.startCallback(err => {
        if (err) {
          return reject(err);
        }

        spinner = spin('Server running');
        gracefullyInterrupt(spinner);
      });

      process.on('SIGINT', () => {
        spinner.clear();
        server.stopCallback(() => {
          if (spinner) {
            spinner.succeed('Server closed');
          }

          resolve();
        });
      });
    }).finally(() => restore());
  }
);

const gracefullyHandleLogging = () => {
  const METHODS = ['debug', 'error', 'info', 'log', 'warn'];
  const reference = {};

  for (let method of METHODS) {
    reference[method] = console[method];
  }

  return [
    spinner => {
      for (let method of METHODS) {
        console[method] = (...args) => {
          spinner.clear();
          reference[method](...args);
          spinner.start();
        };
      }
    },
    () => {
      for (let method of METHODS) {
        console[method] = reference[method];
      }
    }
  ];
};
