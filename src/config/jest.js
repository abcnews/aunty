// Native
const path = require('path');

// External
const merge = require('webpack-merge');

const PROJECT_TYPES_DEFAULT_CONFIG = {
  // nothing projectType specific for now
};

module.exports.createConfig = config => {
  config = config || {};

  let jestConfig = merge(
    {
      rootDir: config.root,
      transform: {
        '.*': require.resolve('../utils/jest')
      }
    },
    (config.type && PROJECT_TYPES_DEFAULT_CONFIG[config.type]) || {}
  );

  if (typeof config.jest === 'function') {
    jestConfig = config.jest(jestConfig);
  } else if (typeof config.jest === 'object') {
    jestConfig = merge(jestConfig, config.jest);
  }

  return jestConfig;
};
