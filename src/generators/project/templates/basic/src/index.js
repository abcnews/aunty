import App from './components/App';

const PROJECT_NAME = '<%= projectSlug %>';
const root = document.querySelector(`[data-${PROJECT_NAME}-root]`);

function init() {
  root.appendChild(new App({ projectName: PROJECT_NAME }).el);
}

init();

if (module.hot) {
  module.hot.accept('./components/App', async () => {
    root.removeChild(root.firstChild);

    try {
      init();
    } catch (err) {
      const ErrorBox = (await import('aunty-error-box')).default;
      root.appendChild(new ErrorBox({ error: err }).el);
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
