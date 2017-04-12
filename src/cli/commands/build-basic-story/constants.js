// External
const {recursive} = require('merge');

// Ours
const {cmd, hvy, opt, req, sec} = require('../../../string-styles');
const {indented} = require('../../../utils/strings');
const {pretty} = require('../../../utils');

// Resolved
const BABELIFY = require.resolve('babelify');
const ES2040 = require.resolve('babel-preset-es2040');

const OPTIONS = {
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

const USAGE = `
Usage: ${cmd('aunty build-basic-story')} ${opt('[options]')}

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
      uglify: true,
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
`;

const TASK_NAMES = ['styles', 'scripts', 'public'];

const KEY = 'build';

const D_KEY = `${KEY}_debug`;

const BUILD_DIR = 'build';

const FROM_PUBLIC_TO_BUILD = {from: 'public', to: BUILD_DIR};

const FROM_SRC_TO_BUILD = {from: 'src', to: BUILD_DIR};

const COMMON_CONFIG = {
  styles: {
    files: '**/[^_]*.{sc,c}ss',
    watched: '**/*.{sc,c}ss',
    ...FROM_SRC_TO_BUILD
  },
  scripts: {
    files: 'index.js',
    watched: '**/*.js',
    browserifyOptions: {
      transform: [
        [BABELIFY, {presets: [ES2040]}]
      ]
    },
    uglifyOptions: {},
    ...FROM_SRC_TO_BUILD
  },
  public: {
    files: '**/*',
    ...FROM_PUBLIC_TO_BUILD
  }
};

const DEFAULTS = {
  [KEY]: recursive(true, COMMON_CONFIG, {
    styles: {
      nodeSassOptions: {
        outputStyle: 'compressed'
      }
    }
  }),
  [D_KEY]: recursive(true, COMMON_CONFIG, {
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
        preserveComments: 'all'
      }
    }
  })
};

const MESSAGES = {
  config: (key, config, isDefault) => indented(pretty`
Here is the${
  isDefault ? ' default' : ''
} ${hvy(key)} config${
  isDefault ? '' : ', including defaults'
}:

${config}`),
  building: (taskName, key) => `
  Building ${taskName}${key === D_KEY ? ' (debug)' : ''}:`
};

module.exports = {
  OPTIONS,
  USAGE,
  TASK_NAMES,
  KEY,
  D_KEY,
  BUILD_DIR,
  DEFAULTS,
  MESSAGES
};
