I WAS HERE — PLACES & MEMORIES
Version 5.0 • 7 November 2026

POLAND ATLAS / MAIN SCREEN
https://auriol-kno.github.io/Zwiedzanie-trip/atlas.html
WARSAW SIGHTSEEING GUIDE
https://auriol-kno.github.io/Zwiedzanie-trip/
GITHUB REPOSITORY
https://github.com/Auriol-kno/Zwiedzanie-trip

WHAT'S NEW IN VERSION 5.0
- Chosen visual concept #1: bright illustrated map of Poland with a cream and light-green palette.
- Accurate Polish outline and boundaries of 16 provinces using geographical Natural Earth data.
- The same 13 cities in their correct geographical locations.
- Illustration-style landmarks, woods, blue rivers, lakes and mountains.
- New English product name: I Was Here — Places & Memories.
- New English brand mark in the main Atlas and Warsaw screens.
- English interface and light Atlas selected on first launch of version 5.
- Optional Polish language and Night/Terrain styles still available.
- A floating return-to-Poland button remains available in Warsaw.
- PWA manifest updated with the English name and new SVG icon.

WARSAW FUNCTIONS
- 184 curated places across 18 districts, including parks, memorials and museums.
- 36 selected places to eat, with cuisine, district and budget filters.
- Planning by time and transport mode; photo and family preferences.
- Saved places, digital stamps, spoken descriptions, GPS starting point.
- Real travel times and Google ratings still require external integrations.

ATLAS 7.0 — NEW MAP
- Default style "Atlas": navy Baltic, olive land with real terrain relief, cream province borders, amber pins.
- Real geography: Natural Earth 1:10m borders of Poland and all 16 provinces, rivers and lakes; relief from Terrain Tiles.
- Zoom in: borders get stronger, province names and then towns appear. Layers button: borders, names, relief, towns, illustrations; styles Atlas / Light / Night / Terrain.
- Tap a city: card with description, status and actions (View, Trip plan, Day plan, I was here).
- Bottom tabs: Map of Poland, Trip plan, My day plan, Memories, Profile (saved on this device).
- The floating "Poland" button always returns to the whole country. See ATLAS_7_0.md.

KIELCE (8.2)
- Kielce added as the 14th Atlas city with 14 sights ("Explore Kielce" opens them in the Świętokrzyskie guide).

REGIONAL GUIDES (8.0)
- All 16 provinces now have regional guides with 198 curated places; each of the 13 cities opens its sights from the Atlas card ("Explore <city>"). See REGIONY_8_0.md.

PROVINCES (6.0)
- Below the 13 cities the Atlas lists all 16 provinces.
- Tap a province (list or map) to zoom in, see its outline and towns with places.
- Pick a town (e.g. Sandomierz, Sierpc) and tap Explore to open the regional guide.
- Świętokrzyskie: 31 places in 19 towns; Mazowieckie: Warsaw guide + 8 places. Others: coming soon.
- Regional guide: map, filters, saved places, stamps and an estimated day plan. See REGIONY_6_0.md.

IPHONE
1. Open the Poland Atlas link in Safari.
2. Choose Share → Add to Home Screen.
3. Choose Warsaw on the map to open its sightseeing guide.
4. Tap the I Was Here logo with the mini Poland map (top left, always visible) to return to the Atlas.
5. Use the PL | EN switch (the active language is highlighted); the choice is remembered.
6. If your older home-screen shortcut opens the old page, remove that shortcut and add it again from /atlas.html.

MAINTENANCE
- Map data: assets/poland-geography.js
- Illustrated map artwork: assets/atlas-illustrated.js
- Light Atlas style: assets/atlas-light-v5.css
- Map controls: assets/atlas.js (pan, pinch-zoom, keyboard)
- Browser test: node tools/test_browser.js (Playwright, Chromium)
- Branding and logos: assets/brand-pin.svg, assets/logo-en.svg, icon.svg
- Read ATLAS_5_0.md for geography sources, limitations and plans.

IMPORTANT
- The map border, province boundaries and city coordinates are geographic data.
- Landmark vignettes and scenery are artistic representations, not a topographic survey.
- Currently only Warsaw has the full guide; the other 12 cities are coming soon.
- The 180px and 512px PNG icons were regenerated from the SVG logo by GitHub Actions (commit 7766a2c2). Previously installed iPhone shortcuts may keep a cached old icon; add the app again if needed.
- Final tests on a physical iPhone and live GitHub Pages deployment verification remain pending.
