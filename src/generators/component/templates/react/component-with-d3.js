const React = require('react');
const d3 = require('d3-selection');

const styles = require('./<%= className %>.scss');

class <%= className %> extends React.Component {
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
    if (!this.wrapper) return;

    this.svg = d3
      .select(this.wrapper)
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

  /**
   * Update the graph. It is important to only update this component through normal D3 methods.
   * @param {object} props The latest props given to this component
   */
  updateGraph(props) {
    if (!this.wrapper) return;

    // TODO: Use D3 to update the graph
  }

  render() {
    return <div className={styles.wrapper} ref={el => (this.wrapper = el)} />;
  }
}

module.exports = <%= className %>;