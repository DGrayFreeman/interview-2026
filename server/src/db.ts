import { readFile, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"
import type { Album } from "./types"

// The "database" is just a JSON file. Reads load the whole file; writes
// replace it. Fine at this scale — don't reach for anything fancier.
const DB_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
  "albums.json"
)

export async function readAlbums(): Promise<Album[]> {
  const raw = await readFile(DB_PATH, "utf-8")
  return JSON.parse(raw) as Album[]
}

export async function writeAlbums(albums: Album[]): Promise<void> {
  await writeFile(DB_PATH, JSON.stringify(albums, null, 2) + "\n", "utf-8")
}
