import App from './components/App';

const PROJECT_NAME<% if (isTS) { %>: string<% } %> = '<%= projectSlug %>';
const root = document.querySelector(`[data-${PROJECT_NAME}-root]`);

function init() {
  render(new App({ projectName: PROJECT_NAME }).el, root);
}

init();

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      init();
    } catch (err) {
      import('./components/ErrorBox').then(({ default: ErrorBox }) => {
        render(new ErrorBox({ error: err }).el, root);
      });
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}

function render(el<% if (isTS) { %>: Element<% } %>, parentEl<% if (isTS) { %>: Element | null<% } %>) {
  if (parentEl === null) {
    throw new Error('parentEl is not an Element');
  }

  while (parentEl.firstElementChild) {
    parentEl.removeChild(parentEl.firstElementChild);
  }

  parentEl.appendChild(el);
}
