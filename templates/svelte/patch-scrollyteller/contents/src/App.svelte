<script lang="ts">
  import Scrollyteller from "@abcnews/svelte-scrollyteller";
  import Worm from "./components/Worm/Worm.svelte";
  import { untrack } from "svelte";
  import { type PanelData } from "../types";

  interface Panel {
    data: PanelData;
    nodes: Element[];
  }

  let { panels }: { panels: Panel[] } = $props();
  let options = $state(untrack(() => panels[0]?.data));

  const setConfig = (data: PanelData) => {
    options = data;
  };
</script>

{#if options}
  <Scrollyteller
    {panels}
    onMarker={setConfig}
    layout={{ resizeInteractive: true }}
  >
    <div class="container">
      <Worm colour={options.colour} />
    </div>
  </Scrollyteller>
{/if}

<style type="scss">
  .container {
    width: 100%;
    height: 100%;
  }
</style>
