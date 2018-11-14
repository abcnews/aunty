import { h, Component } from 'preact';

import styles from './styles.scss';

export default class <%= className %> extends Component {
  render() {
    return (
      <div className={styles.root}>
        Find me in <strong>src/components/<%= className %>/index.js</strong>
      </div>
    );
  }
}
