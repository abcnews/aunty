// External
const FTPDeploy = require('ftp-deploy');

// Ours
const { dim } = require('./color');
const { padLeft } = require('./strings');

module.exports = (target, spinner) => {
  return new Promise((resolve, reject) => {
    const ftpDeploy = new FTPDeploy();

    ftpDeploy.on('uploaded', data => {
      if (spinner) {
        const numFilesTransferred = data.transferredFileCount - 1; //  `ftp-deploy` starts counting from 1 for some reason
        const filesTransferred = padLeft(numFilesTransferred, data.totalFilesCount.toString().length, ' ');
        const filename = numFilesTransferred === data.totalFilesCount ? '' : ` ${data.filename}`;

        spinner.text = 'Deploy ' + dim(`(${filesTransferred}/${data.totalFilesCount})${filename}`);
      }
    });

    // [1] The `ftp-deploy` package logs when it connects, and doesn't allow us to
    // make it quiet. While this task runs, temporarily re-map `console.log`.
    const _log = console.log;
    console.log = () => {};

    ftpDeploy.deploy(
      {
        host: target.host,
        port: target.port || 21,
        user: target.username,
        password: target.password,
        localRoot: target.from,
        remoteRoot: target.to,
        include: [target.files],
        exclude: [],
        deleteRoot: false
      },
      err => {
        // * [1]
        console.log = _log;

        if (err) {
          return reject(err);
        }

        return resolve();
      }
    );
  });
};
