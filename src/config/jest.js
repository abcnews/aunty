// Ours
const { merge } = require('../utils/structures');
const { getProjectConfig } = require('./project');

module.exports.getJestConfig = () => {
  const { jest: projectJestConfig, root } = getProjectConfig();

  return merge(
    {
      rootDir: root,
      transform: {
        '.*': require.resolve('../utils/jest')
      }
    },
    projectJestConfig
  );
};
