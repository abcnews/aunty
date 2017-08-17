// External
const browserify = require('browserify');
const uglify = require('gulp-uglify');
const merge = require('webpack-merge');
const map = require('map-stream');
const nodeSass = require('node-sass');
const through = require('through2');
const vfs = require('vinyl-fs');

// Ours
const {pumped, throws} = require('../../utils/async');
const {bad, cmd, ok} = require('../../utils/color');
const {log, warn} = require('../../utils/console');
const {styleLastSegment} = require('../../utils/strings');
const {clean} = require('../clean');
const {command} = require('../');
const {OPTIONS, KEY, D_KEY, DEFAULTS, MESSAGES} = require('./constants');

function fileFailure(file, root) {
  return `${styleLastSegment(file.path.replace(root, ''), bad)}`;
}

function fileSuccess(file, root, from, to) {
  const srcPath = (file.srcPath || file.path).replace(root, '');
  const path = file.path.replace(root, '');

  return `${srcPath} ${cmd('=>')} ${styleLastSegment(path.replace(from, to), ok)}`;
}

module.exports.buildBasicStory = command({
  name: 'build-basic-story',
  options: OPTIONS,
  usage: MESSAGES.usage,
  isConfigRequired: true
}, async (argv, config) => {
  const configKey = argv.debug ? D_KEY : KEY;
  const defaults = DEFAULTS[configKey];

  if (argv.defaultConfig) {
    return log(MESSAGES.config(configKey, defaults, true));
  }

  const buildConfig = merge(true, defaults,
    typeof config[configKey] === 'object' ? config[configKey] : {}
  );

  if (argv.config) {
    return log(MESSAGES.config(configKey, buildConfig));
  }

  if (argv.taskName == null) {
    throws(await clean());
  }

  if (argv.taskName == null || argv.taskName == 'styles') {
    log(MESSAGES.building('styles', configKey));

    // [from] | (sass) | (rename) | log | [to]

    throws(await pumped(
      vfs.src(buildConfig.styles.files, {
        cwd: `${config.root}/${buildConfig.styles.from}`
      }),
      through.obj((file, enc, next) => {
        if (file.path.indexOf('.scss') > -1) {
          nodeSass.render(Object.assign(
            {
              file: file.path,
              outFile: file.path
                .replace(buildConfig.styles.from, buildConfig.styles.to)
                .replace('.scss', '.css')
            },
            buildConfig.styles.nodeSassOptions
          ), (err, result) => {
            if (err) {
              log(`• ${fileFailure(file, config.root)}`);

              if (!argv.taskName) {
                throw err;
              }

              warn(bad(err.message));

              return next(null, file);
            }

            file.contents = result.css;
            next(null, file);
          });
        } else {
          next(null, file);
        }
      }),
      map((file, cb) => {
        file.srcPath = file.path;
        file.path = file.path.replace('.scss', '.css');
        cb(null, file);
      }),
      map((file, cb) => {
        log(`• ${fileSuccess(file, config.root,
          buildConfig.styles.from, buildConfig.styles.to)}`);
        cb(null, file);
      }),
      vfs.dest('./', {
        cwd: `${config.root}/${buildConfig.styles.to}`
      })
    ));
  }

  if (argv.taskName == null || argv.taskName == 'scripts') {
    log(MESSAGES.building('scripts', configKey));

    // [from] | browserify | uglify | log | [to]

    throws(await pumped(
      vfs.src(buildConfig.scripts.files, {
        cwd: `${config.root}/${buildConfig.scripts.from}`
      }),
      through.obj((file, enc, next) => {
        browserify(file, Object.assign({
          basedir: `${config.root}/${buildConfig.scripts.from}`
        }, buildConfig.scripts.browserifyOptions))
        .bundle((err, result) => {
          if (err) {
            if (!argv.taskName) {
              log(file);
              throw err;
            }

            warn(bad(err.message));

            return next(null, file);
          }

          file.contents = result;
          next(null, file);
        });
      }),
      uglify(buildConfig.scripts.uglifyOptions),
      map((file, cb) => {
        log(`• ${fileSuccess(file, config.root,
          buildConfig.scripts.from, buildConfig.scripts.to)}`);
        cb(null, file);
      }),
      vfs.dest('./', {
        cwd: `${config.root}/${buildConfig.scripts.to}`
      })
    ));
  }

  if (argv.taskName == null || argv.taskName == 'public') {
    log(MESSAGES.building('public', configKey));

    // [from] | log | [to]

    throws(await pumped(
      vfs.src(buildConfig.public.files, {
        cwd: `${config.root}/${buildConfig.public.from}`
      }),
      map((file, cb) => {
        log(`• ${fileSuccess(file, config.root,
          buildConfig.public.from, buildConfig.public.to)}`);
        cb(null, file);
      }),
      vfs.dest('./', {
        cwd: `${config.root}/${buildConfig.public.to}`
      })
    ));
  }
});
