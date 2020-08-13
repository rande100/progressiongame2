<script>
  export let mobs = [];
</script>

<style>
  .mobModel {
    width: 64px;
    height: 64px;
    background-color: #dddddd;
  }
</style>

<h4>Mobs</h4>
<div class="mobs">
  {#each mobs as mob}
  <div class="mob">
    <div><div class="mobModel" id="mobModel"></div></div>
    <div><meter value="{mob.health / mob.maxHealth}"></meter></div>
    <div><strong>{mob.name}</strong> (Level {mob.level})</div>
    <div>Health: {mob.health}/{mob.maxHealth}</div>
  </div>
  {/each}
</div>
