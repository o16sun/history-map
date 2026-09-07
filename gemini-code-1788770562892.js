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
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // 初期テスト用ピン (江戸城跡)
  L.marker([35.6852, 139.7528])
    .addTo(map)
    .bindPopup("<b>江戸城跡</b><br>1603年（慶長8年）<br>徳川家康が居城とした城跡。");
});