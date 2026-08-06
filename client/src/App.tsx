import { useEffect, useState } from "react"
import { Disc3 } from "lucide-react"
import { AlbumCard } from "@/components/album-card"
import type { Album } from "@/types"

// Hard-coded sample so you can see what a card looks like. It's the first
// record in server/data/albums.json — task 1 is to render the whole
// collection from GET /api/albums instead.
const SAMPLE_ALBUM: Album = {
  id: "alb_001",
  title: "Kind of Blue",
  artist: "Miles Davis",
  year: 1959,
  genre: "Jazz",
  price: 29.99,
  stock: 7,
}

function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-6">
          <Disc3 className="h-6 w-6" />
          <h1 className="text-lg font-semibold tracking-tight">Record Shop</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AlbumCard album={SAMPLE_ALBUM} />
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10">
        <ApiStatus />
      </footer>
    </div>
  )
}

// Pings the API so you can confirm client ↔ server wiring works before
// writing any code. Feel free to remove once you're up and running.
function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking")

  useEffect(() => {
    fetch("/api/health")
      .then((res) => (res.ok ? setStatus("ok") : setStatus("error")))
      .catch(() => setStatus("error"))
  }, [])

  return (
    <p className="text-sm text-muted-foreground">
      API status:{" "}
      {status === "checking" && "checking…"}
      {status === "ok" && "✅ connected"}
      {status === "error" && "❌ unreachable — is the server running?"}
    </p>
  )
}

export default App
