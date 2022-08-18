// Native
const { homedir, hostname } = require('os');
const { readFileSync } = require('fs');
const { join } = require('path');
const { Socket } = require('net');

// External
const { probe } = require('tcp-ping-sync');

// Ours
const { combine } = require('../utils/structures');
const { getProjectConfig } = require('./project');
const { info } = require('../utils/logging');
const { MESSAGES } = require('../cli/serve/constants');

const HOME_DIR = homedir();
const SSL_DIR = '.aunty/ssl';
const SERVER_CERT_FILENAME = (module.exports.SERVER_CERT_FILENAME = 'server.crt');
const SERVER_KEY_FILENAME = (module.exports.SERVER_KEY_FILENAME = 'server.key');
const INTERNAL_SUFFIX = '.aus.aunty.abc.net.au';
const DEFAULT_HOST = (module.exports.DEFAULT_HOST = probe(`nucwed${INTERNAL_SUFFIX}`)
  ? `${hostname().toLowerCase().split('.')[0]}${INTERNAL_SUFFIX}` // hostname _may_ include INTERNAL_SUFFIX
  : 'localhost');
const DEFAULT_PORT = 8000;

const addEnvironmentVariables = config => {
  if (process.env.AUNTY_HOST) {
    config.host = process.env.AUNTY_HOST;
  }

  if (process.env.AUNTY_PORT) {
    config.port = process.env.AUNTY_PORT;
  }

  return config;
};

const getSSLPath = (module.exports.getSSLPath = (host, name) => join(HOME_DIR, SSL_DIR, host, name || '.'));

/*
Set config.https to cert & key generated with `aunty sign-cert` (if they both exist)
We expect them to be in: ~/.aunty/ssl/<host>/server.{cert|key}
*/
const addUserSSLConfig = config => {
  if (config.https === true) {
    try {
      config.https = {
        cert: readFileSync(getSSLPath(config.host, SERVER_CERT_FILENAME)),
        key: readFileSync(getSSLPath(config.host, SERVER_KEY_FILENAME))
      };
    } catch (e) {}
  }

  return config;
};

const findPort = async (port, max = port + 100, host = '0.0.0.0') => {
  return new Promise((resolve, reject) => {
    const socket = new Socket();

    const next = () => {
      socket.destroy();
      info(MESSAGES.port(port));
      if (port <= max) resolve(findPort(port + 1, max, host));
      else reject(new Error('Could not find an available port'));
    };

    const found = () => {
      socket.destroy();
      resolve(port);
    };

    // Port is taken if connection can be made
    socket.once('connect', next);

    // Port is open if connection attempt times out
    socket.setTimeout(500);
    socket.once('timeout', found);

    // If an error occurs, it's assumed the port is available.
    socket.once('error', e => {
      // If the connection is refused, it's assumed nothing is listening and the port is available.
      if (e.code === 'ECONNREFUSED') {
        found();
      } else {
        // Not sure what to do with other errors, so keep seeking a free port.
        next();
      }
    });

    socket.connect(port, host);
  });
};

const _getServeConfig = async () => {
  const { serve } = getProjectConfig();

  const config = combine(
    {
      hasBundleAnalysis: false,
      host: DEFAULT_HOST,
      hot: process.env.NODE_ENV === 'development',
      https: true,
      port: DEFAULT_PORT
    },
    serve,
    addEnvironmentVariables,
    addUserSSLConfig
  );
  const port = await findPort(config.port, config.port + 100, config.host);
  config.port = port;

  return config;
};

let _serveConfigPromiseSingleton;

// getServeConfig is called twice during server startup, because the `serve`
// command calls it directly, then indirectly, via getWebpackDevServerConfig.
// Because it won't change during a single `serve` command, and because we
// don't want to waste time doing port lookups with `findPort` multiple times
// we just cache the promise created on the first run, and return that later.

module.exports.getServeConfig = async () => {
  if (!_serveConfigPromiseSingleton) {
    _serveConfigPromiseSingleton = _getServeConfig();
  }

  return _serveConfigPromiseSingleton;
};
