import Vue from "vue";

const root = document.querySelector(`[data-<%= projectSlug %>-root]`);
const PROJECT_NAME = "<%= projectSlug %>";

function init() {
  let appEl = document.createElement("app");
  root.appendChild(appEl);
  const App = require("./components/App.vue").default;
  new Vue({
    el: `[data-${PROJECT_NAME}-root] > app`,
    data: { test: "test" },
    render: h =>
      h(App, {
        props: {
          projectName: PROJECT_NAME
        }
      })
  });
}

if (module.hot) {
  try {
    init();
  } catch (err) {
    let appEl = document.createElement("app");
    root.appendChild(appEl);
    const ErrorBox = require("./components/ErrorBox.vue").default;
    new Vue({
      el: `[data-${PROJECT_NAME}-root]`,
      render: h =>
        h(ErrorBox, {
          props: {
            errorMessage: err.stack
          }
        })
    });
  }
} else {
  init();
}

// Log some developement info to th console
if (process.env.NODE_ENV === "development") {
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
