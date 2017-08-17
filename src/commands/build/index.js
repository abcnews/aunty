// External
const {hasWebpackConfig, build} = require('@abcnews/webpacker');

// Ours
const {command, projectTypeRouter} = require('../../cli');
const {BASIC_STORY} = require('../../projects/constants');
const {buildBasicStory} = require('../build-basic-story');
const {MESSAGES} = require('./constants');

// If the project has a webpack.config.js then assume it is built with Webpack
if (hasWebpackConfig()) {
  module.exports.build = command({
    name: 'build',
    options: {},
    usage: MESSAGES.usage
  }, async () => build(process.argv));

// Otherwise it's a normal Aunty project
} else {
  module.exports.build = projectTypeRouter({
    isProxy: true,
    name: 'build'
  }, {
    [BASIC_STORY]: buildBasicStory
  });
}
