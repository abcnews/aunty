// External
const FTPDeploy = require('ftp-deploy');
const FTPConnection = require('promise-ftp');

// Ours
const { gray } = require('./color');
const { padLeft } = require('./strings');

module.exports = (target, spinner) => {
  const ftpConnection = new FTPConnection();

  return ftpConnection
    .connect({
      user: target.username,
      password: target.password,
      host: target.host,
      port: target.port || 21
    })
    .then(() => ftpConnection.mkdir(target.to, true))
    .then(() => {
      return new Promise((resolve, reject) => {
        const ftpDeploy = new FTPDeploy();

        ftpDeploy.on('uploaded', data => {
          if (spinner) {
            const filesTransferred = padLeft(data.transferredFileCount, data.totalFilesCount.toString().length, ' ');
            const filename = data.transferredFileCount === data.totalFilesCount ? '' : ` ${data.filename}`;

            spinner.text = 'Deploy ' + gray(`(${filesTransferred}/${data.totalFilesCount})${filename}`);
          }
        });

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
            if (err) return reject(err);

            return resolve();
          }
        );
      });
    });
};
