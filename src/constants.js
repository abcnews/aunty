const BASIC_STORY = 'basic-story';

module.exports.BASIC_STORY = BASIC_STORY;
module.exports.PROJECT_TYPES = new Set([
  BASIC_STORY
]);
module.exports.PROJECT_TYPE_DESCRIPTIONS = {
  [BASIC_STORY]: 'a vanilla JS app which runs inside a News story.'
};
module.exports.CONFIG_FILE_NAME = 'aunty.config.js';
module.exports.DEFAULT_PORT = process.env.PORT || 8000;
