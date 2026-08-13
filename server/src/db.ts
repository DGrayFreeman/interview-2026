import { readFile, rename, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"

import type { Album } from "./types"

const DB_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
  "albums.json",
)

let writeQueue: Promise<void> = Promise.resolve()

export async function readAlbums(): Promise<Album[]> {
  const raw = await readFile(DB_PATH, "utf-8")
  const parsed: unknown = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error("Album database must contain an array")
  }

  return parsed as Album[]
}

export async function writeAlbums(albums: Album[]): Promise<void> {
  const operation = writeQueue.then(async () => {
    const temporaryPath = `${DB_PATH}.tmp`

    await writeFile(
      temporaryPath,
      JSON.stringify(albums, null, 2) + "\n",
      "utf-8",
    )

    await rename(temporaryPath, DB_PATH)
  })

  writeQueue = operation.catch(() => undefined)

  await operation
}
