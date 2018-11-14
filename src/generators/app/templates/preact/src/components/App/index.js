import { h, Component } from 'preact';
import styles from './styles.scss';
import worm from './worm.svg';

export default class App extends Component {
  render({ projectName }) {
    return (
      <div className={styles.root}>
        <img className={styles.worm} src={worm} />
        <h1>{projectName}</h1>
      </div>
    );
  }
}
