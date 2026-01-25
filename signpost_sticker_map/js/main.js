// js/main.js v1.0.4
import { initMap, loadPrefectures, prefectureStyle } from './map.js';
import { openSidebar, closeSidebar, setPrefectureNames, showNoMeta, showLoading } from './sidebar.js';
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
// Prefecture click handler
// -------------------------------
async function onPrefectureClick(feature, layer) {
  const nameEn = feature.properties['name:en'] ?? 'Unknown';
  const nameJa = feature.properties['name:ja'] ?? '';

  // Update sidebar text
  setPrefectureNames(nameEn, nameJa);
  openSidebar();

  const key = sanitizeKey(nameEn);

  // If gray prefecture, show ⚠ only
  if (layer.hasImages === false) {
    showNoMeta();
    return;
  }

  // Blue prefecture: show spinner while loading
  showLoading('Loading image...');

  const hasImages = await gallery.loadForKey(key, 12);

  if (!hasImages) {
    // If loading failed, mark gray and show ⚠
    layer.hasImages = false;
    layer.setStyle({ fillColor: '#cccccc', fillOpacity: 0.8, color: '#666' });
    showNoMeta();
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

  // 1) Immediately set all layers to "no-meta" (gray)
  layers.forEach(layer => {
    layer.hasImages = false;
    layer.setStyle({ fillColor: '#cccccc', fillOpacity: 0.8, color: '#666' });
  });

  // 2) Scan layers asynchronously to flip those with images back to default style
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
          if (prefLayer && typeof prefLayer.resetStyle === 'function') {
            prefLayer.resetStyle(layer);
          } else {
            layer.setStyle(prefectureStyle(layer.feature));
          }
        }
      } catch (err) {
        console.error('Error probing images for', key, err);
        layer.hasImages = false;
        layer.setStyle({ fillColor: '#cccccc', fillOpacity: 0.8, color: '#666' });
      }
    }
  }

  const runWorkers = () => Promise.all(new Array(CONCURRENCY).fill().map(() => worker()));

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => runWorkers().catch(console.error), { timeout: 2000 });
  } else {
    setTimeout(() => runWorkers().catch(console.error), 80);
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
    preScanAllPrefectures(prefLayer);
  }
});
