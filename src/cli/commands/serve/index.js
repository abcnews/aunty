// Ours
const {BASIC_STORY} = require('../../../constants');
const {projectTypeRouter} = require('../');
const serveBasicStory = require('../serve-basic-story');

module.exports = projectTypeRouter({
  isProxy: true,
  name: 'serve'
}, {
  [BASIC_STORY]: serveBasicStory
});
