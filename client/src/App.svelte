<script>
  import { onMount } from "svelte";
  import axios from "axios";
  import io from "socket.io-client";
  const socket = io("https://76xzn-3000.sse.codesandbox.io/");

  import List from "./components/List.svelte";
  import Player from "./components/Player.svelte";

  let listItems = [];
  let player = {};
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
</script>

<p>Test paragraph.</p>

<List items={listItems} />

<Player player={player} />

<button type="button" name="attack" on:click={attack}>Attack</button>
