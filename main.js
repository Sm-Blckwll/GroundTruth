if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered:', registration);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}

var map = L.map('map', {
    center: [51.09309929090176, -4.203939263088293],
    zoom: 13,
    minZoom: 13,
    maxZoom: 17
});

var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {}).addTo(map);

var mytile = L.tileLayer('scrub/{z}/{x}/{y}.png', {
    nativeZooms: [13, 14, 15, 16, 17]
}).addTo(map);

const locateControl = L.control.locate({
  setView: false, 
  flyTo: false,
  keepCurrentZoomLevel: false,
  watch: true,
  enableHighAccuracy: true
}).addTo(map);

map.on('locationfound', function(e) {
  map.setView(e.latlng, map.getZoom(), { animate: true });
});

var compassIcon = L.control({ position: 'topright' });
compassIcon.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'compass-indicator');
    div.innerHTML = '<span id="compass-heading">--</span>° v1.3✨';
    return div;
};
compassIcon.addTo(map);

if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientationabsolute', updateCompass, true);
    window.addEventListener('deviceorientation', updateCompass, true);
}

function updateCompass(event) {
    var heading = event.alpha;
    if (typeof event.webkitCompassHeading !== "undefined") {
        heading = event.webkitCompassHeading;
    }
    if (typeof heading === "number") {
        document.getElementById('compass-heading').textContent = Math.round(heading);
    }
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

cancelBtn.addEventListener('click', () => {
  sweeping = false;
});

L.Control.LoadTiles = L.Control.extend({
  options: { position: 'bottomleft' },

  onAdd: function (map) {
    const container = L.DomUtil.create('div', 'leaflet-control-loadtiles');
    const button = L.DomUtil.create('button', '', container);
    button.id = 'load-tiles';
    button.textContent = '🤖';
    Object.assign(button.style, {
      padding: '8px 8px',
      fontSize: '12px',
      backgroundColor: 'rgb(244, 244, 244)',
      borderBottomColor: 'rgb(204, 204, 204)',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '4px',
      cursor: 'pointer'
    });

    button.addEventListener('click', async () => {
      sweeping = !sweeping;

      if (sweeping) {
        mask.style.display = 'flex';
        progress.style.width = '0%';
        percentText.textContent = '0%';

        const bounds = scrubBounds;
        const startZoom = map.getZoom();
        const startCenter = map.getCenter();
        const stepByZoom = { 13: 0.03, 14: 0.02, 15: 0.02, 16: 0.01, 17: 0.005 };

        let estimatedSteps = 0;

for (let z = 13; z <= 17; z++) {
  const step = stepByZoom[z];
  const sw = scrubBounds.getSouthWest();
  const ne = scrubBounds.getNorthEast();

  const latSteps = Math.ceil((ne.lat - sw.lat) / step);
  const lngSteps = Math.ceil((ne.lng - sw.lng) / step);
  estimatedSteps += latSteps * lngSteps;
}

        let stepCount = 0;

        for (let z = 13; z <= 17 && sweeping; z++) {
          map.setZoom(z);
          await new Promise(resolve => setTimeout(resolve, 500));

          const step = stepByZoom[z];
          const sw = bounds.getSouthWest();
          const ne = bounds.getNorthEast();

          for (let lat = sw.lat; lat <= ne.lat && sweeping; lat += step) {
            for (let lng = sw.lng; lng <= ne.lng && sweeping; lng += step) {
              map.panTo([lat, lng]);
              await new Promise(resolve => setTimeout(resolve, 300));
              stepCount++;
              const percent = Math.min(100, Math.round((stepCount / estimatedSteps) * 100));
              progress.style.width = `${percent}%`;
              percentText.textContent = `${percent}%`;
            }
          }
        }

        mask.style.display = 'none';

        if (sweeping) {
          map.setZoom(startZoom);
          map.panTo(startCenter);
          console.log('✅ Sweep complete.');
        } else {
          console.log('⛔ Sweep cancelled.');
        }

        sweeping = false;
      } else {
        mask.style.display = 'none';
        console.log('🛑 Cancelling sweep...');
      }
    });

    return container;
  }
});

map.addControl(new L.Control.LoadTiles());



