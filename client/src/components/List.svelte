<script>
  export let items;
  console.log(items);
</script>

<ul>
  {#each items as item}
    <li> <strong>{item.id}</strong>: {item.body} </li>
  {/each}
</ul>
