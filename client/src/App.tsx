import { useEffect, useMemo, useState } from "react"

import {
  Disc3,
  LibraryBig,
  Plus,
  Search,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react"

import { AlbumCard } from "@/components/album-card"
import { AlbumForm } from "@/components/album-form"

import type { Album, AlbumFormData } from "@/types"

type SortOption =
  | "title-asc"
  | "title-desc"
  | "artist-asc"
  | "year-newest"
  | "year-oldest"
  | "price-low"
  | "price-high"

type Notice = {
  type: "success" | "error"
  message: string
} | null

const DEFAULT_SORT: SortOption = "title-asc"

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json()

    if (
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
    ) {
      return data.error
    }
  } catch {
    // Fall through to generic error.
  }

  return `Request failed with status ${response.status}`
}

async function fetchAlbums(): Promise<Album[]> {
  const response = await fetch("/api/albums")

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data)) {
    throw new Error("The API returned an invalid album collection.")
  }

  return data as Album[]
}

async function createAlbum(data: AlbumFormData): Promise<Album> {
  const response = await fetch("/api/albums", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return (await response.json()) as Album
}

async function updateAlbum(
  id: string,
  data: AlbumFormData,
): Promise<Album> {
  const response = await fetch(`/api/albums/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return (await response.json()) as Album
}

async function deleteAlbum(id: string): Promise<void> {
  const response = await fetch(`/api/albums/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
}

function App() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [genre, setGenre] = useState("all")
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT)

  const [formOpen, setFormOpen] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)

  const [notice, setNotice] = useState<Notice>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [surpriseAlbum, setSurpriseAlbum] = useState<Album | null>(null)

  async function loadAlbums() {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchAlbums()
      setAlbums(data)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load albums.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAlbums()
  }, [])

  useEffect(() => {
    if (!notice) {
      return
    }

    const timer = window.setTimeout(() => {
      setNotice(null)
    }, 4000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [notice])

  const genres = useMemo(() => {
    return Array.from(
      new Set(albums.map((album) => album.genre)),
    ).sort((a, b) => a.localeCompare(b))
  }, [albums])

  const filteredAlbums = useMemo(() => {
    const query = search.trim().toLowerCase()

    const result = albums.filter((album) => {
      const matchesSearch =
        query.length === 0 ||
        album.title.toLowerCase().includes(query) ||
        album.artist.toLowerCase().includes(query) ||
        album.genre.toLowerCase().includes(query)

      const matchesGenre =
        genre === "all" || album.genre === genre

      return matchesSearch && matchesGenre
    })

    result.sort((a, b) => {
      switch (sort) {
        case "title-desc":
          return b.title.localeCompare(a.title)

        case "artist-asc":
          return (
            a.artist.localeCompare(b.artist) ||
            a.title.localeCompare(b.title)
          )

        case "year-newest":
          return b.year - a.year

        case "year-oldest":
          return a.year - b.year

        case "price-low":
          return a.price - b.price

        case "price-high":
          return b.price - a.price

        case "title-asc":
        default:
          return a.title.localeCompare(b.title)
      }
    })

    return result
  }, [albums, genre, search, sort])

  const statistics = useMemo(() => {
    const artists = new Set(
      albums.map((album) => album.artist.toLowerCase()),
    )

    const genresSet = new Set(
      albums.map((album) => album.genre.toLowerCase()),
    )

    const totalCopies = albums.reduce(
      (total, album) => total + album.stock,
      0,
    )

    const years = albums.map((album) => album.year)

    return {
      albums: albums.length,
      artists: artists.size,
      genres: genresSet.size,
      copies: totalCopies,
      oldest: years.length > 0 ? Math.min(...years) : "—",
      newest: years.length > 0 ? Math.max(...years) : "—",
    }
  }, [albums])

  function openCreateForm() {
    setEditingAlbum(null)
    setFormOpen(true)
  }

  function openEditForm(album: Album) {
    setEditingAlbum(album)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingAlbum(null)
  }

  async function handleSave(data: AlbumFormData) {
    try {
      if (editingAlbum) {
        const updated = await updateAlbum(editingAlbum.id, data)

        setAlbums((current) =>
          current.map((album) =>
            album.id === updated.id ? updated : album,
          ),
        )

        setNotice({
          type: "success",
          message: `"${updated.title}" was updated.`,
        })
      } else {
        const created = await createAlbum(data)

        setAlbums((current) => [...current, created])

        setNotice({
          type: "success",
          message: `"${created.title}" was added to the collection.`,
        })
      }

      closeForm()
    } catch (saveError) {
      setNotice({
        type: "error",
        message:
          saveError instanceof Error
            ? saveError.message
            : "Unable to save album.",
      })

      throw saveError
    }
  }

  async function handleDelete(album: Album) {
    const confirmed = window.confirm(
      `Delete "${album.title}" by ${album.artist}? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingId(album.id)

    try {
      await deleteAlbum(album.id)

      setAlbums((current) =>
        current.filter((item) => item.id !== album.id),
      )

      setNotice({
        type: "success",
        message: `"${album.title}" was removed.`,
      })
    } catch (deleteError) {
      setNotice({
        type: "error",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Unable to delete album.",
      })
    } finally {
      setDeletingId(null)
    }
  }

  function handleSurpriseMe() {
    if (albums.length === 0) {
      return
    }

    const randomIndex = Math.floor(Math.random() * albums.length)
    setSurpriseAlbum(albums[randomIndex])
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
              <Disc3 className="h-5 w-5" />
            </div>

            <div>
              <h1 className="font-bold tracking-tight">
                Record Shop
              </h1>

              <p className="hidden text-xs text-zinc-500 sm:block">
                Your online record catalog
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            <span>Add album</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="mb-8 overflow-hidden rounded-3xl bg-zinc-950 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
          <div className="max-w-3xl">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-400">
              <Sparkles className="h-4 w-4" />
              COLLECTION CATALOG
            </p>

            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Find your next favorite record.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Browse the collection, search by artist or genre,
              organize the catalog, and manage your records from one
              place.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSurpriseMe}
                disabled={albums.length === 0}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Shuffle className="h-4 w-4" />
                Surprise me
              </button>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-400">
                <LibraryBig className="h-4 w-4" />
                {albums.length}{" "}
                {albums.length === 1 ? "album" : "albums"}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-6">
          <Stat label="Albums" value={statistics.albums} />
          <Stat label="Artists" value={statistics.artists} />
          <Stat label="Genres" value={statistics.genres} />
          <Stat label="Copies" value={statistics.copies} />
          <Stat label="Oldest" value={statistics.oldest} />
          <Stat label="Newest" value={statistics.newest} />
        </section>

        <section className="mb-8 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, artist, or genre..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-zinc-500" />

                <select
                  value={genre}
                  onChange={(event) => setGenre(event.target.value)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                >
                  <option value="all">All genres</option>

                  {genres.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortOption)
                }
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                aria-label="Sort albums"
              >
                <option value="title-asc">Title A–Z</option>
                <option value="title-desc">Title Z–A</option>
                <option value="artist-asc">Artist A–Z</option>
                <option value="year-newest">
                  Newest release
                </option>
                <option value="year-oldest">
                  Oldest release
                </option>
                <option value="price-low">
                  Price: low to high
                </option>
                <option value="price-high">
                  Price: high to low
                </option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-zinc-500">
            <span>
              Showing {filteredAlbums.length} of {albums.length} albums
            </span>

            {(search || genre !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setGenre("all")
                }}
                className="font-medium text-zinc-900 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {loading && (
          <LoadingState />
        )}

        {!loading && error && (
          <ErrorState
            message={error}
            onRetry={() => void loadAlbums()}
          />
        )}

        {!loading && !error && filteredAlbums.length === 0 && (
          <EmptyState
            hasFilters={Boolean(search) || genre !== "all"}
            onClear={() => {
              setSearch("")
              setGenre("all")
            }}
            onAdd={openCreateForm}
          />
        )}

        {!loading && !error && filteredAlbums.length > 0 && (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAlbums.map((album) => (
              <div
                key={album.id}
                className={
                  deletingId === album.id
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              >
                <AlbumCard
                  album={album}
                  onEdit={openEditForm}
                  onDelete={(item) => void handleDelete(item)}
                />
              </div>
            ))}
          </section>
        )}

        <footer className="mt-12 border-t pt-6">
          <ApiStatus />
        </footer>
      </main>

      {formOpen && (
        <AlbumForm
          album={editingAlbum}
          onSubmit={handleSave}
          onClose={closeForm}
        />
      )}

      {surpriseAlbum && (
        <SurpriseModal
          album={surpriseAlbum}
          onClose={() => setSurpriseAlbum(null)}
          onEdit={() => {
            setSurpriseAlbum(null)
            openEditForm(surpriseAlbum)
          }}
        />
      )}

      {notice && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-[60] max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {notice.message}
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">
        {value}
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border bg-white"
        >
          <div className="aspect-square animate-pulse bg-zinc-200" />

          <div className="space-y-3 p-5">
            <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <h2 className="text-lg font-bold text-red-950">
        We couldn't load the collection.
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm text-red-800">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl bg-red-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-900"
      >
        Try again
      </button>
    </div>
  )
}

function EmptyState({
  hasFilters,
  onClear,
  onAdd,
}: {
  hasFilters: boolean
  onClear: () => void
  onAdd: () => void
}) {
  return (
    <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
        <Disc3 className="h-7 w-7 text-zinc-500" />
      </div>

      <h2 className="mt-5 text-xl font-bold">
        {hasFilters ? "No albums found" : "Your collection is empty"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {hasFilters
          ? "Try a different search or remove your filters."
          : "Add your first record to start building the catalog."}
      </p>

      <button
        type="button"
        onClick={hasFilters ? onClear : onAdd}
        className="mt-5 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
      >
        {hasFilters ? "Clear filters" : "Add first album"}
      </button>
    </div>
  )
}

function SurpriseModal({
  album,
  onClose,
  onEdit,
}: {
  album: Album
  onClose: () => void
  onEdit: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="surprise-title"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose()
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex aspect-video items-center justify-center bg-zinc-950">
          <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-zinc-300 bg-zinc-900 shadow-2xl">
            <div className="h-8 w-8 rounded-full border-4 border-zinc-600 bg-zinc-200" />
          </div>
        </div>

        <div className="p-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Your surprise record
          </p>

          <h2
            id="surprise-title"
            className="mt-2 text-2xl font-bold tracking-tight"
          >
            {album.title}
          </h2>

          <p className="mt-1 text-zinc-600">
            {album.artist} · {album.year}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-zinc-100 px-3 py-1.5 font-medium">
              {album.genre}
            </span>

            <span className="rounded-full bg-zinc-100 px-3 py-1.5 font-medium">
              ${album.price.toFixed(2)}
            </span>
          </div>

          <div className="mt-7 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-zinc-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="flex-1 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Edit album
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApiStatus() {
  const [status, setStatus] = useState<
    "checking" | "ok" | "error"
  >("checking")

  useEffect(() => {
    fetch("/api/health")
      .then((response) => {
        setStatus(response.ok ? "ok" : "error")
      })
      .catch(() => {
        setStatus("error")
      })
  }, [])

  return (
    <div className="flex items-center justify-between gap-4 text-xs text-zinc-500">
      <p>
        Record Shop · Catalog management
      </p>

      <p>
        API status:{" "}
        {status === "checking" && "checking…"}
        {status === "ok" && "connected"}
        {status === "error" && "unreachable"}
      </p>
    </div>
  )
}

export default App
