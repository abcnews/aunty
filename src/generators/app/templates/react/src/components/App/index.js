const React = require('react');
const styles = require('./styles.scss');
const worm = require('./worm.svg');

class App extends React.Component {
  render() {
    return (
      <div className={styles.root}>
        <img className={styles.worm} src={worm} />
        <h1>{this.props.projectName}</h1>
      </div>
    );
  }
}

module.exports = App;
