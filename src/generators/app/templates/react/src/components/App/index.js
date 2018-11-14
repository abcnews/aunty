import React from 'react';
import styles from './styles.scss';
import worm from './worm.svg';

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.root}>
        <img className={styles.worm} src={worm} />
        <h1>{this.props.projectName}</h1>
      </div>
    );
  }
}
