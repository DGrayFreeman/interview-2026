import { useEffect, useState } from "react"
import { X } from "lucide-react"

import type { Album, AlbumFormData } from "@/types"

interface AlbumFormProps {
  album?: Album | null
  onSubmit: (data: AlbumFormData) => Promise<void>
  onClose: () => void
}

interface FormErrors {
  title?: string
  artist?: string
  year?: string
  genre?: string
  price?: string
  stock?: string
}

const EMPTY_FORM: AlbumFormData = {
  title: "",
  artist: "",
  year: new Date().getFullYear(),
  genre: "",
  price: 0,
  stock: 0,
}

export function AlbumForm({
  album,
  onSubmit,
  onClose,
}: AlbumFormProps) {
  const [form, setForm] = useState<AlbumFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (album) {
      setForm({
        title: album.title,
        artist: album.artist,
        year: album.year,
        genre: album.genre,
        price: album.price,
        stock: album.stock,
      })
    } else {
      setForm(EMPTY_FORM)
    }

    setErrors({})
  }, [album])

  function updateField<K extends keyof AlbumFormData>(
    field: K,
    value: AlbumFormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }))
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {}

    if (!form.title.trim()) {
      nextErrors.title = "Title is required."
    }

    if (!form.artist.trim()) {
      nextErrors.artist = "Artist is required."
    }

    if (!form.genre.trim()) {
      nextErrors.genre = "Genre is required."
    }

    if (!Number.isInteger(form.year) || form.year < 1880 || form.year > 2100) {
      nextErrors.year = "Enter a year between 1880 and 2100."
    }

    if (!Number.isFinite(form.price) || form.price < 0) {
      nextErrors.price = "Price must be zero or greater."
    }

    if (!Number.isInteger(form.stock) || form.stock < 0) {
      nextErrors.stock = "Stock must be a whole number of zero or greater."
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setSubmitting(true)

    try {
      await onSubmit({
        title: form.title.trim(),
        artist: form.artist.trim(),
        year: form.year,
        genre: form.genre.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-form-title"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose()
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Collection
            </p>

            <h2
              id="album-form-title"
              className="mt-1 text-xl font-bold text-zinc-950"
            >
              {album ? "Edit album" : "Add album"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <Field
            label="Album title"
            value={form.title}
            onChange={(value) => updateField("title", value)}
            error={errors.title}
            placeholder="Kind of Blue"
          />

          <Field
            label="Artist"
            value={form.artist}
            onChange={(value) => updateField("artist", value)}
            error={errors.artist}
            placeholder="Miles Davis"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              label="Release year"
              value={form.year}
              onChange={(value) => updateField("year", value)}
              error={errors.year}
              min={1880}
              max={2100}
            />

            <Field
              label="Genre"
              value={form.genre}
              onChange={(value) => updateField("genre", value)}
              error={errors.genre}
              placeholder="Jazz"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              label="Price"
              value={form.price}
              onChange={(value) => updateField("price", value)}
              error={errors.price}
              min={0}
              step={0.01}
            />

            <NumberField
              label="Stock"
              value={form.stock}
              onChange={(value) => updateField("stock", value)}
              error={errors.stock}
              min={0}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border px-5 py-2.5 font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-zinc-950 px-5 py-2.5 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : album
                  ? "Save changes"
                  : "Add album"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-800">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200 ${
          error ? "border-red-500" : "border-zinc-200"
        }`}
      />

      {error && (
        <span className="mt-1.5 block text-xs text-red-600">
          {error}
        </span>
      )}
    </label>
  )
}

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  error?: string
  min?: number
  max?: number
  step?: number
}

function NumberField({
  label,
  value,
  onChange,
  error,
  min,
  max,
  step = 1,
}: NumberFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-800">
        {label}
      </span>

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const nextValue = event.target.value

          onChange(nextValue === "" ? 0 : Number(nextValue))
        }}
        className={`w-full rounded-xl border px-4 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200 ${
          error ? "border-red-500" : "border-zinc-200"
        }`}
      />

      {error && (
        <span className="mt-1.5 block text-xs text-red-600">
          {error}
        </span>
      )}
    </label>
  )
}
