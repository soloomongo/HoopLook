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
        allCourts = courts;     // store all courts locally
        renderCourts(allCourts);    // initially render all markers
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
                ${court.description}<br><br>
                ${buildDirectionsLinks(court)}
            `;
        }
            // Add marker to the map
        const marker = L.marker([court.lat, court.lng])
            .addTo(map)
            .bindPopup(popupText);

        markers.push(marker);
    });
}

function buildDirectionsLinks(court) {

    const google = `https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`;
    const apple = `https://maps.apple.com/?daddr=${court.lat},${court.lng}`;
    const waze = `https://waze.com/ul?ll=${court.lat},${court.lng}&navigate=yes`;

    return `
        <strong>Directions:</strong><br>
        <a href="${google}" target="_blank">Google Maps</a> |
        <a href="${apple}" target="_blank">Apple Maps</a> |
        <a href="${waze}" target="_blank">Waze</a>
    `;
}

// Get filter panel and button elements
const filterBtn = document.getElementById('filterBtn');
const filterPanel = document.getElementById('filterPanel');

// Toggle panel open/close when filter button clicked
filterBtn.addEventListener('click', () => {
    filterPanel.classList.toggle('open'); // class controls slide animation
});

// Live Filtering
function applyFilters() {
    const nameSearch = document.getElementById("nameSearch").value.toLowerCase();
    const rimFilter = document.getElementById("rimFilter").value;
    const netFilter = document.getElementById("netFilter").value;
    const activeFilter = document.getElementById("activeFilter").value;

    // Filter courts array based on user selections
    const filtered = allCourts.filter(court => {

        // Name search
        if (nameSearch && !court.name.toLowerCase().includes(nameSearch)) {
            return false;
        }

        // Rim type filter
        if (rimFilter && court.rim !== rimFilter) {
            return false;
        }

        // Net type filter
        if (netFilter && court.net !== netFilter) {
            return false;
        }

        // Active/inactive filter
        if (activeFilter) {
            const isActive = !court.inactive;
            if ((activeFilter === "true" && !isActive) || (activeFilter === "false" && isActive)) {
                return false;
            }
        }

        return true; // include court
    });

    // Render the filtered courts
    renderCourts(filtered);
}

// Event listeners for live filtering
// Live search: updates as user types
document.getElementById("nameSearch").addEventListener("input", applyFilters);

// Dropdown filters: update as user changes selection
document.querySelectorAll("#filterPanel select").forEach(select => {
    select.addEventListener("change", applyFilters);
});

