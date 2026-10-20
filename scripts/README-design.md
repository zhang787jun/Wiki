# Knowledge-space redesign

The homepage is maintained in `zhang787jun/zhang787jun.github.io`; this repository owns the Wiki content and reader experience. Both continue to publish through GitHub Pages. Article source files and paths are unchanged.

## Design and interaction

Warm white, graphite and sage surfaces; system fonts; a restrained typographic scale; four topical entry points; searchable server-rendered content. The design takes cues from Apple’s visual hierarchy and the direct task entry of Kimi and Manus without using their branding or suggesting affiliation.

The `simple` theme now includes a keyboard-accessible search dialog, full-text search with Chinese/English matching and topic filters, a persistent light/dark preference, native folder disclosure controls, a reader table of contents, reading progress and code copying. No account, analytics service or AI endpoint is required. Search loads only the published Wiki catalog. A failed index request exposes retry and a catalog link.

All articles and directory links work without JavaScript. Optional scripts improve navigation and reading. MathJax remains an external dependency for article equations, as before. System fonts and the main UI do not depend on external font/CDN services. Reduced-motion and print styles are included.

## Build and verification

```sh
python -m pip install --no-deps -r requirements-build.txt
simiki g
cp favicon.ico output/favicon.ico
cp 404.html output/404.html
touch output/.nojekyll
python scripts/build_search_index.py
python scripts/check_pages_build.py
python scripts/check_redesign.py
node scripts/check_search.cjs
node --check themes/simple/static/js/space.js
```

`build_search_index.py` derives its records from generated public catalog links, not arbitrary source directories. CI verifies every record points to a generated article, that the catalog and index match, and that reader scripts/styles exist. Search checks include actual body-only matches, full-width Latin letters, combined queries, ordering and filters.

The homepage copies the shared stylesheet, scripts and mark from `themes/simple/static/` into its `assets/` directory. Update both when changing shared UI. Homepage-specific styles are in the same stylesheet so the sites share design tokens. Existing root article URLs continue to use the Wiki's stylesheet and receive compatibility styling.

## Verification limits

The initial redesign passed a local Python 3.12 build and static/behavior checks. The deployment workflow uses the existing Python 3.11 runtime. Desktop/mobile browser visual inspection was unavailable in the authoring environment. Existing article-body content, historical outbound links and historical image availability were not edited or recertified as part of this visual redesign.
