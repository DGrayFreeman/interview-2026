# Spindle Records — Take-Home

A bare-bones record shop app. Client: React 19 + Vite + Tailwind 4 +
shadcn-style components. Server: Hono (TypeScript). Database: the JSON file at
`server/data/albums.json`.

## Run

```bash
docker compose up --build
```

App: http://localhost:5173 · API: http://localhost:3000/api/health

Faster iteration: `npm install && npm run dev` in `server/` and `client/`
(the Vite proxy forwards `/api/*` to the server).

## Your task

The starter serves `GET /api/albums` (+ `/:id`) and renders one hard-coded
card. Build on it:

1. **Wire up** — render real albums from the API, with loading/error states
2. **CRUD** — create, edit, and delete albums from the UI; write the API
   routes; persist to the JSON file; validate input
3. **Find** — at least one search/filter/sort
4. **Your feature** — one open-ended feature of your choosing, described in a
   short `NOTES.md` (what and why, tradeoffs, how you used AI tools)

AI tools are allowed and expected — but you own every line in the follow-up
interview.

## Acceptance criteria

- [ ] `docker compose up --build` is all we run — the app works at :5173
- [ ] Albums come from the API, not hard-coded
- [ ] CRUD works end to end and survives a restart
- [ ] Search/filter/sort works
- [ ] Your feature works and `NOTES.md` explains it
- [ ] TypeScript compiles: `npm run build` (client), `npm run typecheck` (server)

## Submitting

Don't fork or open PRs here. Send a **private** repo invite or a zip (without
`node_modules/`), with your git history intact. Aim for 4–8 hours; a polished
subset beats a rushed everything.
