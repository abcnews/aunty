import Vue from 'vue';
import App from './components/App/App.vue';

const PROJECT_NAME<% if (isTS) { %>: string<% } %> = '<%= projectSlug %>';
const ROOT_SELECTOR = `[data-${PROJECT_NAME}-root]`;

const root = document.querySelector(ROOT_SELECTOR);

if (root) {
  root.appendChild(document.createElement('div'));

  new Vue({
    el: `${ROOT_SELECTOR} > div`,
    render: h =>
      h(App, {
        props: {
          projectName: PROJECT_NAME
        }
      })
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
