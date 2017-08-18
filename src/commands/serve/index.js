// Native
const {existsSync} = require('fs');
const {createServer} = require('http');

// External
const chokidar = require('chokidar');
const finalhandler = require('finalhandler');
const merge = require('webpack-merge');
const serveStatic = require('serve-static');
const {hasWebpackConfig, build: webpackBuild} = require('@abcnews/webpacker');

// Ours
const {command} = require('../../cli');
const {pack, throws} = require('../../utils/async');
const {dry, info, warn} = require('../../utils/logging');
const {BUILD_DIR, D_KEY, DEFAULTS, KEY, TASK_NAMES} = require('../build/constants');
const {build} = require('../build');
const {OPTIONS, MESSAGES} = require('./constants');

const serve = command({
  name: 'serve',
  options: OPTIONS,
  isConfigRequired: true
}, async (argv, config) => {
  const serveConfig = typeof config.serve === 'object' ? config.serve : {};
  const buildConfigKey = argv.debug ? D_KEY : KEY;

  const buildConfig = merge(true, DEFAULTS[buildConfigKey],
    typeof config[buildConfigKey] === 'object' ? config[buildConfigKey] : {}
  );

  if (argv.dry) {
    return dry({
      'Serve config': serveConfig
    });
  }

  throws(await build(argv.$));

  const serve = serveStatic(`${config.root}/${BUILD_DIR}`, {
    setHeaders: res => res.setHeader('Access-Control-Allow-Origin', '*')
  });
  const serveProject = argv.debug ? serveStatic(`${config.root}`) : null;

  const server = createServer((req, res) => {
    if (argv.debug && req.url !== '/' && existsSync(`${config.root}${req.url}`)) {
      return serveProject(req, res, finalhandler(req, res));
    }

    serve(req, res, finalhandler(req, res));
  });
  const port = serveConfig.port || 8000;

  server.listen(port);

  info(MESSAGES.server(port));

  const changesQueue = [];

  const flushChangesQueue = async () => {
    if (changesQueue.length === 0) {
      return;
    }

    while (changesQueue.length > 0) {
      const {taskName, evt, path} = changesQueue.shift();

      warn(MESSAGES.watchEvent(taskName, evt, path.replace(config.root, '')));
      throws(await build(argv.$.concat(['--taskName', taskName])));
    }

    info(MESSAGES.STILL_WATCHING);
  };

  const watchAndServe = pack(new Promise((resolve, reject) => {
    const watchedTaskNames = TASK_NAMES.reduce((watchedTaskNames, taskName) => {
      const taskConfig = buildConfig[taskName];

      if (
        typeof taskConfig !== 'object' ||
        taskConfig.from == null ||
        (
          taskConfig.files == null &&
          taskConfig.watched == null
        )
      ) {
        return watchedTaskNames;
      }

      const fileGlobs = taskConfig.watched || taskConfig.files;
      const globs = (Array.isArray(fileGlobs) ? fileGlobs : [fileGlobs])
        .map(glob => `${config.root}/${taskConfig.from}/${glob}`);

      chokidar.watch(globs, {ignoreInitial: true})
      .on('all', (evt, path) => changesQueue.push({taskName, evt, path}))
      .on('error', reject);

      return watchedTaskNames.concat(taskName);
    }, []);

    if (watchedTaskNames.length === 0) {
      resolve();
    }

    info(MESSAGES.watching(watchedTaskNames));

    setInterval(flushChangesQueue, 100);
  }));

  throws(await watchAndServe);
});

if (hasWebpackConfig()) {
  module.exports.serve = command({
    name: 'serve',
    options: {},
    usage: ''
  }, async () => webpackBuild(process.argv));
} else {
  module.exports.serve = serve;
}
