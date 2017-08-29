const style = require('./ErrorBox.css');

function ErrorBox(err) {
  const el = this.el = document.createElement('pre');

  el.className = style;
  el.textContent = err.stack;

  (function logOnMount() {
    if (!el.parentNode) {
      return setTimeout(logOnMount, 100);
    }

    console.error(err);
  })();
}

module.exports = ErrorBox;
