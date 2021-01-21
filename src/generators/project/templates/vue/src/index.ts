import * as acto from '@abcnews/alternating-case-to-object';
import { <% if (isOdyssey) { %>whenOdysseyLoaded<% } else { %>whenDOMReady<% } %> } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';<% if (isTS) { %>
import type { Mount } from '@abcnews/mount-utils';<% } %>
import Vue from 'vue';
import App from './components/App/App.vue';

let appMountEl<% if (isTS) { %>: Mount<% } %>;
let appProps;

<% if (isOdyssey) { %>whenOdysseyLoaded<% } else { %>whenDOMReady<% } %>.then(() => {
  [appMountEl] = selectMounts('<%= projectNameFlat %>');

  if (appMountEl) {
    appProps = acto(getMountValue(appMountEl));
    appMountEl.appendChild(document.createElement('div'));
    new Vue({
      el: `[data-mount-used="${appMountEl.getAttribute('data-mount-used')}"] > div`,
      render: h =>
        h(App, {
          props: appProps
        })
    });
  }
});

if (process.env.NODE_ENV === 'development') {
  console.debug(`[<%= projectName %>] public path: ${__webpack_public_path__}`);
}
