// Native
const { existsSync } = require('fs');
const { join, resolve } = require('path');

// External
const importLazy = require('import-lazy')(require);
const CopyPlugin = importLazy('copy-webpack-plugin');
const Dotenv = importLazy('dotenv-webpack');
const ForkTsCheckerWebpackPlugin = importLazy('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = importLazy('mini-css-extract-plugin');
const sveltePreprocess = importLazy('svelte-preprocess');
const EnvironmentPlugin = importLazy('webpack/lib/EnvironmentPlugin');

// Ours
const { combine, merge } = require('../utils/structures');
const { getBabelConfig } = require('./babel');
const { getBuildConfig } = require('./build');
const { getProjectConfig } = require('./project');

const JSX_RESOLVE_EXTENSIONS = ['.jsx', '.tsx'];

/**
 * Project types to override the Webpack config.
 */
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

  /**
   * Svelte uses a function to modify the existing config, rather than just merging in.
   * @see combine
   */
  svelte: config => {
    config.resolve = {
      extensions: [...config.resolve.extensions, '.svelte'],
      mainFields: ['svelte', 'browser', 'module', 'main'],
      conditionNames: ['svelte', 'browser', 'import']
    };

    const { include, loader, options } = getHintedRule(config, 'scripts');
    const extractCSS = getHintedRule(config, 'styles').use[0].loader === MiniCssExtractPlugin.loader;

    include.push(/(node_modules\/svelte)/);

    // options from https://github.com/sveltejs/svelte-loader
    config.module.rules.push(
      ...[
        {
          test: /\.svelte\.ts$/,
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
            },
            { loader: require.resolve('ts-loader'), options: { transpileOnly: true } }
          ]
        },
        {
          test: /(?<!\.svelte)\.ts$/,
          loader: require.resolve('ts-loader'),
          options: {
            transpileOnly: true // you should use svelte-check for type checking
          }
        },
        {
          // Svelte 5+:
          test: /\.(svelte|svelte\.js)$/,
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
        },
        {
          // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
          test: /node_modules\/svelte\/.*\.mjs$/,
          resolve: {
            fullySpecified: false
          }
        }
      ]
    );

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
  const hasEnvFile = existsSync(join(root, '.env'));
  const hasEnvExampleFile = existsSync(join(root, '.env.example'));

  const config = merge(
    {
      mode: isProd ? 'production' : 'development',
      target: isModernJS ? 'web' : ['web', 'es5'],
      cache: true,
      entry: createEntriesDictionary(root, from, entry),
      devtool: 'source-map',
      output: {
        path: join(root, to),
        publicPath: '/',
        filename: isModernJS ? '[name]_modern.js' : '[name].js'
      },
      resolve: {
        extensions: ['.mjs', '.js', '.json', '.ts']
      },
      module: {
        rules: [
          {
            /**
             * hints are used by PROJECT_TYPES_CONFIGs to quickly select the right config.
             * @see PROJECT_TYPES_CONFIG
             */
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
                    loader: MiniCssExtractPlugin.loader
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
                    localIdentHashSalt: `${pkg.name}@${pkg.version}`,
                    localIdentName: `${isProd ? '' : '[folder]-[name]__[local]--'}[hash:base64:6]`
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
            test: /\.(jpg|png|gif|mp4|m4v|flv|mp3|wav|m4a|eot|ttf|woff|woff2|webm|webp|avif)$/,
            type: 'asset'
          },
          {
            test: /\.svg$/,
            resourceQuery: { not: [/raw/] },
            type: 'asset'
          },
          {
            resourceQuery: /raw/,
            type: 'asset/source'
          },
          {
            test: /\.html$/,
            type: 'asset/source'
          }
        ]
      },
      plugins: [
        new EnvironmentPlugin(Object.keys(process.env)),
        hasEnvFile || hasEnvExampleFile
          ? new Dotenv({
              safe: hasEnvExampleFile
            })
          : null,
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
        new CopyPlugin({
          patterns: (Array.isArray(staticDir) ? staticDir : [staticDir]).map(dirName => ({
            from: join(root, dirName)
          }))
        })
      ].filter(x => x),
      optimization: {
        moduleIds: isProd ? 'deterministic' : 'named'
      }
    },
    PROJECT_TYPES_CONFIG[type],
    projectWebpackConfig
  );

  if (isProd) {
    config.optimization.minimize = true;
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
