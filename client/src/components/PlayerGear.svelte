<script>
  import { formatGear } from "../libraries/Gear.js";

  export let player;
</script>

<h4>Gear</h4>

<div>
	Weapon:
	{#if player.gear && player.gear.weapon && player.gear.weapon.name}
	  {@html formatGear(player.gear.weapon)}
	{:else}
	  None
	{/if}
</div>

{#each ["head", "chest", "hands", "legs", "feet"] as slot}
<div>
  {slot}:
  {#if player.gear && player.gear[slot] && player.gear[slot]["name"]}
    {@html formatGear(player.gear[slot])}
  {:else}
    None
  {/if}
</div>
{/each}
