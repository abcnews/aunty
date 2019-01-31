import styles from './styles';

export default function ErrorBox({ error }) {
  const el = (this.el = document.createElement('pre'));

  Object.keys(styles).forEach(attr => {
    el.style[attr] = styles[attr];
  });
  el.textContent = `${String(error)}\n\n${error.stack}`;

  (function logOnMount() {
    if (!el.parentNode) {
      return setTimeout(logOnMount, 100);
    }

    console.error(error);
  })();
}
