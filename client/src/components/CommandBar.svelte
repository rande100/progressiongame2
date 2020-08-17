<script>
  export let mobs;
  export let mobList;
  export let socket;

  let autospawn = true;
  let noMobs = true;
  for (mob in mobs) {
    if (mob.health > 0) {
      noMobs = false;
    }
  }

  const engage = () => {
    let mob = document.getElementById("moblist").value;
    socket.emit("engage", mob);
  };

  const flee = () => {
    socket.emit("flee");
  };

  const autospawnChange = () => {
    autospawn = !autospawn;
    socket.emit("autospawn update", autospawn);
  };

  socket.on("autospawn update", autospawnUpdated => {
    autospawn = autospawnUpdated;
  });
</script>

<div>
  <select id="moblist">
    {#each Object.values(mobList) as mob}
      <option value="{mob.id}">{mob.name} (Level {mob.level}{mob.boss ? " Boss" : ""})</option>
    {/each}
  </select>
  {#if noMobs}
    <button type="button" id="engage" on:click={engage}>Engage</button>
  {:else}
    <button type="button" id="flee" on:click={flee}>Flee</button>
  {/if}
  <label><input type="checkbox" name="autospawn" checked={autospawn} on:change={autospawnChange}>
    Automatically re-engage when mob dies
  </label>
</div>
