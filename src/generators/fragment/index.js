// Native
const { join } = require('path');

// External
const loadJsonFile = require('load-json-file');
const Generator = require('yeoman-generator');

// Ours
const { DEPLOY_FILE_NAME } = require('../../constants');
const { MESSAGES: DEPLOY_MESSAGES } = require('../../cli/deploy/constants');
const { getBuildConfig } = require('../../config/build');
const { getProjectConfig } = require('../../config/project');
const { cmd, hvy, opt, sec, red: tag, yellow: key, green: val } = require('../../utils/color');
const { info } = require('../../utils/logging');
const { indented } = require('../../utils/text');

const identity = x => x;

module.exports = class extends Generator {
  usage() {
    return `${cmd('aunty generate fragment')} -- ${opt('[options]')}`;
  }

  async end() {
    const { root } = getProjectConfig();
    let deployConfig;

    try {
      deployConfig = loadJsonFile.sync(join(root, DEPLOY_FILE_NAME));
    } catch (err) {
      throw new Error(DEPLOY_MESSAGES.noDescriptor);
    }

    const { publicPath } = deployConfig.targets[0];

    info(`HTMLFragment init-interactive markup:
  ${indented(getFragmentMarkup({ publicPath, tag, key, val }))}
`);
  }
};

const getFragmentMarkup = (module.exports.getFragmentMarkup = ({
  publicPath,
  tag = identity,
  key = identity,
  val = identity
} = {}) => {
  const { pkg } = getProjectConfig();
  const { addModernJS, extractCSS } = getBuildConfig();
  const { name } = pkg;

  const asset = url => (publicPath ? [publicPath] : []).concat([url]).join('/');

  return `
<${tag('div')}
  ${key('class')}=${val(`"init-interactive"`)}
  ${key('data-no-support-msg')}=${val(`"true"`)}
  ${key(`data-${name}-root`)}${
    addModernJS ? `\n  ${key('data-modern-scripts')}=${val(`"${asset('index_modern.js')}"`)}` : ''
  }
  ${key('data-scripts')}=${val(`"${asset('index.js')}"`)}${
    extractCSS ? `\n  ${key('data-styles')}=${val(`"${asset('index.css')}"`)}` : ''
  }
></${tag('div')}>`;
});
