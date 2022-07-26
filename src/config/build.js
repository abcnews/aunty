// Native
const { join } = require('path');

// External
const mem = require('mem');

// Ours
const { BUILD_DIRECTORY_NAME, OUTPUT_DIRECTORY_NAME } = require('../constants');
const { combine } = require('../utils/structures');
const { getProjectConfig } = require('./project');

const PROJECT_TYPES_CONFIG = {
  svelte: {
    useCSSModules: false
  }
};
const DEFAULT_ENTRY_FILE_NAME = 'index';
const DEFAULT_SOURCE_DIRECTORY_NAME = 'src';
const DEFAULT_STATIC_DIRECTORY_NAME = 'public';

module.exports.getBuildConfig = mem(() => {
  const { build: projectBuildConfig, type } = getProjectConfig();

  return combine(
    {
      entry: DEFAULT_ENTRY_FILE_NAME,
      from: DEFAULT_SOURCE_DIRECTORY_NAME,
      to: join(OUTPUT_DIRECTORY_NAME, BUILD_DIRECTORY_NAME),
      staticDir: DEFAULT_STATIC_DIRECTORY_NAME,
      addModernJS: false,
      includedDependencies: [],
      extractCSS: false,
      useCSSModules: true,
      showDeprecations: false
    },
    PROJECT_TYPES_CONFIG[type],
    projectBuildConfig
  );
});
