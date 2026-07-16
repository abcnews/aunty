import ftp from "basic-ftp";
import os from "node:os";
import path from "node:path";
import { loadJson } from "./util.ts";
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
}

/**
 * Checks if a project name already exists on the FTP server.
 */
export async function isProjectNameAndVersionAvailable(
  projectName: string,
  version?: string,
  ftpClient?: FtpClient,
): Promise<"available" | "exists" | "error"> {
  const client = ftpClient || new FtpClient();
  try {
    if (!ftpClient) {
      await client.connect(5000);
    }
    const nameSlug = slugify(projectName, { strict: true });
    const remoteDir = version
      ? path.join(FTP_PROJECTS_PATH, nameSlug, version, "/")
      : path.join(FTP_PROJECTS_PATH, nameSlug, "/");
    const exists = await client.exists(remoteDir);
    return exists ? "exists" : "available";
  } catch {
    return "available";
  } finally {
    if (!ftpClient) {
      client.close();
    }
  }
}

/**
 * Test the FTP connection and returns success status and optional error message.
 */
export async function testFtpConnection(timeout = 5000): Promise<{
  success: boolean;
  ftpClient?: FtpClient;
  error?: string;
}> {
  const ftpClient = new FtpClient();
  try {
    await ftpClient.connect(timeout);
    return { success: true, ftpClient };
  } catch (err: unknown) {
    ftpClient.close();
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
