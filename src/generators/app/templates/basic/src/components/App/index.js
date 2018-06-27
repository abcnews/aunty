const styles = require('./styles.scss');
const worm = require('./worm.svg');

function App({ projectName }) {
  this.el = document.createElement('div');
  this.el.className = styles.root;
  this.el.innerHTML = `
    <img class="${styles.worm}" src="${worm}" />
    <h1>${projectName}</h1>
  `;
}

module.exports = App;
