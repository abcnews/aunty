// Ours
const { combine } = require('../utils/structures');
const { getProjectConfig } = require('./project');
const { getServeConfig } = require('./serve');

module.exports.getWebpackDevServerConfig = () => {
  const { devServer } = getProjectConfig();
  const { host, hot, https, port } = getServeConfig();

  return combine(
    {
      disableHostCheck: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
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
    devServer
  );
};
