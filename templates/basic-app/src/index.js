const PROJECT_NAME = '{{projectName}}';
const root = document.querySelector(`[data-${PROJECT_NAME}-root]`);

function init() {
  const App = require('./components/App');

  root.appendChild(new App({ projectName: PROJECT_NAME }).el);
}

init();

if (module.hot) {
  module.hot.accept('./components/App', () => {
    root.removeChild(root.firstChild);

    try {
      init();
    } catch (err) {
      const ErrorBox = require('./components/ErrorBox');

      root.appendChild(new ErrorBox({ error: err }).el);
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
