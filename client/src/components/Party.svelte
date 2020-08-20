<script>
  export let party;
  export let socket;

  const resurrect = event => {
    socket.emit("player resurrect");
  };
  const heal = event => {
    socket.emit("player heal player", event.target.dataset.playerid);
  };
</script>

<style>
  .party {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .party-member {
    margin-right: 1em;
    margin-bottom: 1em;
  }
  .party-member-model {
    width: 64px;
    height: 64px;
    background-color: #dddddd;
  }
  .me {
    background-color: #aaaaaa;
  }
</style>

<h4>Party</h4>
<div class="party">
  {#each Object.values(party) as partyMember}
  <div class="party-member ">
    <div><div class="party-member-model {partyMember.id === socket.id ? `me` : ``}" id="party-member-model-{partyMember.id}"></div></div>
    <div><meter value="{partyMember.health / partyMember.maxHealth}"></meter></div>
    <div><strong>{partyMember.name}</strong></div>
    <div>HP {partyMember.health}/{partyMember.maxHealth}</div>
    <div>MP {partyMember.mana}/{partyMember.maxMana}</div>
    <div>Level {partyMember.level}</div>

    {#if partyMember.health > 0 && partyMember.health < partyMember.maxHealth && party[socket.id] && party[socket.id].mana >= 5}
      <div><button type="button" on:click={heal} data-playerid="{partyMember.id}" title="Heal: Costs 5 mana.">Heal</button></div>
    {/if}

    {#if partyMember.health === 0 && partyMember.id === socket.id}
      <div><button type="button" on:click={resurrect} title="Resurrect Self: Costs 10 xp.">Resurrect</button></div>
    {/if}

  </div>
  {/each}
</div>