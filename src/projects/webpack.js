// Native
const {hostname} = require('os');

// External
const autoprefixer = require('autoprefixer');
const CopyPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');
const webpack = require('webpack');

// Ours
const {BUILD_DIR, DEV_SERVER_PORT} = require('./constants');

const URL_LOADER_LIMIT = 10000;

module.exports.createConfig = (argv, config, isServer) => {
  const isProd = process.env.NODE_ENV === 'production';
  const publicURL = argv.target ? config.deploy[argv.target].publicURL : '/';
  let projectTypeConfig = {};

  if (config.type) {
    projectTypeConfig = require(`./${config.type}`);
  }

  const buildConfig = merge({
    useCSSModules: true,
    showDeprecations: false,
    entry: 'index.js',
    from: 'src',
    to: BUILD_DIR
  }, config.build || {});

  if (config.showDeprecations) {
    process.traceDeprecation = true;
  } else {
    process.noDeprecation = true;
  }

  const babelOptions = merge({
    presets: [
      require.resolve('babel-preset-es2015')
    ]
  }, projectTypeConfig.babel || {}, config.babel || {});

  const webpackConfig = merge({
    cache: true,
    entry: {
      index: [`${config.root}/${buildConfig.from}/${buildConfig.entry}`]
    },
    output: {
      path: `${config.root}/${buildConfig.to}`,
      publicPath: publicURL,
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: babelOptions
        },
        {
          test: /\.(css|scss)$/,
          use: [
            {
              loader: require.resolve('style-loader')
            },
            {
              loader: require.resolve('css-loader'),
              options: {
                camelCase: true,
                localIdentName: isProd ? '[hash:base64:5]' :
                  buildConfig.useCSSModules ?
                  '[name]__[local]--[hash:base64:5]' :
                  '[local]',
                minimize: isProd,
                modules: buildConfig.useCSSModules,
                sourcemaps: !isProd
              }
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                config: {
                  path: `${__dirname}/postcss.config.js`
                }
              }
            },
            {
              loader: require.resolve('sass-loader')
            }
          ]
        },
        {
          test: /\.(jpg|png|gif|mp4|m4v|flv|mp3|wav|m4a)$/,
          loader: require.resolve('file-loader'),
          options: {
            name: '[name]-[hash].[ext]'
          }
        },
        {
          test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
          loader: require.resolve('url-loader'),
          options: {
            limit: URL_LOADER_LIMIT,
            mimetype: 'application/font-woff'
          }
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          loader: require.resolve('url-loader'),
          options: {
            limit: URL_LOADER_LIMIT,
            mimetype: 'application/octet-stream'
          }
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          loader: require.resolve('file-loader')
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          loader: require.resolve('url-loader'),
          options: {
            limit: URL_LOADER_LIMIT,
            mimetype: 'image/svg+xml'
          }
        },
        {
          test: /\.html$/,
          loader: require.resolve('html-loader')
        }
      ]
    },
    plugins: [
      new webpack.LoaderOptionsPlugin({
        options: {
          context: __dirname,
          postcss: [autoprefixer()]
        }
      }),
      new webpack.EnvironmentPlugin(Object.keys(process.env)),
      new CopyPlugin([{
        from: `${config.root}/public`
      }])
    ]
  }, projectTypeConfig.webpack || {}, config.webpack || {});

  if (isProd) {
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin());
  } else {
    webpackConfig.plugins.push(new webpack.NamedModulesPlugin());
  }

  if (!isServer) {
    return webpackConfig;
  }

  const devServerConfig = merge({
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    hot: !isProd,
    noInfo: true,
    overlay: true,
    quiet: true,
    watchOptions: {
      ignored: /node_modules/
    },
    // Remember to strip before passing config to new WebpackDevServer
    host: `${hostname()}.aus.aunty.abc.net.au`,
    port: DEV_SERVER_PORT
  }, projectTypeConfig.devServer || {}, config.devServer || {});

  if (argv.host) {
    devServerConfig.host = argv.host;
  }

  if (argv.port) {
    devServerConfig.port = argv.port;
  }

  if (typeof argv.hot === 'boolean') {
    devServerConfig.hot = argv.hot;
  }

  webpackConfig.output.publicPath = devServerConfig.publicPath =
    `http://${devServerConfig.host}:${devServerConfig.port}/`;

  if (devServerConfig.hot) {
    webpackConfig.entry = upgradeEntryToHot(webpackConfig.entry, webpackConfig.output.publicPath);
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  return [webpackConfig, devServerConfig];
};

function upgradeEntryToHot(entry, publicPath) {
  const heat = [
    `webpack-dev-server/client?${publicPath}`,
    'webpack/hot/dev-server'
  ];

  if (Array.isArray(entry) || typeof entry === 'string') {
    return heat.concat(Array.isArray(entry) ? entry : [entry]);
  }

  return Object.keys(entry).reduce((memo, key) => {
    const value = entry[key];

    memo[key] = heat.concat(Array.isArray(value) ? value : [value]);

    return memo;
  }, {});
}
