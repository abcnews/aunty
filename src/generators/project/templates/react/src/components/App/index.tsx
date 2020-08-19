import React from 'react';
import Worm from '../Worm';
import styles from './styles.scss';
<% if (isTS) { %>
interface AppProps {
  projectName: string;
}
<% } %>
const App<% if (isTS) { %>: React.FC<AppProps><% } %> = ({ projectName }) => {
  return (
    <div className={styles.root}>
      <Worm />
      <h1>{projectName}</h1>
    </div>
  );
};

export default App;
