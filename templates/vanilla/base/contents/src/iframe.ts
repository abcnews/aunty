/**
 * @file
 * Any iframe-specific config you need to include. E.g. query string parsing.
 */
import "./index.ts";

// Emit resize events to resize when embedded inside an article
let prevHeight = 0;
function emitResize(height = 0) {
  if (prevHeight === height) return;
  prevHeight = height;
  window.parent?.postMessage({ type: "embed-size", height }, "*");
}
const observer = new ResizeObserver(() =>
  emitResize(document.documentElement.offsetHeight),
);
observer.observe(document.documentElement);
