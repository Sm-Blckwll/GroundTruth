if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(r => console.log('ServiceWorker registered:', r))
      .catch(e => console.log('ServiceWorker failed:', e));
  });
}

const map = L.map('map', {
  center: [51.09309929090176, -4.203939263088293],
  zoom: 13,
  minZoom: 13,
  maxZoom: 17
});

const satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
).addTo(map);

const mytile = L.tileLayer('scrub/{z}/{x}/{y}.png', {
  nativeZooms: [13, 14, 15, 16, 17]
}).addTo(map);

const locateControl = L.control.locate({ setView: false, flyTo: false, watch: false, enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }).addTo(map);
map.on('locationfound', e => map.setView(e.latlng, map.getZoom(), { animate: true }));

const compassIcon = L.control({ position: 'topright' });
compassIcon.onAdd = function () {
  const div = L.DomUtil.create('div', 'compass-indicator');
  div.innerHTML = '<span id="compass-heading">--</span>° v1.6✨';
  return div;
};
compassIcon.addTo(map);

if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientationabsolute', updateCompass, true);
  window.addEventListener('deviceorientation', updateCompass, true);
}
function updateCompass(e) {
  let heading = e.alpha;
  if (typeof e.webkitCompassHeading !== 'undefined') heading = e.webkitCompassHeading;
  if (typeof heading === 'number') document.getElementById('compass-heading').textContent = Math.round(heading);
}

const scrubBounds = L.latLngBounds(
  L.latLng(51.06589, -4.23008),
  L.latLng(51.12529, -4.18287)
);

let sweeping = false;
const mask = document.getElementById('map-mask');
const progress = document.getElementById('loading-progress');
const percentText = document.getElementById('loading-percent');
const cancelBtn = document.getElementById('cancel-button');
cancelBtn.addEventListener('click', () => (sweeping = false));

L.Control.LoadTiles = L.Control.extend({
  options: { position: 'bottomleft' },
  onAdd: function () {
    const container = L.DomUtil.create('div', 'leaflet-control-loadtiles');
    const button = L.DomUtil.create('button', '', container);
    button.id = 'load-tiles';
    button.textContent = '🤖';
    Object.assign(button.style, { padding: '8px 8px', fontSize: '12px', backgroundColor: 'rgb(244,244,244)', borderWidth: '2px', borderStyle: 'solid', borderRadius: '4px', cursor: 'pointer' });

    button.addEventListener('click', async () => {
      sweeping = !sweeping;
      if (!sweeping) { mask.style.display = 'none'; return; }

      mask.style.display = 'flex';
      progress.style.width = '0%';
      percentText.textContent = '0%';
      const startZoom = map.getZoom();
      const startCenter = map.getCenter();
      const stepByZoom = { 13: 0.03, 14: 0.02, 15: 0.02, 16: 0.01, 17: 0.005 };

      let estimated = 0;
      for (let z = 13; z <= 17; z++) {
        const step = stepByZoom[z];
        const sw = scrubBounds.getSouthWest();
        const ne = scrubBounds.getNorthEast();
        estimated += Math.ceil((ne.lat - sw.lat) / step) * Math.ceil((ne.lng - sw.lng) / step);
      }

      let count = 0;
      for (let z = 13; z <= 17 && sweeping; z++) {
        map.setZoom(z);
        await new Promise(r => setTimeout(r, 500));
        const step = stepByZoom[z];
        const sw = scrubBounds.getSouthWest();
        const ne = scrubBounds.getNorthEast();

        for (let lat = sw.lat; lat <= ne.lat && sweeping; lat += step) {
          for (let lng = sw.lng; lng <= ne.lng && sweeping; lng += step) {
            map.panTo([lat, lng], { animate: false });
            await new Promise(r => setTimeout(r, 300));
            count++;
            const pct = Math.min(100, Math.round((count / estimated) * 100));
            progress.style.width = `${pct}%`;
            percentText.textContent = `${pct}%`;
          }
        }
      }

      mask.style.display = 'none';
      if (sweeping) { map.setZoom(startZoom); map.panTo(startCenter); }
      sweeping = false;
    });

    return container;
  }
});
map.addControl(new L.Control.LoadTiles());

const baseLayers = { "Satellite": satellite };
const overlayLayers = { "LiDAR Scrub Map": mytile };
const layerControl = L.control.layers(baseLayers, overlayLayers, { 
    collapsed: true, 
    position: 'topleft' 
}).addTo(map);


const slider = document.getElementById('opacity-range');

