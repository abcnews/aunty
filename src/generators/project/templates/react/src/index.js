import React from 'react';
import { render } from 'react-dom';
import App from './components/App';

const PROJECT_NAME = '<%= projectSlug %>';
const root = document.querySelector(`[data-${PROJECT_NAME}-root]`);

function init() {
  render(<App projectName={PROJECT_NAME} />, root);
}

init();

if (module.hot) {
  module.hot.accept('./components/App', async () => {
    try {
      init();
    } catch (err) {
      const ErrorBox = (await import('./components/ErrorBox')).default;
      render(<ErrorBox error={err} />, root);
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
