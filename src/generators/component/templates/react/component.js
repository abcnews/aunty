const React = require('react');
const styles = require('./<%= className %>.scss');

class <%= className %> extends React.Component {
  render() {
    return (
      <div className={styles.wrapper}>
        Find me in <strong>src/components/<%= className %>.js</strong>
      </div>
    );
  }
}

module.exports = <%= className %>;