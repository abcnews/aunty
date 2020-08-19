import styles from './styles.scss';
import worm from './worm.svg';

export default class Worm {<% if (isTS) { %>
  el: HTMLImageElement;
<% } %>
  constructor() {
    this.el = document.createElement('img');
    this.el.className = styles.root;
    this.el.src = worm;
  }
}
