<script>
  import { onMount } from "svelte";
  import axios from "axios";
  import io from "socket.io-client";
  const socket = io("https://76xzn-3000.sse.codesandbox.io/");

  import Player from "./components/Player.svelte";
  import Mobs from "./components/Mobs.svelte";
  import Party from "./components/Party.svelte";

  let listItems = [];
  let player = {};
  let mobs = [];
  let party = [];
  let ts = 0;

  onMount(async () => {
    const res = await axios.get("https://76xzn-3000.sse.codesandbox.io/api/test");
    listItems = await res.data;
  });

  onMount(async () => {
    const res = await axios.get(
      "https://76xzn-3000.sse.codesandbox.io/api/player"
    );
    player = await res.data;
  });

  const attack = () => {
    ts = Date.now();
    console.log("attack button pressed");
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
</script>

<Mobs mobs={mobs} />

<div>
  <button type="button" name="attack" on:click={attack}>Attack</button>
</div>

<Party party={party} />

<Player player={player} />
