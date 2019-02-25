import style from './style';
import src from './worm.svg';

export default function Worm() {
  this.el = document.createElement('img');
  Object.keys(style).forEach(key => (this.el.style[key] = style[key]));
  this.el.src = src;
}
