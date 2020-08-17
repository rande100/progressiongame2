<script>
  import { onMount } from "svelte";
  import axios from "axios";
  import io from "socket.io-client";
  const socket = io("https://76xzn-3000.sse.codesandbox.io/");

  import Player from "./components/Player.svelte";
  import PlayerGear from "./components/PlayerGear.svelte";
  import PlayerInventory from "./components/PlayerInventory.svelte";
  import Party from "./components/Party.svelte";
  import Mobs from "./components/Mobs.svelte";
  import CommandBar from "./components/CommandBar.svelte";
  import GameLog from "./components/GameLog.svelte";

  let player = {};
  let party = {};
  let mobs = {};
  let mobList = {};
  let gameLog = [];
  let ts = 0;

  /* UNUSED TEST
                                                                          onMount(async () => {
                                                                            const res = await axios.get(
                                                                              "https://76xzn-3000.sse.codesandbox.io/api/player"
                                                                            );
                                                                            player = await res.data;
                                                                          });
                                                                        */

  const attack = () => {
    ts = Date.now();
    socket.emit("attack");
  };

  socket.on("attack return", () => {
    console.log(Date.now() - ts);
  });

  socket.on("player update", playerUpdated => {
    console.log("player update received.");
    player = playerUpdated;
  });
  socket.on("mobs update", mobsUpdated => {
    console.log("mobs update received.");
    mobs = mobsUpdated;
  });
  socket.on("party update", partyUpdated => {
    console.log("party update received.");
    party = partyUpdated;
  });
  socket.on("player attack mob", ({ playerID, mobID }) => {
    console.log("player attack mob received. playerID: " + playerID);
  });
  socket.on("gamelog message", message => {
    console.log("gamelog message received: " + message);
    gameLog = [...gameLog, message];
  });
  socket.on("moblist update", mobListUpdated => {
    mobList = mobListUpdated;
  });
</script>

<div class="main-container">

<CommandBar mobs={mobs} mobList={mobList} socket={socket} />

<div class="grid-container">
  <div class="grid-column">
    <Mobs mobs={mobs} />

    <div style="width: 50px; height: 25px;">
    {#if mobs && mobs["a"] && mobs["a"].health > 0 && player && player.health > 0}
      <button type="button" name="attack" on:click={attack}>Attack</button>
    {/if}
    </div>

    <Party party={party} />
  </div>
  <div class="grid-column">
    <GameLog gameLog={gameLog} />
  </div>
</div>

<div class="grid-container">
  <div class="grid-column">
    <Player player={player} socket={socket} />
  </div>
  <div class="grid-column">
    <PlayerGear player={player} />
    
    <PlayerInventory player={player} socket={socket} />
  </div>
</div>

<!-- End main-container-->
</div>