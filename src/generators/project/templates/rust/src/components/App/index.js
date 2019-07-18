import styles from './styles.scss';

export default function App({ projectName }) {
  this.el = document.createElement('div');
  this.el.className = styles.root;
  this.el.innerHTML = `
    <canvas id="game-of-life-canvas"></canvas>
    <h1>${projectName}</h1>
  `;
}
