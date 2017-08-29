const {h, Component} = require('preact');
const styles = require('./App.scss');
const worm = require('./worm.svg');

class App extends Component {
  render() {
    return (
      <div className={styles.root}>
        <img className={styles.worm} src={worm} />
        <h1>{{projectName}}</h1>
      </div>
    );
  }
}

module.exports = App;
