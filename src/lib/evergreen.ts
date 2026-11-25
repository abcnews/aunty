/**
 * Builds the `<major>.x.x-latest.html` page that redirects CMS iframes to the latest release.
 *
 * Redirect rules (run in the browser):
 * - `?path=<segment>` picks a sub-folder of the release, e.g. `?path=map` → `<version>/map/`.
 *   It must match `^[a-z0-9-]{1,64}$` so a link can't do path traversal or redirect off-site.
 *   An invalid value is ignored and the redirect goes to the release root.
 * - All other query params are forwarded, minus `path`.
 * - The hash is forwarded verbatim, because the embedded app owns it.
 *
 * The `<noscript>` fallback can't read the URL, so it always goes to the release root.
 */
export function getEvergreenRedirectHtml({
  target,
  version,
}: {
  /** Absolute URL of the release folder, ending in `/` */
  target: string;
  version: string;
}): string {
  return `<!doctype html>
<meta charset="utf-8">
<meta name="color-scheme" content="light dark">
<meta name="version" content="${version}">
<title>Loading…</title>
<style>:root{color-scheme:light dark}html,body{background:transparent;margin:0}</style>
<script>
var params=new URLSearchParams(location.search);
var path=params.get("path");
params.delete("path");
var query=params.toString();
location.replace(${JSON.stringify(target)}+(path&&/^[a-z0-9-]{1,64}$/i.test(path)?path+"/":"")+(query?"?"+query:"")+location.hash);
</script>
<noscript><meta http-equiv="refresh" content="0;url=${target}"></noscript>
`;
}
