import { expect, test } from 'vitest';
import { checkHealth, createSnippet, fetchSnippets, fetchSnippetById, deleteSnippet } from './snippetApi';
import { Snippet, SnippetRequest } from '../shared/types';

// GET /health
test('checkHealth returns OK from backend', async () => {
  const result = await checkHealth();
  expect(result.status).toBe('ok');
});

// GET/snippets
test('fetchSnippets returns an array', async () => {
  const snippets: Snippet[] = await fetchSnippets();
  expect(Array.isArray(snippets)).toBe(true);
});

// POST /add
test('addSnippet adds a snippet and returns it', async () => {
  const title = 'New snippet';
  const content = 'This is a new snippet.';
  const result: SnippetRequest = await createSnippet(title, content);
  expect(result.title).toBe(title);
  expect(result.content).toBe(content);
});

// Negative test: createSnippet with missing title
test('createSnippet with missing title throws error', async () => {
  const content = 'Content without a title';
  await expect(createSnippet('', content)).rejects.toThrow('Failed to create snippet');
});

// GET /snippets/:id
test('fetchSnippetById returns the correct snippet', async () => {
  // First, create a new snippet to ensure we have a known ID
  const title = 'Snippet to fetch';
  const content = 'Content of the snippet to fetch.';
  const createdSnippet: Snippet = await createSnippet(title, content);

  // Now fetch the snippet by its ID
  const fetchedSnippet: Snippet = await fetchSnippetById(createdSnippet.uuid);
  expect(fetchedSnippet.uuid).toBe(createdSnippet.uuid);
  expect(fetchedSnippet.title).toBe(title);
  expect(fetchedSnippet.content).toBe(content);
});

// Negative test: fetchSnippetById with invalid ID
test('fetchSnippetById with invalid ID throws error', async () => {
  const invalidId = 'non-existent-id';
  await expect(fetchSnippetById(invalidId)).rejects.toThrow('Failed to fetch snippet');
});

// Negative test: fetchSnippetById with empty ID
test('fetchSnippetById with empty ID throws error', async () => {
  const emptyId = '';
  await expect(fetchSnippetById(emptyId)).rejects.toThrow('Failed to fetch snippet');
});

// DELETE /delete/:id
test('deleteSnippet deletes a snippet by id', async () => {
  // First, create a new snippet to ensure we have a known ID
  const title = 'Snippet to delete';
  const content = 'Content of the snippet to delete.';
  const createdSnippet: Snippet = await createSnippet(title, content);

  // Now delete the snippet by its ID
  await deleteSnippet(createdSnippet.uuid);

  // Verify that the snippet is no longer retrievable
  await expect(fetchSnippetById(createdSnippet.uuid)).rejects.toThrow('Failed to fetch snippet');
});

// Negative test: deleteSnippet with invalid ID
test('deleteSnippet with invalid ID throws error', async () => {
  const invalidId = 'non-existent-id';
  await expect(deleteSnippet(invalidId)).rejects.toThrow('Failed to delete snippet');
});

// Negative test: deleteSnippet with empty ID
test('deleteSnippet with empty ID throws error', async () => {
  const emptyId = '';
  await expect(deleteSnippet(emptyId)).rejects.toThrow('Failed to delete snippet');
});
