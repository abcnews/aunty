import ftp from "basic-ftp";
import os from "node:os";
import path from "node:path";
import { loadJson } from "../../lib/util.ts";
import { spin } from "../../lib/terminal.ts";

const CREDENTIALS_PATH = path.resolve(os.homedir(), ".abc-credentials");

/**
 * Loads credentials from ~/.abc-credentials
 */
async function getCredentials(): Promise<{
  host: string;
  username?: string;
  password?: string;
  port?: number;
}> {
  const credentials = (await loadJson(CREDENTIALS_PATH)) as {
    contentftp?: {
      host: string;
      username?: string;
      password?: string;
      port?: number;
    };
  } | null;
  const contentftp = credentials?.contentftp;
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
  private credentialsPromise: ReturnType<typeof getCredentials>;

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
  async connect(timeout = 5000) {
    // @ts-expect-error - basic-ftp context timeout is readonly but allows runtime assignment
    this.ftpClient.ftp.timeout = timeout;
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
      return list.some((item) => item.name === name);
    } catch {
      return false;
    }
  }

  /**
   * Upload a directory to a remote path
   */
  async uploadDir(
    localDir: string,
    remoteDir: string,
    onProgress?: (info: {
      name: string;
      bytes: number;
      bytesOverall: number;
    }) => void,
  ) {
    if (onProgress) {
      this.ftpClient.trackProgress(onProgress);
    }
    await this.ftpClient.ensureDir(remoteDir);
    await this.ftpClient.uploadFromDir(localDir);
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

  /**
   * Test the FTP connection.
   */
  async testConnection(
    timeout = 5000,
    spinner?: ReturnType<typeof spin>,
  ): Promise<FtpClient> {
    const s = spinner || spin("Testing credentials...");

    try {
      await this.connect(timeout);
      if (spinner) {
        s.message("Credentials verified");
      } else {
        s.stop("Credentials verified");
      }
      return this;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      s.cancel(`Connection failed: ${message}.`);
      throw error;
    }
  }
}
