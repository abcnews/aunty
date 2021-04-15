// Native
const { existsSync } = require('fs');
const { join, resolve } = require('path');

// External
const importLazy = require('import-lazy')(require);
const getContext = importLazy('@abcaustralia/postcss-config/getContext'); // optional dependency
const CopyPlugin = importLazy('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = importLazy('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = importLazy('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = importLazy('optimize-css-assets-webpack-plugin');
const sveltePreprocess = importLazy('svelte-preprocess');
const TerserPlugin = importLazy('terser-webpack-plugin');
const VueLoaderPlugin = importLazy('vue-loader/lib/plugin');
const EnvironmentPlugin = importLazy('webpack/lib/EnvironmentPlugin');

// Ours
const { combine, merge } = require('../utils/structures');
const { getBabelConfig } = require('./babel');
const { getBuildConfig } = require('./build');
const { getProjectConfig } = require('./project');

const URL_LOADER_LIMIT = 10000;
const JSX_RESOLVE_EXTENSIONS = ['.jsx', '.tsx'];
const PROJECT_TYPES_CONFIG = {
  preact: {
    resolve: {
      alias: {
        react: 'preact',
        'react-dom': 'preact/compat'
      },

      extensions: JSX_RESOLVE_EXTENSIONS
    }
  },
  react: {
    resolve: {
      extensions: JSX_RESOLVE_EXTENSIONS
    }
  },
  svelte: config => {
    config.resolve.extensions.push('.svelte');

    const { include, loader, options } = getHintedRule(config, 'scripts');
    const extractCSS = getHintedRule(config, 'styles').use[0].loader === MiniCssExtractPlugin.loader;

    include.push(/(node_modules\/svelte)/);

    config.module.rules.push({
      test: /\.svelte$/,
      include,
      use: [
        {
          loader,
          options
        },
        {
          loader: require.resolve('svelte-loader'),
          options: {
            dev: config.mode === 'development',
            emitCss: extractCSS,
            preprocess: sveltePreprocess()
          }
        }
      ]
    });

    return config;
  },
  vue: config => {
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

const createEntriesDictionary = (root, from, entry) =>
  (Array.isArray(entry) ? entry : [entry]).reduce(
    (memo, _entry) => ({ ...memo, [_entry]: [join(root, from, _entry)] }),
    {}
  );

const resolveIncludedDependencies = (includedDependencies, root) => {
  if (!Array.isArray(includedDependencies)) {
    return [];
  }

  return includedDependencies.map(packageNameOrPattern => {
    if (typeof packageNameOrPattern === 'string') {
      return resolve(root, 'node_modules', packageNameOrPattern);
    }

    if (packageNameOrPattern instanceof RegExp) {
      return new RegExp(join('node_modules', packageNameOrPattern.source), packageNameOrPattern.flags);
    }

    return null;
  });
};

function createWebpackConfig({ isModernJS } = {}) {
  const { pkg, root, hasTS, type, webpack: projectWebpackConfig } = getProjectConfig();
  const { entry, extractCSS, from, includedDependencies, staticDir, to, useCSSModules } = getBuildConfig();
  const isProd = process.env.NODE_ENV === 'production';

  const config = merge(
    {
      mode: isProd ? 'production' : 'development',
      cache: true,
      entry: createEntriesDictionary(root, from, entry),
      devtool: 'source-map',
      output: {
        path: join(root, to),
        publicPath: '/',
        filename: isModernJS ? '[name]_modern.js' : '[name].js',
        jsonpFunction: `webpackJsonp__${pkg.name.replace(/[^a-z]/g, '_')}`,
        // The update file hash was causing 404s and full page reloads.
        // This will make the file name more predictable.
        // See https://github.com/webpack/webpack-dev-server/issues/79#issuecomment-244596129
        hotUpdateChunkFilename: 'hot/hot-update.js',
        hotUpdateMainFilename: 'hot/hot-update.json'
      },
      resolve: {
        extensions: ['.mjs', '.js', '.json', '.ts']
      },
      module: {
        rules: [
          {
            __hint__: 'scripts',
            test: hasTS ? /\.m?[jt]sx?$/ : /\.m?jsx?$/,
            include: [resolve(root, from)].concat(resolveIncludedDependencies(includedDependencies, root)),
            loader: require.resolve('babel-loader'),
            options: getBabelConfig({ isModernJS })
          },
          {
            __hint__: 'styles',
            test: /\.(css|scss)$/,
            use: [
              extractCSS
                ? {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                      hmr: !isProd
                    }
                  }
                : {
                    loader: require.resolve('style-loader')
                  },
              {
                loader: require.resolve('css-loader'),
                options: {
                  modules: useCSSModules && {
                    exportLocalsConvention: 'camelCase',
                    localIdentContext: __dirname,
                    //  ^^^ https://github.com/webpack-contrib/css-loader/issues/413#issuecomment-299578180
                    localIdentName: `${isProd ? '' : '[folder]-[name]__[local]-'}[hash:base64:6]`,
                    localIdentHashPrefix: `${pkg.name}@${pkg.version}`
                  },
                  sourceMap: !isProd
                }
              },
              {
                loader: require.resolve('sass-loader')
              }
            ]
          },
          {
            __hint__: 'data',
            test: /\.[tc]sv$/,
            loader: 'csv-loader',
            options: {
              dynamicTyping: true,
              header: true,
              skipEmptyLines: true
            }
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
        hasTS
          ? new ForkTsCheckerWebpackPlugin({
              logger: { infrastructure: 'silent', issues: 'silent' },
              typescript: {
                diagnosticOptions: {
                  semantic: true,
                  syntactic: true
                }
              }
            })
          : null,
        extractCSS
          ? new MiniCssExtractPlugin({
              filename: `[name].css`
            })
          : null,
        extractCSS
          ? new OptimizeCssAssetsPlugin({
              assetNameRegExp: /\.css$/,
              cssProcessorOptions: {
                safe: true,
                discardComments: { removeAll: isProd },
                normalizeUrl: { stripWWW: false },
                canPrint: false
              }
            })
          : null,
        new CopyPlugin({
          patterns: [
            {
              from: join(root, staticDir)
            }
          ]
        })
      ].filter(x => x),
      optimization: {
        minimizer: [],
        namedModules: !isProd
      }
    },
    conditionallyEnableABCAustraliaStyles,
    PROJECT_TYPES_CONFIG[type],
    projectWebpackConfig
  );

  if (isProd) {
    config.optimization.minimize = true;
    config.optimization.minimizer.push(
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          output: {
            comments: /@license/i
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

function getHintedRule(config, hint) {
  return config.module.rules.find(rule => rule.__hint__ === hint);
}

const ABC_POSTCSS_CONTEXT_SUGGESTION = `

To compile @abcaustralia/* styles, you need to add the following to your package.json:

"abc": {
  "css": {
    "libraryDir": "./node_modules/@abcaustralia/nucleus/css",
    "logVariables": "false"
  }
}
`;

function getABCAustraliaPostCSSContext(isDev) {
  try {
    return getContext(isDev);
  } catch (err) {
    if (err.message.indexOf('css') > -1) {
      err.message += ABC_POSTCSS_CONTEXT_SUGGESTION;
    }

    throw err;
  }
}

const ABC_PACKAGE_PATTERN = /(node_modules\/@abcaustralia\/*)/;

function conditionallyEnableABCAustraliaStyles(config) {
  const { pkg } = getProjectConfig();

  // Only enable if we have an @abcaustralia/* dependency
  if (!Object.keys(pkg.dependencies || {}).find(x => x.indexOf('@abcaustralia/') === 0)) {
    return config;
  }

  const isProd = config.mode === 'production';
  const stylesRule = getHintedRule(config, 'styles');

  stylesRule.exclude = ABC_PACKAGE_PATTERN;

  config.module.rules.push({
    __hint__: 'styles/@abcaustralia',
    test: /\.css$/,
    include: ABC_PACKAGE_PATTERN,
    use: [
      stylesRule.use[0],
      {
        loader: require.resolve('css-loader'),
        options: {
          importLoaders: 1,
          modules: {
            exportLocalsConvention: 'camelCase',
            localIdentName: `${isProd ? '' : '[name]__[local]--'}[hash:base64:5]`
          },
          url: false
        }
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            config: require.resolve('@abcaustralia/postcss-config'),
            ...getABCAustraliaPostCSSContext(!isProd)
          }
        }
      }
    ]
  });

  return config;
}
