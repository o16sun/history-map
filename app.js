document.addEventListener("DOMContentLoaded", () => {
  // 投稿ボタンにフォームURLをセット
  const submitBtn = document.getElementById("submit-btn");
  if (CONFIG.formUrl) {
    submitBtn.href = CONFIG.formUrl;
  }

  // 地図の初期化 (日本中心)
  const map = L.map("map").setView([35.6812, 139.7671], 6);

  // 地図タイルの読み込み (OpenStreetMap)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© [OpenStreetMap](https://www.openstreetmap.org/copyright)'
  }).addTo(map);

  // 初期テスト用ピン (江戸城跡)
  L.marker([35.6852, 139.7528])
    .addTo(map)
    .bindPopup("**江戸城跡**