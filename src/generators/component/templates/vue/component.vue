<template>
  <div :class="$style.root">
    Find me in
    <strong>src/components/<%= className %></strong>
  </div>
</template>

<script<% if (isTS) { %> lang="ts"<% } %>>
import Vue from 'vue';

export default Vue.extend({
  name: '<%= className %>'
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
