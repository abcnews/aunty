import { eachLimit, eachSeries } from "async";
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
 * Joins a local relative path (OS separators) onto a remote directory (always "/").
 */
export function toRemotePath(remoteDir: string, relPath: string) {
  return path.posix.join(remoteDir, relPath.split(path.sep).join("/"));
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
   * Upload exactly the files in an inventory beneath a remote directory.
   * Sequential: a single FTP connection can't parallelise.
   */
  async uploadInventory(
    inventory: { path: string; relPath: string }[],
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
    await inventory.reduce(async (previous, { path: localPath, relPath }) => {
      await previous;
      const remotePath = toRemotePath(remoteDir, relPath);
      await this.ensureDir(path.posix.dirname(remotePath));
      await this.ftpClient.uploadFrom(localPath, remotePath);
    }, Promise.resolve());
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
 * Uploads an inventory over several simultaneous FTP connections.
 * The given (already connected) client is reused and additional clients connect
 * in series from the constructor.
 */
export class FtpClientPool {
  private clients: FtpClient[];
  /** Settles once the extra clients have connected; rejects on the first failure */
  private ready: Promise<void>;

  constructor(primaryClient: FtpClient, size = 4) {
    const extraClients = Array.from(
      { length: size - 1 },
      () => new FtpClient(),
    );
    this.clients = [primaryClient, ...extraClients];

    // eachSeries stops at the first failed connection
    this.ready = eachSeries(extraClients, (client) => client.connect());
  }

  /**
   * @param onFileStart Called once per file as its upload begins, from any connection
   */
  async uploadInventory(
    inventory: { path: string; relPath: string }[],
    remoteDir: string,
    onFileStart?: (name: string) => void,
  ) {
    const [primaryClient] = this.clients;
    await this.ready;

    // Create every remote directory up front on one connection, so the
    // parallel workers never race to create the same directory
    const remoteSubDirs = [
      ...new Set(
        inventory.map(({ relPath }) =>
          path.posix.dirname(toRemotePath(remoteDir, relPath)),
        ),
      ),
    ];
    await eachSeries(remoteSubDirs, (dir) => primaryClient.ensureDir(dir));

    const idleClients = [...this.clients];

    await eachLimit(inventory, this.clients.length, async (file) => {
      const client = idleClients.pop()!;
      try {
        onFileStart?.(file.relPath);
        await client.uploadInventory([file], remoteDir);
      } finally {
        idleClients.push(client);
      }
    });
  }

  /**
   * Close every connection, including the primary
   */
  close() {
    this.clients.forEach((client) => client.close());
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
    const nameSlug = (slugify as unknown as (s: string, o: object) => string)(
      projectName,
      { strict: true },
    );
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
