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
                ? ['Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54', 'Edge >= 15']
                : pkg.browserslist || ['> 1% in au', '> 5%', 'Firefox ESR']
            },
            useBuiltIns: 'entry',
            corejs: 3,
            modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false
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
