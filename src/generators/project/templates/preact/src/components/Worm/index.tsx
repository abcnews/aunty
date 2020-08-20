import { h<% if (isTS) { %>, FunctionalComponent<% } %> } from 'preact';
import styles from './styles.scss';
import worm from './worm.svg';

const Worm<% if (isTS) { %>: FunctionalComponent<% } %> = () => {
  return <img className={styles.root} src={worm} />;
};

export default Worm;
