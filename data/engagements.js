// Engagements Calendar Data
// Auto-synced from EXP26 Dashboard
// Last updated: 2026-06-24T10:08:30.996Z

const ENGAGEMENTS_STORAGE_KEY = "exp26_engagements";

const INITIAL_ENGAGEMENTS = [
  {
    "title": "Booking.com",
    "date": "2026-06-23",
    "endDate": "2026-06-23",
    "gameboard": "Gameboard 1",
    "type": "Workshop",
    "attendees": "Nandana, Katharina",
    "notes": "",
    "id": "eng-1782295704714"
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
  if (stored) { return JSON.parse(stored); }
  saveEngagements(INITIAL_ENGAGEMENTS);
  return INITIAL_ENGAGEMENTS;
}
function saveEngagements(e) { localStorage.setItem(ENGAGEMENTS_STORAGE_KEY, JSON.stringify(e)); }
function addEngagement(e) { const all = loadEngagements(); e.id = "eng-" + Date.now(); all.push(e); saveEngagements(all); return all; }
function deleteEngagement(id) { const all = loadEngagements().filter(e => e.id !== id); saveEngagements(all); return all; }
function updateEngagement(id, u) { const all = loadEngagements().map(e => e.id === id ? {...e,...u} : e); saveEngagements(all); return all; }
function loadGHSettings() { const s = localStorage.getItem("exp26_gh_settings"); return s ? JSON.parse(s) : { token:'', owner:'', repo:'', branch:'main' }; }
function saveGHSettings(s) { localStorage.setItem("exp26_gh_settings", JSON.stringify(s)); }
function buildEngagementsFileContent(engagements) { return ``; }
async function syncEngagementsToGitHub(engagements, onStatus) { }
