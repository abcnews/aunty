/**
 * @file
 * This config does two things:
 * 1. resolve your Aunty certificates and serve via HTTPS on your ABC hostname
 * 2. create a non-ESM entrypoint called es5entry.js, to bootstrap our ESM app
 *
 * The idea is that eventually these will be imported from @abcnews/aunty, but
 * for now they're inline so we can test and modify.
 */
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig, type Plugin } from "vite";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir, hostname } from "node:os";

/**
 * Get SSL config from the Aunty dir, if exists. See DEVELOPING.md
 * @returns {import('vite').CommonServerOptions}
 */
const getServer = () => {
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

const isTS = existsSync(join(process.cwd(), "src/index.ts"));
const entryPoint = isTS ? "src/index.ts" : "src/index.js";

/**
 * Vite plugin to export a non-module entrypoint to
 * bootstrap the rest of the app as type="module".
 *
 * /es5entry.js
 */
const es5EntryPlugin = (): Plugin => {
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
  crel('script', { type: 'module', crossorigin:true, src: base + '${entryPath}' });
})();`;

  return {
    name: "es5-entry-proxy",
    config(_config, { command }) {
      isBuild = command === "build";
    },
    generateBundle(_options, bundle) {
      if (isBuild) {
        const entry = Object.values(bundle).find(
          (chunk) => chunk.type === "chunk" && chunk.name === "index",
        );
        if (entry && entry.type === "chunk") {
          const cssPaths = Array.from(entry.viteMetadata?.importedCss || []);
          const modulePreloadPaths = entry.imports;
          this.emitFile({
            type: "asset",
            fileName: "es5entry.js",
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
};

const ALLOWED_DEV_DOMAINS = [
  "abc-test.net.au",
  "abc-prod.net.au",
  "abc.net.au",
];
/**
 * A middleware that rejects no-cors mode requests that are not same-origin,
 * unless they are from a whitelisted ABC domain.
 *
 * Cloned and modified from:
 * https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/rejectNoCorsRequest.ts
 */
const abcSomeCorsPlugin = (): Plugin => ({
  name: "abc-some-cors-plugin",
  configureServer(server) {
    const stack = server.middlewares.stack;
    const index = stack.findIndex(
      (m) =>
        typeof m.handle === "function" &&
        m.handle.name === "viteRejectNoCorsRequestMiddleware",
    );
    if (index !== -1) {
      stack.splice(index, 1);
    }

    server.middlewares.use((req, res, next) => {
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
        `[abc-some-cors-plugin] Blocked no-cors request for ${req.url} from ${headers.referer || "unknown origin"}. ` +
          `Classic scripts from other origins must have 'crossorigin' attribute or be from a whitelisted ABC domain.`,
      );

      res.statusCode = 400;
      res.end("Unknown referer");
    });
  },
});

/**
 * Application entry points.
 */
const rollupInput: Record<string, string> = {
  "index.html": "index.html",
  index: entryPoint,
};

// Add the builder entry point if it exists.
if (existsSync(join(process.cwd(), "builder/index.html"))) {
  rollupInput["builder/index.html"] = "builder/index.html";
}

export default defineConfig({
  base: "",
  plugins: [svelte(), es5EntryPlugin(), abcSomeCorsPlugin()],
  server: getServer(),
  build: {
    rollupOptions: {
      input: rollupInput,
      output: {
        // entry points currently get hashed. In the future we will likely
        // want to spit these out into /[name].js so we have a stable /index.js
        // entry point.
        entryFileNames: "modules/[name]-[hash].js",

        // the remainder of assets get hashed to avoid name collisions.
        chunkFileNames: "modules/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
