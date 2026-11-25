import { describe, it } from "node:test";
import assert from "node:assert";
import vm from "node:vm";
import { getEvergreenRedirectHtml } from "../src/lib/evergreen.ts";

const target = "https://example.com/project/2.3.1/";
const html = getEvergreenRedirectHtml({ target, version: "2.3.1" });
const [, redirectScript = ""] = html.match(/<script>([\s\S]*?)<\/script>/) ?? [];

// ---- Helpers ----

/** Runs the page's redirect script against a fake `location` and returns where it redirected to */
const getRedirectUrl = ({ search = "", hash = "" }) => {
  const redirects: string[] = [];
  const location = { search, hash, replace: (url: string) => redirects.push(url) };
  vm.runInNewContext(redirectScript, { location, URLSearchParams });
  assert.strictEqual(redirects.length, 1);
  return redirects[0];
};

// ---- Tests ----

describe("getEvergreenRedirectHtml", () => {
  it("includes the version and a noscript fallback to the release root", () => {
    assert.match(html, /<meta name="version" content="2\.3\.1">/);
    assert.match(html, new RegExp(`content="0;url=${target}"`));
  });

  it("redirects to the release root with no query or hash", () => {
    assert.strictEqual(getRedirectUrl({}), target);
  });

  it("redirects to a sub-folder with ?path=", () => {
    assert.strictEqual(getRedirectUrl({ search: "?path=map" }), `${target}map/`);
  });

  it("forwards other query params and the hash verbatim", () => {
    assert.strictEqual(
      getRedirectUrl({ search: "?path=map&a=1&b=2", hash: "#x=1&y" }),
      `${target}map/?a=1&b=2#x=1&y`,
    );
  });

  it("forwards query and hash without a path", () => {
    assert.strictEqual(getRedirectUrl({ search: "?a=1", hash: "#hash" }), `${target}?a=1#hash`);
  });

  it("ignores invalid paths but keeps other params", () => {
    ["../x", "a/b", "a".repeat(65), "", "%2F", "https://evil.com"].forEach((path) => {
      assert.strictEqual(
        getRedirectUrl({ search: `?path=${encodeURIComponent(path)}&a=1` }),
        `${target}?a=1`,
      );
    });
  });

  it("no longer maps #segment to a path", () => {
    assert.strictEqual(getRedirectUrl({ hash: "#segment" }), `${target}#segment`);
  });
});
