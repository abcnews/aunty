import { h, render } from 'preact';
import App from './components/App';

const PROJECT_NAME<% if (isTS) { %>: string<% } %> = '<%= projectSlug %>';
const root = document.querySelector(`[data-${PROJECT_NAME}-root]`);

function init() {
  if (root) {
    render(<App projectName={PROJECT_NAME} />, root);
  }
}

init();

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      init();
    } catch (err) {
      import('./components/ErrorBox').then(({ default: ErrorBox }) => {
        if (root) {
          render(<ErrorBox error={err} />, root);
        }
      });
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  require('preact/debug');
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
