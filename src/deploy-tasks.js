// External
const pify = require('pify');
const rsyncwrapper = require('rsyncwrapper');
const SSH = require('ssh2');
const {obj} = require('through2');
const vfs = require('vinyl-fs');
const VTFP = require('vinyl-ftp');

// Ours
const {bad, cmd, hvy, ok} = require('./string-styles');
const {packs, pumped, throws} = require('./utils/async');
const {createLogger, warn} = require('./utils/console');
const {styleLastSegment} = require('./utils/strings');

// Wrapped
const _rsync = packs(pify(rsyncwrapper));

const DEFAULTS = {
  RSYNC: {
    ssh: true,
    recursive: true
  },
  SYMLINK: {
    NAME: 'latest'
  }
};

const MESSAGE_ICONS = {
  INITIAL: ['🙋', '🙋‍♂️'],
  FAILURE: ['🙅', '🙅‍♂️'],
  SUCCESS: ['🙆', '🙆‍♂️']
};

const ICON_INDEX = Math.floor(Math.random() * 2);

const MESSAGES = {
  STARTED: cmd(`${MESSAGE_ICONS.INITIAL[ICON_INDEX]}  Started`),
  FAILED: bad(`${MESSAGE_ICONS.FAILURE[ICON_INDEX]}  Failed!`),
  COMPLETED: ok(`${MESSAGE_ICONS.SUCCESS[ICON_INDEX]}  Completed!`),
  NO_MAPPABLE_ID: 'Could not create symlink because target path does not contain a mappable id.',
  symlinked: (path, to) => `🔗  ${path} -> ${to}`,
  mkdir: path => `📁 ${ok('+')} ${styleLastSegment(path, ok)}`,
  put: path => `📄 ${ok('‣')} ${styleLastSegment(path, ok)}`
};

const ftp = packs(async function (target) {
  const log = createLogger('  FTP', hvy);

  log(MESSAGES.STARTED);

  const vftp = new VTFP({
    host: target.host,
    port: target.port || 21,
    user: target.username,
    password: target.password,
    parallel: 10,
    log: (type, data) => {
      if (type.indexOf('MKDIR') === 0) {
        log(MESSAGES.mkdir(data));
      } else if (type.indexOf('UP') === 0 && data.indexOf('100%') === 0) {
        log(MESSAGES.put(data.split('% ')[1]));
      }
    }
  });

  const [err] = await pumped(
    vfs.src(target.files, {
      buffer: false,
      cwd: target.from
    }),
    vftp.dest(target.to),
    obj()
  );

  if (err) {
    log(MESSAGES.FAILED);
    throw err;
  }

  log(MESSAGES.COMPLETED);
});

const rsync = packs(async function (target) {
  const log = createLogger('  SSH [rsync]', hvy);

  log(MESSAGES.STARTED);

  const [err] = await _rsync({
    ...(DEFAULTS.RSYNC),
    ...{
      src: `${target.from}/${Array.isArray(target.files) ?
        target.files[0] : target.files}`,
      dest: `${target.username}@${target.host}:${target.to}`
    }
  });

  if (err) {
    log(MESSAGES.FAILED);
    throw err;
  }

  log(MESSAGES.COMPLETED);
});

const symlink = packs(async function (target) {
  const log = createLogger('  SSH [symlink]', hvy);

  log(MESSAGES.STARTED);

  const symlinkName = typeof target.symlink === 'string' ?
    target.symlink : DEFAULTS.SYMLINK.NAME;
  const symlinkPath = target.to.replace(target.id, symlinkName);

  if (symlinkPath === target.to) {
    warn(MESSAGES.NO_MAPPABLE_ID);
    log(MESSAGES.FAILED);
    return;
  }

  const ssh = new SSH();

  ssh.connect(target);

  throws(await packs(pify(ssh.on))('ready'));

  let [err, stream] = await packs(pify(ssh.exec))(
    `rm -rf ${symlinkPath} && ln -s ${target.to} ${symlinkPath}`
  );

  if (err) {
    log(MESSAGES.FAILED);
    throw err;
  }

  throws(await packs(pify(stream.on))('exit'));

  ssh.end();
  log(MESSAGES.symlinked(symlinkPath, target.to));
  log(MESSAGES.COMPLETED);
});

module.exports = {
  ftp,
  rsync,
  symlink
};
