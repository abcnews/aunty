// Ours
const { hvy } = require('../utils/color');

module.exports.CONFIG_FILE_NAME = 'aunty.config.js';

const BUILD_DIR = (module.exports.BUILD_DIR = 'build');

module.exports.DEV_SERVER_PORT = 8000;

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

module.exports.MESSAGES = {
  NOT_PACKAGE: `This command can only be run inside a project with a ${hvy('package.json')} file.`
};
