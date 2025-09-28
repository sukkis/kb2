import { expect, test } from "vitest";
import {
  checkHealth,
  createSnippet,
  deleteSnippet,
  fetchSnippetById,
  fetchSnippets,
  searchSnippets,
} from "./snippetApi";
import { Snippet, SnippetRequest } from "../shared/types";

// GET /health
test("checkHealth returns OK from backend", async () => {
  const result = await checkHealth();
  expect(result.status).toBe("ok");
});

// GET/snippets
test("fetchSnippets returns an array", async () => {
  const snippets: Snippet[] = await fetchSnippets();
  expect(Array.isArray(snippets)).toBe(true);
});

// POST /add
test("addSnippet adds a snippet and returns it", async () => {
  const title = "New snippet";
  const content = "This is a new snippet.";
  const result: SnippetRequest = await createSnippet(title, content);
  expect(result.title).toBe(title);
  expect(result.content).toBe(content);
});

// Negative test: createSnippet with missing title
test("createSnippet with missing title throws error", async () => {
  const content = "Content without a title";
  await expect(createSnippet("", content)).rejects.toThrow(
    "Failed to create snippet",
  );
});

// GET /snippets/:id
test("fetchSnippetById returns the correct snippet", async () => {
  // First, create a new snippet to ensure we have a known ID
  const title = "Snippet to fetch";
  const content = "Content of the snippet to fetch.";
  const createdSnippet: Snippet = await createSnippet(title, content);

  // Now fetch the snippet by its ID
  const fetchedSnippet: Snippet = await fetchSnippetById(createdSnippet.uuid);
  expect(fetchedSnippet.uuid).toBe(createdSnippet.uuid);
  expect(fetchedSnippet.title).toBe(title);
  expect(fetchedSnippet.content).toBe(content);
});

// Negative test: fetchSnippetById with invalid ID
test("fetchSnippetById with invalid ID throws error", async () => {
  const invalidId = "non-existent-id";
  await expect(fetchSnippetById(invalidId)).rejects.toThrow(
    "Failed to fetch snippet",
  );
});

// Negative test: fetchSnippetById with empty ID
test("fetchSnippetById with empty ID throws error", async () => {
  const emptyId = "";
  await expect(fetchSnippetById(emptyId)).rejects.toThrow(
    "Failed to fetch snippet",
  );
});

// DELETE /delete/:id
test("deleteSnippet deletes a snippet by id", async () => {
  // First, create a new snippet to ensure we have a known ID
  const title = "Snippet to delete";
  const content = "Content of the snippet to delete.";
  const createdSnippet: Snippet = await createSnippet(title, content);

  // Now delete the snippet by its ID
  await deleteSnippet(createdSnippet.uuid);

  // Verify that the snippet is no longer retrievable
  await expect(fetchSnippetById(createdSnippet.uuid)).rejects.toThrow(
    "Failed to fetch snippet",
  );
});

// Negative test: deleteSnippet with invalid ID
test("deleteSnippet with invalid ID throws error", async () => {
  const invalidId = "non-existent-id";
  await expect(deleteSnippet(invalidId)).rejects.toThrow(
    "Failed to delete snippet",
  );
});

// Negative test: deleteSnippet with empty ID
test("deleteSnippet with empty ID throws error", async () => {
  const emptyId = "";
  await expect(deleteSnippet(emptyId)).rejects.toThrow(
    "Failed to delete snippet",
  );
});

// GET /search?query=... happy path frontend handler test
test("searchSnippets returns results for a valid query", async () => {
  // First, create snippets to search against
  const snippet1 = await createSnippet(
    "Test snippet one",
    "Content for snippet one",
  );
  const snippet2 = await createSnippet(
    "Another test snippet",
    "Content for another snippet",
  );
  const _snippet3 = await createSnippet(
    "Unrelated title",
    "Some other content",
  );

  // Now perform a search
  const query = "test";
  const results = await searchSnippets(query);
  expect(results).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        uuid: snippet1.uuid,
        score: expect.any(Number),
      }),
      expect.objectContaining({
        uuid: snippet2.uuid,
        score: expect.any(Number),
      }),
    ]),
  );
});

// GET /search?query=... negative test invalid query
test("searchSnippets with invalid query throws error", async () => {
  const invalidQuery = "invalid!@#"; // contains special characters
  await expect(searchSnippets(invalidQuery)).rejects.toThrow(
    "Failed to search snippets",
  );
});

// GET /search?query=... negative test empty query
test("searchSnippets with empty query throws error", async () => {
  const emptyQuery = "";
  await expect(searchSnippets(emptyQuery)).rejects.toThrow(
    "Failed to search snippets",
  );
});
