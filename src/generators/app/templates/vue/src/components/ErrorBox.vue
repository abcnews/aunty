<template>
  <div class="root">
    <code>Error: {{ errorMessage }}</code>
  </div>
</template>

<script>
export default {
  name: 'App',
  props: ['errorMessage'],
  data() {
    return {};
  }
};
</script>

<style lang="scss" scoped>
.root {
  position: fixed;
  overflow: auto;
  left: 0;
  top: 0;
  z-index: 10000;
  box-sizing: border-box;
  margin: 0;
  padding: 2rem;
  width: 100vw;
  height: 100vh;
  background-color: #900;
  color: #fff;
  font-family: Menlo, Consolas, monospace;
  font-size: large;
}
</style>
