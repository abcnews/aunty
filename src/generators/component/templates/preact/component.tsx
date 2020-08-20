import { h<% if (isTS) { %>, FunctionalComponent<% } %> } from 'preact';
import styles from './styles.scss';
<% if (isTS) { %>
interface <%= className %>Props {}
<% } %>
const <%= className %><% if (isTS) { %>: FunctionalComponent<<%= className %>Props><% } %> = () => {
  return (
    <div className={styles.root}>
      Find me in <strong>src/components/<%= className %></strong>
    </div>
  );
};

export default <%= className %>;
