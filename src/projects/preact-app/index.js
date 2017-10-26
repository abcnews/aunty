module.exports.dependencies = ['preact', 'preact-compat'];

module.exports.babel = {
  presets: [],
  plugins: [
    [
      require.resolve('babel-plugin-transform-react-jsx'),
      {
        pragma: 'h'
      }
    ]
  ]
};

module.exports.webpack = {
  resolve: {
    alias: {
      react: 'preact-compat',
      'react-dom': 'preact-compat',
      'create-react-class': 'preact-compat/lib/create-react-class'
    }
  }
};

module.exports.devServer = {};
