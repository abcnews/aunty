import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir, hostname } from "node:os";
import type { CommonServerOptions } from "vite";

/**
 * Get SSL config from the Aunty dir, if it exists.
 *
 * This function checks for SSL certificates in `~/.aunty/ssl` matching the
 * current hostname (or a provided host argument/env var).
 */
export const getServer = (): CommonServerOptions => {
  const HOME_DIR = homedir();
  const SSL_DIR = join(HOME_DIR, ".aunty/ssl");
  const INTERNAL_SUFFIX = ".aus.aunty.abc.net.au";

  // Determine host - check command line args first, then environment, then default
  const hostArg = process.argv.find((arg: string) => arg.startsWith("--host="));
  const host = hostArg
    ? hostArg.split("=")[1]
    : process.env.AUNTY_HOST ||
      `${hostname().toLowerCase().split(".")[0]}${INTERNAL_SUFFIX}`;

  const certDir = join(SSL_DIR, host);
  const certFile = join(certDir, "server.crt");
  const keyFile = join(certDir, "server.key");

  // Use certs if they exist
  const https =
    existsSync(certFile) && existsSync(keyFile)
      ? {
          key: readFileSync(keyFile),
          cert: readFileSync(certFile),
        }
      : undefined;

  return {
    https,
    host,
    port: 8000,
    cors: {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    },
  };
};
