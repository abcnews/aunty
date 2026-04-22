import { type Plugin } from "vite";

/**
 * Vite plugin to export a non-module entrypoint to
 * bootstrap the rest of the app as type="module".
 *
 * This generates /es5entry.js which injects the necessary
 * link and script tags to load the ESM bundle.
 *
 * @param entryPoint The entry point for the application (e.g. 'src/index.ts')
 */
export const es5EntryPlugin = (entryPoint: string): Plugin => {
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
