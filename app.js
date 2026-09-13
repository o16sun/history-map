document.addEventListener("DOMContentLoaded", () => {
  // 地図の初期化 (日本・東京中心)
  const map = L.map("map").setView([35.6812, 139.7671], 6);

  // OpenStreetMapの地図タイルを表示
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // テスト用ピン (江戸城跡)
  L.marker([35.6852, 139.7528])
    .addTo(map)
    .bindPopup("**江戸城跡**
