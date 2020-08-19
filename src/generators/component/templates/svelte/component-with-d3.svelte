<script>
  import { select } from 'd3-selection';
  import { onMount } from 'svelte';

  let rootEl;
  let svgEl;
  let gEl;
  let rectEl;

  onMount(() => {
    svgEl = select(rootEl)
      .append('svg')
      .attr('width', 400)
      .attr('height', 300);

    gEl = svgEl.append('g').attr('fill', 'black');

    rectEl = gEl
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', 400)
      .attr('height', 300);
  });
</script>

<style lang="scss">
  div {
    border: 1px solid rgb(255, 115, 0);
    padding: 20px;
    text-align: center;
    color: black;
  }
</style>

<div bind:this={rootEl} />
