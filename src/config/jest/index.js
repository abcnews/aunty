// Ours
const { merge } = require('../../utils/structures');
const { getProjectConfig } = require('../project');

module.exports.getJestConfig = () => {
  const { jest: projectJestConfig, root, type } = getProjectConfig();
  const defaultTransformerPath = require.resolve('./transformer-default');

  return merge(
    {
      rootDir: root,
      verbose: true,
      globals: {
        'vue-jest': {
          transform: {
            js: defaultTransformerPath
          },
          experimentalCSSCompile: false
        }
      },
      transform: {
        '^.+\\.svelte$': require.resolve('./transformer-svelte'),
        '^.*\\.vue$': require.resolve('vue-jest'),
        '.*': defaultTransformerPath
      }
    },
    projectJestConfig
  );
};
