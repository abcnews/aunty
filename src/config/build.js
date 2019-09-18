// External
const mem = require('mem');

// Ours
const { BUILD_DIRECTORY_NAME } = require('../constants');
const { combine } = require('../utils/structures');
const { getProjectConfig } = require('./project');

module.exports.getBuildConfig = mem(() => {
  const { build: projectBuildConfig } = getProjectConfig();

  return combine(
    {
      entry: 'index.js',
      from: 'src',
      to: BUILD_DIRECTORY_NAME,
      staticDir: 'public',
      addModernJS: false,
      extractCSS: false,
      useCSSModules: true,
      showDeprecations: false
    },
    projectBuildConfig
  );
});
