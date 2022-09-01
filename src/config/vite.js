// Native
const { existsSync } = require('fs');
const { join, resolve } = require('path');

// External
const importLazy = require('import-lazy')(require);
const getContext = importLazy('@abcaustralia/postcss-config/getContext'); // optional dependency
const dsv = require('@rollup/plugin-dsv');

// Plugins go here
const sveltePreprocess = importLazy('svelte-preprocess');
const svelte = importLazy('rollup-plugin-svelte');

// Ours
const { combine, merge } = require('../utils/structures');
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
  svelte: {
    plugins: [
      svelte({
        preprocess: sveltePreprocess({
          /* options */
        })
      })
    ]
  }
};
const VITE_CONFIG_FILE = 'vite.config.js';

module.exports.getViteConfig = () => {
  const { root } = getProjectConfig();
  const { showDeprecations } = getBuildConfig();
  const customViteConfigFilePath = join(root, VITE_CONFIG_FILE);

  if (showDeprecations) {
    process.traceDeprecation = true;
  } else {
    process.noDeprecation = true;
  }

  let config;

  // If the project has a vite config file, use it, otherwise create our own
  if (existsSync(customViteConfigFilePath)) {
    config = require(customViteConfigFilePath);

    if (!Array.isArray(config)) {
      config = [config];
    }

    // Ensure functions are resolved to objects
    config = config.map(combine);
  } else {
    config = createViteConfig();
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

function createViteConfig() {
  const { pkg, root, hasTS, type, vite: projectViteConfig } = getProjectConfig();
  const { entry, extractCSS, from, includedDependencies, staticDir, to, useCSSModules } = getBuildConfig();
  const isProd = process.env.NODE_ENV === 'production';
  // todo: handle `includedDependencies`
  const config = merge(
    {
      root,
      mode: isProd ? 'production' : 'development',
      base: '/', // TODO: this will need to be modified based on the deploy config for production builds
      build: {
        rollupOptions: {
          input: createEntriesDictionary(root, from, entry),
          output: {
            entryFileNames: '[name]'
          }
        }
      },
      plugins: [dsv()]
    },
    conditionallyEnableABCAustraliaStyles,
    PROJECT_TYPES_CONFIG[type],
    projectViteConfig
  );

  if (isProd) {
    config.optimization.minimize = true;
  }

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
            localIdentName: `${isProd ? '' : '[name]__[local]--'}[contenthash:base64:5]`
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
