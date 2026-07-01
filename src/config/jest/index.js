// Ours
const { merge } = require('../../utils/structures');
const { getProjectConfig } = require('../project');

module.exports.getJestConfig = () => {
  const { jest: projectJestConfig, root } = getProjectConfig();
  const defaultTransformerPath = require.resolve('./transformer-default');

  return merge(
    {
      rootDir: root,
      verbose: true,
      transform: {
        '^.+\\.svelte$': require.resolve('./transformer-svelte'),
        '.*': defaultTransformerPath
      }
    },
    projectJestConfig
  );
};
