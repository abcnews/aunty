// @ts-check

const ftp = require('basic-ftp');
const { to: wrap } = require('await-to-js');

const { getCredentials, getDeployConfig } = require('../config/deploy');

const BASE_FTP_DIRECTORY = '/www/res/sites/news-projects/';

/**
 * Check if a project exists on FTP
 * @param {string} projectNameSlug
 * @returns {Promise<boolean>}
 */
const projectExists = async projectNameSlug => {
  const config = getDeployConfig();
  console.log(config);
  const credentials = getCredentials();

  const { contentftp } = credentials;
  const { host, username: user, password } = contentftp;

  const client = new ftp.Client();

  try {
    await client.access({
      host,
      user,
      password,
      secure: false
    });
    await client.cd(BASE_FTP_DIRECTORY);
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
  const credentials = getCredentials();

  const { contentftp } = credentials;
  const { host, username: user, password } = contentftp;

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
