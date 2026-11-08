# CLAUDE.md — I Was Here / Places & Memories

## Start of every session (read first)
1. `git fetch origin` and inspect `git log origin/main -10`; other agents or the owner may have pushed.
2. Read, in this order:
   1. this file;
   2. `PROJECT_STATUS.md`: current state, open PRs and branches, known bugs, **next task**;
   3. `DECYZJE_PROJEKTOWE.md`: binding owner decisions on logo, colours, map, navigation, PL/EN, stamps and plans;
   4. `ROADMAP.md`: priorities;
   5. `CHANGELOG.md`: history, latest version and PWA cache key.
3. Check open PRs and branches (`git branch -r`; `git rev-list --count origin/main..<branch>`). Never redo or overwrite unmerged work.
4. Branch from the latest `origin/main` (`claude/<topic>`), implement, test (see *Commands*), commit with the session attribution lines, push and open a PR with a **Polish** description.
5. **Never merge yourself.** The owner merges by writing „Scal”. Only then merge the PR (merge commit) and confirm the GitHub Actions runs „pages build and deployment” and „Sprawdź aplikację Warszawa”.
6. Before finishing a PR: update `PROJECT_STATUS.md` and `CHANGELOG.md`, plus `DECYZJE_PROJEKTOWE.md` if the owner decided something new, in the same PR.
7. Talk to the owner in **Polish**. Always say whether you could test on a real iPhone; normally you can't, only Chromium iPhone 13 emulation.

