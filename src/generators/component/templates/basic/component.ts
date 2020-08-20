import styles from './styles.scss';

export default class <%= className %> {<% if (isTS) { %>
  el: Element;
<% } %>
  constructor() {
    this.el = document.createElement('div');
    this.el.className = styles.root;
    this.el.innerHTML = `Find me in <strong>src/components/<%= className %></strong>`;
  }
}
