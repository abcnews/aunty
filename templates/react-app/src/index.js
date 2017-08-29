const React = require('react');
const {render} = require('react-dom');

const root = document.querySelector('[data-{{projectName}}-root]');

function init() {
  const App = require('./components/App');

  render(<App />, root);
}

init();

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      init();
    } catch (err) {
      const ErrorBox = require('./components/ErrorBox');

      render(<ErrorBox error={err} />, root);
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[{{projectName}}] public path: ${__webpack_public_path__}`);
}
