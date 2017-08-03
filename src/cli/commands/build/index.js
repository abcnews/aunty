// External
const {hasWebpackConfig, build} = require('@abcnews/webpacker');

// Ours
const {BASIC_STORY} = require('../../../constants');
const {projectTypeRouter} = require('../');
const buildBasicStory = require('../build-basic-story');
const {command} = require('../');
const {WEBPACK_USAGE} = require('./constants');

// If the project has a webpack.config.js then assume it is built with Webpack
if (hasWebpackConfig()) {
  module.exports = command({
    name: 'build',
    options: {},
    usage: WEBPACK_USAGE
  }, async () => build(process.argv));

// Otherwise it's a normal Aunty project
} else {
  module.exports = projectTypeRouter({
    isProxy: true,
    name: 'build'
  }, {
    [BASIC_STORY]: buildBasicStory
  });
}
