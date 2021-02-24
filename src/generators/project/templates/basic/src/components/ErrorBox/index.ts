import styles from './styles.scss';
<% if (isTS) { %>
type ErrorBoxProps = {
  error: Error;
}
<% } %>
export default class ErrorBox {<% if (isTS) { %>
  el: Element;
<% } %>
  constructor({ error }<% if (isTS) { %>: ErrorBoxProps<% } %>) {
    const el = (this.el = document.createElement('pre'));

    el.className = styles.root;
    el.textContent = `${String(error)}\n\n${error.stack}`;

    (function logOnMount() {
      if (!el.parentNode) {
        return setTimeout(logOnMount, 100);
      }

      console.error(error);
    })();
  }
}
