import { select<% if (isTS) { %>, Selection<% } %> } from 'd3-selection';
import styles from './styles.scss';

export default class <%= className %> {<% if (isTS) { %>
  el: Element;
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  g: Selection<SVGGElement, unknown, null, undefined>;
  rect: Selection<SVGRectElement, any, any, any>;
<% } %>
  constructor() {
    this.el = document.createElement('div');
    this.el.className = styles.root;

    this.svg = select(this.el)
      .append('svg')
      .attr('width', 400)
      .attr('height', 300);

    this.g = this.svg.append('g').attr('fill', 'black');

    this.rect = this.g
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', '100%')
      .attr('height', '100%');
  }
}
