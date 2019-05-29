import React from 'react';
import styles from './styles.scss';
import worm from './worm.svg';

export default props => {
  return (
    <div className={styles.root}>
      <img className={styles.worm} src={worm} />
      <h1>{props.projectName}</h1>
    </div>
  );
};
