import React from 'react';
import Worm from '../Worm';
import styles from './styles.scss';
<% if (isTS) { %>
export type AppProps {
  x: number;
  y: string;
  z: boolean;
}
<% } %>
const App<% if (isTS) { %>: React.FC<AppProps><% } %> = ({ x, y, z }) => {
  return (
    <div className={styles.root}>
      <Worm />
      <pre>{JSON.stringify({ x, y, z })}</pre>
      <h1><%= projectName %></h1>
    </div>
  );
};

export default App;
