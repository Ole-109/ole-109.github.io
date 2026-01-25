// js/map.js
import { sanitizeKey } from './utils.js';

/**
 * Initialize the Leaflet map
 */
export function initMap(containerEl) {
  const map = L.map(containerEl, { minZoom: 6, maxZoom: 7 }).setView([36.2, 138.0], 5);

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    { subdomains: "abcd", attribution: "&copy; OpenStreetMap &copy; CARTO" }
  ).addTo(map);

  return map;
}

/**
 * Default style for prefectures
 */
export function prefectureStyle(feature) {
  return {
    color: '#333',
    weight: 1,
    fillColor: '#88aaff',
    fillOpacity: 0.6,
  };
}

/**
 * Highlight style for hover
 */
export function highlightStyle() {
  return {
    weight: 2,
    color: '#000',
    fillOpacity: 0.8,
  };
}

/**
 * Load GeoJSON prefectures and bind click/hover
 * @param {L.Map} map Leaflet map
 * @param {Object} options
 * @returns {Promise<L.GeoJSON>} resolves with the layer
 */
export function loadPrefectures(map, { geojsonUrl, onClick }) {
  return fetch(geojsonUrl)
    .then(res => res.json())
    .then(data => {
      const prefLayer = L.geoJSON(data, {
        style: prefectureStyle,
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: (e) => {
              if (layer.hasImages !== false) e.target.setStyle(highlightStyle());
            },
            mouseout: (e) => {
              if (layer.hasImages !== false && prefLayer && typeof prefLayer.resetStyle === 'function') {
                prefLayer.resetStyle(e.target);
              }
            },
            click: async () => {
              if (onClick) await onClick(feature, layer);
            },
          });
        },
        interactive: true,
        fill: true,
      }).addTo(map);

      map.fitBounds(prefLayer.getBounds());
      return prefLayer;
    })
    .catch(err => {
      console.error('GeoJSON load error:', err);
      return null;
    });
}
