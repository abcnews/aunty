// External
const ftp = require('basic-ftp');
const { to: wrap } = require('await-to-js');
const { probe } = require('tcp-ping-sync');

const { addProfileProperties, addKnownProfileProperties } = require('../config/deploy');
const { INTERNAL_TEST_HOST } = require('../constants');

/**
 * Check if a project exists on FTP
 * @param {string} projectNameSlug
 * @returns {Promise<boolean>}
 */
const projectExists = async projectNameSlug => {
  // If not on internal network FTP won't connect, so bail out
  const isOnInternalNetwork = probe(INTERNAL_TEST_HOST);
  if (!isOnInternalNetwork) throw new Error('Not on internal network');

  const config = addProfileProperties(addKnownProfileProperties({}));
  const { host, username: user, password, to } = config;
  const [baseDir] = to.split('<name>');

  if (!host || !user || !password) throw new Error('Missing FTP credentials');

  const client = new ftp.Client();

  try {
    await client.access({
      host,
      user,
      password,
      secure: false
    });
    await client.cd(baseDir);
    const list = await client.list();

    for (const item of list) {
      if (projectNameSlug === item.name) return true;
    }
  } catch (err) {
    throw err;
  }

  client.close();

  return false;
};

/**
 * Quick FTP check if deployment dir exists
 * @param {string} deployToDir - Remote dir to check
 * @returns {Promise<boolean>}
 */
const deploymentExists = async deployToDir => {
  const config = addProfileProperties(addKnownProfileProperties({}));
  const { host, username: user, password, to } = config;

  const client = new ftp.Client();

  const [accessErr] = await wrap(
    client.access({
      host,
      user,
      password,
      secure: false
    })
  );
  if (accessErr) throw accessErr;

  const [cdError] = await wrap(client.cd(deployToDir));
  if (cdError) {
    throw cdError;
  }

  client.close();

  return false;
};

module.exports = { projectExists, deploymentExists };
