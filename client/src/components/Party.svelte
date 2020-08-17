<script>
  export let party;
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
</style>

<h4>Party</h4>
<div class="party">
  {#each Object.values(party) as partyMember}
  <div class="party-member">
    <div><div class="party-member-model" id="party-member-model-{partyMember.id}"></div></div>
    <div><meter value="{partyMember.health / partyMember.maxHealth}"></meter></div>
    <div><strong>{partyMember.name}</strong></div>
    <div>HP {partyMember.health}/{partyMember.maxHealth}</div>
    <div>Level {partyMember.level}</div>
  </div>
  {/each}
</div>