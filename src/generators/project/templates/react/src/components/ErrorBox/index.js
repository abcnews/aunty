import React, { useEffect } from 'react';
import styles from './styles.css';

export default props => {
  useEffect(() => console.log(props.error), []);

  return <pre className={styles.root}>{`${String(props.error)}\n\n${props.error.stack}`}</pre>;
};
