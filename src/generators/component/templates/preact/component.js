const { h, Component } = require('preact');

const styles = require('./styles.scss');

class <%= className %> extends Component {
  render() {
    return (
      <div className={styles.wrapper}>
        Find me in <strong>src/components/<%= className %>/index.js</strong>
      </div>
    );
  }
}

module.exports = <%= className %>;