<script>
  import worm from './worm.svg';

  export let projectName;
</script>

<style lang="scss">
  div {
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

  img {
    width: 240px;
    height: auto;
  }
</style>

<div>
  <img src={worm} alt="" />
  <h1>{projectName}</h1>
</div>
