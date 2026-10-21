// 初期表示の位置（日本全体が見渡せる位置）
const map = L.map('map').setView([36.578056, 136.648056], 5);

// OpenStreetMapのタイルレイヤーを追加
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

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

// 住所や文字から緯度経度を取得してピンを立てる関数（ジオコーディング）
async function geocodeAndAddMarker(title, era, desc, location, imgUrl, author) {
  let lat = null;
  let lng = null;

  // 1. 位置情報が直接「35.68,139.76」のような数値座標の場合
  const coordMatch = location.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
  if (coordMatch) {
    lat = parseFloat(coordMatch[1]);
    lng = parseFloat(coordMatch[3]);
  } else {
    // 2. 住所テキストの場合、OpenStreetMap Nominatimで緯度経度を検索
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
    if (imgUrl) popupContent += `<img src="${imgUrl}" alt="${title}">`;
    if (author) popupContent += `<p><small>投稿者: ${author}</small></p>`;

    L.marker([lat, lng]).addTo(map).bindPopup(popupContent);
  }
}

// スプレッドシートからデータを読み込んでピンを配置
fetch(csvUrl)
  .then(response => response.text())
  .then(csvText => {
    const rows = parseCSV(csvText);
    // ヘッダー行を除いて2行目からループ処理
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 8) continue;

      const title = row[1];       // B列: 場所の名称
      const era = row[2];         // C列: 時代・年
      const desc = row[3];        // D列: 説明・歴史
      const location = row[4];    // E列: 住所または座標
      const imgUrl = row[5];      // F列: 画像URL
      const author = row[6];      // G列: 投稿者名
      const permission = row[7];  // H列: 掲載許可

      // H列が「OK」の場合のみマップにピンを立てる
      if (permission && permission.toUpperCase() === 'OK') {
        geocodeAndAddMarker(title, era, desc, location, imgUrl, author);
      }
    }
  })
  .catch(err => console.error('データ取得エラー:', err));
