// js/map.js

// -------------------------------
// Styles
// -------------------------------
function prefectureStyle() {
    return {
      color: '#333',
      weight: 1,
      fillColor: '#88aaff',
      fillOpacity: 0.6,
    };
  }
  
  function highlightStyle() {
    return {
      weight: 2,
      color: '#000',
      fillOpacity: 0.8,
    };
  }
  
  // -------------------------------
  // Map init
  // -------------------------------
  export function initMap(mapEl) {
    const map = L.map(mapEl, {
      minZoom: 6,
      maxZoom: 7,
      zoomControl: true,
    }).setView([36.2, 138.0], 5);
  
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }
    ).addTo(map);
  
    return map;
  }
  
  // -------------------------------
  // GeoJSON loading
  // -------------------------------
  export async function loadPrefectures(map, { geojsonUrl, onClick }) {
    try {
      const res = await fetch(geojsonUrl);
      const data = await res.json();
  
      const layer = L.geoJSON(data, {
        style: prefectureStyle,
        interactive: true,
        fill: true,
        onEachFeature: (feature, layer) =>
          bindPrefectureEvents(feature, layer, onClick),
      }).addTo(map);
  
      map.fitBounds(layer.getBounds());
      return layer;
    } catch (err) {
      console.error('GeoJSON load error:', err);
      return null;
    }
  }
  
  // -------------------------------
  // Interaction
  // -------------------------------
  function bindPrefectureEvents(feature, layer, onClick) {
    layer.on({
      mouseover: e => {
        if (layer.hasImages !== false) {
          e.target.setStyle(highlightStyle());
        }
      },
  
      mouseout: e => {
        if (layer.hasImages !== false) {
          e.target.setStyle(prefectureStyle());
        }
      },
  
      click: () => {
        if (typeof onClick === 'function') {
          onClick(feature, layer);
        }
      },
    });
  }
  