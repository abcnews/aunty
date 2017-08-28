const root = document.querySelector('[data-{{projectName}}-root]');

function init() {
  const App = require('./components/App');

  root.appendChild((new App()).el);
}

if (module.hot) {
  module.hot.accept('./components/App', () => requestAnimationFrame(() => {
    root.removeChild(root.firstChild);

    try {
      init();
    } catch (err) {
      const ErrorBox = require('./components/ErrorBox');

      root.appendChild((new ErrorBox(err)).el);
    }
  }));
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[{{projectName}}] public path: ${__webpack_public_path__}`);
}

init();
