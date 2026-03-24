<script lang="ts">
  import wormSrc from './worm.svg?raw';
</script>

<div class="worm">
  {@html wormSrc}
</div>

<style lang="scss">
  .worm {
    max-width: 320px;
    width: 100%;
    display: inline-block;

    :global(svg) {
      width: 100%;
      height: auto;
      display: block;
    }

    :global(path) {
      animation: rainbow 5s linear infinite;
    }
  }

  @keyframes rainbow {
    0% {
      fill: hsl(0, 100%, 50%);
    }
    14% {
      fill: hsl(51, 100%, 50%);
    }
    28% {
      fill: hsl(102, 100%, 50%);
    }
    42% {
      fill: hsl(153, 100%, 50%);
    }
    57% {
      fill: hsl(204, 100%, 50%);
    }
    71% {
      fill: hsl(255, 100%, 50%);
    }
    85% {
      fill: hsl(306, 100%, 50%);
    }
    100% {
      fill: hsl(360, 100%, 50%);
    }
  }
</style>
