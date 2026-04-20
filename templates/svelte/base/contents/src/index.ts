/**
 * @file
 * Entrypoint. Creates a non-module es5entry.js in your build.
 */
import acto from '@abcnews/alternating-case-to-object';
import { whenDOMReady } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import App from './App.svelte';
import { mount } from 'svelte';

whenDOMReady.then(() => {
  const [appMountEl] = selectMounts('__PROJECT_NAME_ACTO__');

  if (appMountEl) {
    const appProps = acto(getMountValue(appMountEl));

    mount(App, {
      target: appMountEl,
      props: appProps
    });
  }
});

export default App;
