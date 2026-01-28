# Japan Map Projects

This repository contains interactive, map-driven learning and exploration projects about Japan. The two main apps are:

- Prefecture Signpost Trainer — an interactive Leaflet map you can click to view real signpost stickers (images) for Japanese prefectures.
  - Location: `signpost_sticker_map/`
  - Entry page: `signpost_sticker_map/signpost_sticker_index.html`
- Cities ≥ 25k Population — a clustered point map of Japanese cities with population ≥ 25,000.
  - Location: `population25k_map/`
  - Entry page: `population25k_map/jp_cities_25k_index.html`

This README focuses on the Prefecture Signpost Trainer because it is the main interactive, code-driven feature in this repo.

---

Table of contents

- [What it is](#what-it-is)
- [How it works (signpost trainer)](#how-it-works-signpost-trainer)
- [File / code overview](#file--code-overview)
- [Image naming / how to add photos](#image-naming--how-to-add-photos)
- [Local development / preview](#local-development--preview)
- [Deployment / GitHub Pages](#deployment--github-pages)
- [Data sources](#data-sources)
- [Contributing](#contributing)
- [License & credits](#license--credits)
- [Open offers](#open-offers)

---

## What it is

The Prefecture Signpost Trainer is a small learning tool that shows the geographical outline of Japan's prefectures using Leaflet. Each prefecture is scanned for a small set of real-world signpost sticker photos (if available). Users click a prefecture to open a sidebar with the prefecture names (English and Japanese) and a preview/gallery of sticker photos for that prefecture.

Visual cues:
- Prefectures that have at least one image are styled in blue.
- Prefectures with no images are gray and show a "no meta available" placeholder.
- Hovering over a (non-gray) prefecture temporarily highlights it.

The Cities map is a separate, simpler Leaflet/MarkerCluster example listing cities with population ≥ 25k.

---

## How it works (signpost trainer)

Main flow:

1. initMap initializes a Leaflet map centered on Japan and adds a basemap tile layer.
   - Implemented in `signpost_sticker_map/js/map.js`.

2. loadPrefectures fetches GeoJSON (prefecture polygons) and creates a Leaflet GeoJSON layer:
   - GeoJSON used: `signpost_sticker_map/data/prefectures_land_only_clean.geojson`.
   - `onEachFeature` binds mouseover, mouseout and click handlers.
   - On click the app opens the sidebar and attempts to load images for the clicked prefecture.

3. Image discovery:
   - The code uses `sanitizeKey(nameEn)` to convert the prefecture English name into a stable key. Implementation detail:
     - It takes the first token of the English name, lowercases it and removes non-alphanumeric characters. Example: `"Tokyo Metropolis"` → `"tokyo"`.
     - Implemented in `signpost_sticker_map/js/utils.js`.
   - `hasImageForKey(key, { maxNumbered = 1, exts = [...] })` probes whether there are images for that key.
     - Strategy:
       1. Probe `images/{key}/1.ext` (folder with numbered images) for common extensions (png, jpg, jpeg, webp).
       2. If not found, probe `images/{key}.ext` (flat file).
     - Probing loads the image in the browser (with a cache-busting query) and resolves true if it loads within a timeout.
     - Results are cached in an in-memory Map to avoid repeated requests.
     - Implemented in `signpost_sticker_map/js/utils.js`.
   - The app pre-scans all prefectures in the background (`preScanAllPrefectures`) to mark those with images and update styles early.

4. Gallery and display:
   - A `Gallery` class (in `signpost_sticker_map/js/gallery.js`) loads images for a key (e.g. `gallery.loadForKey(key, 12)`) and handles the preview strip, main image, and previous/next controls.
   - Sidebar helpers (`signpost_sticker_map/js/sidebar.js`) manage opening/closing the UI, showing spinner/placeholder text, and writing the English/Japanese names.

5. Visual status:
   - If pre-scan/probing determines no images: the prefecture is colored gray and the sidebar shows "No meta available".
   - If images exist: clicking shows a spinner while images are loaded, then the gallery.

---

## File / code overview

Top-level (relevant to the signpost trainer):

- signpost_sticker_map/
  - signpost_sticker_index.html — app entry HTML (includes sidebar and map container)
  - css/signpost_sticker.css — styling for map, sidebar and gallery
  - js/
    - main.js — app entry module: initializes map, gallery, pre-scan and click logic
    - map.js — map initialization, prefecture style, loadPrefectures (GeoJSON)
    - utils.js — sanitizeKey, hasImageForKey, probeImageUrl, and an image-key cache
    - gallery.js — gallery logic (loading multiple images, preview strip, navigation)
    - sidebar.js — sidebar UI helpers (open/close, spinner, text)
  - data/
    - prefectures_land_only_clean.geojson — prefecture polygons used for the layer
  - images/
    - (image folders / files for prefectures live here; see naming rules below)

Other project:
- population25k_map/ — a separate map demonstrating city markers & clustering

See the code for more comments and small behaviors — functions are intentionally small and documented inline.

---

## Image naming / how to add photos

To add images for a prefecture, place files under `signpost_sticker_map/images/` using one of these patterns:

1. Folder with numbered images (preferred for multiple images)
   - images/tokyo/1.jpg
   - images/tokyo/2.jpg
   - ...
   - The app probes `images/{key}/1.ext` (and other exts) to detect presence.

2. Single image file (flat)
   - images/tokyo.jpg

Where `{key}` is produced by `sanitizeKey(nameEn)`:
- It takes the English name's first token, lowercases and strips non-alphanumeric characters.
- Examples:
  - "Tokyo Metropolis" → `tokyo`
  - "Aichi Prefecture" → `aichi`
  - "Oita Pref." → `oita`

Notes:
- Supported extensions probed: png, jpg, jpeg, webp (configurable in code).
- The default probe checks only the "1" file in a folder (maxNumbered = 1) to keep network requests light. You can increase `maxNumbered` if you plan many numbered images.
- The probe uses a timeout and caches results in memory. If you add or change images during development, reload the page (or call the `clearImageKeyCache()` helper) to refresh probes.

---

## Local development / preview

Because this is a static site you can preview easily.

Serve from the repo root (recommended to avoid CORS issues):

- Python 3:
  ```
  cd signpost_sticker_map
  python -m http.server 8000
  # open http://localhost:8000/signpost_sticker_index.html
  ```

- Node (http-server):
  ```
  npx http-server -p 8000
  ```

When developing, check the browser devtools console for probe requests and errors (useful to see why a prefecture is gray).

---

## Deployment / GitHub Pages

This repo is intended to be served as a GitHub Pages site. Basic steps:

1. Push to your repository (default branch `main` or `master`).
2. In GitHub repo Settings → Pages, set the source to the repository root on the branch you use.
3. Wait a minute and visit: `https://<your-username>.github.io/<repo-name>/`
   - Example: `https://abgespeichert.github.io/ole-109.github.io/`
4. The two entry pages:
   - `index.html` — project index (links to both apps)
   - `signpost_sticker_map/signpost_sticker_index.html`
   - `population25k_map/jp_cities_25k_index.html`

If you add a build step (npm tooling, bundler), adapt your Pages workflow to publish the built output.

---

## Data sources

- Prefecture geometry: shipped GeoJSON at `signpost_sticker_map/data/prefectures_land_only_clean.geojson`.
- City dataset for the population map: `population25k_map/cleaned-japan-cities-25k.geojson` (used by the city map page).

If you update or replace these data files, make sure the GeoJSON properties include `name:en` and `name:ja` for prefectures (the app reads these to populate the sidebar and compute image keys).

---

## Contributing

Ideas for improvements:

- Add more images (images/{key}/1.jpg ...)
- Increase `maxNumbered` in `hasImageForKey` if you want to maintain many numbered images per prefecture.
- Improve `sanitizeKey` if you want a different key derivation (e.g., use romaji names).
- Add caching or a small manifest JSON listing available images to avoid probing many URLs on load.
- Add unit tests for utils (e.g., sanitizeKey, probeImageUrl).

Workflow:
1. Fork
2. Create a branch
3. Make changes and test locally
4. Open a pull request with a description of changes

---

## License & credits

No license file is included in the repository. If you want to open-source the project, add a `LICENSE` (MIT/Apache-2.0/etc.) and reference it here.

Credits:
- Map rendering: Leaflet (https://leafletjs.com)
- Basemap tiles: CARTO / OpenStreetMap (used via Carto light_nolabels tiles)
- MarkerCluster (used in population map): leaflet.markercluster

---

## Open offers

I can:
- Commit this README.md into the `main` branch for you.
- Scan the repo and update the README with exact file lists and example images for each prefecture.
- Add badges (Pages URL, license) once you confirm the Pages URL and license choice.

Which would you like me to do next?
