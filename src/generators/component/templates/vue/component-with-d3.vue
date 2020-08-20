<script<% if (isTS) { %> lang="ts"<% } %>>
import Vue from 'vue';
import { select<% if (isTS) { %>, Selection<% } %> } from 'd3-selection';
<% if (isTS) { %>
interface <%= className %>Data {
  svg: Selection<SVGSVGElement, unknown, null, undefined> | null;
  g: Selection<SVGGElement, unknown, null, undefined> | null;
  rect: Selection<SVGRectElement, unknown, null, undefined> | null;
}
<% } %>
export default Vue.extend({
  name: '<%= className %>'<% if (isTS) { %> as string<% } %>,
  props: {
    color: {<% if (isTS) { %>
      type: String,<% } %>
      default: 'black'
    }
  },
  data()<% if (isTS) { %>: ThingD3Data<% } %> {
    return {
      svg: null,
      g: null,
      rect: null
    };
  },
  mounted() {
    this.svg = select(this.$el)
      .append('svg')
      .attr('width', 400)
      .attr('height', 300);

    this.g = this.svg.append('g').attr('fill', this.color);

    this.rect = this.g
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', '100%')
      .attr('height', '100%');
  },
  watch: {
    color(value, lastValue) {
      if (!this.g) {
        return;
      }

      this.g.attr('fill', value);
    }
  }
});
</script>

<style lang="scss" module>
.root {
  border: 1px solid rgb(255, 115, 0);
  padding: 20px;
  text-align: center;
  color: black;
}
</style>

<template>
  <div :class="$style.root"></div>
</template>
