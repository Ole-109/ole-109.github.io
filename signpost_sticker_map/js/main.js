// js/main.js
import { initMap, loadPrefectures } from './map.js';
import { openSidebar, closeSidebar, setPrefectureNames } from './sidebar.js';
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

  // Reset gallery UI
  gallery.reset('Searching images...');

  // Build image key
  const key = sanitizeKey(nameEn);

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
// -------------------------------
async function preScanAllPrefectures(prefLayer) {
  const layers = [];
  prefLayer.eachLayer(l => layers.push(l));

  const CONCURRENCY = 6;
  let idx = 0;

  async function worker() {
    while (idx < layers.length) {
      const layer = layers[idx++];
      const nameEn = layer.feature?.properties?.['name:en'] ?? '';
      const key = sanitizeKey(nameEn);

      try {
        const hasImages = await hasImageForKey(key, { maxNumbered: 1 });
        if (!hasImages) {
          layer.hasImages = false;
          layer.setStyle({
            fillColor: '#cccccc',
            fillOpacity: 0.8,
            color: '#666',
          });
        } else {
          layer.hasImages = true;
          if (prefLayer && typeof prefLayer.resetStyle === 'function') {
            prefLayer.resetStyle(layer);
          }
        }
      } catch (err) {
        console.error('Error probing images for', key, err);
        layer.hasImages = false;
        layer.setStyle({
          fillColor: '#cccccc',
          fillOpacity: 0.8,
          color: '#666',
        });
      }
    }
  }

  await Promise.all(new Array(CONCURRENCY).fill().map(() => worker()));
}

// -------------------------------
// Load GeoJSON & bind interaction
// -------------------------------
loadPrefectures(map, {
  geojsonUrl: 'data/prefectures_land_only_clean.geojson',
  onClick: onPrefectureClick,
}).then(prefLayer => {
  if (prefLayer) {
    // Run background pre-scan
    preScanAllPrefectures(prefLayer).catch(err => console.error('preScan error', err));
  }
});
