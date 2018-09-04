// External
const merge = require('webpack-merge');

const PROJECT_TYPES_DEFAULT_CONFIG = {
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

module.exports.createConfig = config => {
  config = config || {};

  const browsers = config.buildWithModules
    ? ['Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54', 'Edge >= 15']
    : ['> 1% in au', '> 5%', 'Firefox ESR'];

  let babelConfig = merge(
    {
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            targets: {
              browsers
            },
            useBuiltIns: 'entry',
            modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false
          }
        ]
      ],
      plugins: [require.resolve('@babel/plugin-proposal-object-rest-spread')]
    },
    (config.type && PROJECT_TYPES_DEFAULT_CONFIG[config.type]) || {}
  );

  if (typeof config.babel === 'function') {
    babelConfig = config.babel(babelConfig);
  } else if (typeof config.babel === 'object') {
    babelConfig = merge(babelConfig, config.babel);
  }

  return babelConfig;
};
