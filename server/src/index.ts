import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { logger } from "hono/logger"

import { readAlbums, writeAlbums } from "./db"
import type { AlbumInput, ValidationResult } from "./types"

const app = new Hono()

app.use(logger())

app.get("/api/health", (c) => {
  return c.json({
    ok: true,
    service: "record-shop-server",
  })
})

function validateAlbum(input: unknown): ValidationResult {
  const errors: string[] = []

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      valid: false,
      errors: ["Request body must be a JSON object"],
    }
  }

  const album = input as Record<string, unknown>

  if (
    typeof album.title !== "string" ||
    album.title.trim().length === 0
  ) {
    errors.push("Title is required")
  } else if (album.title.trim().length > 120) {
    errors.push("Title must be 120 characters or fewer")
  }

  if (
    typeof album.artist !== "string" ||
    album.artist.trim().length === 0
  ) {
    errors.push("Artist is required")
  } else if (album.artist.trim().length > 120) {
    errors.push("Artist must be 120 characters or fewer")
  }

  if (
    typeof album.genre !== "string" ||
    album.genre.trim().length === 0
  ) {
    errors.push("Genre is required")
  } else if (album.genre.trim().length > 60) {
    errors.push("Genre must be 60 characters or fewer")
  }

  if (
    typeof album.year !== "number" ||
    !Number.isInteger(album.year)
  ) {
    errors.push("Year must be a whole number")
  } else if (album.year < 1880 || album.year > 2100) {
    errors.push("Year must be between 1880 and 2100")
  }

  if (
    typeof album.price !== "number" ||
    !Number.isFinite(album.price)
  ) {
    errors.push("Price must be a valid number")
  } else if (album.price < 0 || album.price > 100000) {
    errors.push("Price must be between $0 and $100,000")
  }

  if (
    typeof album.stock !== "number" ||
    !Number.isInteger(album.stock)
  ) {
    errors.push("Stock must be a whole number")
  } else if (album.stock < 0 || album.stock > 1000000) {
    errors.push("Stock must be between 0 and 1,000,000")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

function normalizeAlbumInput(input: AlbumInput): AlbumInput {
  return {
    title: input.title.trim(),
    artist: input.artist.trim(),
    year: input.year,
    genre: input.genre.trim(),
    price: Math.round(input.price * 100) / 100,
    stock: input.stock,
  }
}

function generateId(existingIds: Set<string>): string {
  let id = ""

  do {
    id = `alb_${crypto.randomUUID().replaceAll("-", "").slice(0, 10)}`
  } while (existingIds.has(id))

  return id
}

app.get("/api/albums", async (c) => {
  try {
    const albums = await readAlbums()
    return c.json(albums)
  } catch (error) {
    console.error("Failed to read albums:", error)

    return c.json(
      {
        error: "Unable to read album collection",
      },
      500,
    )
  }
})

app.get("/api/albums/:id", async (c) => {
  try {
    const albums = await readAlbums()
    const album = albums.find((item) => item.id === c.req.param("id"))

    if (!album) {
      return c.json(
        {
          error: "Album not found",
        },
        404,
      )
    }

    return c.json(album)
  } catch (error) {
    console.error("Failed to read album:", error)

    return c.json(
      {
        error: "Unable to read album",
      },
      500,
    )
  }
})

app.post("/api/albums", async (c) => {
  let body: unknown

  try {
    body = await c.req.json()
  } catch {
    return c.json(
      {
        error: "Invalid JSON body",
      },
      400,
    )
  }

  const validation = validateAlbum(body)

  if (!validation.valid) {
    return c.json(
      {
        error: "Validation failed",
        details: validation.errors,
      },
      400,
    )
  }

  try {
    const albums = await readAlbums()

    const input = normalizeAlbumInput(body as AlbumInput)

    const duplicate = albums.some(
      (album) =>
        album.title.toLowerCase() === input.title.toLowerCase() &&
        album.artist.toLowerCase() === input.artist.toLowerCase(),
    )

    if (duplicate) {
      return c.json(
        {
          error: "An album with this title and artist already exists",
        },
        409,
      )
    }

    const album = {
      id: generateId(new Set(albums.map((item) => item.id))),
      ...input,
    }

    albums.push(album)

    await writeAlbums(albums)

    return c.json(album, 201)
  } catch (error) {
    console.error("Failed to create album:", error)

    return c.json(
      {
        error: "Unable to create album",
      },
      500,
    )
  }
})

app.put("/api/albums/:id", async (c) => {
  const id = c.req.param("id")

  let body: unknown

  try {
    body = await c.req.json()
  } catch {
    return c.json(
      {
        error: "Invalid JSON body",
      },
      400,
    )
  }

  const validation = validateAlbum(body)

  if (!validation.valid) {
    return c.json(
      {
        error: "Validation failed",
        details: validation.errors,
      },
      400,
    )
  }

  try {
    const albums = await readAlbums()

    const index = albums.findIndex((album) => album.id === id)

    if (index === -1) {
      return c.json(
        {
          error: "Album not found",
        },
        404,
      )
    }

    const input = normalizeAlbumInput(body as AlbumInput)

    const duplicate = albums.some(
      (album, albumIndex) =>
        albumIndex !== index &&
        album.title.toLowerCase() === input.title.toLowerCase() &&
        album.artist.toLowerCase() === input.artist.toLowerCase(),
    )

    if (duplicate) {
      return c.json(
        {
          error: "An album with this title and artist already exists",
        },
        409,
      )
    }

    const updatedAlbum = {
      id,
      ...input,
    }

    albums[index] = updatedAlbum

    await writeAlbums(albums)

    return c.json(updatedAlbum)
  } catch (error) {
    console.error("Failed to update album:", error)

    return c.json(
      {
        error: "Unable to update album",
      },
      500,
    )
  }
})

app.delete("/api/albums/:id", async (c) => {
  const id = c.req.param("id")

  try {
    const albums = await readAlbums()

    const index = albums.findIndex((album) => album.id === id)

    if (index === -1) {
      return c.json(
        {
          error: "Album not found",
        },
        404,
      )
    }

    const [deletedAlbum] = albums.splice(index, 1)

    await writeAlbums(albums)

    return c.json({
      message: "Album deleted successfully",
      album: deletedAlbum,
    })
  } catch (error) {
    console.error("Failed to delete album:", error)

    return c.json(
      {
        error: "Unable to delete album",
      },
      500,
    )
  }
})

const port = Number(process.env.PORT ?? 3000)

serve(
  {
    fetch: app.fetch,
    port,
    hostname: "0.0.0.0",
  },
  () => {
    console.log(
      `record-shop-server listening on http://localhost:${port}`,
    )
  },
)
