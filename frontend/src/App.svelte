<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchSnippets } from './api/snippetApi';

  let snippets = [];

  onMount(async () => {
    snippets = await fetchSnippets();
  });

  // function to format timestamp from Snippet, show date and <time datetime=""></time>
  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  } 
</script>

<main>
  <h1>Welcome to KB2 snippet app</h1>
  <br>
  <div>
    {#each snippets as snippet}
      <div class="snippet">
        <h2>{snippet.title}</h2>
        <pre>{snippet.content} {formatTimestamp(snippet.timestamp)}</pre>
      </div>
    {/each}
  </div>

</main>



<style>
    main {
      background: #181818;
      color: #eee;
      min-height: 100vh;
      margin: 0;
      font-family: system-ui, sans-serif;
    }
</style>
