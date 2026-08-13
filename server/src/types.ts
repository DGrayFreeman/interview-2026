export interface Album {
  id: string
  title: string
  artist: string
  year: number
  genre: string
  /** USD */
  price: number
  /** copies in stock */
  stock: number
}

export type AlbumInput = Omit<Album, "id">

export interface ValidationResult {
  valid: boolean
  errors: string[]
}
