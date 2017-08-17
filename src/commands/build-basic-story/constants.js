// External
const merge = require('merge');

// Ours
const {cmd, hvy, opt, req, sec} = require('../../utils/color');
const {pretty} = require('../../utils/misc');
const {indented} = require('../../utils/strings');

// Resolved
const BABELIFY = require.resolve('babelify');
const ES2040 = require.resolve('babel-preset-es2040');

module.exports.OPTIONS = {
  boolean: [
    'config',
    'debug',
    'defaultConfig',
    'help'
  ],
  alias: {
    config: 'c',
    debug: 'd',
    defaultConfig: 'D',
    help: 'h'
  }
};

module.exports.TASK_NAMES = ['styles', 'scripts', 'public'];

const KEY = module.exports.KEY = 'build';
const D_KEY = module.exports.D_KEY = `${KEY}_debug`;
const BUILD_DIR = module.exports.BUILD_DIR = 'build';
const FROM_PUBLIC_TO_BUILD = {from: 'public', to: BUILD_DIR};
const FROM_SRC_TO_BUILD = {from: 'src', to: BUILD_DIR};

const COMMON_CONFIG = {
  styles: Object.assign({
    files: '**/[^_]*.{sc,c}ss',
    watched: '**/*.{sc,c}ss'
  }, FROM_SRC_TO_BUILD),
  scripts: Object.assign({
    files: 'index.js',
    watched: '**/*.js',
    browserifyOptions: {
      transform: [
        [BABELIFY, {presets: [ES2040]}]
      ]
    },
    uglifyOptions: {}
  }, FROM_SRC_TO_BUILD),
  public: Object.assign({
    files: '**/*'
  }, FROM_PUBLIC_TO_BUILD)
};

module.exports.DEFAULTS = {
  [KEY]: merge.recursive(true, COMMON_CONFIG, {
    styles: {
      nodeSassOptions: {
        outputStyle: 'compressed'
      }
    }
  }),
  [D_KEY]: merge.recursive(true, COMMON_CONFIG, {
    styles: {
      nodeSassOptions: {
        outputStyle: 'nested',
        sourceMap: true,
        sourceMapEmbed: true
      }
    },
    scripts: {
      browserifyOptions: {
        debug: true
      },
      uglifyOptions: {
        compress: false,
        mangle: false,
        output: {
          comments: 'all'
        }
      }
    }
  })
};

module.exports.MESSAGES = {
  config: (key, config, isDefault) => indented(pretty`
Here is the${
  isDefault ? ' default' : ''
} ${hvy(key)} config${
  isDefault ? '' : ', including defaults'
}:

${config}`),
  building: (taskName, key) => `
  Building ${taskName}${key === D_KEY ? ' (debug)' : ''}:`,
  usage: name => `
Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')}

${sec('Options')}

  ${opt('-d')}, ${opt('--debug')}          Use the ${hvy('build_debug')} config instead of ${hvy('build')}
  ${opt('-c')}, ${opt('--config')}         Display this project's config and exit
  ${opt('-D')}, ${opt('--defaultConfig')}  Display the default config and exit
  ${opt('-h')}, ${opt('--help')}           Display this help message and exit

${sec(`Example ${hvy('aunty')} config`)}:

  ${req(`build: {
    styles: {
      files: '**/[^_]*.s?css',
      from: 'src',
      to: 'build',
      nodeSassOptions: {…}
    },
    scripts: {
      files: 'index.js',
      from: 'src',
      to: 'build',
      browserifyOptions: {…},
      uglifyOptions: {…}
    },
    public: {
      from: 'public',
      to: 'build'
    }
  },
  build_debug: {…}`)}

${sec('Examples')}

  ${cmd('aunty build-basic-story')} ${opt('--debug')}
    Build the project using the ${hvy('build_debug')} config.

  ${cmd('aunty build-basic-story')} ${opt('--config')}
    Output the project's ${hvy('build')} config, including defaults.

  ${cmd('aunty build-basic-story')} ${opt('--debug --defaultConfig')}
    Output the default ${hvy('build_debug')} config.
`
};
