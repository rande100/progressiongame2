<script>
  import { onMount } from "svelte";
  import axios from "axios";

  import List from "./components/List.svelte";
  import Player from "./components/Player.svelte";

  let listItems = [];
  let player = {};

  onMount(async () => {
    const res = await axios.get("https://76xzn-3000.sse.codesandbox.io/api/test");
    listItems = await res.data;
  });

  onMount(async () => {
    const res = await axios.get(
      "https://76xzn-3000.sse.codesandbox.io/api/player"
    );
    player = await res.data;
    console.log("received player");
  });
</script>

<p>Test paragraph.</p>

<List items={listItems} />

<Player player={player} />