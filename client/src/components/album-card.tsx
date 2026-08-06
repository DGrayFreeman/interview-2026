import { Disc3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Album } from "@/types"

export function AlbumCard({ album }: { album: Album }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{album.title}</CardTitle>
            <CardDescription>
              {album.artist} · {album.year}
            </CardDescription>
          </div>
          <Disc3 className="h-5 w-5 shrink-0 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Badge variant="secondary">{album.genre}</Badge>
        <div className="text-right">
          <div className="font-semibold">${album.price.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">
            {album.stock > 0 ? `${album.stock} in stock` : "Out of stock"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
