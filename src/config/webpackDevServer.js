// Native
const { join } = require('path');

// Ours
const { combine } = require('../utils/structures');
const { getBuildConfig } = require('./build');
const { getProjectConfig } = require('./project');
const { getServeConfig } = require('./serve');

module.exports.getWebpackDevServerConfig = () => {
  const { root, webpackDevServer: projectWebpackDevServerConfig } = getProjectConfig();
  const { staticDir } = getBuildConfig();
  const { host, hot, https, port } = getServeConfig();

  return combine(
    {
      allowedHosts: 'all',
      client: {
        logging: 'warn',
        overlay: true
      },
      devMiddleware: {
        publicPath: `http${https ? 's' : ''}://${host}:${port}/`
      },
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      host: '0.0.0.0',
      hot,
      port,
      server: https
        ? {
            type: 'https',
            options: typeof https === 'object' ? https : null
          }
        : 'http',
      static: {
        directory: join(root, staticDir)
      }
    },
    projectWebpackDevServerConfig
  );
};
