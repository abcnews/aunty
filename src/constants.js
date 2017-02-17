const CONFIG_FILE_NAME = 'aunty.config.js';

const DEFAULT_PORT = process.env.PORT || 8000;

const BASIC_STORY = 'basic-story';

const PROJECT_TYPES = new Set([
  BASIC_STORY
]);

const PROJECT_TYPE_DESCRIPTIONS = {
  [BASIC_STORY]: 'a vanilla JS app which runs inside a News story.'
};

module.exports = {
  CONFIG_FILE_NAME,
  DEFAULT_PORT,
  BASIC_STORY,
  PROJECT_TYPES,
  PROJECT_TYPE_DESCRIPTIONS
};
