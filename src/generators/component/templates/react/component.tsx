import React from 'react';
import styles from './styles.scss';
<% if (isTS) { %>
type <%= className %>Props = {}
<% } %>
const <%= className %><% if (isTS) { %>: React.FC<<%= className %>Props><% } %> = () => {
  return (
    <div className={styles.root}>
      Find me in <strong>src/components/<%= className %></strong>
    </div>
  );
}

export default <%= className %>;
