<script<% if (isTS) { %> lang="ts"<% } %>>
  export let color<% if (isTS) { %>: string<% } %> = 'black';

  import { select } from 'd3-selection';<% if (isTS) { %>
  import type { Selection } from 'd3-selection';<% } %>
  import { afterUpdate, onMount } from 'svelte';

  let root<% if (isTS) { %>: HTMLDivElement<% } %>;
  let svg<% if (isTS) { %>: Selection<SVGSVGElement, unknown, null, undefined><% } %>;
  let g<% if (isTS) { %>: Selection<SVGGElement, unknown, null, undefined><% } %>;
  let rect<% if (isTS) { %>: Selection<SVGRectElement, unknown, null, undefined><% } %>;

  onMount(() => {
    svg = select(root)
      .append('svg')
      .attr('width', 400)
      .attr('height', 300);

    g = svg.append('g').attr('fill', color);

    rect = g
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', '100%')
      .attr('height', '100%');
  });

  afterUpdate(() => {
    g.attr('fill', color);
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

<div bind:this={root} />