slider.addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    mytile.setOpacity(v); 
    Object.values(overlayLayers).forEach(layer => {
        if (map.hasLayer(layer) && layer.setStyle)
            layer.setStyle({ opacity: v, fillOpacity: v });
    });
});



const hasProj = typeof proj4 !== "undefined";

function reprojectFeature(feature) {
  if (!feature.geometry) return feature;
  const proj = coord => proj4('EPSG:27700', 'EPSG:4326', coord);
  function recurseCoords(coords) {
    if (typeof coords[0] === "number") return proj(coords);
    return coords.map(recurseCoords);
  }
  feature.geometry.coordinates = recurseCoords(feature.geometry.coordinates);
  return feature;
}

const shpFiles = [
  { name: 'Boundary', path: 'shp/Boundary.zip' },
  { name: 'Bracken Control', path: 'shp/Bracken Control.zip' },
  { name: 'Burrows Farm', path: 'shp/Burrows Farm.zip' },
  { name: 'Capital Work SB2', path: 'shp/Capital Work SB2.zip' },
  { name: 'Capital Work', path: 'shp/Capital Work.zip' },
  { name: 'Clear vegetation', path: 'shp/Clear vegetation.zip' },
  { name: 'Cut and scrape', path: 'shp/Cut and scrape.zip' },
  { name: 'Dunescapes', path: 'shp/Dunescapes.zip' },
  { name: 'Future Opportunities', path: 'shp/Future Opportunities.zip' },
  { name: 'Mow and rake', path: 'shp/Mow and rake.zip' },
  { name: 'Quickella habitat 2022', path: 'shp/Quickella habitat 2022.zip' },
  { name: 'Scrub Clearance SB2', path: 'shp/Scrub Clearance SB2.zip' }
];

const gpkgFiles = [
  { name: 'Adders', path: 'shp/adder_commonlizard_sightings_adder_commonlizard_sightings.geojson' },
  { name: 'Great Crested Newts', path: 'shp/great_crested_newt_great_crested_newt_survey__braunton_burrows__sheet1.geojson' },
  { name: 'Historic Features', path: 'shp/historic_features_2007_historic_features_2007.geojson' },
  { name: 'Lichen Records', path: 'shp/lichen_records_lichen_records__sheet1.geojson' },
  { name: 'Petalwort', path: 'shp/petalwort_petalwort.geojson' },
  { name: 'Rosa Rugosa', path: 'shp/rosa_rugosa_rosa_rugosa.geojson' },
  { name: 'Sand Lizard', path: 'shp/sand_lizard_sand_lizard_john_breeds__sheet1.geojson' },
  { name: 'Sea Buckthorn', path: 'shp/sea_buckthorn_sea_buckthorn.geojson' },
  { name: 'Tamarisk', path: 'shp/tamarisk_tamarisk.geojson' },
  { name: 'Water Germander', path: 'shp/water_germander_water_germander_october_2024__mary_breeds__sheet1.geojson' }
];

async function loadVectorLayers() {
  for (const file of shpFiles) {
    try {
      const geojson = await shp(file.path);
      const layer = L.geoJSON(geojson, {
        style: { color: "#1E90FF", weight: 2, fillOpacity: 0.4 },
        pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 5, color: "#1E90FF", fillOpacity: 0.7 })
      });
      layerControl.addOverlay(layer, `${file.name}`);
      console.log("✅ Shapefile loaded:", file.name);
    } catch (err) { console.warn("⚠️ Shapefile failed:", file.name, err); }
  }

  for (const file of gpkgFiles) {
  try {
    const res = await fetch(file.path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let geojson = await res.json();

    if (hasProj && geojson.crs?.properties?.name?.includes("EPSG::27700")) {
      geojson = {
        type: "FeatureCollection",
        features: geojson.features.map(f => reprojectFeature(f))
      };
    }

    const layer = L.geoJSON(geojson, {
      style: { color: "#FF8C00", weight: 2, fillOpacity: 0.4 },
      pointToLayer: (f, latlng) => L.circleMarker(latlng, { 
        radius: 6, fillColor: "#FF8C00", color: "#000", weight: 1, fillOpacity: 0.8 
      }),
      onEachFeature: (feature, layer) => {
    const props = feature.properties || {};
    const tooltipText = Object.entries(props)
      .map(([key, value]) => `${key}: ${value}`)
      .join("<br>");
    layer.bindPopup(tooltipText);
}
    });

    layerControl.addOverlay(layer, file.name);
    console.log("✅ GeoJSON loaded:", file.name);

    } catch (err) { console.error("❌ GeoJSON failed:", file.name, err); }
  }
}

loadVectorLayers();
