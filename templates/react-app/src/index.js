const React = require('react');
const {render} = require('react-dom');

const root = document.querySelector('[data-{{projectName}}-root]');

function init() {
  const App = require('./components/App');

  render(<App />, root);
}

if (module.hot) {
  module.hot.accept('./components/App', () => requestAnimationFrame(() => {
    try {
      init();
    } catch (err) {
      const ErrorBox = require('./components/ErrorBox');

      render(<ErrorBox error={err} />, root);
    }
  }));
}

init();
