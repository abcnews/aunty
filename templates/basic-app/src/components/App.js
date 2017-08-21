const styles = require('./App.scss');
const worm = require('./worm.svg');

function App() {
  this.el = document.createElement('div');
  this.el.className = styles.root;
  this.el.innerHTML = `
    <img class="${styles.worm}" src="${worm}" />
    <h1>{{projectName}}</h1>
  `;
}

module.exports = App;
