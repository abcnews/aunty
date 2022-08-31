// Native
const { join } = require('path');

// Ours
// TODO: Probably replace combine with the vite mergeConfig util https://vitejs.dev/guide/api-javascript.html#mergeconfig
const { combine } = require('../utils/structures');
const { getBuildConfig } = require('./build');
const { getProjectConfig } = require('./project');
const { getServeConfig } = require('./serve');

module.exports.getViteServerConfig = async () => {
  const { root, webpackDevServer: projectViteServerConfig } = getProjectConfig();
  const { staticDir } = getBuildConfig();
  const { host, hot, https, port } = await getServeConfig();

  console.log('hot :>> ', hot);

  return combine(
    {
      host: '0.0.0.0',
      hmr: true,
      port,
      https,
      static: {
        directory: join(root, staticDir)
      }
    },
    projectViteServerConfig
  );
};
