# QJ's Reel 🎬

A personal film and TV tracker — dark, cinematic, honest ratings out of 10.

## What's in here

```
/
├── index.html       ← the site
├── styles.css       ← the look
├── app.js           ← the logic (router, 4 pages, modal, random picker)
├── movies.json      ← YOUR DATA
├── enrich.html      ← one-time tool to fetch posters from TMDB
└── README.md
```

## Pages

- **Home** — hero with stats, Netflix-style Top 10, random picker ("The Oracle"), recently logged
- **Watched** — everything you've seen + partial-watched entries
- **Watchlist** — unwatched + partial-watched entries (partial entries appear in BOTH tabs)
- **Stats** — rating histogram, top platforms, Hall of Fame (9+), Hall of Shame (≤2)

## Data model

Each entry:

```json
{
  "id": 28,
  "title": "Money heist",
  "platform": "Netflix",
  "rating": 8.5,
  "seasons_watched": "S1-S5",
  "status": "watched",
  "watched": true,
  "poster": "https://image.tmdb.org/...",
  "overview": "A criminal mastermind...",
  "year": "2017",
  "matched_title": "Money Heist",
  "tmdb_id": 71446,
  "tmdb_type": "tv"
}
```

### Status field

- `"watched"` — fully watched
- `"partial"` — you've watched some but more seasons exist or more to watch; appears in **both** Watched and Watchlist tabs with an "In progress" ribbon
- `"unwatched"` — on the watchlist, not started

### seasons_watched field

Shown as a badge on the poster (bottom-left). Values like `"S1"`, `"S1-S5"`, `"All"`, or `null`.

## First-time setup — get the posters & descriptions

Run this **once** to fill in posters using TMDB.

1. Get a free TMDB token at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Open `enrich.html` in your browser
3. Paste your token, click **Start enriching** (~1-2 minutes)
4. Click **Download enriched movies.json**
5. Replace the existing `movies.json` with the download

Some titles won't match (Pakistani dramas, ambiguous names) — they'll show clean text-based fallback cards.

## Deploying to GitHub Pages

1. Create a public repo on GitHub
2. Upload all 6 files
3. Settings → Pages → Source: `Deploy from a branch`, Branch: `main`, Folder: `/ (root)` → Save
4. Live at `https://<username>.github.io/<repo>/` in ~30 seconds

## Local preview

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Tech notes

- Zero-build static site. No framework, no dependencies.
- Hash-based routing (works on any static host)
- Fully responsive, mobile-first
- Terracotta accent on dark charcoal background
- Fonts: Fraunces (display), Inter Tight (body), JetBrains Mono (UI)
