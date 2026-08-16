# Notely

A minimalist, local-first note-taking web app: rich-text writing, syntax-highlighted
code blocks in any language, and an editable shapes/drawing canvas — everything stored
in a local **MongoDB**.

Design language from the `ui-ux-pro-max` skill: *Exaggerated Minimalism* — warm ink on
cream, amber accent, Inter. Light & dark mode. The full design system lives in
[`design-system/notely/MASTER.md`](design-system/notely/MASTER.md).

## Features

A **OneNote-style free-form canvas** — add and move content anywhere:

- **Click anywhere** on the canvas to drop a text box and start writing. Empty boxes are
  discarded automatically when you click away.
- **Rich text** (per box) — headings (H1–H3), bold / italic / underline / strikethrough,
  highlight, bullet / numbered / **checklists**, quotes, links, dividers, text alignment.
- **Code blocks** — free-floating code editors with a per-block language picker and live
  syntax highlighting for Python, SQL, Java, JavaScript, TypeScript, C, C++, C#, Go, Rust,
  Bash, JSON, HTML/XML, CSS, PHP, Ruby, Kotlin, Swift, YAML — plus Tab-indent and one-click copy.
- **Drawing** — toggle **Draw** and the paint toolbar appears at the top; sketch over the
  whole canvas with freehand pen, rectangle, ellipse, line, arrow, and text. Pick colors and
  stroke widths; select to move or delete. Stored as **vector JSON** (not images), so it
  stays crisp and re-editable.
- **Move & resize** any block by its top grip handle / right edge. Blocks stack by recency.
- **Autosave** to MongoDB (debounced), searchable note list, light/dark theme.

Each note is one MongoDB document: `{ title, blocks[], drawing[] }`, where every block is a
positioned text or code container. Legacy linear notes migrate into a single text block on open.

## Architecture

| Layer  | Tech |
|--------|------|
| Client | React 18 + Vite, TipTap (ProseMirror), lowlight/highlight.js, lucide-react |
| Server | Express + native MongoDB driver, REST API on `:4000` |
| Data   | MongoDB `notely` database, `notes` collection. Each note = one TipTap JSON doc |

The Vite dev server (`:5173`) proxies `/api` to the Express server (`:4000`).

## Prerequisites

- Node.js 18+ (tested on Node 24)
- A running MongoDB on `localhost:27017`

> **Note about MongoDB on this machine:** the pre-existing `MongoDB` Windows service points
> at a **0-byte / broken `mongod.exe`**, so it can't start. This project was set up to use
> **MongoDB in Docker** instead, with a persistent named volume so your notes survive restarts.

### Start MongoDB (Docker)

```powershell
docker run -d --name notely-mongo -p 27017:27017 -v notely_mongo_data:/data/db --restart unless-stopped mongo:7
```

It's already running from setup. To manage it later:

```powershell
docker start notely-mongo    # start again after a reboot (auto-restarts with Docker)
docker stop  notely-mongo    # stop
```

If you later install MongoDB natively, just point the server at it — no code change needed
(it defaults to `mongodb://127.0.0.1:27017`).

## Run

```powershell
npm run install:all   # first time only — installs root, server, and client deps
npm run dev           # starts API (:4000) and client (:5173) together
```

Then open **http://localhost:5173**.

## Configuration

Server env vars (optional): `PORT` (4000), `MONGO_URI` (`mongodb://127.0.0.1:27017`),
`DB_NAME` (`notely`).

## API

| Method | Route             | Purpose                    |
|--------|-------------------|----------------------------|
| GET    | `/api/notes`      | List notes (metadata only) |
| GET    | `/api/notes/:id`  | Get one note (full doc)    |
| POST   | `/api/notes`      | Create                     |
| PUT    | `/api/notes/:id`  | Update title / content     |
| DELETE | `/api/notes/:id`  | Delete                     |
