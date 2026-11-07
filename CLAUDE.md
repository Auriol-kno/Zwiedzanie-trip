# CLAUDE.md — I Was Here / Places & Memories

## Start of every session (read first)
1. `git fetch origin main` and inspect `git log origin/main -10` — other agents/the owner may have pushed.
2. Read, in order: this file → `PROJECT_STATUS.md` (current state, known bugs, **next task**) → `ROADMAP.md` (priorities) → `CHANGELOG.md` (history, latest version and PWA cache key).
3. Check open PRs/branches (`git branch -r`); never redo or overwrite unmerged work.
4. Branch from the latest `origin/main` (`claude/<topic>`), implement, test (see *Commands*), open a PR.
5. **Never merge yourself.** The owner merges by writing „Scal”; only then merge the PR and confirm the Pages deployment.
6. Before finishing: update `PROJECT_STATUS.md` + `CHANGELOG.md` (and the release notes file) in the same PR.

## Project and source of truth
This repository is the **single shared source of truth** for the travel web app **I Was Here — Places & Memories** (Polish working name: "Tu Byłem — Miejsca i Wspomnienia").
- Repo: https://github.com/Auriol-kno/Zwiedzanie-trip
- Published PWA: https://auriol-kno.github.io/Zwiedzanie-trip/
- Poland atlas entry: `atlas.html`
- Warsaw guide: `index.html`
- User-facing explanations and feature discussions are in **Polish** unless the owner explicitly requests another language.
- The application UI supports **English and Polish**, preserving the selected language across the atlas and Warsaw guide.

## Existing architecture
A lightweight static **HTML/CSS/vanilla JavaScript** PWA deployed through GitHub Pages; do not assume a React/Vite/backend build. No secrets belong in public web code.
- `atlas.html`, `assets/atlas.js`, `assets/atlas-premium.css` (+ `atlas.css`, `atlas-light-v5.css`): interactive map of Poland. Since 7.0 the default style **„Atlas”** is the premium cartographic map chosen by the owner (navy Baltic, olive land, real relief, amber pins); the former *light illustrated atlas* (concept 1) remains as style **„Jasny/Light”**. See `ATLAS_7_0.md`.
- `assets/poland-geography.js` and `assets/poland-relief.webp` are **generated** by `tools/build_geography.py` from Natural Earth 1:10m (public domain) and Terrain Tiles (SRTM/EU-DEM © Copernicus). Do not edit them by hand; never draw geography by eye.
- `assets/atlas-plans.js`: bottom tabs (Map, Trip plan, My day plan, Memories, Profile) with trip plans and day plans stored in `localStorage` (`iwh_trips`, `iwh_days`, `iwh_visited`).
- `index.html`, `assets/features3.js`, `assets/upgrade3.css`, `assets/i18n4.js`, `assets/nav4.css`: Warsaw guide, planner, PL/EN translations, and permanent floating return-to-Poland control.
- `data/atrakcje.json`: curated Warsaw attractions (184 entries in 18 districts as of current project records).
- `data/restauracje.json`: curated Warsaw food venues (36 entries as of current project records).
- `data/regiony.json`: 16 voivodeships (provinces) and 207 curated regional places (Kielce: 14) — every province has a regional guide (Mazowieckie: Warsaw guide + 8 places); generated to `data/regiony.js`. See `REGIONY_8_0.md`.
- `region.html`, `assets/region.js`, `assets/region.css`: regional guide (list, map, town/category filters, saved places, stamps, estimated day plan, PL/EN). The Atlas opens it from a province or town (`region.html?region=…&town=…`).
- `data/atrakcje.js`, `data/restauracje.js` and `data/regiony.js` are browser-loaded **generated** copies; regenerate after changing JSON with `python tools/sync_database.py`.
- `manifest.webmanifest`, `service-worker.js`: iPhone PWA and offline application cache. Bump the cache version whenever adding or changing cached files.
- `assets/place-extras.js` + `.css` (8.3, loaded by all three pages): „More information — Wikipedia” links (verified article from the `wiki` field, otherwise an honest Wikipedia *search* link) and the **travel journal** (notes + up to 5 photos per place, stored only on the device in IndexedDB `iwh_journal`; keys `reg:<placeId>`, `waw:<attractionId>`, `atlas:<item key>`). Never upload or delete journal data without the owner's consent.
- `assets/brand-atlas.svg`: the single logo symbol (pin inside the Poland silhouette) used top-left on every page; it always links back to the Atlas.
- `tools/test_bundle.py` and `tools/test_atlas.py`: regression tests.
- `.github/workflows/validate.yml`: GitHub Actions validation.

