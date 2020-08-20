import App from './components/App/App.svelte';

const PROJECT_NAME<% if (isTS) { %>: string<% } %> = '<%= projectSlug %>';
const ROOT_SELECTOR = `[data-${PROJECT_NAME}-root]`;

const root = document.querySelector(ROOT_SELECTOR);

if (root) {
  new App({
    target: root,
    props: {
      projectName: PROJECT_NAME
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
