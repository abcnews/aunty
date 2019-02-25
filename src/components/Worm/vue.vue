<template>
  <img :src="src" :style="style">
</template>

<script>
import style from './style';
import src from './worm.svg';

export default {
  name: 'Worm',
  props: [],
  components: {},
  data() {
    return {
      src,
      style
    };
  }
};
</script>
