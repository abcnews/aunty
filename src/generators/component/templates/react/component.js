import React from 'react';
import styles from './styles.scss';

export default props => {
  return (
    <div className={styles.root}>
      Find me in <strong>src/components/<%= className %>/index.js</strong>
    </div>
  );
}
