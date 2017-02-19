// Native
const {existsSync} = require('fs');
const {createServer} = require('http');

// External
const chokidar = require('chokidar');
const finalhandler = require('finalhandler');
const merge = require('merge');
const serveStatic = require('serve-static');

// Ours
const {pack, throws} = require('../../../utils/async');
const {log} = require('../../../utils');
const {exec} = require('../../../processes');
const {
  BUILD_DIR, D_KEY, DEFAULTS, KEY, TASK_NAMES
} = require('../build-basic-story/constants');
const build = require('../build-basic-story');
const {command} = require('../');
const {OPTIONS, USAGE, MESSAGES, HOSTNAME} = require('./constants');

module.exports = command({
  name: 'serve-basic-story',
  options: OPTIONS,
  usage: USAGE,
  configRequired: true
}, async function (argv, config) {
  const serveConfig = typeof config.serve === 'object' ? config.serve : {};
  const buildConfigKey = argv.debug ? D_KEY : KEY;

  const buildConfig = merge.recursive(true, DEFAULTS[buildConfigKey],
    typeof config[buildConfigKey] === 'object' ? config[buildConfigKey] : {}
  );

  throws(await build(argv.$));

  const serve = serveStatic(`${config.root}/${BUILD_DIR}`);
  const serveProject = argv.debug ? serveStatic(`${config.root}`) : null;

  const server = createServer((req, res) => {
    if (argv.debug && existsSync(`${config.root}${req.url}`)) {
      return serveProject(req, res, finalhandler(req, res));
    }

    serve(req, res, finalhandler(req, res));
  });
  const [, domain] = await exec(`awk '/^domain/ {print $2}' /etc/resolv.conf`);
  const hostname = `${HOSTNAME}${domain ? `.${domain.replace('\n', '')}` : ''}`;
  const port = serveConfig.port || 8000;

  server.listen(port);

  log(MESSAGES.server(hostname, port));

  const changesQueue = [];

  async function flushChangesQueue() {
    if (changesQueue.length === 0) {
      return;
    }

    while (changesQueue.length > 0) {
      const {taskName, evt, path} = changesQueue.shift();

      log(MESSAGES.watchEvent(taskName, evt, path.replace(config.root, '')));
      throws(await build(argv.$.concat(['--taskName', taskName])));
    }

    log(MESSAGES.STILL_WATCHING);
  }

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

    log(MESSAGES.watching(watchedTaskNames));

    setInterval(flushChangesQueue, 100);
  }));

  throws(await watchAndServe);
});
