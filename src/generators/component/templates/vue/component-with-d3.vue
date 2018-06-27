<template>
  <div></div>
</template>

<script>
const d3 = require("d3-selection");

export default {
  name: "<%= className %>",
  props: {
    data: {
      default: "red"
    }
  },
  watch: {
    data(newVal, oldVal) {
      // TODO: Use D3 to update the graphic like this:
      this.g.attr("fill", newVal);
    }
  },
  mounted() {
    this.svg = d3
      .select(this.$el)
      .append("svg")
      .attr("width", 400)
      .attr("height", 300);

    this.g = this.svg.append("g").attr("fill", this.data);

    this.rect = this.g
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("width", 400)
      .attr("height", 300);
  },
  data() {
    return {};
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  border: 1px solid rgb(255, 115, 0);
  padding: 20px;
  text-align: center;
  color: black;
}
</style>
