const BASIC_STORY = module.exports.BASIC_STORY = 'basic-story';
const PREACT_STORY = module.exports.PREACT_STORY = 'preact-story';

module.exports.PROJECT_TYPES = new Set([
  BASIC_STORY,
  PREACT_STORY
]);

module.exports.PROJECT_TYPE_DESCRIPTIONS = {
  [BASIC_STORY]: 'a vanilla JS app which runs inside a News story.'
};

module.exports.CONFIG_FILE_NAME = 'aunty.config.js';

const BUILD_DIR = module.exports.BUILD_DIR = 'build';

module.exports.DEFAULTS = {
  build: {
    from: 'src',
    to: BUILD_DIR
  },
  deploy: {
    contentftp: {
      from: BUILD_DIR,
      to: '/www/res/sites/news-projects/<name>/<id>'
    }
  }
};

module.exports.KNOWN_TARGETS = {
  contentftp: {
    publicPathRewritePattern: /\/www\/(.*)/,
    publicURLRoot: `http://www.abc.net.au/`
  },
  newsdev3: {
    publicPathRewritePattern: /\/var\/www\/html\/(.*)/,
    publicURLRoot: `http://newsdev3.aus.aunty.abc.net.au/`
  }
};
