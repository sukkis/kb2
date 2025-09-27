/**
 * Returns a fresh, file‑backed KV store that lives only for the
 * duration of the test.  The folder is created in the OS temporary
 * directory and is automatically cleaned up when the process exits.
 */
export async function makeTempKv(): Promise<Deno.Kv> {
  // Deno.makeTempDir creates a unique temporary folder.
  const tmpDir = await Deno.makeTempDir({ prefix: "kv_test_" });
  // `openKv` will create a SQLite file inside that folder.

  const kv = await Deno.openKv(`${tmpDir}/kv.sqlite`);
  return kv; // caller will close it later
}
