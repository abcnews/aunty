import ftp from "basic-ftp";
import os from "node:os";
import path from "node:path";
import { loadJson } from "../../lib/util.ts";

const CREDENTIALS_PATH = path.resolve(os.homedir(), ".abc-credentials");

/**
 * Loads credentials from ~/.abc-credentials
 * @returns The contentftp credentials
 */
async function getCredentials() {
  const { contentftp } = (await loadJson(CREDENTIALS_PATH)) || {};
  if (!contentftp) {
    throw new Error(
      `Credentials file not found or missing 'contentftp' at ${CREDENTIALS_PATH}`,
    );
  }
  return contentftp;
}

/**
 * A wrapper around basic-ftp to provide a cleaner interface for ABC news-projects deployments.
 */
export class FtpClient {
  private ftpClient: ftp.Client;
  private ensuredDirs: Set<string>;
  private credentialsPromise: Promise<any>;

  constructor(verbose = false) {
    this.ftpClient = new ftp.Client();
    this.ensuredDirs = new Set();
    this.credentialsPromise = getCredentials();
    if (verbose) {
      this.ftpClient.ftp.verbose = true;
    }
  }

  /**
   * Connect to the FTP server
   */
  async connect() {
    const credentials = await this.credentialsPromise;
    await this.ftpClient.access({
      host: credentials.host,
      user: credentials.username,
      password: credentials.password,
      port: Number(credentials.port) || 21,
      secure: false,
    });
  }

  /**
   * Check if a directory exists on the remote
   */
  async exists(remotePath: string) {
    try {
      const parent = path.dirname(remotePath);
      const name = path.basename(remotePath);
      const list = await this.ftpClient.list(parent);
      return list.some((item: any) => item.name === name);
    } catch (err) {
      return false;
    }
  }

  /**
   * Upload a directory to a remote path
   */
  async uploadDir(
    localDir: string,
    remoteDir: string,
    onProgress?: (info: any) => void,
  ) {
    if (onProgress) {
      this.ftpClient.trackProgress(onProgress);
    }
    await this.ftpClient.ensureDir(remoteDir);
    await this.ftpClient.uploadFromDir(localDir);
  }

  /**
   * Upload a single file to a remote path
   */
  async uploadFile(localPath: string, remotePath: string) {
    await this.ensureDir(path.dirname(remotePath));
    await this.ftpClient.uploadFrom(localPath, remotePath);
  }

  /**
   * Ensure a remote directory exists (with local caching)
   */
  async ensureDir(remoteDir: string) {
    if (this.ensuredDirs.has(remoteDir)) return;

    await this.ftpClient.ensureDir(remoteDir);
    this.ensuredDirs.add(remoteDir);
  }

  /**
   * Close the connection
   */
  close() {
    this.ftpClient.close();
  }
}
