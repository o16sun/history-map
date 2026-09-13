document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([35.6812, 139.7671], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  L.marker([35.6852, 139.7528])
    .addTo(map)
    .bindPopup("**江戸城跡**
