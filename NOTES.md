# Implementation Notes

## What I built

I expanded the starter Record Shop into a full online record catalog.

The application now supports:

- Loading the complete album collection from the API
- Loading, error, and empty states
- Creating albums
- Editing albums
- Deleting albums
- Server-side input validation
- JSON-file persistence
- Album title/artist/genre search
- Genre filtering
- Multiple sorting options
- Collection statistics
- Responsive album cards
- Delete confirmation
- API connection status
- Success and error notifications

The existing Docker Compose setup remains the only required runtime dependency.

## Creative Feature: Surprise Me

I added a "Surprise me" feature.

When the user selects it, the application randomly chooses an album from
the collection and displays it in a modal with the album's title, artist,
year, genre, and price.

### Why

A record catalog should be useful for browsing, not only for searching for
a known record. The random selection feature gives the user a lightweight
way to discover something in their existing collection.

### Tradeoffs

The random selection happens on the client using the albums already loaded
from the API. This keeps the backend simple and avoids another API request.

The tradeoff is that the random selection is limited to the albums currently
loaded by the client. That is appropriate for this JSON-backed application,
but a much larger production catalog could move discovery logic to the
server.

## Collection Statistics

I also added a collection overview showing:

- Total albums
- Unique artists
- Unique genres
- Total copies in stock
- Oldest release year
- Newest release year

These values are calculated from the API response on the client.

## API Validation

The server validates album data before writing it to the JSON database.

Required fields:

- title
- artist
- year
- genre
- price
- stock

The server also checks:

- title and artist length
- valid release-year range
- non-negative price
- non-negative integer stock
- duplicate title/artist combinations

The API returns appropriate HTTP status codes for validation failures,
duplicates, missing albums, and server errors.

## Persistence

The existing JSON file remains the application's database.

Writes use a temporary file followed by a rename so that the database is
less likely to be left partially written if a write fails.

The Docker Compose configuration mounts `server/data` into the server
container, allowing CRUD changes to persist across container restarts.

## AI Tool Usage

AI tools were used as development assistance for:

- Planning the CRUD API structure
- Reviewing validation requirements
- Generating implementation ideas
- Identifying edge cases
- Improving the UI structure and responsive behavior

The generated code was reviewed and adapted to the existing project's
React, Tailwind, Hono, TypeScript, and Docker architecture.

## Design Decisions

I intentionally kept the backend dependency-free beyond the existing Hono
stack. Validation is implemented directly in TypeScript instead of adding
a schema-validation dependency because the application's JSON database is
small and the required validation rules are straightforward.

The frontend uses the dependencies already present in the starter project.
No additional package installation is required.
