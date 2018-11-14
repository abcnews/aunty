<template>
  <div :class="$style.root">
    Find me in <strong>src/components/<%= className %>/<%= className %>.vue</strong>
  </div>
</template>

<script>
export default {
  name: '<%= className %>',
  data() {
    return {};
  }
};
</script>

<style lang="scss" module>
.root {
  border: 1px solid rgb(255, 115, 0);
  padding: 20px;
  text-align: center;
  color: black;
}
</style>
