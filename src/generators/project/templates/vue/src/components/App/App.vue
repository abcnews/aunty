<template>
  <div :class="$style.root">
    <img :class="$style.worm" :src="worm" />
    <h1>{{ projectName }}</h1>
    <!-- <new-component></new-component> -->
  </div>
</template>

<script>
import worm from './worm.svg';
// import NewComponent from "../NewComponent/NewComponent.vue";

export default {
  name: 'App',
  props: ['projectName'],
  // components: {
  //   "new-component": NewComponent
  // },
  data() {
    return {
      worm: worm
    };
  }
};
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
  background-color: #ffc100;
  color: #fff;
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

.worm {
  width: 240px;
  height: auto;
}
</style>
