// Engagements Logic
// Data lives in engagements-data.js (synced to GitHub by the Sync button)

const ENGAGEMENTS_STORAGE_KEY = "exp26_engagements";

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
  if (stored) { return JSON.parse(stored); }
  // Seed from the data file on first visit
  saveEngagements(INITIAL_ENGAGEMENTS);
  return [...INITIAL_ENGAGEMENTS];
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

async function syncEngagementsToGitHub(engagements, onStatus) {
  const { token, owner, repo, branch } = loadGHSettings();
  if (!token || !owner || !repo) {
    alert('Please configure your GitHub settings first (click the Sync to GitHub button).');
    return false;
  }

  // Only update the data file — never overwrites logic
  const filePath = 'data/engagements-data.js';
  const apiBase = 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + filePath;
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json'
  };

  try {
    onStatus('Fetching from GitHub...');

    const getResp = await fetch(apiBase + '?ref=' + branch, { headers });
    let sha = null;

    if (getResp.ok) {
      sha = (await getResp.json()).sha;
    } else if (getResp.status === 401) {
      throw new Error('Authentication failed (401) — check your token has "repo" scope.');
    } else if (getResp.status === 404) {
      throw new Error('File not found (404) — check owner="' + owner + '" and repo="' + repo + '".');
    } else {
      const e = await getResp.json();
      throw new Error('GET ' + getResp.status + ': ' + e.message);
    }

    onStatus('Pushing data to GitHub...');

    const json = JSON.stringify(engagements, null, 2);
    const fileContent = [
      '// ENGAGEMENTS DATA FILE',
      '// Auto-updated by Sync to GitHub on ' + new Date().toISOString(),
      '// Do not edit manually — use the dashboard.',
      '',
      'const INITIAL_ENGAGEMENTS = ' + json + ';',
      ''
    ].join('\n');

    const encoded = btoa(unescape(encodeURIComponent(fileContent)));
    const body = {
      message: 'Update engagements [' + new Date().toLocaleString() + ']',
      content: encoded,
      branch: branch,
      sha: sha
    };

    const putResp = await fetch(apiBase, { method: 'PUT', headers: headers, body: JSON.stringify(body) });

    if (!putResp.ok) {
      const e = await putResp.json();
      throw new Error('PUT ' + putResp.status + ': ' + e.message);
    }

    onStatus('Synced! GitHub Pages updates in ~1 min.');
    return true;
  } catch (err) {
    const msg = 'Sync failed: ' + err.message;
    onStatus(msg);
    alert(msg);
    return false;
  }
}
