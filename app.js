// 初期表示の位置（日本全体が見渡せる位置）
const map = L.map('map').setView([36.578056, 136.648056], 5);

// OpenStreetMapのタイルレイヤーを追加
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// GoogleフォームのURL（事前入力用のentry IDを含む）
const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfZdkXwJ7wW6_VCqoanb8EK2q87C5LnyPd_VESpuryrA7B6Iw/viewform?usp=pp_url';

// 画面の右上に「投稿ボタン」を常時表示するコントロールを作成
const PostButtonControl = L.Control.extend({
  options: {
    position: 'topright'
  },
  onAdd: function (map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    const button = L.DomUtil.create('a', '', container);
    button.href = formUrl;
    button.target = '_blank';
    button.innerHTML = '＋ 投稿する';
    button.title = '新しい歴史スポットや写真を投稿する';
    
    // ボタンのデザイン（見やすいように青い背景に白文字）
    button.style.backgroundColor = '#1a73e8';
    button.style.color = '#white';
    button.style.color = '#ffffff';
    button.style.padding = '8px 12px';
    button.style.fontSize = '14px';
    button.style.fontWeight = 'bold';
    button.style.textDecoration = 'none';
    button.style.borderRadius = '4px';
    button.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    button.style.display = 'block';

    // マップのクリックイベントがボタンに伝わらないようにする
    L.DomEvent.disableClickPropagation(button);

    return container;
  }
});

// マップに投稿ボタンを追加
map.addControl(new PostButtonControl());

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
