import acto from '@abcnews/alternating-case-to-object';
import { <% if (isOdyssey) { %>whenOdysseyLoaded<% } else { %>whenDOMReady<% } %> } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import React from 'react';
import { createRoot<% if (isTS) { %>, Root<% } %> } from 'react-dom/client';
import App from './components/App';<% if (isTS) { %>
import type { AppProps } from './components/App';<% } %>

let root<% if (isTS) { %>: Root<% } %>;
let appProps<% if (isTS) { %>: AppProps<% } %>;

function renderApp() {
  root.render(<App {...appProps} />);
}

<% if (isOdyssey) { %>whenOdysseyLoaded<% } else { %>whenDOMReady<% } %>.then(() => {
  const [appMountEl] = selectMounts('<%= projectNameFlat %>');

  if (appMountEl) {
    root = createRoot(appMountEl);
    appProps = acto(getMountValue(appMountEl))<% if (isTS) { %> as AppProps<% } %>;
    renderApp();
  }
});

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      renderApp();
    } catch (err: any) {
      import('./components/ErrorBox').then(({ default: ErrorBox }) => {
        root.render(<ErrorBox error={err} />);
      });
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[<%= projectName %>] public path: ${__webpack_public_path__}`);
}
