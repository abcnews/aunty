// Native
const { homedir, hostname } = require('os');
const { readFileSync } = require('fs');
const { join } = require('path');

// External
const { probe } = require('tcp-ping-sync');

// Ours
const { combine } = require('../utils/structures');
const { getProjectConfig } = require('./project');

const HOME_DIR = homedir();
const SSL_DIR = '.aunty/ssl';
const SERVER_CERT_FILENAME = (module.exports.SERVER_CERT_FILENAME = 'server.crt');
const SERVER_KEY_FILENAME = (module.exports.SERVER_KEY_FILENAME = 'server.key');
const INTERNAL_SUFFIX = '.aus.aunty.abc.net.au';
const DEFAULT_HOST = (module.exports.DEFAULT_HOST = probe(`nucwed${INTERNAL_SUFFIX}`)
  ? `${hostname().toLowerCase().split('.')[0]}${INTERNAL_SUFFIX}` // hostname _may_ include INTERNAL_SUFFIX
  : 'localhost');
const DEFAULT_PORT = 8000;

module.exports.getServeConfig = () => {
  const { serve } = getProjectConfig();

  return combine(
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
};

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
function addUserSSLConfig(config) {
  if (config.https === true) {
    try {
      config.https = {
        cert: readFileSync(getSSLPath(config.host, SERVER_CERT_FILENAME)),
        key: readFileSync(getSSLPath(config.host, SERVER_KEY_FILENAME))
      };
    } catch (e) {}
  }

  return config;
}
