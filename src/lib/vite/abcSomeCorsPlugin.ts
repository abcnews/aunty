import { type Plugin } from "vite";

const ALLOWED_DEV_DOMAINS = ["abc-test.net.au", "abc-prod.net.au", "abc.net.au"];

/**
 * A middleware that rejects no-cors mode requests that are not same-origin,
 * unless they are from an allowlisted ABC domain.
 *
 * This allows classical script tags from ABC domains to bypass Vite's
 * default no-cors restriction.
 *
 * Cloned and modified from:
 * https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/rejectNoCorsRequest.ts
 */
export const abcSomeCorsPlugin = (): Plugin => ({
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
        const isAllowlisted = ALLOWED_DEV_DOMAINS.some(
          (domain) =>
            originHost === domain || originHost.endsWith("." + domain),
        );
        if (isAllowlisted) {
          return next();
        }
      }

      // Log the reason for the block to the server console
      server.config.logger.error(
        `[abc-some-cors-plugin] Blocked no-cors request for ${req.url} from ${headers.referer || "unknown origin"}. ` +
          `Classic scripts from other origins must have 'crossorigin' attribute or be from an allowlisted ABC domain.`,
      );

      res.statusCode = 400;
      res.end("Unknown referer");
    });
  },
});
