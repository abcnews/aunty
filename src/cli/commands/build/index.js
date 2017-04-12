// Ours
const {BASIC_STORY} = require('../../../constants');
const {projectTypeRouter} = require('../');
const {buildBasicStory} = require('../build-basic-story');

const build = projectTypeRouter({
  isProxy: true,
  name: 'build'
}, {
  [BASIC_STORY]: buildBasicStory
});

module.exports = {
  build
};
