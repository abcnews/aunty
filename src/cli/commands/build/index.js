// Ours
const {BASIC_STORY} = require('../../../constants');
const {projectTypeRouter} = require('../');
const buildBasicStory = require('../build-basic-story');

module.exports = projectTypeRouter({
  isProxy: true,
  name: 'build'
}, {
  [BASIC_STORY]: buildBasicStory
});
