import { useEffect, useState } from "react"
import { Disc3 } from "lucide-react"
import { AlbumCard } from "@/components/album-card"
import type { Album } from "@/types"

// One hard-coded album so you can see what a card looks like.
// Your first task: replace this with real data from GET /api/albums.
const PLACEHOLDER_ALBUM: Album = {
  id: "alb_000",
  title: "Replace Me",
  artist: "Fetched From Nowhere",
  year: 2024,
  genre: "Placeholder",
  price: 0.99,
  stock: 1,
}

function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center gap-3">
          <Disc3 className="h-6 w-6" />
          <h1 className="text-lg font-semibold tracking-tight">Spindle Records</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AlbumCard album={PLACEHOLDER_ALBUM} />
        </div>
      </main>

      <footer className="container py-8">
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
