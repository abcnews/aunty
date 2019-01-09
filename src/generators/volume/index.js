// Native
const { join } = require('path');

// External
const loadJsonFile = require('load-json-file');
const Generator = require('yeoman-generator');

// Ours
const { getProjectConfig } = require('../../config/project');
const { DEPLOY_FILE_NAME } = require('../../constants');
const { cmd, dim, hvy, opt, red: key, green: val } = require('../../utils/color');
const { info, warn } = require('../../utils/logging');

module.exports = class extends Generator {
  usage() {
    return `${cmd('aunty generate volume')} ${opt('[options]')}`;
  }

  end() {
    const { pkg, root } = getProjectConfig();
    const { name } = pkg;
    let id = pkg.version;

    try {
      const deployConfig = loadJsonFile.sync(join(root, DEPLOY_FILE_NAME));
      id = deployConfig.id;
    } catch (err) {
      warn('No deploy configuration file was found. Assuming id is package.json:version');
    }

    info(`Volume setting for thumbnail:

    ${dim(`CMID_OR_POSITION`)}(${key('image-full')},${key('interactive')},${key('data')}:{${key(`"i"`)}:${val(
      `"${name}\/${id}\/thumbnail"`
    )}})`);
  }
};
