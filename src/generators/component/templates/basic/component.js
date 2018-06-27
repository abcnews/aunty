const styles = require('./<%= className %>.scss');

function <%= className %>() {
  this.el = document.createElement('div');
  this.el.className = styles.wrapper;
  this.el.innerHTML = `Find me in src/components/<%= className %>.js`;
}

module.exports = <%= className %>;
