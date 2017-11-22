// Native
const { hostname } = require('os');
const path = require('path');
const FS = require('fs');

// External
const guessRootPath = require('guess-root-path');
const autoprefixer = require('autoprefixer');
const CopyPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

// Ours
const { BUILD_DIR, DEV_SERVER_PORT } = require('./constants');

const URL_LOADER_LIMIT = 10000;

module.exports.createConfig = (argv, config, isServer) => {
  const rootPath = config.root || guessRootPath();
  let webpackConfig;
  // If a config file exists, use it
  if (FS.existsSync(`${rootPath}/webpack.config.js`)) {
    webpackConfig = require(`${rootPath}/webpack.config.js`);
    if (!webpackConfig instanceof Array) {
      webpackConfig = [webpackConfig];
    }
    // If a function was given then execute it for the final config
    webpackConfig = webpackConfig.map(c => {
      if (typeof c === 'function') {
        return c(argv, config, isServer);
      } else {
        return c;
      }
    });
  } else {
    webpackConfig = [createWebpackConfig(argv, config)];

    // create two copies of the config if we are going to be building modules too
    if (argv['modules'] && (!config.build || config.build.modules !== false)) {
      webpackConfig.push(createWebpackConfig(argv, Object.assign({}, config, { buildWithModules: true })));
    }
  }

  // if isServer then include the devServer config and check for hot reload
  if (isServer) {
    const devServerConfig = createDevServerConfig(argv, config);
    webpackConfig.map(c => {
      c.output.publicPath = devServerConfig.publicPath = `http://${devServerConfig.host}:${devServerConfig.port}/`;
      if (devServerConfig.hot) {
        c.entry = upgradeEntryToHot(c.entry, c.output.publicPath);
        c.plugins.push(new webpack.HotModuleReplacementPlugin());
      }
      return c;
    });
    return [webpackConfig, devServerConfig];
  } else {
    return webpackConfig;
  }
};

function createWebpackConfig(argv, config) {
  argv = argv || [];
  config = config || {
    root: guessRootPath()
  };

  const isProd = process.env.NODE_ENV === 'production';
  const publicURL = argv.target ? config.deploy[argv.target].publicURL : '/';
  let projectTypeConfig = {};

  if (config.type) {
    projectTypeConfig = require(`./${config.type}`);
  }

  const buildConfig = merge(
    {
      useCSSModules: true,
      showDeprecations: false,
      entry: 'index.js',
      from: 'src',
      to: BUILD_DIR
    },
    config.build || {}
  );

  if (config.showDeprecations) {
    process.traceDeprecation = true;
  } else {
    process.noDeprecation = true;
  }

  let babelOptions = merge(
    {
      presets: [
        [
          require.resolve('babel-preset-env'),
          {
            targets: {
              browsers: config.buildWithModules
                ? ['Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54', 'Edge >= 15']
                : ['> 1%', 'last 2 versions', 'Firefox ESR']
            },
            useBuiltIns: true,
            modules: false
          }
        ]
      ],
      plugins: [require.resolve('babel-plugin-transform-object-rest-spread')],
      cacheDirectory: true
    },
    projectTypeConfig.babel || {}
  );

  if (typeof config.babel === 'function') {
    babelOptions = config.babel(babelOptions);
  } else if (typeof config.babel === 'object') {
    babelOptions = merge(babelOptions, config.babel);
  }

  let webpackConfig = merge(
    {
      cache: true,
      entry: {
        index: [`${config.root}/${buildConfig.from}/${buildConfig.entry}`]
      },
      output: {
        path: `${config.root}/${buildConfig.to}`,
        publicPath: publicURL,
        filename: config.buildWithModules ? '[name].modules.js' : '[name].js'
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            include: [path.resolve(config.root, buildConfig.from)],
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
                  localIdentName: isProd
                    ? '[hash:base64:5]'
                    : buildConfig.useCSSModules ? '[name]__[local]--[hash:base64:5]' : '[local]',
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
        new CopyPlugin([
          {
            from: `${config.root}/public`
          }
        ])
      ]
    },
    projectTypeConfig.webpack || {}
  );

  if (typeof config.webpack === 'function') {
    webpackConfig = config.webpack(webpackConfig);
  } else if (typeof config.webpack === 'object') {
    webpackConfig = merge(webpackConfig, config.webpack);
  }

  if (isProd) {
    webpackConfig.plugins.push(
      new UglifyJSPlugin({
        parallel: true
      })
    );
  } else {
    webpackConfig.plugins.push(new webpack.NamedModulesPlugin());
  }

  return webpackConfig;
}

function createDevServerConfig(argv, config) {
  const webpackConfig = createWebpackConfig(argv, config);

  const isProd = process.env.NODE_ENV === 'production';
  const publicURL = argv.target ? config.deploy[argv.target].publicURL : '/';
  let projectTypeConfig = {};

  if (config.type) {
    projectTypeConfig = require(`./${config.type}`);
  }

  let devServerConfig = merge(
    {
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
      host: `${hostname().replace('.aus.aunty.abc.net.au', '')}.aus.aunty.abc.net.au`,
      port: DEV_SERVER_PORT
    },
    projectTypeConfig.devServer || {}
  );

  if (typeof config.devServer === 'function') {
    devServerConfig = config.devServer(devServerConfig);
  } else if (typeof config.devServer === 'object') {
    devServerConfig = merge(devServerConfig, config.devServer);
  }

  if (argv.host) {
    devServerConfig.host = argv.host;
  }

  if (argv.port) {
    devServerConfig.port = argv.port;
  }

  if (typeof argv.hot === 'boolean') {
    devServerConfig.hot = argv.hot;
  }

  return devServerConfig;
}

function upgradeEntryToHot(entry, publicPath) {
  const heat = [`webpack-dev-server/client?${publicPath}`, 'webpack/hot/dev-server'];

  if (Array.isArray(entry) || typeof entry === 'string') {
    return heat.concat(Array.isArray(entry) ? entry : [entry]);
  }

  return Object.keys(entry).reduce((memo, key) => {
    const value = entry[key];

    memo[key] = heat.concat(Array.isArray(value) ? value : [value]);

    return memo;
  }, {});
}

module.exports.createWebpackConfig = createWebpackConfig;
