// Native
const { existsSync } = require('fs');
const { hostname } = require('os');
const path = require('path');

// External
const guessRootPath = require('guess-root-path');
const CopyPlugin = require('copy-webpack-plugin');
const pify = require('pify');
const tcpp = require('tcp-ping');
const merge = require('webpack-merge');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

// Ours
const { createConfig: createBabelConfig } = require('./babel');
const { BUILD_DIR, DEV_SERVER_PORT } = require('./constants');

const probe = pify(tcpp.probe);

const INTERNAL_HOST = '.aus.aunty.abc.net.au';
const URL_LOADER_LIMIT = 10000;
const PROJECT_TYPES_DEFAULT_CONFIG = {
  preact: config =>
    merge(config, {
      resolve: {
        alias: {
          react: 'preact-compat',
          'react-dom': 'preact-compat',
          'create-react-class': 'preact-compat/lib/create-react-class'
        }
      }
    }),
  vue: config => {
    config.module.rules.forEach(({ __hint__, use }) => {
      if (__hint__ === 'styles') {
        use[0] = { loader: require.resolve('vue-style-loader') };
      }
    });

    return merge(config, {
      module: {
        rules: [
          {
            test: /\.vue$/,
            loader: require.resolve('vue-loader')
          }
        ]
      },
      plugins: [new VueLoaderPlugin()]
    });
  }
};

module.exports.createConfig = async (argv, config, isServer) => {
  const rootPath = config.root || guessRootPath();
  let webpackConfig;
  // If a config file exists, use it
  if (existsSync(`${rootPath}/webpack.config.js`)) {
    webpackConfig = require(`${rootPath}/webpack.config.js`);
    if (!(webpackConfig instanceof Array)) {
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
    const devServerConfig = await createDevServerConfig(argv, config);
    webpackConfig.map(c => {
      c.output.publicPath = devServerConfig.publicPath = `http${devServerConfig.https ? 's' : ''}://${
        devServerConfig.host
      }:${devServerConfig.port}/`;
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

const createWebpackConfig = (module.exports.createWebpackConfig = (argv, config) => {
  argv = argv || [];
  config = config || {
    root: guessRootPath()
  };

  const isProd = process.env.NODE_ENV === 'production';
  const publicURL = argv.target ? config.deploy[argv.target].publicURL : '/';

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

  // Common config
  let webpackConfig = {
    mode: isProd ? 'production' : 'development',
    cache: true,
    entry: {
      index: [`${config.root}/${buildConfig.from}/${buildConfig.entry}`]
    },
    output: {
      path: `${config.root}/${buildConfig.to}`,
      publicPath: publicURL,
      filename: config.buildWithModules ? '[name].modules.js' : '[name].js',
      // The update file hash was causing 404s and full page reloads.
      // This will make the file name more predictable.
      // See https://github.com/webpack/webpack-dev-server/issues/79#issuecomment-244596129
      hotUpdateChunkFilename: 'hot/hot-update.js',
      hotUpdateMainFilename: 'hot/hot-update.json'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [path.resolve(config.root, buildConfig.from)],
          loader: require.resolve('babel-loader'),
          options: createBabelConfig(config)
        },
        {
          __hint__: 'styles',
          test: /\.(css|scss)$/,
          use: [
            {
              loader: require.resolve('style-loader')
            },
            {
              loader: require.resolve('css-loader'),
              options: {
                camelCase: true,
                context: __dirname, // https://github.com/webpack-contrib/css-loader/issues/413#issuecomment-299578180
                localIdentName: `${isProd ? '' : '[folder]-[name]__[local]-'}[hash:base64:6]`,
                minimize: isProd,
                modules: buildConfig.useCSSModules,
                sourcemaps: !isProd
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
      new webpack.EnvironmentPlugin(Object.keys(process.env)),
      new CopyPlugin([
        {
          from: `${config.root}/public`
        }
      ])
    ],
    optimization: {
      namedModules: !isProd
    }
  };

  // Add project _type_ config
  if (PROJECT_TYPES_DEFAULT_CONFIG[config.type]) {
    webpackConfig = PROJECT_TYPES_DEFAULT_CONFIG[config.type](webpackConfig);
  }

  // Add project config
  if (typeof config.webpack === 'function') {
    webpackConfig = config.webpack(webpackConfig);
  } else if (typeof config.webpack === 'object') {
    webpackConfig = merge(webpackConfig, config.webpack);
  }

  // Add environment config
  if (isProd) {
    webpackConfig.plugins.push(
      new UglifyJSPlugin({
        parallel: true
      })
    );
  }

  // Cleanup hints
  webpackConfig.module.rules.forEach(rule => {
    if (rule.__hint__) {
      delete rule.__hint__;
    }
  });

  return webpackConfig;
});

async function createDevServerConfig(argv, config) {
  const isProd = process.env.NODE_ENV === 'production';

  // Try to reach internal known internal network, setting host to
  // internally visible network address if successful; localhost if not.
  const host = (await probe(`nucwed${INTERNAL_HOST}`, 80))
    ? `${hostname().replace(INTERNAL_HOST, '')}${INTERNAL_HOST}`
    : 'localhost';

  // Common config
  let devServerConfig = {
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    hot: !isProd,
    noInfo: true,
    overlay: true,
    quiet: true,
    https: true,
    watchOptions: {
      ignored: /node_modules/
    },
    // Remember to strip before passing config to new WebpackDevServer
    host,
    port: DEV_SERVER_PORT
  };

  // Add project config
  if (typeof config.devServer === 'function') {
    devServerConfig = config.devServer(devServerConfig);
  } else if (typeof config.devServer === 'object') {
    devServerConfig = merge(devServerConfig, config.devServer);
  }

  // Add command line arguments config
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
