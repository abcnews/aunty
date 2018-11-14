import { h, Component } from 'preact';
import { select } from 'd3-selection';

import styles from './styles.scss';

export default class <%= className %> extends Component {
  constructor(props) {
    super(props);

    this.initGraph = this.initGraph.bind(this);
    this.updateGraph = this.updateGraph.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // TODO: Add any conditions that mitigate updating the graph
    this.updateGraph(nextProps);
  }

  shouldComponentUpdate() {
    // Stop Preact from managing the DOM itself
    return false;
  }

  componentDidMount() {
    this.initGraph(this.props);

    // TODO: add any listeners here
    // ...
  }

  componentWillUnmount() {
    // TODO: remove any listeners here
    // ...
  }

  /**
   * Initialize the graph
   * @param {object} props The latest props that were given to this component
   */
  initGraph(props) {
    this.svg = select(this.base)
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
      .attr('width', 400)
      .attr('height', 300);
  }

  /**
   * Using the latests props, update any values in the graph.
   * @param {object} props The latest props given to this component
   */
  updateGraph(props) {
    // TODO: Use D3 to update the graph
  }

  render() {
    return <div className={styles.root} />;
  }
}
