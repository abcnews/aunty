// @ts-check
const ftp = require('basic-ftp');
const { getCredentials } = require('../config/deploy');

const DEPLOY_DIRECTORY = '/www/res/sites/news-projects/';

/**
 * Check if a project exists on FTP
 * @param {string} projectNameSlug
 * @returns boolean
 */
const existsExternally = async projectNameSlug => {
  const credentials = getCredentials();
  if (!credentials) return false;

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
    await client.cd(DEPLOY_DIRECTORY);
    const list = await client.list();

    for (const item of list) {
      if (projectNameSlug === item.name) return true;
    }
  } catch (err) {
    console.error(err);
  }

  client.close();

  return false;
};

module.exports = { existsExternally };
