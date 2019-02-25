import Worm from 'aunty-worm';
import React from 'react';
import styles from './styles.scss';

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.root}>
        <Worm />
        <h1>{this.props.projectName}</h1>
      </div>
    );
  }
}