## Features and non-features
- Poland Atlas with 14 pinned cities (Kielce added in 8.2) and correct geographic locations; **Warsaw is the only fully developed city**. Other city guides are planned, never present them as fully available.
- Atlas provinces: selecting a voivodeship zooms in, outlines it and shows towns with places. All **16 provinces** have regional guides (Mazowieckie is partial: Warsaw + 8 places). Each of the 14 cities has its sights in its province guide; only Warsaw has a full city guide. 166 of 207 regional positions are verified in OpenStreetMap via `tools/verify_coordinates.py` (`coordinateStatus: "osm"` + OSM id; © OpenStreetMap contributors, ODbL — keep the attribution); the rest stay `orientacyjne` (approximate).
- Warsaw: districts, sightseeing places, an itinerary planner, food section, editorial visit rating 1–5, favorites, virtual stamps, family and photography preferences, speech synthesis, GPS with permission.
- The independent 1–5 **editorial** score is NOT a Google review score. Google reviews are linked out; do not invent live ratings or include private Places API keys.
- Public transport and street routing are **estimates and external links**, not validated real-time WTP routing; do not claim otherwise.
- Some new attraction coordinates and editorial notes are approximate; do not silently label them verified.

## Rules for cooperating with ChatGPT and other AI coding agents
1. **Fetch/pull the latest `main` first.** Other assistants and the owner may have changed the repository.
2. Do not directly edit/push `main` for nontrivial tasks. Start a clearly named feature branch, e.g. `claude/atlas-mobile-navigation`, and open a Pull Request for user approval.
3. Never overwrite another agent's work without inspecting the latest code and diff. Do not force-push, rebase or delete unrelated work.
4. Keep PRs small, focused, and include a concise Polish description of what changed, tests performed, known limitations and any screenshot-based testing still needed.
5. Before editing UI: inspect both `atlas.html` and `index.html` plus their CSS/JS dependencies. Preserve navigation **Warsaw ⇄ Poland Atlas**, iPhone safe areas, floating return button, and both languages.
6. When changing visible copy, update PL and EN together. English must not leave Polish UI fragments; preserve place names when they are proper nouns. Avoid misleading automatically fabricated history.
7. Prefer real, source-backed geography and city coordinates. Decorative drawings/landmarks must not move pins or change real borders.
8. Test keyboard/mobile accessibility, iPhone Safari PWA behaviour, selected map style and localStorage persistence when possible. State explicitly if you could not test on a real iPhone.
9. Run: `python tools/sync_database.py`, `python tools/test_bundle.py`, `python tools/test_atlas.py`, `node tools/test_browser.js` (Playwright + Chromium; also runs in CI), and `node --check` on every changed JS file. Review git diff for unintended changes.
10. Prefer GitHub Issues / Pull Requests for coordination. Leave a PR ready for review rather than self-merging when another assistant may be working simultaneously.
11. Do not commit credentials, service tokens, personal user data, or generated high-resolution binary assets unless authorised.
12. Update relevant documentation (`README.txt`, `ATLAS_4_0.md`, or a new release notes file) when implementation changes.

