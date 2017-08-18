// External
const browserify = require('browserify');
const uglify = require('gulp-uglify');
const merge = require('webpack-merge');
const map = require('map-stream');
const nodeSass = require('node-sass');
const pify = require('pify');
const pump = require('pump');
const through = require('through2');
const vfs = require('vinyl-fs');

// Ours
const {command} = require('../../cli');
const {throws} = require('../../utils/async');
const {dry, info, warn} = require('../../utils/logging');
const {clean} = require('../clean');
const {OPTIONS, KEY, D_KEY, DEFAULTS, MESSAGES} = require('./constants');

// Wrapped
const pumped = pify(pump);

module.exports.buildBasicStory = command({
  name: 'build-basic-story',
  options: OPTIONS,
  usage: MESSAGES.usage,
  isConfigRequired: true
}, async (argv, config) => {
  const configKey = argv.debug ? D_KEY : KEY;
  const defaults = DEFAULTS[configKey];

  if (argv.defaults) {
    return dry({
      [`Defaults for ${configKey}`]: defaults
    });
  }

  const buildConfig = merge(true, defaults,
    typeof config[configKey] === 'object' ? config[configKey] : {}
  );

  if (argv.dry) {
    return dry({
      [`Config for ${configKey}`]: buildConfig
    });
  }

  if (argv.taskName == null) {
    throws(await clean());
  }

  if (argv.taskName == null || argv.taskName == 'styles') {
    info(`Building styles${configKey === D_KEY ? ' (debug)' : ''}…`);

    // [from] | (sass) | (rename) | [to]

    await pumped(
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
              if (!argv.taskName) {
                throw err;
              }

              warn(err.message);

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
      vfs.dest('./', {
        cwd: `${config.root}/${buildConfig.styles.to}`
      })
    );
  }

  if (argv.taskName == null || argv.taskName == 'scripts') {
    info(`Building scripts${configKey === D_KEY ? ' (debug)' : ''}…`);

    // [from] | browserify | uglify | log | [to]

    await pumped(
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
              throw err;
            }

            warn(err.message);

            return next(null, file);
          }

          file.contents = result;
          next(null, file);
        });
      }),
      uglify(buildConfig.scripts.uglifyOptions),
      vfs.dest('./', {
        cwd: `${config.root}/${buildConfig.scripts.to}`
      })
    );
  }

  if (argv.taskName == null || argv.taskName == 'public') {
    info(`Building public${configKey === D_KEY ? ' (debug)' : ''}…`);

    // [from] | [to]

    await pumped(
      vfs.src(buildConfig.public.files, {
        cwd: `${config.root}/${buildConfig.public.from}`
      }),
      vfs.dest('./', {
        cwd: `${config.root}/${buildConfig.public.to}`
      })
    );
  }
});
