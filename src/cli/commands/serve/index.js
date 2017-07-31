// External
const {hasWebpackConfig, build} = require('@abcnews/webpacker');

// Ours
const {BASIC_STORY} = require('../../../constants');
const {projectTypeRouter} = require('../');
const serveBasicStory = require('../serve-basic-story');
const {command} = require('../');

// If the project has a webpack.config.js then assume it is built with Webpack
if (hasWebpackConfig()) {
  module.exports = command({
    name: 'serve',
    options: {},
    usage: ''
  }, async function () {
    return build(process.argv);
  });

// Otherwise it's a normal Aunty project
} else {
  module.exports = projectTypeRouter({
    isProxy: true,
    name: 'serve'
  }, {
    [BASIC_STORY]: serveBasicStory
  });
}
