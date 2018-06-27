const styles = require('./styles.scss');

function <%= className %>() {
  this.el = document.createElement('div');
  this.el.className = styles.wrapper;
  this.el.innerHTML = `Find me in src/components/<%= className %>/index.js`;
}

module.exports = <%= className %>;
