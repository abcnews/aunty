import React from 'react';
import styles from './styles.scss';
import worm from './worm.svg';

const Worm<% if (isTS) { %>: React.FC<% } %> = () => {
  return <img className={styles.root} src={worm} />;
};

export default Worm;
