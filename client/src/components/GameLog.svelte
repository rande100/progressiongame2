<script>
	import { beforeUpdate, afterUpdate } from "svelte";

	export let gameLog;

	let autoscrollContainer;
	let autoscroll;

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
  .game-log {
    height: 400px;
    overflow-y: scroll;
  }
  .game-log ul {
    list-style-type: none;
  }
</style>

<h4>Game Log</h4>

<div class="game-log" bind:this={autoscrollContainer}>
  <ul>
    {#each gameLog as message}
      <li>{@html message}</li>
    {/each}
  </ul>
</div>