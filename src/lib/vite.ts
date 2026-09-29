/**
 * @file
 * Helpers for vite.confifg.ts files
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir, hostname } from "node:os";

import { createServer } from "node:net";

const DEV_PORT = 8000;
const INTERNAL_SUFFIX = ".aus.aunty.abc.net.au";

// Determine host - check command line args first, then environment, then default
const hostArg = process.argv.find((arg: string) => arg.startsWith("--host="));
const HOST = hostArg
  ? hostArg.split("=")[1]
  : process.env.AUNTY_HOST ||
    `${hostname().toLowerCase().split(".")[0]}${INTERNAL_SUFFIX}`;

/**
 * Finds the first free port from `port` up to `max`, probing on `host` by
 * trying to listen on it (so it matches what Vite will actually bind).
 */
async function findFreePort(
  port: number,
  max = port + 100,
  host = "0.0.0.0",
): Promise<number> {
  const outcome = await new Promise<string>((resolve) => {
    const probe = createServer();

    probe.once("listening", () => probe.close(() => resolve("free")));

    probe.once("error", (e: NodeJS.ErrnoException & { hostname?: string }) => {
      if (
        e.code === "ENOTFOUND" &&
        e.syscall === "getaddrinfo" &&
        e.hostname?.includes(INTERNAL_SUFFIX)
      ) {
        console.error(
          [
            "Could not resolve hostname " + e.hostname,
            "You appear to be on the ABC network without a hostname attached to your computer.",
            "Aunty can't continue. Consider reconnecting, or add your hostname to your hosts file.",
            "",
          ].join("\n"),
        );
        process.exit(1);
      }
      // In use, or an unexpected error: log the reason and keep seeking.
      resolve(e.code === "EADDRINUSE" ? "in use" : `error code ${e.code}`);
    });

    probe.listen(port, host);
  });

  if (outcome === "free") return port;

  console.log(`Port ${port} unavailable (${outcome})`);
  if (port >= max) throw new Error("Could not find an available port");
  return findFreePort(port + 1, max, host);
}

// Resolved once at import (top-level await) so getServer() can stay synchronous.
const FREE_PORT = await findFreePort(DEV_PORT, DEV_PORT + 100, HOST);

/**
 * Get SSL config from the Aunty dir, if exists.
 */
export function getServer() {
  const HOME_DIR = homedir();
  const SSL_DIR = join(HOME_DIR, ".aunty/ssl");

  const certDir = join(SSL_DIR, HOST);
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
    host: HOST,
    port: FREE_PORT,
    strictPort: true,
    origin: `${https ? "https" : "http"}://${HOST}:${FREE_PORT}`,
    cors: {
      origin: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    },
  };
}

/**
 * Recursively retrieves all imported CSS file paths for a chunk and its dependencies.
 */
function getChunkCss(
  chunkName: string,
  bundle: any,
  visited = new Set<string>(),
): string[] {
  if (visited.has(chunkName)) return [];
  visited.add(chunkName);
  const chunk = bundle[chunkName];
  if (!chunk) return [];
  const css = Array.from((chunk.viteMetadata?.importedCss || []) as string[]);
  const importedCss = (chunk.imports || []).flatMap((imp: string) =>
    getChunkCss(imp, bundle, visited),
  );
  return [...css, ...importedCss];
}

/**
 * Vite plugin to export a non-module entrypoint to
 * bootstrap the rest of the app as type="module".
 */
export function es5EntryPlugin(): any {
  let isBuild = false;

  const isTS = existsSync(join(process.cwd(), "src/index.ts"));
  const entryPoint = isTS ? "src/index.ts" : "src/index.js";

  const getProxyScript = (
    entryPath: string,
    cssPaths: string[] = [],
    modulePreloadPaths: string[] = [],
  ) => `(function() {
  var src = document.currentScript ? document.currentScript.src : '';
  var base = src.substring(0, src.lastIndexOf('/') + 1);
  var cssPaths = ${JSON.stringify(cssPaths)};
  var modulePreloadPaths = ${JSON.stringify([...new Set([entryPath, ...modulePreloadPaths])])};

  function crel(tag, props) {
    var el = document.createElement(tag);
    for (var key in props) el[key] = props[key];
    return document.head.appendChild(el);
  }

  cssPaths.forEach(p => crel('link', { rel: 'stylesheet', href: base + p }));
  modulePreloadPaths.forEach(p => crel('link', { rel: 'modulepreload', href: base + p }));
  crel('script', { type: 'module', crossorigin:true, src: base + '${entryPath}' });
})();`;

  return {
    name: "es5-entry-proxy",
    config(_config: any, { command }: { command: string }) {
      isBuild = command === "build";
    },
    generateBundle(_options: any, bundle: any) {
      if (isBuild) {
        const entry = Object.values(bundle).find(
          (chunk: any) => chunk.type === "chunk" && chunk.name === "indexEntry",
        );
        if (entry && (entry as any).type === "chunk") {
          const modulePreloadPaths = (entry as any).imports;
          this.emitFile({
            type: "asset",
            fileName: "es5entry.js",
            source: getProxyScript(
              (entry as any).fileName,
              Array.from(new Set(getChunkCss((entry as any).fileName, bundle))),
              modulePreloadPaths,
            ),
          });
        }
      }
    },
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === "/es5entry.js") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Content-Type", "application/javascript");
          res.end(getProxyScript(entryPoint));
          return;
        }
        next();
      });
    },
  };
}

const ALLOWED_DEV_DOMAINS = [
  "abc-test.net.au",
  "abc-prod.net.au",
  "abc.net.au",
];

/**
 * A middleware that rejects no-cors mode requests that are not same-origin,
 * unless they are from a whitelisted ABC domain.
 */
export function abcCorsPlugin(): any {
  return {
    name: "abc-cors-plugin",
    configureServer(server: any) {
      const stack = server.middlewares.stack;
      const index = stack.findIndex(
        (m: any) =>
          typeof m.handle === "function" &&
          m.handle.name === "viteRejectNoCorsRequestMiddleware",
      );
      if (index !== -1) {
        stack.splice(index, 1);
      }

      server.middlewares.use((req: any, res: any, next: any) => {
        const { headers } = req;

        const isForbiddenNoCorsRequest =
          headers["sec-fetch-mode"] === "no-cors" &&
          headers["sec-fetch-site"] !== "same-origin" &&
          headers["sec-fetch-dest"] === "script";

        if (!isForbiddenNoCorsRequest) {
          return next();
        }

        if (headers.referer) {
          const originHost = new URL(headers.referer).hostname;
          const isWhitelisted = ALLOWED_DEV_DOMAINS.some(
            (domain) =>
              originHost === domain || originHost.endsWith("." + domain),
          );
          if (isWhitelisted) {
            return next();
          }
        }

        // Log the reason for the block to the server console
        server.config.logger.error(
          `[abc-cors-plugin] Blocked no-cors request for ${req.url} from ${headers.referer || "unknown origin"}. ` +
            `Classic scripts from other origins must have 'crossorigin' attribute or be from a whitelisted ABC domain.`,
        );

        res.statusCode = 400;
        res.end("Unknown referer");
      });
    },
  };
}
