// External
const importLazy = require('import-lazy')(require);
const { createServer } = importLazy('vite');

// TODO: add budle analyzer https://github.com/btd/rollup-plugin-visualizer
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Ours
const { getServeConfig } = require('../../config/serve');
const { getViteConfig } = require('../../config/vite');
const { throws } = require('../../utils/async');
const { cmd } = require('../../utils/color');
const { dry, info, spin } = require('../../utils/logging');
const { combine } = require('../../utils/structures');
const { command } = require('../');
const cleanCommand = require('../clean');
const { MESSAGES } = require('./constants');
const { getViteServerConfig } = require('../../config/viteServer');

module.exports = command(
  {
    name: 'serve-vite',
    nodeEnv: 'development',
    usage: MESSAGES.usage
  },
  async argv => {
    const { port } = await getServeConfig();
    const viteConfig = getViteConfig();
    viteConfig.server = await getViteServerConfig();

    if (argv.dry) {
      return dry({
        'Vite config': viteConfig
      });
    }

    throws(await cleanCommand(['--quiet']));

    info(
      MESSAGES.serve({
        hot: viteConfig.server.hmr,
        publicPath: viteConfig.base
      })
    );

    const server = await createServer(viteConfig);
    const [gracefullyInterrupt, restore] = gracefullyHandleLogging();

    return new Promise(async (resolve, reject) => {
      try {
        await server.listen(port);
        server.printUrls();
      } catch (err) {
        return reject(err);
      }

      spinner = spin('Server running');
      gracefullyInterrupt(spinner);

      process.on('SIGINT', async () => {
        spinner.clear();
        await server.close();
        if (spinner) {
          spinner.succeed('Server closed');
        }

        resolve();
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
