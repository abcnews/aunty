// Native
const { execSync } = require('child_process');
const { basename } = require('path');

// External
const importLazy = require('import-lazy')(require);
const svelte = importLazy('svelte/compiler');
const sveltePreprocess = importLazy('svelte-preprocess');

module.exports = {
  process(src, filename) {
    const preprocessor = require.resolve('./transformer-svelte-preprocess.js');

    const processed = execSync(`node --unhandled-rejections=strict --abort-on-uncaught-exception ${preprocessor}`, {
      env: { PATH: process.env.PATH, src, filename }
    }).toString();

    const result = svelte.compile(processed, {
      filename: basename(filename),
      css: true,
      accessors: true,
      dev: true,
      format: 'cjs'
    });

    const esInterop = 'Object.defineProperty(exports, "__esModule", { value: true });';

    return {
      code: result.js.code + esInterop,
      map: result.js.map
    };
  }
};
