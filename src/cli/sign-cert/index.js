// Native
const { spawnSync } = require('child_process');

// External
const importLazy = require('import-lazy')(require);
const makeDir = importLazy('make-dir');

// Ours
const { DEFAULT_HOST, SERVER_CERT_FILENAME, SERVER_KEY_FILENAME, getSSLPath } = require('../../config/serve');
const { dry, info, spin } = require('../../utils/logging');
const { command } = require('../');
const { MESSAGES } = require('./constants');

module.exports = command(
  {
    name: 'sign-cert',
    usage: MESSAGES.usage
  },
  async argv => {
    if (process.platform !== 'darwin') {
      throw new Error(MESSAGES.platform);
    }

    const host = process.env.AUNTY_HOST || DEFAULT_HOST;
    const files = {
      cert: getSSLPath(host, SERVER_CERT_FILENAME),
      key: getSSLPath(host, SERVER_KEY_FILENAME)
    };
    const opensslArgs = MESSAGES.opensslArgs(host, files.key, files.cert);
    const cmd = `openssl ${opensslArgs.join(' ')}`;

    if (argv.dry) {
      return dry({
        'OpenSSL config': {
          host,
          files,
          cmd
        }
      });
    }

    let spinner = spin(`Creating SSL certificate`);

    await makeDir(getSSLPath(host));
    spawnSync('bash', ['-c', cmd]);

    spinner.succeed('SSL certificate created');
    info(MESSAGES.manual(files.cert));
  }
);
