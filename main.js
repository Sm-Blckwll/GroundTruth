var map = L.map('map', {
    center: [51.09309929090176, -4.203939263088293],
    zoom: 13,
    zooms: [12, 13, 14, 15, 16, 17] // Allowed zoom levels
});




var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {}).addTo(map);

var mytile = L.tileLayer('scrub/{z}/{x}/{y}.png', {
    nativeZooms: [13, 14, 15, 16, 17]
}).addTo(map);

if (L.control.locate) {
    L.control.locate({
        setView: true,
        flyTo: true,
        keepCurrentZoomLevel: false,
        watch: true, // keep watching location
        onLocationFound: function(e) {
            map.setView(e.latlng, map.getZoom(), { animate: true });
        }
    }).addTo(map);
}

// ...existing code...

// Add a compass indicator to the map
var compassIcon = L.control({position: 'topright'});
compassIcon.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'compass-indicator');
    div.innerHTML = '🧭 <span id="compass-heading">--</span>°';
    return div;
};
compassIcon.addTo(map);

// Listen for device orientation events
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientationabsolute', updateCompass, true);
    window.addEventListener('deviceorientation', updateCompass, true);
}

function updateCompass(event) {
    var heading = event.alpha;
    if (typeof event.webkitCompassHeading !== "undefined") {
        heading = event.webkitCompassHeading; // iOS
    }
    if (typeof heading === "number") {
        document.getElementById('compass-heading').textContent = Math.round(heading);
    }
}