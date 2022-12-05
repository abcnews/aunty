// Native
const { join } = require('path');

// Ours
const { combine } = require('../utils/structures');
const { getBuildConfig } = require('./build');
const { getProjectConfig } = require('./project');
const { getServeConfig } = require('./serve');

module.exports.getWebpackDevServerConfig = async () => {
  const { root, webpackDevServer: projectWebpackDevServerConfig } = getProjectConfig();
  const { staticDir } = getBuildConfig();
  const { host, hot, https, port } = await getServeConfig();

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
        ? typeof https === 'object'
          ? {
              type: 'https',
              options: https
            }
          : 'https'
        : 'http',
      static: (Array.isArray(staticDir) ? staticDir : [staticDir]).map(dirName => ({
        directory: join(root, dirName)
      }))
    },
    projectWebpackDevServerConfig
  );
};
