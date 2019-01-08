// External
const importLazy = require('import-lazy')(require);
const FTPDeploy = importLazy('ftp-deploy');
const pify = importLazy('pify');
const rsyncwrapper = importLazy('rsyncwrapper');

// Ours
const { packs } = require('./async');
const { dim } = require('./color');
const { combine } = require('./structures');
const { padLeft } = require('./text');

const DEFAULT_FTP_CONFIG = {
  port: 21
};

const DEFAULT_RSYNC_CONFIG = {
  ssh: true,
  recursive: true
};

module.exports.ftp = packs(
  ({ files, from, host, password, port, to, username }, spinner) =>
    new Promise((resolve, reject) => {
      const ftpDeploy = new FTPDeploy();
      const originalSpinnerText = spinner ? spinner.text : null;

      if (spinner) {
        ftpDeploy.on('uploaded', data => {
          const numFilesTransferred = data.transferredFileCount - 1; //  `ftp-deploy` starts counting from 1 for some reason
          const filesTransferred = padLeft(numFilesTransferred, data.totalFilesCount.toString().length, ' ');
          const filename = numFilesTransferred === data.totalFilesCount ? '' : ` ${data.filename}`;

          spinner.text = `${originalSpinnerText} ${dim(`(${filesTransferred}/${data.totalFilesCount})${filename}`)}`;
        });
      }

      // [1] The `ftp-deploy` package logs when it connects, and doesn't allow us to
      // make it quiet. While this task runs, temporarily re-map `console.log`.
      const _log = console.log;
      console.log = () => {};

      ftpDeploy.deploy(
        combine(DEFAULT_FTP_CONFIG, {
          host,
          port: port || 21,
          user: username,
          password,
          localRoot: from,
          remoteRoot: to,
          include: [files],
          exclude: [],
          deleteRoot: false
        }),
        err => {
          // * [1]
          console.log = _log;

          if (err) {
            return reject(err);
          }

          if (spinner) {
            spinner.text = originalSpinnerText;
          }

          return resolve();
        }
      );
    })
);

module.exports.rsync = packs(({ files, from, host, to, username }) =>
  pify(rsyncwrapper)(
    combine(DEFAULT_RSYNC_CONFIG, {
      src: `${from}/${Array.isArray(files) ? files[0] : files}`,
      dest: `${username}@${host}:${to}`,
      args: [`--rsync-path="mkdir -p ${to} && rsync"`]
    })
  )
);
