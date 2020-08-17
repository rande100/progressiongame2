<script>
 export let player;
 export let socket;

 const spendAttr = event => {
   socket.emit("player spend attribute", event.target.dataset.spendattrchoice);
 };

 const changeName = event => {
   let name = document.getElementById("change-name-input").value;
   if (name.length === 0) return false;

   socket.emit("player change name", name);
 };
</script>

<style>
  .stat-calc {
    font-size: 0.75em;
  }
</style>

<h4>Player</h4>

{#if player.baseStats}

  <div>
    <form id="change-name" on:submit|preventDefault={changeName}>
      <input type="text" id="change-name-input" value="" placeholder="Name" />
      <input type="submit" value="Save" />
    </form>
  </div>
  <div>Level: {player.level}</div>
  <div>XP: {player.xp}/{player.level * 10}</div>
  <div>
    Weapon Damage:
    {player.totalStats.damage}
  </div>
  <div>
    Armor:
    {player.totalStats.armor}
  </div>
  <div>
    Strength: {player.totalStats.strength}

    {#if player.baseStats.unspent > 0}
      <button type="button" data-spendattrchoice="strength" on:click={spendAttr}>+</button>
    {/if}

    <span class="stat-calc">({player.baseStats.strength} + {player.gearStats.strength})</span>
  </div>
  <div>
    Agility: {player.totalStats.agility}

    {#if player.baseStats.unspent > 0}
      <button type="button" data-spendattrchoice="agility" on:click={spendAttr}>+</button>
    {/if}

    <span class="stat-calc">({player.baseStats.agility} + {player.gearStats.agility})</span>
  </div>
  <div>
    Intelligence: {player.totalStats.intelligence}

    {#if player.baseStats.unspent > 0}
      <button type="button" data-spendattrchoice="intelligence" on:click={spendAttr}>+</button>
    {/if}

    <span class="stat-calc">({player.baseStats.intelligence} + {player.gearStats.intelligence})</span>
  </div>
  {#if player.baseStats.unspent > 0}
  <div style="color: green;">
    Unspent: {player.baseStats.unspent}
  </div>
  {/if}

{:else}

  <div>Loading...</div>

{/if}

<h4>Debug</h4>

<div style="overflow: scroll; max-width: 400px; max-height: 200px;">{JSON.stringify(player)}</div>
