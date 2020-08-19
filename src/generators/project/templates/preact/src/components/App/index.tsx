import { h<% if (isTS) { %>, FunctionalComponent<% } %> } from 'preact';
import Worm from '../Worm';
import styles from './styles.scss';
<% if (isTS) { %>
interface AppProps {
  projectName: string;
}
<% } %>
const App<% if (isTS) { %>: FunctionalComponent<AppProps><% } %> = ({ projectName }) => {
  return (
    <div className={styles.root}>
      <Worm />
      <h1>{projectName}</h1>
    </div>
  );
};

export default App;
