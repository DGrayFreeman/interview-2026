import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { logger } from "hono/logger"
import { readAlbums } from "./db"

const app = new Hono()

app.use(logger())

app.get("/api/health", (c) => c.json({ ok: true, service: "record-shop-server" }))

app.get("/api/albums", async (c) => {
  const albums = await readAlbums()
  return c.json(albums)
})

app.get("/api/albums/:id", async (c) => {
  const albums = await readAlbums()
  const album = albums.find((a) => a.id === c.req.param("id"))
  if (!album) return c.json({ error: "Album not found" }, 404)
  return c.json(album)
})

// ── Your routes go here ─────────────────────────────────────────────
// POST   /api/albums      → create an album
// PUT    /api/albums/:id  → update an album
// DELETE /api/albums/:id  → delete an album
//
// See db.ts for reading/writing the JSON file. Remember to validate input.

const port = Number(process.env.PORT ?? 3000)
serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, () => {
  console.log(`record-shop-server listening on http://localhost:${port}`)
})
