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
    div.innerHTML = '<span id="compass-heading">--</span>°';
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