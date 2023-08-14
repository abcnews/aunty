import acto from '@abcnews/alternating-case-to-object';
import { <% if (isOdyssey) { %>whenOdysseyLoaded<% } else { %>whenDOMReady<% } %> } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';<% if (isTS) { %>
import type { Mount } from '@abcnews/mount-utils';<% } %>
import { h, render } from 'preact';
import App from './components/App';<% if (isTS) { %>
import type { AppProps } from './components/App';<% } %>

let appMountEl<% if (isTS) { %>: Mount<% } %>;
let appProps<% if (isTS) { %>: AppProps<% } %>;

function renderApp() {
  render(<App {...appProps} />, appMountEl);
}

<% if (isOdyssey) { %>whenOdysseyLoaded<% } else { %>whenDOMReady<% } %>.then(() => {
  [appMountEl] = selectMounts('<%= projectNameFlat %>');

  if (appMountEl) {
    appProps = acto(getMountValue(appMountEl))<% if (isTS) { %> as AppProps<% } %>;
    renderApp();
  }
});

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      renderApp();
    } catch (err<% if (isTS) { %>: any<% } %>) {
      import('./components/ErrorBox').then(({ default: ErrorBox }) => {
        if (appMountEl) {
          render(<ErrorBox error={err} />, appMountEl);
        }
      });
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  require('preact/debug');
  console.debug(`[<%= projectName %>] public path: ${__webpack_public_path__}`);
}
