// Ours
const {BASIC_STORY} = require('../../../constants');
const {projectTypeRouter} = require('../');
const {serveBasicStory} = require('../serve-basic-story');

const serve = projectTypeRouter({
  isProxy: true,
  name: 'serve'
}, {
  [BASIC_STORY]: serveBasicStory
});

module.exports = {
  serve
};
