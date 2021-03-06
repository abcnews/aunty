// Native
const { existsSync, statSync } = require('fs');
const { join } = require('path');

// External
const importLazy = require('import-lazy')(require);
const loadJsonFile = importLazy('load-json-file');

// Ours
const { command } = require('../');
const { addProfileProperties } = require('../../config/deploy');
const { getProjectConfig } = require('../../config/project');
const { DEPLOY_FILE_NAME } = require('../../constants');
const { packs, throws, unpack } = require('../../utils/async');
const { dry, info, spin, warn } = require('../../utils/logging');
const { ftp, rsync } = require('../../utils/remote');
const { combine } = require('../../utils/structures');
const { DEFAULTS, MESSAGES, VALID_TYPES } = require('./constants');

module.exports = command(
  {
    name: 'deploy',
    usage: MESSAGES.usage
  },
  async argv => {
    const { root } = getProjectConfig();
    let deployConfig;

    // 1) Load the deploy configuration (created by the build process)

    try {
      deployConfig = loadJsonFile.sync(join(root, DEPLOY_FILE_NAME));
    } catch (err) {
      throw new Error(MESSAGES.noDeployConfigFile);
    }

    let { id, targets } = deployConfig;

    if (!Array.isArray(targets)) {
      throw new Error(MESSAGES.noDeployConfigFile);
    }

    // 2) Add profile properties (type, host, port, username, password) to each target

    targets = targets.map(addProfileProperties);

    // 3) Validate the deploy configuration

    for (let target of targets) {
      const { from, type } = target;

      // 3.1) Check profile's 'type' is valid
      if (!VALID_TYPES.has(type)) {
        throw MESSAGES.unrecognisedType(type);
      }

      // 3.2) Check all required properties are present
      VALID_TYPES.get(type).REQUIRED_PROPERTIES.forEach(prop => {
        if (target[prop] == null) {
          throw MESSAGES.missingProperty(prop);
        }
      });

      // 3.3) Check 'from' directory exists
      if (!existsSync(from) || !statSync(from).isDirectory()) {
        throw MESSAGES.noFromDirectory(from);
      }

      // 3.4) For SSH targets, give the `to` directory a trailing slash
      if (target.type === 'ssh') {
        target.to = target.to.replace(/\/?$/, '/');
      }
    }

    // 4a) Log config

    if (argv.dry) {
      return dry({
        'Deploy config': { id, targets }
      });
    }

    // 4b) Deploy

    for (let target of targets) {
      const { publicPath, type } = target;
      info(MESSAGES.deploy(target));

      const spinner = spin('Deploying');

      try {
        if (type === 'ftp') {
          throws(await ftp(target, spinner));
        } else if (type === 'ssh') {
          throws(await rsync(target));
        }
      } catch (err) {
        spinner.fail('Deployment failed');

        throw err;
      }

      spinner.succeed(MESSAGES.deployed(publicPath));
    }
  }
);
