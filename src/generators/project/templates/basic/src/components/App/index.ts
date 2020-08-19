import Worm from '../Worm';
import styles from './styles.scss';
<% if (isTS) { %>
interface AppProps {
  projectName: string;
}
<% } %>
export default class App {<% if (isTS) { %>
  el: Element;
<% } %>
  constructor({ projectName }<% if (isTS) { %>: AppProps<% } %>) {
    this.el = document.createElement('div');
    this.el.className = styles.root;
    this.el.innerHTML = `
      ${new Worm().el.outerHTML}
      <h1>${projectName}</h1>
    `;
  }
}
