import { select<% if (isTS) { %>, Selection<% } %> } from 'd3-selection';
import React, { useEffect, useRef } from 'react';
import styles from './styles.scss';
<% if (isTS) { %>
type <%= className %>Props {
  color?: string;
}
<% } %>
const <%= className %><% if (isTS) { %>: React.FC<<%= className %>Props><% } %> = ({ color = 'black' }) => {
  const root = useRef<% if (isTS) { %><HTMLDivElement | null><% } %>(null);
  const svg = useRef<% if (isTS) { %><Selection<SVGSVGElement, unknown, null, undefined> | null><% } %>(null);
  const g = useRef<% if (isTS) { %><Selection<SVGGElement, unknown, null, undefined> | null><% } %>(null);
  const rect = useRef<% if (isTS) { %><Selection<SVGRectElement, unknown, null, undefined> | null><% } %>(null);

  useEffect(() => {
    svg.current = select(root.current)
      .append('svg')
      .attr('width', 400)
      .attr('height', 300);

    g.current = svg.current.append('g');

    rect.current = g.current
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', '100%')
      .attr('height', '100%');
  }, []);

  useEffect(() => {
    if (!g.current) {
      return;
    }

    g.current.attr('fill', color);
  }, [color]);

  return <div ref={root} className={styles.root}></div>;
};

export default <%= className %>;
