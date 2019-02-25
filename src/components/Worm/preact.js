import { h } from 'preact';
import style from './style';
import src from './worm.svg';

export default function Worm() {
  return <img style={style} src={src} />;
}
