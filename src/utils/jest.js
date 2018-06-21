// Native
const path = require('path');

// External
const babelJest = require('babel-jest');

// Ours
const { createConfig: createBabelConfig } = require('../config/babel');
const { getConfig: getProjectConfig } = require('../config/project');

module.exports = {
  process(src, filename, config) {
    // Handle media requires
    if (filename.match(/\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/)) {
      return 'module.exports = ' + JSON.stringify(path.basename(filename)) + ';';
    } else if (filename.match(/\.s?css$/)) {
      return `module.exports = new Proxy({}, { get: (styles, method) => method });`;
    }

    const projectConfig = getProjectConfig();
    const babelConfig = createBabelConfig(projectConfig);

    if (filename.match(/\.vue$/)) {
      // Add a dodgy hack in to trick the processor into thinking
      // it's loading a .babelrc file
      const findBabelConfig = require('find-babel-config');
      const oldSync = findBabelConfig.sync;
      findBabelConfig.sync = () => {
        return {
          file: 'Internal',
          config: babelConfig
        };
      };

      // Process the file
      const processVue = require('vue-jest/lib/process');
      const processedSrc = processVue(src, filename);

      // Remove the dodgy hack
      findBabelConfig.sync = oldSync;

      return processedSrc;
    }

    return babelJest.createTransformer(babelConfig).process(src, filename, config, { sourceMaps: false });
  }
};
