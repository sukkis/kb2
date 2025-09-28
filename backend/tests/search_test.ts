// tests for the helper functions in search.ts
// handler is tested in snippet_test.ts
import {
  assertEquals,
  assertObjectMatch,
} from "@std/assert";
import { Snippet, SearchResult } from "../../shared/types.ts";
import { matches, matching_words, create_search_result_set } from "../src/routes/search.ts";

Deno.test("matches() function", () => {
  assertEquals(matches("test", "this is a test"), true);
  assertEquals(matches("TEST", "this is a test"), true); // case insensitive
  assertEquals(matches("absent", "this is a test"), false);
});

Deno.test("matching_words() function", () => {
  const patterns = ["python", "deno", "kv"];
  assertEquals(matching_words(patterns, "Python and Deno are great"), 2);
  assertEquals(matching_words(patterns, "No matches here"), 0);
  assertEquals(matching_words(patterns, "kv is key-value store"), 1);
  assertEquals(matching_words(patterns, "PYTHON, DENO, and KV"), 3); // case insensitive
});

// tests for create_search_result_set()
// we mock listSnippets() to return a fixed set of snippets
// and check the search results
Deno.test("create_search_result_set() function", async () => {
  // mock snippets
  const mockSnippets: Snippet[] = [
    {
      uuid: "abc123",
      title: "Python Poetry installation",
      content: "How to install Python packages using Poetry.",
      timestamp: Date.now(),
    },
    {
      uuid: "def456",
      title: "Deno KV basics",
      content: "Introduction to Deno's key-value store.",
      timestamp: Date.now(),
    },
    {
      uuid: "ghi789",
      title: "JavaScript async/await",
      content: "Understanding asynchronous programming in JS.",
      timestamp: Date.now(),
    },
  ];

  // test cases
  const results1: SearchResult[] = await create_search_result_set("Python Poetry install", mockSnippets);
  assertEquals(results1.length, 1);
  assertObjectMatch(results1[0], { uuid: "abc123", score: 3 });

  const results2: SearchResult[] = await create_search_result_set("deno kv basics", mockSnippets);
  assertEquals(results2.length, 1);
  assertObjectMatch(results2[0], { uuid: "def456", score: 3 });

  const results3: SearchResult[] = await create_search_result_set("async programming", mockSnippets);
  assertEquals(results3.length, 1);
  assertObjectMatch(results3[0], { uuid: "ghi789", score: 1 });

  const results4: SearchResult[] = await create_search_result_set("nonexistent term", mockSnippets);
  assertEquals(results4.length, 0);
});
// tests for the /search endpoint are in snippet_test.ts
// since it requires the full server to be running

