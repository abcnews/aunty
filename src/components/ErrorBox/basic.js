import style from './style';

export default function ErrorBox({ error }) {
  this.el = document.createElement('pre');
  Object.keys(style).forEach(key => (this.el.style[key] = style[key]));
  this.el.textContent = `${String(error)}\n\n${error.stack}`;

  (function logOnMount(el) {
    if (!el.parentNode) {
      return setTimeout(logOnMount, 100, el);
    }

    console.error(error);
  })(this.el);
}
