// Native
const { existsSync } = require('fs');
const { join, resolve } = require('path');

// External
const importLazy = require('import-lazy')(require);
const CopyPlugin = importLazy('copy-webpack-plugin');
const MiniCssExtractPlugin = importLazy('mini-css-extract-plugin');
const UglifyJSPlugin = importLazy('uglifyjs-webpack-plugin');
const { VueLoaderPlugin } = importLazy('vue-loader');
const EnvironmentPlugin = importLazy('webpack/lib/EnvironmentPlugin');

// Ours
const { combine, merge } = require('../utils/structures');
const { getBabelConfig } = require('./babel');
const { getBuildConfig } = require('./build');
const { getProjectConfig } = require('./project');

const URL_LOADER_LIMIT = 10000;
const PROJECT_TYPES_CONFIG = {
  preact: {
    resolve: {
      alias: {
        react: 'preact-compat',
        'react-dom': 'preact-compat',
        'create-react-class': 'preact-compat/lib/create-react-class'
      }
    }
  },
  vue: config => {
    config.module.rules.forEach(({ __hint__, use }) => {
      if (__hint__ === 'styles') {
        use[0] = { loader: require.resolve('vue-style-loader') };
      }
    });
    config.module.rules.push({
      test: /\.vue$/,
      loader: require.resolve('vue-loader')
    });
    config.plugins.push(new VueLoaderPlugin());

    return config;
  }
};
const WEBPACK_CONFIG_FILE = 'webpack.config.js';

module.exports.getWebpackConfig = () => {
  const { root } = getProjectConfig();
  const { addModernJS, showDeprecations } = getBuildConfig();
  const isProd = process.env.NODE_ENV === 'production';
  const customWebpackConfigFilePath = join(root, WEBPACK_CONFIG_FILE);

  if (showDeprecations) {
    process.traceDeprecation = true;
  } else {
    process.noDeprecation = true;
  }

  let config;

  // If the project has a webpack config file, use it, otherwise create our own
  if (existsSync(customWebpackConfigFilePath)) {
    config = require(customWebpackConfigFilePath);

    if (!Array.isArray(config)) {
      config = [config];
    }

    // Ensure functions are resolved to objects
    config = config.map(combine);
  } else {
    config = [createWebpackConfig()];

    // Duplicate the config if the project expects an additional modern JS build
    if (addModernJS) {
      config.push(createWebpackConfig({ isModernJS: true }));
    }
  }

  return config;
};

function createWebpackConfig({ isModernJS } = {}) {
  const { root, type, webpack: projectWebpackConfig } = getProjectConfig();
  const { entry, from, to, extractCSS, useCSSModules } = getBuildConfig();
  const isProd = process.env.NODE_ENV === 'production';

  const config = merge(
    {
      mode: isProd ? 'production' : 'development',
      cache: true,
      entry: {
        index: [join(root, from, entry)]
      },
      output: {
        path: join(root, to),
        publicPath: '/',
        filename: isModernJS ? '[name]_modern.js' : '[name].js',
        // The update file hash was causing 404s and full page reloads.
        // This will make the file name more predictable.
        // See https://github.com/webpack/webpack-dev-server/issues/79#issuecomment-244596129
        hotUpdateChunkFilename: 'hot/hot-update.js',
        hotUpdateMainFilename: 'hot/hot-update.json'
      },
      module: {
        rules: [
          {
            __hint__: 'scripts',
            test: /\.js$/,
            include: [resolve(root, from)],
            loader: require.resolve('babel-loader'),
            options: getBabelConfig({ isModernJS })
          },
          {
            __hint__: 'styles',
            test: /\.(css|scss)$/,
            use: [
              extractCSS
                ? MiniCssExtractPlugin.loader
                : {
                    loader: require.resolve('style-loader')
                  },
              {
                loader: require.resolve('css-loader'),
                options: {
                  camelCase: true,
                  context: __dirname, // https://github.com/webpack-contrib/css-loader/issues/413#issuecomment-299578180
                  localIdentName: `${isProd ? '' : '[folder]-[name]__[local]-'}[hash:base64:6]`,
                  minimize: isProd,
                  modules: useCSSModules,
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
        new EnvironmentPlugin(Object.keys(process.env)),
        extractCSS
          ? new MiniCssExtractPlugin({
              filename: `[name].css`
            })
          : null,
        new CopyPlugin([
          {
            from: `${root}/public`
          }
        ])
      ].filter(x => x),
      optimization: {
        namedModules: !isProd
      }
    },
    PROJECT_TYPES_CONFIG[type],
    projectWebpackConfig
  );

  if (isProd) {
    // Add environment config
    config.plugins.push(
      new UglifyJSPlugin({
        parallel: true,
        uglifyOptions: {
          output: {
            comments: false
          }
        }
      })
    );
  }

  // Cleanup hints
  config.module.rules.forEach(rule => {
    if (rule.__hint__) {
      delete rule.__hint__;
    }
  });

  return config;
}
