import Worm from 'aunty-worm';
import styles from './styles.scss';

export default function App({ projectName }) {
  this.titleEl = document.createElement('h1');
  this.titleEl.textContent = projectName;
  this.el = document.createElement('div');
  this.el.className = styles.root;
  this.el.appendChild(new Worm().el);
  this.el.appendChild(this.titleEl);
}