## Documentation index
| File | Purpose |
|---|---|
| `PROJECT_STATUS.md` | Current state: working/partial features, known bugs, environment, next task |
| `ROADMAP.md` | Development plan (stages A–D) and out-of-scope items |
| `CHANGELOG.md` | Version history 3.x → 8.3 with PR numbers |
| `README.txt` | User-facing description (EN), iPhone installation |
| `ATLAS_4_0.md`, `ATLAS_5_0.md`, `ATLAS_7_0.md` | Atlas release notes (7.0 = current map design) |
| `REGIONY_6_0.md`, `REGIONY_8_0.md` | Regional guides, data model, OSM verification (8.1/8.2) |
| `INTEGRACJE_3_0.md` | Warsaw data model, Google/WTP limits |
| `PLAN_ROZWOJU.md`, `data/SCHEMA.md` | **Historical/outdated** (old React/MapLibre vision; 118-record schema) — do not follow blindly |

## Commands
```bash
python3 -m http.server 8000          # then http://localhost:8000/atlas.html
python tools/sync_database.py        # regenerate data/*.js from data/*.json (must leave no git diff)
python tools/test_bundle.py && python tools/test_atlas.py
for f in assets/*.js data/*.js service-worker.js tools/*.js; do node --check "$f"; done
NODE_PATH=$(npm root -g) node tools/test_browser.js   # Playwright/Chromium (preinstalled in Claude sandbox)
python tools/verify_coordinates.py --cache .geo-cache/osm.json [--apply]   # needs nominatim.openstreetmap.org
python tools/build_geography.py --cache .geo-cache [--no-relief]           # needs numpy, Pillow, shapely + network
python tools/wiki_links.py --cache .geo-cache/wiki.json [--apply]          # Wikipedia links via OSM wikidata tag + Wikidata
```

## Data pipelines
- Warsaw: edit `data/atrakcje.json` / `data/restauracje.json` → `sync_database.py` → `data/*.js`.
- Regions: edit `data/regiony.json` (unique ids, `coordinateStatus` `osm`|`orientacyjne`) → `sync_database.py` → `data/regiony.js`; optionally `verify_coordinates.py --apply`.
- Geography: only via `tools/build_geography.py` → `assets/poland-geography.js`, `assets/poland-relief.webp`.
- Icons: `tools/render_icons.py` (cairosvg) run by `.github/workflows/sync-icons.yml`, which pushes PNGs to `main` (known exception).
- Wikipedia: `tools/wiki_links.py --apply` writes `wiki: {qid, pl, en}` into `data/regiony.json` and `data/atrakcje.json` (only confirmed matches; Warsaw coordinates are not changed) → `sync_database.py`.
- Any change to cached files → bump `KEY` in `service-worker.js` (format `i-was-here-v<ver>-<yyyymmdd>`).

## Environment (Claude Code cloud sandbox)
- No secrets/API keys anywhere. Allowed extra hosts: `nominatim.openstreetmap.org` (tools only; 2.5 s delay, honour 429) and `www.wikidata.org` (tools only). `*.wikipedia.org` is not reachable from the sandbox.
- `*.github.io` is not reachable from the sandbox: verify deployment via the GitHub Actions run „pages build and deployment”.
- GitHub via MCP tools (no `gh` CLI except search); push to the session's `claude/...` branch.

## Suggested workflow
- User assigns issue to Claude Code or ChatGPT.
- Working AI reads current `main` and creates its own named branch.
- Implement and test; publish Pull Request.
- User reviews; optionally requests the *other* AI to review the PR/diff.
- Only after acceptance („Scal” from the owner), merge to `main`; verify GitHub Pages deployment.

## Priority design notes
Version 7.0 (owner's brief `PROMPT_DLA_CLAUDE_I_WAS_HERE_MAPA.md`): premium cartographic atlas — deep navy sea, warm olive land with real shaded relief, cream province borders that strengthen with zoom, amber pins, the permanent floating **„Polska/Poland”** button that animates back to the whole country, and a consistent navy/amber palette on all screens. Concept 1 (light illustrated atlas) stays available as the „Jasny/Light” style. Correct geography always wins over decoration. Keep the map responsive on iPhone and navigation back to it always accessible.
