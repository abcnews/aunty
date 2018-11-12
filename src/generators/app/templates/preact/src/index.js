import { h, render }  from 'preact';

const PROJECT_NAME = '<%= projectSlug %>';
const root = document.querySelector(`[data-${PROJECT_NAME}-root]`);

function init() {
  import App from './components/App';
  render(<App projectName={PROJECT_NAME} />, root, root.firstChild);
}

init();

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      init();
    } catch (err) {
      import ErrorBox from './components/ErrorBox';
      render(<ErrorBox error={err} />, root, root.firstChild);
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  require('preact/devtools');
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
