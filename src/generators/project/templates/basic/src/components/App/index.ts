import Worm from '../Worm';
import styles from './styles.scss';
<% if (isTS) { %>
export type AppProps = {
  x: number;
  y: string;
  z: boolean;
}
<% } %>
export default class App {<% if (isTS) { %>
  el: Element;
<% } %>
  constructor({ x, y, z }<% if (isTS) { %>: AppProps<% } %>) {
    this.el = document.createElement('div');
    this.el.className = styles.root;
    this.el.innerHTML = `
      ${new Worm().el.outerHTML}
      <pre>${JSON.stringify({ x, y, z })}</pre>
      <h1><%= projectName %></h1>
    `;
  }
}
