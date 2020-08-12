<script>
  import { onMount } from "svelte";
  import axios from "axios";

  import List from "./components/List.svelte";
  let listItems = [];

  onMount(async () => {
    console.log("attempting get");
    const res = await axios.get("https://lm4qf-3000.sse.codesandbox.io/api/test");
    listItems = await res.data;
    console.log(listItems);
  });
</script>

<p>Test 3.</p>

<List items={listItems} />