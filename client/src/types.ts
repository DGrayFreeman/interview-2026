export interface Album {
  id: string
  title: string
  artist: string
  year: number
  genre: string
  price: number
  stock: number
}

export type AlbumFormData = Omit<Album, "id">
