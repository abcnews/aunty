// External
const importLazy = require('import-lazy')(require);
const mem = require('mem');
const semver = importLazy('semver');

// Ours
const { merge } = require('../utils/structures');
const { getProjectConfig } = require('./project');

const PROJECT_TYPES_CONFIG = {
  preact: {
    plugins: [
      [
        require.resolve('@babel/plugin-transform-react-jsx'),
        {
          pragma: 'h'
        }
      ]
    ]
  },
  react: {
    presets: [require.resolve('@babel/preset-react')]
  }
};

module.exports.getBabelConfig = mem(
  ({ isModernJS } = {}) => {
    const { babel: projectBabelConfig, pkg, hasTS, type } = getProjectConfig();

    let corejs = '3';

    // Minor version should be specified, if possible
    // https://babeljs.io/docs/en/babel-preset-env#corejs
    if (pkg.dependencies && pkg.dependencies['core-js']) {
      const corejsSemVer = semver.coerce(pkg.dependencies['core-js']);

      corejs = `${corejsSemVer.major}.${corejsSemVer.minor}`;
    }

    return merge(
      {
        presets: [
          [
            require.resolve('@babel/preset-env'),
            {
              targets: {
                browsers: isModernJS
                  ? ['Chrome >= 80', 'Safari >= 12.1', 'iOS >= 12.3', 'Firefox >= 72', 'Edge >= 18']
                  : pkg.browserslist || ['> 1% in AU', 'Firefox ESR', 'IE 11']
              },
              useBuiltIns: 'entry',
              corejs,
              modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false
            }
          ]
        ].concat(
          hasTS
            ? [
                [
                  require.resolve('@babel/preset-typescript'),
                  {
                    onlyRemoveTypeImports: true
                  }
                ]
              ]
            : []
        ),
        plugins: [require.resolve('@babel/plugin-syntax-dynamic-import')]
      },
      PROJECT_TYPES_CONFIG[type],
      projectBabelConfig
    );
  },
  { cacheKey: ({ isModernJS }) => isModernJS }
);
