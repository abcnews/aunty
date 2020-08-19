<script<% if (isTS) { %> lang="ts"<% } %>>
import worm from './worm.svg';

export default {
  name: 'Worm',
  data() {
    return {
      worm,
    };
  },
};
</script>

<style lang="scss" module>
.root {
  width: 240px;
  height: auto;
}
</style>

<template>
  <img :class="$style.root" :src="worm" />
</template>
