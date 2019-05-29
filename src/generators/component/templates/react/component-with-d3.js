import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { select } from 'd3-selection';
import styles from './styles.scss';

let svg;
let group;
let rect;

export default props => {
  const root = useRef();

  useLayoutEffect(() => {
    // Initialise the SVG
    svg = select(root.current)
      .append('svg')
      .attr('width', 400)
      .attr('height', 300);

    group = svg.append('g').attr('fill', 'black');

    rect = group
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', 400)
      .attr('height', 300);
  }, []);

  useEffect(() => {
    updateChart(props);
  }, [props]); // TODO: be more specific with your change checkers

  // Example effect to update chart on window resize
  useEffect(() => {
    const onResize = () => updateChart(props);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function updateChart(props) {
    // TODO: update the SVG
  }

  return <div className={styles.root} ref={root} />;
};
