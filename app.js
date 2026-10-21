// 初期表示の位置（日本全体が見渡せる位置）
const map = L.map('map').setView([36.578056, 136.648056], 5);

// OpenStreetMapのタイルレイヤーを追加
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// GoogleフォームのベースURL（位置情報のentry IDを組み込み済み）
const formBaseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfZdkXwJ7wW6_VCqoanb8EK2q87C5LnyPd_VESpuryrA7B6Iw/viewform?usp=pp_url&entry.1010821055=';

// 地図をクリックしたときの処理（クリックした場所から投稿できるようにする）
map.on('click', function(e) {
  const lat = e.latlng.lat.toFixed(6);
  const lng = e.latlng.lng.toFixed(6);
  const latLngStr = `${lat},${lng}`;

  // フォームを開くURL（クリックした座標が自動で入る）
  const submitUrl = `${formBaseUrl}${encodeURIComponent(latLngStr)}`;

  // ポップアップの内容を作成
  const popupContent = `
    <div style="text-align: center;">
      <strong>ここについて投稿する</strong><br>
      <small>座標: ${latLngStr}</small><br><br>
      <a href="${submitUrl}" target="_blank" style="display: inline-block; background: #1a73e8; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-weight: bold;">
        この場所の情報を投稿 📝
      </a>
    </div>
  `;

  L.popup()
    .setLatLng(e.latlng)
    .setContent(popupContent)
    .openOn(map);
});

// Web公開したGoogleスプレッドシートのCSV URL
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQgpsS1Bqgs0hbln0HkezioWWcFdlEUHTM1qosNRlrFEZdWbnGrnhgdIgw4x74OIwPXxQs7T70ADmyG/pub?output=csv';

// CSVデータをパースする関数
function parseCSV(text) {
  const lines = text.trim().split('\n');
  return lines.map(line => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  });
}

// 住所や座標からピンを立てる関数
async function geocodeAndAddMarker(title, era, desc, location, imgUrl, author) {
  let lat = null;
  let lng = null;

  const coordMatch = location.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
  if (coordMatch) {
    lat = parseFloat(coordMatch[1]);
    lng = parseFloat(coordMatch[3]);
  } else {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        lat = parseFloat(data[0].lat);
        lng = parseFloat(data[0].lon);
      }
    } catch (e) {
      console.error('位置情報の取得に失敗しました:', location, e);
    }
  }

  if (lat !== null && lng !== null) {
    let popupContent = `<h3>${title}</h3>`;
    if (era) popupContent += `<p><strong>時代・年:</strong> ${era}</p>`;
    if (desc) popupContent += `<p>${desc}</p>`;
    if (imgUrl) popupContent += `<img src="${imgUrl}" alt="${title}" style="max-width:100%;">`;
    if (author) popupContent += `<p><small>投稿者: ${author}</small></p>`;

    L.marker([lat, lng]).addTo(map).bindPopup(popupContent);
  }
}

// スプレッドシートからデータを読み込んでピンを配置
fetch(csvUrl)
  .then(response => response.text())
  .then(csvText => {
    const rows = parseCSV(csvText);
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 8) continue;

      const title = row[1];
      const era = row[2];
      const desc = row[3];
      const location = row[4];
      const imgUrl = row[5];
      const author = row[6];
      const permission = row[7];

      if (permission && permission.toUpperCase() === 'OK') {
        geocodeAndAddMarker(title, era, desc, location, imgUrl, author);
      }
    }
  })
  .catch(err => console.error('データ取得エラー:', err));
