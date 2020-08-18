// Native
const path = require('path');

// External
const importLazy = require('import-lazy')(require);
const babelJest = importLazy('babel-jest');

// Ours
const { getBabelConfig } = require('../babel');

const MEDIA_RESOURCE_PATTERN = /\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/;
const STYLE_RESOURCE_PATTERN = /\.s?css$/;
const STYLE_RESOURCE_REPLACEMENT = 'module.exports = new Proxy({}, { get: (styles, method) => method });';
const VUE_RESOURCE_PATTERN = /\.vue$/;

module.exports = {
  process(src, filename, config) {
    // Mock media & style resources
    if (filename.match(MEDIA_RESOURCE_PATTERN)) {
      return 'module.exports = ' + JSON.stringify(path.basename(filename)) + ';';
    } else if (filename.match(STYLE_RESOURCE_PATTERN)) {
      return STYLE_RESOURCE_REPLACEMENT;
    }

    // Run everything else through babel
    return babelJest.createTransformer(getBabelConfig()).process(src, filename, config, { sourceMaps: false });
  }
};
