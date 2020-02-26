// Native
const path = require('path');

// External
const importLazy = require('import-lazy')(require);
const babelJest = importLazy('babel-jest');
const svelte = importLazy('svelte/compiler');

// Ours
const { getBabelConfig } = require('../config/babel');

const MEDIA_RESOURCE_PATTERN = /\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/;
const STYLE_RESOURCE_PATTERN = /\.s?css$/;
const STYLE_RESOURCE_REPLACEMENT = 'module.exports = new Proxy({}, { get: (styles, method) => method });';
const SVELTE_RESOURCE_PATTERN = /\.svelte$/;
const SVELTE_STYLES_PATTERN = /<style[^>]*>[\S\s]*?<\/style>/g;
const VUE_RESOURCE_PATTERN = /\.vue$/;

module.exports = {
  process(src, filename, config) {
    // Mock media & style resources
    if (filename.match(MEDIA_RESOURCE_PATTERN)) {
      return 'module.exports = ' + JSON.stringify(path.basename(filename)) + ';';
    } else if (filename.match(STYLE_RESOURCE_PATTERN)) {
      return STYLE_RESOURCE_REPLACEMENT;
    }

    // Process Svelte files
    if (filename.match(SVELTE_RESOURCE_PATTERN)) {
      return processSvelte(src, filename);
    }

    const babelConfig = getBabelConfig();

    // Process Vue files, ensuring babel config is used
    if (filename.match(VUE_RESOURCE_PATTERN)) {
      return processVue(src, filename, babelConfig);
    }

    // Run everything else through babel
    return babelJest.createTransformer(babelConfig).process(src, filename, config, { sourceMaps: false });
  }
};

function processSvelte(src, filename) {
  const srcWithoutStyles = src.replace(SVELTE_STYLES_PATTERN, '');

  const { js, css, ast, warnings, vars, stats } = svelte.compile(srcWithoutStyles, {
    filename,
    css: false,
    accessors: true,
    dev: true,
    format: 'cjs'
  });
  const { code, map } = js;

  return {
    code,
    map
  };
}

function processVue(src, filename, babelConfig) {
  // `find-babel-config`is a dependency of `vue-jest` which looks for babel
  // config in a project's package.json or .babelrc file, rather than allowing
  // us to pass it directly into its processor. Here, we temporarily replace
  // its `sync` function before `vue-jest` requires it, allowing us to trick it
  // into thinking it found our`babelConfig` during its search.

  const findBabelConfig = require('find-babel-config');
  const _sync = findBabelConfig.sync;
  let processedSrc;

  findBabelConfig.sync = () => ({
    file: 'Internal',
    config: babelConfig
  });
  processedSrc = require('vue-jest/lib/process')(src, filename);
  findBabelConfig.sync = _sync;

  return processedSrc;
}
