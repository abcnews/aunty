import { eachSeries } from "async";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createInterface } from "node:readline";
import { getCredentials, toRemotePath, type FtpClient } from "./ftp.ts";

interface InventoryFile {
  path: string;
  relPath: string;
}

interface CurlTransferResult {
  url?: string;
  exitcode?: number;
  errormsg?: string;
}

/** Quotes a value for a curl config file, where only \ and " need escaping */
const quoteConfigValue = (value: string) =>
  `"${value.replace(/[\\"]/g, "\\$&")}"`;

/**
 * Builds an FTP URL for an absolute remote path. curl treats a URL path as
 * relative to the login directory, so an absolute path needs a leading "//".
 */
const toFtpUrl = ({
  host,
  port,
  remotePath,
}: {
  host: string;
  port: number;
  remotePath: string;
}) =>
  `ftp://${host}:${port}//${remotePath
    .replace(/^\/+/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

/**
 * Uploads an inventory by scripting the local curl binary instead of using a
 * Node FTP client, to rule our own FTP code in or out as the cause of event
 * loop stalls. curl runs in a child process, so it can't block this one.
 *
 * Remote directories are created first over the existing FtpClient, so
 * parallel transfers never race to create the same directory. Set
 * AUNTY_FTP_TRACE=1 to print curl's per-transfer timings (one JSON line each).
 *
 * @param confirmRun Shown the curl command and config (password redacted)
 * before anything is changed on the server; return false to cancel
 * @param onStart Called once confirmed, before the remote directories are created
 * @param onFileDone Called as each file finishes uploading
 * @returns false if cancelled by confirmRun, otherwise true
 */
export async function uploadInventoryWithCurl({
  ftpClient,
  inventory,
  remoteDir,
  connections = 4,
  confirmRun,
  onStart,
  onFileDone,
}: {
  ftpClient: FtpClient;
  inventory: InventoryFile[];
  remoteDir: string;
  connections?: number;
  confirmRun?: (details: { command: string; config: string }) => Promise<boolean>;
  onStart?: () => void;
  onFileDone?: (relPath: string) => void;
}) {
  const { host, username = "anonymous", password = "", port } =
    await getCredentials();
  const ftpPort = Number(port) || 21;

  const urlByFile = inventory.map((file) => ({
    file,
    url: toFtpUrl({
      host,
      port: ftpPort,
      remotePath: toRemotePath(remoteDir, file.relPath),
    }),
  }));
  const relPathByUrl = new Map(urlByFile.map(({ file, url }) => [url, file.relPath]));

  const buildConfigLines = (userValue: string) => [
    "silent",
    "show-error",
    "parallel",
    `parallel-max = ${connections}`,
    "connect-timeout = 10",
    // basic-ftp used PASV, not EPSV; matching it keeps the comparison fair
    "disable-epsv",
    `user = ${quoteConfigValue(userValue)}`,
    // \n is left unescaped on purpose: curl turns it into a newline inside a quoted config value
    'write-out = "%{json}\\n"',
    // curl pairs the nth upload-file with the nth url
    ...urlByFile.flatMap(({ file, url }) => [
      `upload-file = ${quoteConfigValue(file.path)}`,
      `url = ${quoteConfigValue(url)}`,
    ]),
  ];

  // The credentials go in a private config file, not argv, which other users can read with ps
  const configDirectory = await mkdtemp(path.join(os.tmpdir(), "aunty-curl-"));
  const configPath = path.join(configDirectory, "curl.conf");

  try {
    const shouldRun =
      (await confirmRun?.({
        command: `curl --config ${configPath}`,
        config: buildConfigLines(`${username}:***`).join("\n"),
      })) ?? true;
    if (!shouldRun) return false;

    onStart?.();

    const remoteSubDirs = [
      ...new Set(
        inventory.map(({ relPath }) =>
          path.posix.dirname(toRemotePath(remoteDir, relPath)),
        ),
      ),
    ];
    await eachSeries(remoteSubDirs, async (dir) => ftpClient.ensureDir(dir));

    await writeFile(
      configPath,
      `${buildConfigLines(`${username}:${password}`).join("\n")}\n`,
      { mode: 0o600 },
    );

    const failures: CurlTransferResult[] = [];
    let stderrText = "";

    const curl = spawn("curl", ["--config", configPath], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    curl.stderr.on("data", (chunk) => (stderrText += chunk));

    createInterface({ input: curl.stdout }).on("line", (line) => {
      if (process.env.AUNTY_FTP_TRACE === "1") process.stderr.write(`${line}\n`);

      const result = JSON.parse(line) as CurlTransferResult;
      if (result.exitcode) {
        failures.push(result);
        return;
      }
      const relPath = relPathByUrl.get(result.url ?? "");
      if (relPath) onFileDone?.(relPath);
    });

    const exitCode = await new Promise<number | null>((resolve, reject) => {
      curl.once("error", (error: NodeJS.ErrnoException) =>
        reject(
          error.code === "ENOENT"
            ? new Error("curl was not found on PATH")
            : error,
        ),
      );
      curl.once("close", resolve);
    });

    if (exitCode === 0 && failures.length === 0) return true;

    const failureSummary = failures
      .slice(0, 5)
      .map(({ url, exitcode, errormsg }) => `${url} (${exitcode}): ${errormsg}`)
      .join("\n");
    throw new Error(
      `curl upload failed (exit ${exitCode}, ${failures.length} failed transfers)\n${failureSummary}\n${stderrText}`.trim(),
    );
  } finally {
    await rm(configDirectory, { recursive: true, force: true });
  }
}
