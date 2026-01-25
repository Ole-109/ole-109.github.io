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

  setPrefectureNames(nameEn, nameJa);
  openSidebar();

  gallery.reset('Searching images...');
  const key = sanitizeKey(nameEn);

  // Show ⚠ immediately if no images
  if (layer.hasImages === false) {
    showNoMeta();
    return;
  }

  const hasImages = await gallery.loadForKey(key, 12);
  if (!hasImages) {
    layer.hasImages = false;
    layer.setStyle({ fillColor: '#cccccc', fillOpacity: 0.8, color: '#666' });
    showNoMeta();
    return;
  }

  layer.hasImages = true;
}

// -------------------------------
// Immediate greying + background scan
// -------------------------------
async function markMissingPrefectures(prefLayer) {
  const layers = [];
  prefLayer.eachLayer(l => layers.push(l));

  // 1) Immediately grey all
  layers.forEach(layer => {
    layer.hasImages = false;
    layer.setStyle({ fillColor: '#cccccc', fillOpacity: 0.8, color: '#666' });
  });

  // 2) Fire probes in the background to flip blue if folder exists
  layers.forEach(layer => {
    const nameEn = layer.feature?.properties?.['name:en'] ?? '';
    const key = sanitizeKey(nameEn);

    hasImageForKey(key, { maxNumbered: 1 }).then(has => {
      if (has) {
        layer.hasImages = true;
        if (prefLayer && typeof prefLayer.resetStyle === 'function') {
          prefLayer.resetStyle(layer);
        } else {
          layer.setStyle(prefectureStyle(layer.feature));
        }
      }
    }).catch(err => console.error('Error checking images for', key, err));
  });
}

// -------------------------------
// Load GeoJSON & bind interaction
// -------------------------------
loadPrefectures(map, {
  geojsonUrl: 'data/prefectures_land_only_clean.geojson',
  onClick: onPrefectureClick,
}).then(prefLayer => {
  if (prefLayer) {
    markMissingPrefectures(prefLayer); // <--- runs immediately on site load
  }
});
