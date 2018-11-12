import d3 from 'd3-selection';

import styles from './styles.scss';

export default function <%= className %>() {
  this.el = document.createElement('div');
  this.el.className = styles.wrapper;
  
  this.svg = d3
  .select(this.el)
  .append('svg')
  .attr('width', 400)
  .attr('height', 300);

  this.g = this.svg.append('g')
    .attr('fill', 'black');

  this.rect = this.g.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('width', 400)
    .attr('height', 300);
}
