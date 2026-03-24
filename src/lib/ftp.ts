import ftp from "basic-ftp";
import os from "node:os";
import path from "node:path";
import { loadJson } from "./util.ts";
import { spin } from "./terminal.ts";
import { FTP_PROJECTS_PATH } from "./constants.ts";
import slugify from "slugify";

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

/**
 * Check if a project name is available on the FTP server.
 * Returns true if available, false if it exists, or "error" if connection fails.
 */
export async function isProjectNameAvailable(
  projectName: string,
): Promise<boolean | "error"> {
  const ftpClient = new FtpClient();
  try {
    await ftpClient.connect(5000);
    const nameSlug = (slugify as any)(projectName, { strict: true });
    const remoteDir = path.join(FTP_PROJECTS_PATH, nameSlug, "/");
    const exists = await ftpClient.exists(remoteDir);
    return !exists;
  } catch {
    return "error";
  } finally {
    ftpClient.close();
  }
}

/**
 * Test the FTP connection and returns success status and optional error message.
 */
export async function testFtpConnection(timeout = 5000): Promise<{
  success: boolean;
  error?: string;
}> {
  const ftpClient = new FtpClient();
  try {
    await ftpClient.connect(timeout);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    ftpClient.close();
  }
}



