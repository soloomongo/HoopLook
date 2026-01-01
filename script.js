// Create the map object
// Similar to: new Map()
const map = L.map('map');

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

// Load basketball courts from courts.json
fetch('courts.json')
    .then(response => response.json())
    .then(courts => {

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
                    ${court.description}
                `;
            }

            // Add marker to the map
            L.marker([court.lat, court.lng])
                .addTo(map)
                .bindPopup(popupText);
        });
    })
    .catch(error => {
        console.error("Error loading courts:", error);
    });

