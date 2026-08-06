# Record Shop — Take-Home

React 19 + Vite + Tailwind 4 client, Hono (TypeScript) server, and a JSON file
(`server/data/albums.json`) as the database.

## Run

```bash
docker compose up --build
```

App: http://localhost:5173 · API: http://localhost:3000/api/health

Local dev: `npm install && npm run dev` in `server/` and `client/` (Vite
proxies `/api/*` to the server).

## Task

The starter serves `GET /api/albums` (+ `/:id`) and renders one hard-coded
album card.

1. Render the album collection from the API, with loading and error states
2. CRUD: create, edit, and delete albums from the UI — write the API routes,
   persist to the JSON file, validate input
3. At least one search / filter / sort
4. One feature of your choice, described in a short `NOTES.md` (what, why,
   tradeoffs, and how you used AI tools — they're allowed)

## Acceptance criteria

- [ ] `docker compose up --build` is all we run; the app works at :5173
- [ ] Albums come from the API; CRUD persists across restarts
- [ ] Search/filter/sort works
- [ ] Your feature works and `NOTES.md` explains it
- [ ] TypeScript compiles: `npm run build` (client), `npm run typecheck` (server)

## Submitting

Timebox: ~4–8 hours. Don't fork or open PRs here — send a private repo invite
or a zip (no `node_modules/`), git history intact.
