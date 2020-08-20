<script<% if (isTS) { %> lang="ts"<% } %>>
import Vue from 'vue';
import Worm from '../Worm/Worm.vue';

export default Vue.extend({
  name: 'App',
  props: {
    projectName: String
  },
  components: {
    'worm-component': Worm
  }
});
</script>

<style lang="scss" module>
.root {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 320px;
  background-color: #<% if (isTS) { %>3178c7<% } else { %>f0db4e<% } %>;
  color: #<% if (isTS) { %>fff<% } else { %>000<% } %>;
  text-align: center;

  h1 {
    margin-bottom: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    font-size: 24px !important;
    font-weight: normal !important;
    line-height: normal !important;
    letter-spacing: normal !important;
  }
}
</style>

<template>
  <div :class="$style.root">
    <worm-component />
    <h1>{{ projectName }}</h1>
  </div>
</template>
