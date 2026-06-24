// Engagements Calendar Data
// Auto-synced from EXP26 Dashboard
// Last updated: 2026-06-24T10:16:11.685Z

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
  },
  {
    "title": "Llyods Bank",
    "date": "2026-06-23",
    "endDate": "2026-06-23",
    "gameboard": "Gameboard 2",
    "type": "Workshop",
    "attendees": "Rubeen",
    "notes": "",
    "id": "eng-1782296161248"
  }
];

const ENGAGEMENT_TYPES = ["Workshop","Demo","Training","Review","Planning","Other"];

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
function loadGHSettings() { const s = localStorage.getItem("exp26_gh_settings"); return s ? JSON.parse(s) : { token:"", owner:"", repo:"", branch:"main" }; }
function saveGHSettings(s) { localStorage.setItem("exp26_gh_settings", JSON.stringify(s)); }
function buildEngagementsFileContent(e) { return ""; }
async function syncEngagementsToGitHub(engagements, onStatus) {}