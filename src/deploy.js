// Packages
const rsyncwrapper = require('rsyncwrapper');
const ssh2 = require('ssh2');
const vfs = require('vinyl-fs');
const vftp = require('vinyl-ftp');

// Ours
const {abort, error} = require('./error');
const {ok} = require('./text');

const RSYNC_DEFAULTS = {
  ssh: true,
  recursive: true
};

const SYMLINK_DEFAULT_NAME = 'latest';

const okMessage = source => {
  console.log(`
${source}: ${ok('Done!')}
`);
};

async function ftp (target) {
  return new Promise((resolve, reject) => {
    const conn = new vftp({
      host: target.host,
      port: target.port || 21,
      user: target.username,
      password: target.password,
      parallel: 10,
      log: (type, data) => {
        if (type.indexOf('UP') === 0 && data.indexOf('100%') === 0) {
          console.log(`${ok('✔')} ${data.split('% ')[1]}`);
        }
      }
    });

    vfs
    .src(target.files, {
      cwd: target.from,
      buffer: false
    })
    .pipe(conn.dest(target.to))
    .on('error', reject)
    .on('end', () => {
      okMessage('FTP');
      resolve();
    });
  });
}

async function rsync (target) {
  return new Promise((resolve, reject) => {

    const config = Object.assign({}, RSYNC_DEFAULTS, {
      src: [target.from, typeof target.files === 'string' ? target.files : target.files[0]].join('/'),
      dest: `${target.username}@${target.host}:${target.to}`
    });

    rsyncwrapper(config, err => {
      if (err) {
        return reject(err);
      }

      okMessage('SSH [rsync]');
      resolve();
    });
  });
}

async function symlink (target) {
  return new Promise((resolve, reject) => {
    const symlinkName = typeof target.symlink === 'string' ? target.symlink : SYMLINK_DEFAULT_NAME;
    const symlinkPath = target.to.replace(target.id, symlinkName);

    if (symlinkPath === target.to) {
      error('Cannot create symlink because target path does not contain a mappable id');
      resolve();
    }

    const conn = new ssh2();

    conn.connect(target);

    conn.on('ready', () => {
      conn.exec(`rm -rf ${symlinkPath} && ln -s ${target.to} ${symlinkPath}`, (err, stream) => {
        if (err) {
          return reject(err);
        }

        stream.on('exit', () => {
          conn.end();
          okMessage('SSH [symlink]');
          resolve();
        });
      });
    });
  });
}

module.exports = {
  ftp,
  rsync,
  symlink
};
