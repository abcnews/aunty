const PROJECT_NAME = '<%= projectSlug %>';
const root = document.querySelector(`[data-${PROJECT_NAME}-root]`);

function init() {
  import App from './components/App';
  root.appendChild(new App({ projectName: PROJECT_NAME }).el);
}

init();

if (module.hot) {
  module.hot.accept('./components/App', () => {
    root.removeChild(root.firstChild);

    try {
      init();
    } catch (err) {
      import ErrorBox from './components/ErrorBox';
      root.appendChild(new ErrorBox({ error: err }).el);
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
