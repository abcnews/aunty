<script<% if (isTS) { %> lang="ts"<% } %>>
  import Worm from '../Worm/Worm.svelte';

  export let x<% if (isTS) { %>: number<% } %>;
  export let y<% if (isTS) { %>: string<% } %>;
  export let z<% if (isTS) { %>: boolean<% } %>;
</script>

<div>
  <Worm />
  <pre>{JSON.stringify({ x, y, z })}</pre>
  <h1><%= projectName %></h1>
</div>

<style lang="scss">
  div {
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
  }

  h1 {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    font-size: 24px !important;
    font-weight: normal !important;
    line-height: normal !important;
    letter-spacing: normal !important;
  }
</style>
