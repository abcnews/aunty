import "./style.css";/**
 * @file
 * Entrypoint. Creates a non-module es5entry.js in your build.
 */
import acto from '@abcnews/alternating-case-to-object';
import { whenDOMReady } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';

whenDOMReady.then(() => {
  const [appMountEl] = selectMounts('__PROJECT_NAME_ACTO__');

  if (appMountEl) {
    const appProps = acto(getMountValue(appMountEl));

    appMountEl.innerText = `hello world ${JSON.stringify(appProps)}`
  }
});
