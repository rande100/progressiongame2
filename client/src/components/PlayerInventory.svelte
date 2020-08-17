<script>
  import { beforeUpdate, afterUpdate } from "svelte";
  import { formatGear } from "../libraries/Gear.js";

  export let player;
  export let socket;

  let autoscrollContainer;
  let autoscroll;

  const equipItem = event => {
    socket.emit("player equip item", event.target.dataset.inventoryid);
  };

  beforeUpdate(() => {
    autoscroll =
      autoscrollContainer &&
      autoscrollContainer.offsetHeight + autoscrollContainer.scrollTop >
        autoscrollContainer.scrollHeight - 20;
  });

  afterUpdate(() => {
    if (autoscroll)
      autoscrollContainer.scrollTo(0, autoscrollContainer.scrollHeight);
  });
</script>

<style>
  .player-inventory {
    height: 200px;
    overflow-y: scroll;
  }
  .player-inventory ul {
    list-style-type: none;
  }
</style>

<h4>Inventory</h4>

<div class="player-inventory" bind:this={autoscrollContainer}>
  <ul>
  {#if player.inventory}
    {#each player.inventory as item, id}
      <li>{@html formatGear(item)}
      <button type="button" data-inventoryid="{id}" on:click={equipItem}>Equip</button>
      </li>
    {:else}
      <li>None</li>
    {/each}
  {/if}
  </ul>
</div>