<script>
  export let party;
</script>

<style>
  .partyMemberModel {
    width: 64px;
    height: 64px;
    background-color: #dddddd;
  }
</style>

<h4>Party</h4>
<div class="party">
  {#each party as partyMember}
  <div class="partyMember">
    <div><div class="partyMemberModel" id="partyMemberModel{partyMember.id}"></div></div>
    <div><meter value="{partyMember.health / partyMember.maxHealth}"></meter></div>
    <div><strong>{partyMember.name}</strong> (Level {partyMember.level})</div>
    <div>Health: {partyMember.health}/{partyMember.maxHealth}</div>
  </div>
  {/each}
</div>