import {
  Edit3,
  Package,
  Trash2,
} from "lucide-react"

import type { Album } from "@/types"

interface AlbumCardProps {
  album: Album
  onEdit: (album: Album) => void
  onDelete: (album: Album) => void
}

export function AlbumCard({
  album,
  onEdit,
  onDelete,
}: AlbumCardProps) {
  const isInStock = album.stock > 0

  return (
    <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-8 top-8 h-32 w-32 rounded-full border-8 border-white" />
          <div className="absolute right-8 bottom-8 h-20 w-20 rounded-full border-8 border-white" />
        </div>

        <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-zinc-300 bg-zinc-950 shadow-2xl">
          <div className="h-8 w-8 rounded-full border-4 border-zinc-500 bg-zinc-200" />
          <div className="absolute h-1 w-16 rotate-45 bg-zinc-700 opacity-60" />
        </div>

        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-zinc-800 shadow-sm">
          {album.genre}
        </div>

        {!isInStock && (
          <div className="absolute bottom-4 left-4 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
            Out of stock
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
            {album.year}
          </p>

          <h2 className="line-clamp-2 text-lg font-bold leading-tight text-zinc-950">
            {album.title}
          </h2>

          <p className="mt-1 text-sm text-zinc-600">
            {album.artist}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-zinc-950">
              ${album.price.toFixed(2)}
            </p>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
              <Package className="h-3.5 w-3.5" />
              {album.stock} {album.stock === 1 ? "copy" : "copies"} available
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(album)}
              aria-label={`Edit ${album.title}`}
              className="rounded-lg border p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
            >
              <Edit3 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(album)}
              aria-label={`Delete ${album.title}`}
              className="rounded-lg border p-2 text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
