// Native
const { hostname } = require('os');

// External
const { probe } = require('tcp-ping-sync');

// Ours
const { timer } = require('../utils/logging');
const { combine } = require('../utils/structures');
const { getProjectConfig } = require('./project');

const INTERNAL_SUFFIX = '.aus.aunty.abc.net.au';
// TODO: Find a faster way of determining DEFAULT_HOST. It currently takes anywhere from ~300ms to a few seconds
const __DEBUG__stopProbeTimer = timer(`tcp-ping-sync#probe(nucwed${INTERNAL_SUFFIX})`);
const DEFAULT_HOST = probe(`nucwed${INTERNAL_SUFFIX}`)
  ? `${
      hostname()
        .toLowerCase()
        .split('.')[0]
    }${INTERNAL_SUFFIX}` // hostname _may_ include INTERNAL_SUFFIX
  : 'localhost';
if (process.env.AUNTY_DEBUG) {
  __DEBUG__stopProbeTimer();
}
const DEFAULT_PORT = 8000;

module.exports.getServeConfig = () => {
  const { serve } = getProjectConfig();

  return combine(
    {
      host: DEFAULT_HOST,
      hot: process.env.NODE_ENV === 'development',
      https: true,
      port: DEFAULT_PORT
    },
    serve,
    addEnvironmentVariables
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
