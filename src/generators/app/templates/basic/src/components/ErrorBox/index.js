import styles from './styles.css';

export default function ErrorBox({ error }) {
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
