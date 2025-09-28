<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchSnippets } from './api/snippetApi';

  let activeTab: 'search' | 'add' | 'view' = 'view';
  let snippets = [];

  onMount(async () => {
    snippets = await fetchSnippets();
  });

  function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }
</script>

<header>
  <h1>KB2 Snippet App</h1>
</header>

<nav>
  <button class:active={activeTab === 'search'} on:click={() => activeTab = 'search'}>Search</button>
  <button class:active={activeTab === 'add'} on:click={() => activeTab = 'add'}>Add</button>
  <button class:active={activeTab === 'view'} on:click={() => activeTab = 'view'}>View All</button>
</nav>

<main>
  {#if activeTab === 'search'}
    <div>
      <h2>Search</h2>
      <!-- Search UI goes here -->
      <p>Search functionality coming soon.</p>
    </div>
  {:else if activeTab === 'add'}
    <div>
      <h2>Add Snippet</h2>
      <!-- Add snippet form goes here -->
      <p>Add snippet functionality coming soon.</p>
    </div>
  {:else if activeTab === 'view'}
    <div>
      <h2>All Snippets</h2>
      {#each snippets as snippet}
        <div class="snippet">
          <h2>{snippet.title}</h2>
          <pre>{snippet.content}</pre>
          <small>{formatTimestamp(snippet.timestamp)}</small>
        </div>
      {/each}
    </div>
  {/if}
</main>
<style>
  main {
    background: #181818;
    color: #eee;
    font-family: system-ui, sans-serif;
  }
  header {
    padding: 1rem;
    background: #222;
    box-shadow: 0 2px 8px #0004;
  }
  nav {
    display: flex;
    gap: 1rem;
    background: #222;
    padding: 0.5rem 1rem;
  }
  nav button {
    background: none;
    color: #eee;
    border: none;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  nav button.active, nav button:hover {
    border-bottom: 2px solid #00bcd4;
    color: #00bcd4;
  }
  main {
    padding: 2rem;
  }
  .snippet {
    background: #222;
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px #0002;
  }
</style>
