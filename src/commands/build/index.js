// External
const {hasWebpackConfig, build} = require('@abcnews/webpacker');

// Ours
const {BASIC_STORY} = require('../../constants');
const {command, projectTypeRouter} = require('../');
const {buildBasicStory} = require('../build-basic-story');
const {WEBPACK_USAGE} = require('./constants');

// If the project has a webpack.config.js then assume it is built with Webpack
if (hasWebpackConfig()) {
  module.exports.build = command({
    name: 'build',
    options: {},
    usage: WEBPACK_USAGE
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
