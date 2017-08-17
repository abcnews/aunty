// External
const {hasWebpackConfig, build} = require('@abcnews/webpacker');

// Ours
const {BASIC_STORY} = require('../../constants');
const {command, projectTypeRouter} = require('../');
const {serveBasicStory} = require('../serve-basic-story');

// If the project has a webpack.config.js then assume it is built with Webpack
if (hasWebpackConfig()) {
  module.exports.serve = command({
    name: 'serve',
    options: {},
    usage: ''
  }, async () => build(process.argv));

// Otherwise it's a normal Aunty project
} else {
  module.exports.serve = projectTypeRouter({
    isProxy: true,
    name: 'serve'
  }, {
    [BASIC_STORY]: serveBasicStory
  });
}
