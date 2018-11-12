import styles from './styles.scss';
import worm from './worm.svg';

export default function App({ projectName }) {
  this.el = document.createElement('div');
  this.el.className = styles.root;
  this.el.innerHTML = `
    <img class="${styles.worm}" src="${worm}" />
    <h1>${projectName}</h1>
  `;
}
