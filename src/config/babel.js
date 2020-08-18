// External
const mem = require('mem');

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
  },
  vue: config => {
    config.presets[1][0] = require.resolve('babel-preset-typescript-vue');

    return config;
  }
};

module.exports.getBabelConfig = mem(({ isModernJS } = {}) => {
  const { babel: projectBabelConfig, pkg, type } = getProjectConfig();

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
            corejs: 3,
            modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false
          }
        ],
        [
          require.resolve('@babel/preset-typescript'),
          {
            onlyRemoveTypeImports: true
          }
        ]
      ],
      plugins: [
        require.resolve('@babel/plugin-proposal-object-rest-spread'),
        require.resolve('@babel/plugin-syntax-dynamic-import'),
        require.resolve('@babel/plugin-proposal-class-properties')
      ]
    },
    PROJECT_TYPES_CONFIG[type],
    projectBabelConfig
  );
});