## Project and source of truth
This repository is the **single shared source of truth** for the travel web app **I Was Here — Places & Memories** (Polish working name: "Tu Byłem — Miejsca i Wspomnienia"). Current version: **8.7.0** (`main`, PR #22). The app is signed **„Made by Tomasz Kmiecik”** (owner's request) — keep the credit in the Atlas Profile, the regional and Warsaw footers and `<meta name="author">`.
- Repo: https://github.com/Auriol-kno/Zwiedzanie-trip (owner merges, `main` deploys to GitHub Pages).
- Published PWA: https://auriol-kno.github.io/Zwiedzanie-trip/. The start page is `atlas.html`.
- Pages: `atlas.html` (Poland Atlas), `region.html?region=…&town=…` (regional guides), `index.html` (Warsaw guide, the only full city guide).
- The UI is bilingual **PL/EN**; the language is kept across all pages (`tubylem_lang`, `?lang=`).

## Architecture (static, no build step)
Lightweight **HTML/CSS/vanilla JavaScript** PWA on GitHub Pages. Do not assume React/Vite/a backend. No secrets or API keys in public code.

| Area | Files | Notes |
|---|---|---|
| Atlas map | `atlas.html`, `assets/atlas.js`, `data/regiony-lite.js`, `assets/atlas-premium.css` (+ `atlas.css`, `atlas-light-v5.css`) | SVG map 900×680, equirectangular projection at 52°. Styles Atlas (default) / Jasny / Noc / Teren, chosen in the **Layers** panel. API `window.IWH_ATLAS` (`lang, setLang, style, setStyle, resolve, show, cities, changed, home`). **Performance (8.6.4):** during gestures/animations call `preview()` (CSS transform on `.atlas-map`, GPU) and `commit()`/`setTransform()` once at the end; never call `setTransform()` per pointermove, and do not move the CSS transform onto `<svg>` itself (non-scaling strokes would repaint every frame). |
| Geography | `assets/poland-geography.js`, `assets/poland-relief.webp` | **Generated** by `tools/build_geography.py` (Natural Earth 1:10m, Terrain Tiles). Never edit by hand or draw geography by eye. |
| City motifs | `assets/atlas-illustrated.js` | Decorative layers plus the 14 city motifs as **postage stamps** (`IWH_ATLAS_ART.landmark(id,{name,visited})`, `paintDefs`, `cities`, `cityName`). No SVG filters. |
| My data (8.7) | `assets/user-data.js` | `window.IWH_DATA`: Excel `.xlsx` built in the browser without libraries (own ZIP writer/reader, deflate via `CompressionStream`/`DecompressionStream`): sheets Start, Plany/Plans, Pieczątki/Stamps, Odznaki/Badges, Dziennik/Journal, Mapa/Map (scatter-chart map from `POLAND_GEO`, Atlas projection), Miejsca/Places (catalogue for drop-downs), hidden `_mapa`. Full `.json` backup with journal photos; import `.xlsx`/`.json` with preview, **merge by default, never deletes**; „Wyślij e-mailem” = Web Share with the file, fallback download + `mailto:`. Mounted in the Atlas Profile. Sheet names and column order are the import contract — change parser and writer together. |
| Atlas tabs | `assets/atlas-plans.js` | `window.IWH_PLANS`. Tabs `map`, `explore` (map + search), `plans` (trips ⇄ day plans, „add trip to a day plan”), `passport` (= Stamps), `profile`. `atlas.html?tab=…`. Stores `iwh_trips`, `iwh_days`, `iwh_visited`. |
| Explore (themed routes) | `assets/explore-themes.js`, `.css`, `data/szlaki.json` | `window.IWH_EXPLORE`: 15 themes with vector tile art (incl. „Plany województw”, one plan per province with a `region` link), 46 routes; loaded with `fetch` only when the Explore tab opens. Deep link `atlas.html?tab=explore&route=<id>`. Routes save as trips/day plans via `IWH_PLANS.addPlan`. |
| Place history | `data/historia/<region>.json` | ≥10 sentences PL and EN per place (validated by `sync_database.py`), fetched on demand in `region.js` details. Legends marked as legends. All 213 regional places are covered; `sync_database.py` fails if a regional place has no history. Warsaw: all 184 sights have histories in `data/warszawa-historia/*.json` (map `index.json` generated by `sync_database.py`), loaded on demand in `index.html` details. |
| Object index | `data/index/places.json` | **Generated** by `sync_database.py` (stage 1 of `BAZA_DANYCH.md`): all 397 objects (regional `k:place` + Warsaw `k:waw`), short keys. Fetched on demand by Stamps when the page lacks the full database. |
| Bottom menu | `assets/app-nav.js`, `assets/app-nav.css` | One menu on every page: **Mapa · Odkrywaj · Plany · Pieczątki · Profil**. The Poland map button `#atlasFloat.poland-fab` lives in each page's header markup; its styles are in `app-nav.css`. |
| Shared extras | `assets/place-extras.js`, `.css` | `window.IWH_EXTRAS`: Wikipedia links (`wikiHTML`), travel journal (`journal.*`, IndexedDB `iwh_journal`, ≤5 photos, local only), **Stamps** (`passport.mount/open/stats`; toggles fire `iwh-stamps-change`). |
| Regional guide | `region.html`, `assets/region-loader.js`, `assets/region.js`, `assets/region.css`, `assets/vendor/leaflet/` | Loads `data/regiony-lite.js`, then `region-loader.js` fetches `data/regiony/<id>.json` (full data) and starts `region.js` (fallback: full `data/regiony.js`). Filters before the map, Leaflet map (local copy, offline message when OSM tiles fail), day plan (walk/car/transit), details with Wikipedia, ♡, „Byłem tu”, „Do planu dnia/Do podróży”, journal. City stamp in the hero. |
| Warsaw guide | `index.html` (inline app), `assets/features3.js`, `assets/i18n4.js` (PL→EN sentence dictionary; skips `[data-i18n-skip]`), `assets/nav4.css`, `assets/upgrade3.css`, `assets/brand-v5.css/js`, `assets/trips-ics.js` (trip library + .ics only) | Planner, food, editorial 1–5 score, Warsaw stamps (`odkryjWarszawe_1`), speech, GPS. |
| Brand | `assets/brand-mark.svg` (green tile = floating Poland map), `assets/brand-pin-landscape.svg` (landscape pin, logo left of the wordmark), `icon.svg` + `icon-180/512.png` (PWA) | All generated by `tools/build_logo.py`; PNGs by `tools/render_icons.py` (workflow `sync-icons.yml`). |
| Data | `data/atrakcje.json` (184 Warsaw / 18 districts), `data/restauracje.json` (36), `data/regiony.json` (16 provinces, 213 places) | Browser copies `data/*.js`, `data/regiony-lite.js` (Atlas, no descriptions) and `data/regiony/<id>.json` (per province) are **generated** by `tools/sync_database.py`; edit only `data/regiony.json`. Fields `coordinateStatus` (`osm`/`orientacyjne`), `osm`, `wiki {qid,pl,en}`. |
| PWA | `manifest.webmanifest`, `service-worker.js` | Network-first; `CORE` list of cached files; **bump `KEY`** (`i-was-here-v<ver>-<yyyymmdd>`, now `v8-7-0`) whenever cached files change. |
| Tests / CI | `tools/test_bundle.py`, `tools/test_atlas.py`, `tools/test_browser.js` (Playwright, 94 checks), `.github/workflows/validate.yml` | CI runs everything on each push/PR to `main`. |

localStorage keys:
- `tubylem_lang`, `tubylem_map_style`, `iwh_layers`;
- `iwh_trips`, `iwh_days`;
- `iwh_visited` (`city:<id>`, `region:<id>`, `town:<region>:<name>`), `iwh_region_visited`, `iwh_region_favs`;
- `odkryjWarszawe_1` (Warsaw state incl. `visited`), `waw3_*`;
- `iwh_profile` (8.7: optional user email for „Wyślij e-mailem”, local only);
- legacy, read-only: `tb_saved_trips`.

IndexedDB: `iwh_journal` (keys `reg:<placeId>`, `waw:<attractionId>`, `atlas:<item key>`). **Never delete or upload user data.**

## Binding UI decisions (details in `DECYZJE_PROJEKTOWE.md`)
- **Logo:** landscape pin **left of** the wordmark „PLACES & MEMORIES / I WAS HERE”, top-left; the logo is not a link.
- **Poland map button:** the green tile **in the same row as the logo**, the middle item of the header between the logo and the buttons (`#atlasFloat.poland-fab`, 48 px; 44 px in the Atlas). The header is always visible, so the button is too. It always leads to the whole map of Poland; in the Atlas it calls `home()` without a reload. On screens ≤370 px the wordmark hides and only the pin stays. No white halo.
- **Palette:** navy `#0B3446`, amber `#F47C28` / `#FFB24A`, olive land, cream `#F6F1E4`. Serif italic brand wordmark.
- **City motifs:** postage stamps (owner's choice, style 5), with a „✓” postmark when the city is visited.
- **One bottom menu**, identical everywhere. **No duplicate controls on one screen:** the language switch lives in the header, the map style in the Layers panel, and there is no corner „Polska” button.
- **Pieczątki / Stamps:** the former „Paszport”. Clickable counters, „Byłem tu” toggles that can be undone, journal with up to 5 photos. In attraction details the main action is **„✣ Zdobądź pieczątkę”**; „📝 Notatki i zdjęcia” appears only after the stamp is collected (also as 📝 next to collected stamps).

## Features and non-features
- 14 pinned cities at correct locations; **Warsaw is the only full city guide**. Never present the other cities as full guides; their sights live in the province guides.
- All 16 provinces have guides (Mazowieckie partial: Warsaw + 8 places).
- 172 of 213 regional positions are OSM-verified (`tools/verify_coordinates.py`, © OpenStreetMap ODbL — keep the attribution).
- 115 of 213 regional places and 69 of 184 Warsaw sights have confirmed Wikipedia articles; the rest get an honest search link.
- The 1–5 score is **editorial**, not Google's. No live ratings, no Places API keys.
- Transit and routing are **estimates plus Google Maps links**, not real-time WTP routing.
- Approximate coordinates and missing EN texts stay honestly labelled.

## Rules for cooperating with ChatGPT and other AI coding agents
1. Fetch the latest `main` first.
2. Do not push nontrivial changes to `main`; use a `claude/<topic>` branch and a PR.
3. Never overwrite another agent's work. No force-push, rebase or deletion of unrelated work.
4. Keep PRs focused, with a concise **Polish** description: what changed, tests, limitations, and what still needs a real iPhone.
5. Before editing UI, inspect `atlas.html`, `index.html` and `region.html` plus their CSS/JS. Preserve the floating Poland map, the bottom menu, iPhone safe areas and both languages.
6. Update PL and EN together; English must not contain Polish UI fragments (the browser test checks this). Never fabricate history.
7. Real, source-backed geography only. Decorations must not move pins or borders.
8. Run all tests (see Commands) and `node --check` on changed JS. Review `git diff`.
9. No credentials, tokens or personal data in the repo; no high-resolution binaries unless authorised.
10. Update the docs (`PROJECT_STATUS.md`, `CHANGELOG.md`, `DECYZJE_PROJEKTOWE.md`, `ROADMAP.md`, release notes) with implementation changes.
11. For big visual changes, offer the owner **variants first**: Design canvases in claude.ai, e.g. logo board https://claude.ai/artifact/3vK2N3k66menpSRVZwnjkY and city-style board https://claude.ai/artifact/61rgJrriroFaGWZBLLHWae.

## Documentation index
| File | Purpose |
|---|---|
| `PROJECT_STATUS.md` | Current state: features, partial work, known and solved bugs, repo/PR state, environment, next task |
| `DECYZJE_PROJEKTOWE.md` | Binding owner decisions: logo, colours, map, navigation, PL/EN, stamps, plans, content |
| `ROADMAP.md` | Plan: stages A–E, out-of-scope items |
| `CHANGELOG.md` | Version history 3.x → 8.7.0 with PR numbers and merge commits |
| `README.txt` | User-facing description (EN), iPhone installation |
| `ATLAS_4_0.md`, `ATLAS_5_0.md`, `ATLAS_7_0.md` | Atlas release notes (7.0 = map design) |
| `REGIONY_6_0.md`, `REGIONY_8_0.md` | Regional guides, data model, OSM verification |
| `INTEGRACJE_3_0.md` | Warsaw data model, Google/WTP limits |
| `BAZA_DANYCH.md` | Database proposal for hundreds of places, photos and restaurants (stage 1 static-first, stage 2 Supabase — owner decision) |
| `PLAN_ROZWOJU.md`, `data/SCHEMA.md` | **Historical/outdated**; do not follow blindly |

## Commands
```bash
python3 -m http.server 8000          # then http://localhost:8000/atlas.html
python tools/sync_database.py        # regenerate data/*.js from data/*.json (must leave no git diff)
python tools/test_bundle.py && python tools/test_atlas.py
for f in assets/*.js data/*.js service-worker.js tools/*.js; do node --check "$f"; done
NODE_PATH=$(npm root -g) node tools/test_browser.js   # Playwright/Chromium (preinstalled in the Claude sandbox)
python tools/build_logo.py           # logo tile, landscape pin, icon.svg (then python tools/render_icons.py, needs cairosvg)
python tools/verify_coordinates.py --cache .geo-cache/osm.json [--apply]   # needs nominatim.openstreetmap.org
python tools/build_geography.py --cache .geo-cache [--no-relief]           # needs numpy, Pillow, shapely + network
python tools/wiki_links.py --cache .geo-cache/wiki.json [--apply]          # Wikipedia via OSM wikidata tag + Wikidata
```

## Data pipelines
- **Warsaw:** edit `data/atrakcje.json` / `data/restauracje.json` → `sync_database.py` → `data/*.js`.
- **Regions:** edit `data/regiony.json` (unique ids, `coordinateStatus`) → `sync_database.py` (also writes `regiony-lite.js` and `data/regiony/*.json`); optionally `verify_coordinates.py --apply`.
- **Wikipedia:** `wiki_links.py --apply` writes only confirmed matches; the manual `REJECT` list holds wrong matches → `sync_database.py`.
- **Geography:** only via `build_geography.py`.
- **Brand and icons:** `build_logo.py` → `render_icons.py`. The `sync-icons.yml` workflow may push PNGs to `main` (known exception).
- **Any change to cached files:** bump `KEY` in `service-worker.js`.

## Environment (Claude Code cloud sandbox)
- Allowed extra hosts (tools only): `nominatim.openstreetmap.org` (2.5 s delay, honour 429) and `www.wikidata.org` (on 429 wait and retry).
- `*.wikipedia.org`, `*.github.io` and `chatgpt.com` are **not** reachable. Verify deployment via GitHub Actions. Images from the owner arrive as chat attachments.
- GitHub via MCP tools (`mcp__github__*`); `gh` only for search. Merge with `merge_method: merge` and `expectedHeadSha` (full 40-char SHA).

## Priority design notes
Version 7.0 brief (`PROMPT_DLA_CLAUDE_I_WAS_HERE_MAPA.md`, owner's document): premium cartographic atlas with deep navy sea, warm olive land with real shaded relief, cream province borders that strengthen with zoom, amber pins and a consistent navy/amber palette. Since 8.5 the always-visible **Poland map button in the header row, next to the logo,** is the way back to the whole country (it replaced the corner „Polska/Poland” button). The light illustrated atlas stays as the „Jasny/Light” style. Correct geography always wins over decoration. Keep the map responsive on iPhone and the way back to it always accessible.
