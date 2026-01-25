// js/main.js
import { initMap, loadPrefectures, prefectureStyle } from './map.js';
import { openSidebar, closeSidebar, setPrefectureNames, showNoMeta } from './sidebar.js';
import Gallery from './gallery.js';
import { sanitizeKey, hasImageForKey } from './utils.js';

// -------------------------------
// DOM references
// -------------------------------
const dom = {
  map: document.getElementById('map'),
  closeSidebarBtn: document.getElementById('closeSidebar'),

  prefNameEn: document.getElementById('prefNameEn'),
  prefNameJa: document.getElementById('prefNameJa'),

  imageWrapper: document.getElementById('imageWrapper'),
  imagePlaceholder: document.getElementById('imagePlaceholder'),
  placeholderText: document.getElementById('placeholderText'),
  prefImage: document.getElementById('prefImage'),

  imagePreview: document.getElementById('imagePreview'),
  imagePreviewWrapper: document.getElementById('imagePreviewWrapper'),

  prevImage: document.getElementById('prevImage'),
  nextImage: document.getElementById('nextImage'),
  galleryInfo: document.getElementById('galleryInfo'),
};

// -------------------------------
// Sidebar close handler
// -------------------------------
dom.closeSidebarBtn.addEventListener('click', closeSidebar);

// -------------------------------
// Gallery init
// -------------------------------
const gallery = new Gallery({
  previewEl: dom.imagePreview,
  previewWrapperEl: dom.imagePreviewWrapper,
  imageEl: dom.prefImage,
  imageWrapperEl: dom.imageWrapper,
  placeholderEl: dom.imagePlaceholder,
  placeholderTextEl: dom.placeholderText,
  infoEl: dom.galleryInfo,
  prevBtn: dom.prevImage,
  nextBtn: dom.nextImage,
});

// -------------------------------
// Map init
// -------------------------------
const map = initMap(dom.map);

// -------------------------------
// Prefecture click handler
// -------------------------------
async function onPrefectureClick(feature, layer) {
  const nameEn = feature.properties['name:en'] ?? 'Unknown';
  const nameJa = feature.properties['name:ja'] ?? '';

  // Update sidebar text
  setPrefectureNames(nameEn, nameJa);
  openSidebar();

  // Reset gallery UI to show loading
  gallery.reset('Searching images...');

  // Build image key
  const key = sanitizeKey(nameEn);

  // If we already know this has no images, show no-meta immediately
  if (layer.hasImages === false) {
    // use the sidebar helper so layout is consistent
    showNoMeta();
    return;
  }

  // Load images
  const hasImages = await gallery.loadForKey(key, 12);

  // Update map styling based on result
  if (!hasImages) {
    layer.hasImages = false;
    layer.setStyle({
      fillColor: '#cccccc',
      fillOpacity: 0.8,
      color: '#666',
    });
    return;
  }

  layer.hasImages = true;
}

// -------------------------------
// Pre-scan all prefectures for images
// (marks all layers grey immediately, then flips those that have images)
// -------------------------------
async function preScanAllPrefectures(prefLayer) {
  // Build list of layers
  const layers = [];
  prefLayer.eachLayer(l => layers.push(l));

  // 1) Immediately set all layers to "no-meta" state (so UI is correct without interaction)
  layers.forEach(layer => {
    layer.hasImages = false;
    layer.setStyle({ fillColor: '#cccccc', fillOpacity: 0.8, color: '#666' });
  });

  // 2) Now scan to find actual folders and flip those with images to default style
  const CONCURRENCY = 6;
  let idx = 0;

  async function worker() {
    while (idx < layers.length) {
      const layer = layers[idx++];
      const nameEn = layer.feature?.properties?.['name:en'] ?? '';
      const key = sanitizeKey(nameEn);

      try {
        const hasImages = await hasImageForKey(key, { maxNumbered: 1 });
        if (hasImages) {
          layer.hasImages = true;
          // reset to default style defined by your map module
          if (prefLayer && typeof prefLayer.resetStyle === 'function') {
            prefLayer.resetStyle(layer);
          } else {
            // fallback to programmatic default
            layer.setStyle(prefectureStyle(layer.feature));
          }
        } else {
          // keep as no-meta (already set above)
          layer.hasImages = false;
          layer.setStyle({ fillColor: '#cccccc', fillOpacity: 0.8, color: '#666' });
        }
      } catch (err) {
        console.error('Error probing images for', key, err);
        layer.hasImages = false;
        layer.setStyle({ fillColor: '#cccccc', fillOpacity: 0.8, color: '#666' });
      }
    }
  }

  // Defer scanning slightly to avoid blocking rendering; requestIdleCallback if available
  const runWorkers = () =>
    Promise.all(new Array(CONCURRENCY).fill().map(() => worker()));

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => { runWorkers().catch(e => console.error(e)); }, { timeout: 2000 });
  } else {
    // small timeout so map can finish initial rendering
    setTimeout(() => { runWorkers().catch(e => console.error(e)); }, 80);
  }
}

// -------------------------------
// Load GeoJSON & bind interaction
// -------------------------------
loadPrefectures(map, {
  geojsonUrl: 'data/prefectures_land_only_clean.geojson',
  onClick: onPrefectureClick,
}).then(prefLayer => {
  if (prefLayer) {
    // Run background pre-scan to mark grey/blue correctly
    // This call now first sets all layers to grey synchronously, then re-probes them.
    preScanAllPrefectures(prefLayer);
  }
});
