# Record Shop — Take-Home

React 19 + Vite + Tailwind 4 client, Hono (TypeScript) server, JSON file
database (`server/data/albums.json`).

## Run

```bash
docker compose up --build
```

App: http://localhost:5173 · API: http://localhost:3000/api/health

Local dev: `npm install && npm run dev` in `server/` and `client/` (Vite
proxies `/api/*` to the server).

## Task

The starter serves `GET /api/albums` (+ `/:id`) and renders one hard-coded
album card. You should iterate on this, building a web app that does the following:

1. Render the album collection from the API, with loading and error states
2. CRUD: create, edit, and delete albums from the UI — write the API routes,
   persist to the JSON file, validate input
3. At least one search / filter / sort
4. One creative feature of your choice, described in a short `NOTES.md` (what, why,
   tradeoffs, AI tool usage)

AI tools are allowed.

## Acceptance criteria

- [ ] `docker compose up --build` is all we run; the app works at :5173
- [ ] Albums come from the API; CRUD persists across restarts
- [ ] Search/filter/sort works
- [ ] Your feature works and `NOTES.md` explains it

## Submitting

Due 48 hours after you receive this. Email the submission containing your forked repository url to `reid@r2rmovers.com`. Do not fork or open PRs on this
repo.
