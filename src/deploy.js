// Packages
const rsyncwrapper = require('rsyncwrapper');
const ssh2 = require('ssh2');
const vfs = require('vinyl-fs');
const vftp = require('vinyl-ftp');

// Ours
const {abort, error} = require('./error');
const {bad, cmd, hvy, ok} = require('./text');

const ICONS = {
  INITIAL: ['🙋', '🙋‍♂️'],
  FAILURE: ['🤦‍♀️', '🤦‍♂️'],
  SUCCESS: ['🙆', '🙆‍♂️']
};

const ICON_INDEX = Math.floor(Math.random() * 2);

const MESSAGES = {
  INITIAL: cmd(`${ICONS.INITIAL[ICON_INDEX]}  Started`),
  FAILURE: bad(`${ICONS.FAILURE[ICON_INDEX]}  Failed!`),
  SUCCESS: ok(`${ICONS.SUCCESS[ICON_INDEX]}  Done!`)
};

const RSYNC_DEFAULTS = {
  ssh: true,
  recursive: true
};

const SYMLINK_DEFAULT_NAME = 'latest';

const logger = source => message => console.log(`${hvy(source)}: ${message}`);

const highlightLastPathSegment = path => path.split('/').map(
  (segment, index, segments) => {
    return (index === segments.length - 1) ? ok(segment) : segment;
  }
).join('/');

const ftp = target => new Promise((resolve, reject) => {
  const log = logger('FTP');

  log(MESSAGES.INITIAL);

  const conn = new vftp({
    host: target.host,
    port: target.port || 21,
    user: target.username,
    password: target.password,
    parallel: 10,
    log: (type, data) => {
      if (type.indexOf('MKDIR') === 0) {
        log(`📁 ${ok('+')} ${highlightLastPathSegment(data)}`);
      } else if (type.indexOf('UP') === 0 && data.indexOf('100%') === 0) {
        log(`📄 ${ok('‣')} ${highlightLastPathSegment(data.split('% ')[1])}`);
      }
    }
  });

  vfs
  .src(target.files, {
    cwd: target.from,
    buffer: false
  })
  .pipe(conn.dest(target.to))
  .on('error', () => {
    log(MESSAGES.FAILURE);
    reject();
  })
  .on('end', () => {
    log(MESSAGES.SUCCESS);
    resolve();
  });
});

const rsync = target => new Promise((resolve, reject) => {
  const log = logger('SSH [rsync]');

  log(MESSAGES.INITIAL);

  const config = Object.assign({}, RSYNC_DEFAULTS, {
    src: [target.from, typeof target.files === 'string' ? target.files : target.files[0]].join('/'),
    dest: `${target.username}@${target.host}:${target.to}`
  });

  rsyncwrapper(config, err => {
    if (err) {
      log(MESSAGES.FAILURE);

      return reject(err);
    }

    log(MESSAGES.SUCCESS);
    resolve();
  });
});

const symlink = target => new Promise((resolve, reject) => {
  const log = logger('SSH [symlink]');

  log(MESSAGES.INITIAL);

  const symlinkName = typeof target.symlink === 'string' ? target.symlink : SYMLINK_DEFAULT_NAME;
  const symlinkPath = target.to.replace(target.id, symlinkName);

  if (symlinkPath === target.to) {
    error('Cannot create symlink because target path does not contain a mappable id.');
    log(MESSAGES.FAILURE);
    resolve();
  }

  const conn = new ssh2();

  conn.connect(target);

  conn.on('ready', () => {
    conn.exec(`rm -rf ${symlinkPath} && ln -s ${target.to} ${symlinkPath}`, (err, stream) => {
      if (err) {
        log(MESSAGES.FAILURE);

        return reject(err);
      }

      stream.on('exit', () => {
        conn.end();
        log(`🔗  ${symlinkPath} -> ${target.to}`);
        log(MESSAGES.SUCCESS);
        resolve();
      });
    });
  });
});

module.exports = {
  ftp,
  rsync,
  symlink
};
