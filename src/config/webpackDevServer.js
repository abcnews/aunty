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
      contentBase: join(root, staticDir),
      disableHostCheck: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      host,
      hot,
      https,
      noInfo: true,
      overlay: true,
      publicPath: `http${https ? 's' : ''}://${host}:${port}/`,
      quiet: true,
      watchOptions: {
        ignored: /node_modules/
      }
    },
    projectWebpackDevServerConfig
  );
};
