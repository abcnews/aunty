import React from 'react';
import styles from './styles';

export default class ErrorBox extends React.Component {
  componentDidMount() {
    console.error(this.props.error);
  }

  render() {
    return <pre style={styles}>{`${String(this.props.error)}\n\n${this.props.error.stack}`}</pre>;
  }
}
