import { h<% if (isTS) { %>, type FunctionalComponent<% } %> } from 'preact';
import Worm from '../Worm';
import styles from './styles.scss';
<% if (isTS) { %>
export type AppProps = {
  x: number;
  y: string;
  z: boolean;
}
<% } %>
const App<% if (isTS) { %>: FunctionalComponent<AppProps><% } %> = ({ x, y, z }) => {
  return (
    <div className={styles.root}>
      <Worm />
      <pre>{JSON.stringify({ x, y, z })}</pre>
      <h1><%= projectName %></h1>
    </div>
  );
};

export default App;
