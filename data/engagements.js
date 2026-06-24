// Engagements Calendar Data
// Engagements are persisted in localStorage (key: "exp26_engagements")
// This file provides the seed/initial data structure.
// To pre-populate engagements, add entries to INITIAL_ENGAGEMENTS below.

const ENGAGEMENTS_STORAGE_KEY = "exp26_engagements";

const INITIAL_ENGAGEMENTS = [
  {
    "title": "Booking.com",
    "date": "2026-06-25",
    "endDate": "2026-06-25",
    "gameboard": "exp26-gameboard-1.pegademo.com",
    "type": "Workshop",
    "attendees": "",
    "notes": "",
    "id": "eng-1781845410356"
  },
  {
    "title": "Verizon",
    "date": "2026-06-24",
    "endDate": "2026-06-24",
    "gameboard": "exp26-gameboard-2.pegademo.com",
    "type": "Workshop",
    "attendees": "",
    "notes": "",
    "id": "eng-1781848364187"
  },
  {
    "title": "Booking.com",
    "date": "2026-06-23",
    "endDate": "2026-06-23",
    "gameboard": "exp26-gameboard-1.pegademo.com",
    "type": "Workshop",
    "attendees": "",
    "notes": "",
    "id": "eng-1781848395755"
  }
];

const ENGAGEMENT_TYPES = [
  "Workshop",
  "Demo",
  "Training",
  "Review",
  "Planning",
  "Other"
];

function loadEngagements() {
  const stored = localStorage.getItem(ENGAGEMENTS_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  saveEngagements(INITIAL_ENGAGEMENTS);
  return INITIAL_ENGAGEMENTS;
}

function saveEngagements(engagements) {
  localStorage.setItem(ENGAGEMENTS_STORAGE_KEY, JSON.stringify(engagements));
}

function addEngagement(engagement) {
  const all = loadEngagements();
  engagement.id = "eng-" + Date.now();
  all.push(engagement);
  saveEngagements(all);
  return all;
}

function deleteEngagement(id) {
  const all = loadEngagements().filter(e => e.id !== id);
  saveEngagements(all);
  return all;
}

function updateEngagement(id, updates) {
  const all = loadEngagements().map(e => e.id === id ? { ...e, ...updates } : e);
  saveEngagements(all);
  return all;
}

// ===== GitHub Sync =====
const GH_SETTINGS_KEY = "exp26_gh_settings";

function loadGHSettings() {
  const s = localStorage.getItem(GH_SETTINGS_KEY);
  return s ? JSON.parse(s) : { token: '', owner: '', repo: '', branch: 'main' };
}

function saveGHSettings(settings) {
  localStorage.setItem(GH_SETTINGS_KEY, JSON.stringify(settings));
}

function buildEngagementsFileContent(engagements) {
  const json = JSON.stringify(engagements, null, 2);
  const lines = [
    '// Engagements Calendar Data',
    '// Auto-synced from EXP26 Dashboard',
    '// Last updated: ' + new Date().toISOString(),
    '',
    'const ENGAGEMENTS_STORAGE_KEY = "exp26_engagements";',
    '',
    'const INITIAL_ENGAGEMENTS = ' + json + ';',
    '',
    'const ENGAGEMENT_TYPES = ["Workshop","Demo","Training","Review","Planning","Other"];',
    '',
    'function loadEngagements() {',
    '  const stored = localStorage.getItem(ENGAGEMENTS_STORAGE_KEY);',
    '  if (stored) { return JSON.parse(stored); }',
    '  saveEngagements(INITIAL_ENGAGEMENTS);',
    '  return INITIAL_ENGAGEMENTS;',
    '}',
    'function saveEngagements(e) { localStorage.setItem(ENGAGEMENTS_STORAGE_KEY, JSON.stringify(e)); }',
    'function addEngagement(e) { const all = loadEngagements(); e.id = "eng-" + Date.now(); all.push(e); saveEngagements(all); return all; }',
    'function deleteEngagement(id) { const all = loadEngagements().filter(e => e.id !== id); saveEngagements(all); return all; }',
    'function updateEngagement(id, u) { const all = loadEngagements().map(e => e.id === id ? {...e,...u} : e); saveEngagements(all); return all; }',
    'function loadGHSettings() { const s = localStorage.getItem("exp26_gh_settings"); return s ? JSON.parse(s) : { token:"", owner:"", repo:"", branch:"main" }; }',
    'function saveGHSettings(s) { localStorage.setItem("exp26_gh_settings", JSON.stringify(s)); }',
    'function buildEngagementsFileContent(e) { return ""; }',
    'async function syncEngagementsToGitHub(engagements, onStatus) {}',
  ];
  return lines.join('\n');
}

async function syncEngagementsToGitHub(engagements, onStatus) {
  const { token, owner, repo, branch } = loadGHSettings();
  if (!token || !owner || !repo) {
    alert('Please configure your GitHub settings first (click the ⚙ Settings button).');
    return false;
  }

  const filePath = 'data/engagements.js';
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  try {
    onStatus('Fetching current file SHA...');

    // Get current file SHA (needed for update)
    let sha = null;
    const getResp = await fetch(`${apiBase}?ref=${branch}`, { headers });
    if (getResp.ok) {
      const data = await getResp.json();
      sha = data.sha;
    } else if (getResp.status !== 404) {
      throw new Error(`GitHub API error: ${getResp.status} ${getResp.statusText}`);
    }

    onStatus('Pushing engagements to GitHub...');

    const content = buildEngagementsFileContent(engagements);
    const encoded = btoa(unescape(encodeURIComponent(content)));

    const body = {
      message: `Update engagements [${new Date().toLocaleString()}]`,
      content: encoded,
      branch
    };
    if (sha) body.sha = sha;

    const putResp = await fetch(apiBase, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    if (!putResp.ok) {
      const err = await putResp.json();
      throw new Error(err.message || `HTTP ${putResp.status}`);
    }

    onStatus('Done!');
    return true;
  } catch (err) {
    onStatus('Error: ' + err.message);
    return false;
  }
}
