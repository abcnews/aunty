// Native
const { join } = require('path');

// External
const importLazy = require('import-lazy')(require);
const pify = importLazy('pify');
const webpack = importLazy('webpack');
const writeJsonFile = importLazy('write-json-file');

// Ours
const { getDeployConfig } = require('../../config/deploy');
const { getProjectConfig } = require('../../config/project');
const { getWebpackConfig } = require('../../config/webpack');
const { DEPLOY_FILE_NAME } = require('../../constants');
const { packs, throws, unpack } = require('../../utils/async');
const { dry, info, spin, warn } = require('../../utils/logging');
const { combine } = require('../../utils/structures');
const { command } = require('../');
const cleanCommand = require('../clean');
const { MESSAGES, OPTIONS } = require('./constants');

module.exports = command(
  {
    name: 'build',
    nodeEnv: 'production',
    options: OPTIONS,
    usage: MESSAGES.usage
  },
  async argv => {
    const { root } = getProjectConfig();
    const webpackConfig = getWebpackConfig();
    let deployConfig;

    if (!argv.local) {
      deployConfig = getDeployConfig({ id: argv.id });
      webpackConfig.forEach(config => {
        config.output.publicPath = deployConfig.targets[0].publicPath;
      });
    }

    if (argv.dry) {
      return dry(
        combine(
          {
            'Webpack config': webpackConfig
          },
          deployConfig
            ? {
                'Deploy config': deployConfig
              }
            : {}
        )
      );
    }

    throws(await cleanCommand(['--quiet']));

    info(
      MESSAGES.build({
        id: deployConfig ? deployConfig.id : null,
        publicPaths: deployConfig ? deployConfig.targets.map(x => x.publicPath) : [webpackConfig[0].output.publicPath]
      })
    );

    let spinner = spin('Building');
    const startTime = Date.now();
    const compiler = webpack(webpackConfig);
    const stats = unpack(await packs(pify(compiler.run.bind(compiler)))());

    if (stats.hasErrors()) {
      const errors = stats.toJson({}, true).errors;

      spinner.fail();
      
      if (errors.length > 1) {
        throw MESSAGES.multipleErrors(errors);
      }

      throw errors[0];
    }

    if (stats.hasWarnings()) {
      spinner.warn();
      stats.toJson({}, true).warnings.forEach(warn);
    } else {
      spinner.succeed(`Built in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    }

    if (deployConfig) {
      spinner = spin('Creating deploy configuration');
      writeJsonFile.sync(join(root, DEPLOY_FILE_NAME), deployConfig);
      spinner.succeed('Created deploy configuration');
    }
  }
);
