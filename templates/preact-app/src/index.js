const {h, render} = require('preact');

const root = document.querySelector('[data-{{projectName}}-root]');

function init() {
  const App = require('./components/App');

  render(<App />, root, root.firstChild);
}

if (module.hot) {
  module.hot.accept('./components/App', () => requestAnimationFrame(() => {
    try {
      init();
    } catch (err) {
      const ErrorBox = require('./components/ErrorBox');

      render(<ErrorBox error={err} />, root, root.firstChild);
    }
  }));
}

if (process.env.NODE_ENV === 'development') {
  require('preact/devtools');
  
  console.debug(`[{{projectName}}] public path: ${__webpack_public_path__}`);
}

init();
