// Create the map object
// Similar to: new Map()
const map = L.map('map');
let allCourts = [];
let markers = [];


// Default view (fallback if GPS fails)
map.setView([40.7128, -74.0060], 13);

// Load the map tiles (the actual map image)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Try to get the user's location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Center the map on the user
            map.setView([userLat, userLng], 14);

            // Show the user's location
            L.marker([userLat, userLng])
                .addTo(map)
                .bindPopup("You are here")
                .openPopup();
        },
        () => {
            console.log("Location permission denied.");
        }
    );
}

fetch('courts.json')
    .then(response => response.json())
    .then(courts => {
        allCourts = courts;
        renderCourts(allCourts);
    })
    .catch(error => {
        console.error("Error loading courts:", error);
    });

// Load basketball courts from courts.json
function renderCourts(courts) {
    // Remove existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    courts.forEach(court => {

        if (court.inactive && !document.getElementById("inactiveFilter").checked) {
            return;
        }

        let popupText;

        // Build popup text
        if (court.inactive) {
            popupText = `
                <strong>${court.name}</strong><br>
                ${court.description}
            `;
        } else {
            popupText = `
                <strong>${court.name}</strong><br>
                ${court.indoor ? "Indoor" : "Outdoor"}<br>
                Full Courts: ${court.fullCourts}<br>
                Lighting: ${court.lighting ? "Yes" : "No"}<br>
                Hours: ${court.hours}<br>
                Quality: ${court.quality}/10<br>
                Popularity: ${court.popularity}/10<br>
                Rim: ${court.rim}<br>
                Net: ${court.net}<br>
                Short Hoops: ${court.shortHoop ? "Yes" : "No"}<br>
                ${court.accessibility}<br>
                ${court.description}
            `;
        }
            // Add marker to the map
        const marker = L.marker([court.lat, court.lng])
            .addTo(map)
            .bindPopup(popupText);

        markers.push(marker);
    });
}

document.getElementById("applyFilters").addEventListener("click", () => {

    const nameSearch = document.getElementById("nameSearch").value.toLowerCase();
    const rimFilter = document.getElementById("rimFilter").value;
    const netFilter = document.getElementById("netFilter").value;

    const filtered = allCourts.filter(court => {

        if (nameSearch && !court.name.toLowerCase().includes(nameSearch)) {
            return false;
        }

        if (rimFilter && court.rim !== rimFilter) {
            return false;
        }

        if (netFilter && court.net !== netFilter) {
            return false;
        }

        return true;
    });

    renderCourts(filtered);
});

function buildDirectionsLinks(court) {

    const google = `www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`;
    const apple = `maps.apple.com/?daddr=${court.lat},${court.lng}`;
    const waze = `waze.com/ul?ll=${court.lat},${court.lng}&navigate=yes`;

    return `
        <strong>Directions:</strong><br>
        <a href="${google}" target="_blank">Google Maps</a> |
        <a href="${apple}" target="_blank">Apple Maps</a> |
        <a href="${waze}" target="_blank">Waze</a>
    `;
}

