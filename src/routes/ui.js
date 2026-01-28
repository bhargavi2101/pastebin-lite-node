const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Pastebin Lite</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont;
      background: #f6f8fa;
      padding: 40px;
    }
    .card {
      background: white;
      max-width: 700px;
      margin: auto;
      padding: 24px;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    h2 {
      margin-bottom: 16px;
    }
    textarea, input {
      width: 100%;
      padding: 10px;
      margin: 8px 0 16px 0;
      border-radius: 6px;
      border: 1px solid #ccc;
      font-size: 14px;
    }
    button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover {
      background: #1e4fd8;
    }
    .result {
      margin-top: 20px;
      padding: 12px;
      background: #f1f5f9;
      border-radius: 6px;
      word-break: break-all;
    }
    .copy {
      margin-left: 10px;
      font-size: 12px;
      cursor: pointer;
      color: #2563eb;
    }
    .hint {
      font-size: 12px;
      color: #555;
      margin-top: -10px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>

  <div class="card">
    <h2>Pastebin Lite</h2>

    <textarea id="content" rows="6" placeholder="Paste your text here..."></textarea>

    <input id="ttl" type="number" placeholder="TTL in seconds (optional)" />
    <div class="hint">Paste expires automatically after this time</div>

    <input id="views" type="number" placeholder="Max views (optional)" />
    <div class="hint">Paste becomes unavailable after these many views</div>

    <button onclick="createPaste()">Create Paste</button>

    <div id="result" class="result" style="display:none;"></div>
  </div>

<script>
async function createPaste() {
  const content = document.getElementById('content').value.trim();
  const ttl = document.getElementById('ttl').value;
  const views = document.getElementById('views').value;

  if (!content) {
    alert('Content cannot be empty');
    return;
  }

  const payload = { content };
  if (ttl) payload.ttl_seconds = Number(ttl);
  if (views) payload.max_views = Number(views);

  const res = await fetch('/api/pastes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  const resultBox = document.getElementById('result');
  resultBox.style.display = 'block';

  if (!res.ok) {
    resultBox.innerText = 'Error: ' + JSON.stringify(data);
    return;
  }

  resultBox.innerHTML = \`
    <b>Paste created successfully 🎉</b><br/>
    <a id="link" href="\${data.url}" target="_blank">\${data.url}</a>
    <span class="copy" onclick="copyLink()">[Copy]</span>
  \`;
}

function copyLink() {
  const link = document.getElementById('link').innerText;
  navigator.clipboard.writeText(link);
  alert('Link copied to clipboard');
}
</script>

</body>
</html>
  `);
});

module.exports = router;
