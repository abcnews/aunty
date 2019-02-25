import Worm from 'aunty-worm';
import { h, Component } from 'preact';
import styles from './styles.scss';

export default class App extends Component {
  render({ projectName }) {
    return (
      <div className={styles.root}>
        <Worm />
        <h1>{projectName}</h1>
      </div>
    );
  }
}
