import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir, hostname } from "node:os";
import { type Plugin } from "vite";

/**
 * Get SSL config from the Aunty dir, if exists. See DEVELOPING.md
 * @returns {import('vite').CommonServerOptions}
 */
export const getServer = () => {
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

/**
 * Vite plugin to export a CoreMedia-compatible non-module entrypoint to
 * bootstrap the rest of the app as type="module".
 *
 * /coremedia.js
 */
export const coremediaPlugin = (): Plugin => {
  let isBuild = false;

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
  crel('script', { type: 'module', src: base + '${entryPath}' });
})();`;

  return {
    name: "coremedia-proxy",
    config(config, { command }) {
      isBuild = command === "build";
    },
    generateBundle(options, bundle) {
      if (isBuild) {
        const entry = Object.values(bundle).find(
          (chunk) => chunk.type === "chunk" && chunk.name === "coremedia",
        );
        if (entry && entry.type === "chunk") {
          const cssPaths = Array.from(entry.viteMetadata?.importedCss || []);
          const modulePreloadPaths = entry.imports;
          this.emitFile({
            type: "asset",
            fileName: "coremedia.js",
            source: getProxyScript(
              entry.fileName,
              cssPaths as string[],
              modulePreloadPaths,
            ),
          });
        }
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/coremedia.js") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Content-Type", "application/javascript");
          res.end(getProxyScript("src/coremedia.ts"));
          return;
        }
        next();
      });
    },
  };
};
