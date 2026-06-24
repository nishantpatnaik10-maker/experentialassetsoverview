/* ===== Tab Navigation ===== */
document.querySelectorAll('nav.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('nav.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

/* ===== Links Section ===== */
function renderLinks() {
  const container = document.getElementById('links-container');
  container.innerHTML = LINKS_DATA.map(cat => `
    <div class="card">
      <div class="card-title">&#128279; ${cat.category}</div>
      <div class="links-grid">
        ${cat.links.map(l => `
          <a class="link-card" href="${l.url}" target="_blank" rel="noopener">
            <strong>${l.label}</strong>
            <span>${l.description}</span>
          </a>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/* ===== Instance Table ===== */
let activeFilter = { search: '', gameboard: '', type: '' };

function renderInstances() {
  const container = document.getElementById('instances-container');
  const { search, gameboard, type } = activeFilter;

  const filtered = INSTANCES_DATA
    .filter(g => !gameboard || g.gameboard === gameboard)
    .map(g => ({
      ...g,
      instances: g.instances.filter(inst => {
        const matchSearch = !search || inst.hostname.toLowerCase().includes(search.toLowerCase()) || inst.type.toLowerCase().includes(search.toLowerCase());
        const matchType = !type || inst.type === type;
        return matchSearch && matchType;
      })
    }))
    .filter(g => g.instances.length > 0);

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">No instances match your filters.</div>';
    return;
  }

  container.innerHTML = filtered.map(group => `
    <div class="gameboard-group">
      <div class="gameboard-header">
        <span>&#127918; ${group.gameboard}</span>
        <span class="badge">${group.instances.length} instances</span>
        <a href="https://${group.gameboard}" target="_blank" rel="noopener">Open Gameboard &#8599;</a>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Hostname</th>
            <th>Type</th>
            <th>Instance #</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          ${group.instances.map((inst, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><a href="https://${inst.hostname}" target="_blank" rel="noopener">${inst.hostname}</a></td>
              <td><span class="type-badge">${inst.type}</span></td>
              <td>${inst.number}</td>
              <td><a href="https://${inst.hostname}" target="_blank" rel="noopener">Open &#8599;</a></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');
}

function setupInstanceFilters() {
  const gbSelect = document.getElementById('filter-gameboard');
  INSTANCES_DATA.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.gameboard;
    opt.textContent = g.gameboard;
    gbSelect.appendChild(opt);
  });

  const typeSelect = document.getElementById('filter-type');
  const allTypes = [...new Set(INSTANCES_DATA.flatMap(g => g.instances.map(i => i.type)))].sort();
  allTypes.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    typeSelect.appendChild(opt);
  });

  document.getElementById('filter-search').addEventListener('input', e => {
    activeFilter.search = e.target.value;
    renderInstances();
  });
  gbSelect.addEventListener('change', e => {
    activeFilter.gameboard = e.target.value;
    renderInstances();
  });
  typeSelect.addEventListener('change', e => {
    activeFilter.type = e.target.value;
    renderInstances();
  });
}

/* ===== Calendar ===== */
let calState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  selectedDate: null,
  engagements: []
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function initCalendar() {
  calState.engagements = loadEngagements();
  renderCalendar();
  renderSidePanel();
  setupCalendarControls();
}

function renderCalendar() {
  document.getElementById('cal-month-label').textContent = `${MONTHS[calState.month]} ${calState.year}`;

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';

  // Day name headers
  DAYS.forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-name';
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(calState.year, calState.month, 1).getDay();
  const daysInMonth = new Date(calState.year, calState.month + 1, 0).getDate();
  const daysInPrev = new Date(calState.year, calState.month, 0).getDate();
  const today = new Date();

  // Previous month fill
  for (let i = firstDay - 1; i >= 0; i--) {
    const cell = makeCell(daysInPrev - i, calState.month - 1, true);
    grid.appendChild(cell);
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getFullYear() === calState.year && today.getMonth() === calState.month && today.getDate() === d;
    const dateStr = formatDate(calState.year, calState.month, d);
    const isSelected = calState.selectedDate === dateStr;
    const cell = makeCell(d, calState.month, false, isToday, isSelected, dateStr);
    grid.appendChild(cell);
  }

  // Next month fill
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const remaining = totalCells - firstDay - daysInMonth;
  for (let d = 1; d <= remaining; d++) {
    const cell = makeCell(d, calState.month + 1, true);
    grid.appendChild(cell);
  }
}

function makeCell(day, month, otherMonth, isToday, isSelected, dateStr) {
  const cell = document.createElement('div');
  cell.className = 'cal-cell' + (otherMonth ? ' other-month' : '') + (isToday ? ' today' : '') + (isSelected ? ' selected' : '');

  const num = document.createElement('div');
  num.className = 'day-num';
  num.textContent = day;
  cell.appendChild(num);

  if (dateStr) {
    const events = calState.engagements.filter(e => e.date === dateStr || (e.endDate && dateStr >= e.date && dateStr <= e.endDate));
    events.slice(0, 2).forEach(ev => {
      const evEl = document.createElement('div');
      evEl.className = `cal-event type-${(ev.type || 'other').toLowerCase()}`;
      evEl.textContent = ev.title;
      cell.appendChild(evEl);
    });
    if (events.length > 2) {
      const more = document.createElement('div');
      more.className = 'cal-event';
      more.style.background = '#aaa';
      more.textContent = `+${events.length - 2} more`;
      cell.appendChild(more);
    }

    cell.addEventListener('click', () => {
      calState.selectedDate = dateStr;
      renderCalendar();
      renderSidePanel();
    });
  }

  return cell;
}

function renderSidePanel() {
  const panel = document.getElementById('side-engagements');

  let header = '';
  let engList = calState.engagements;

  if (calState.selectedDate) {
    header = `<div class="card-title">&#128197; ${calState.selectedDate}</div>`;
    engList = calState.engagements.filter(e =>
      e.date === calState.selectedDate ||
      (e.endDate && calState.selectedDate >= e.date && calState.selectedDate <= e.endDate)
    );
  } else {
    header = `<div class="card-title">&#128197; All Engagements</div>`;
  }

  const listHtml = engList.length === 0
    ? '<div class="empty-state">No engagements' + (calState.selectedDate ? ' on this date.' : ' yet.') + '<br>Click a date to add one.</div>'
    : `<div class="engagement-list">${engList.map(e => `
        <div class="engagement-item">
          <h4>${e.title}</h4>
          <p>&#128198; ${e.date}${e.endDate && e.endDate !== e.date ? ' &#8594; ' + e.endDate : ''}</p>
          ${e.type ? `<p>&#127381; ${e.type}</p>` : ''}
          ${e.gameboard ? `<p>&#127918; ${e.gameboard}</p>` : ''}
          ${e.attendees ? `<p>&#128101; ${e.attendees}</p>` : ''}
          ${e.notes ? `<p>&#128221; ${e.notes}</p>` : ''}
          <div class="actions">
            <button class="btn btn-danger" onclick="deleteEng('${e.id}')">Delete</button>
          </div>
        </div>
      `).join('')}</div>`;

  panel.innerHTML = header + listHtml;
}

function setupCalendarControls() {
  document.getElementById('cal-prev').addEventListener('click', () => {
    calState.month--;
    if (calState.month < 0) { calState.month = 11; calState.year--; }
    renderCalendar();
  });

  document.getElementById('cal-next').addEventListener('click', () => {
    calState.month++;
    if (calState.month > 11) { calState.month = 0; calState.year++; }
    renderCalendar();
  });

  document.getElementById('cal-today').addEventListener('click', () => {
    const now = new Date();
    calState.year = now.getFullYear();
    calState.month = now.getMonth();
    calState.selectedDate = formatDate(now.getFullYear(), now.getMonth(), now.getDate());
    renderCalendar();
    renderSidePanel();
  });

  document.getElementById('btn-add-engagement').addEventListener('click', () => {
    openModal();
  });

  // GitHub Sync
  document.getElementById('btn-gh-sync').addEventListener('click', async () => {
    const btn = document.getElementById('btn-gh-sync');
    const status = document.getElementById('sync-status');
    btn.disabled = true;
    status.textContent = '';
    const ok = await syncEngagementsToGitHub(calState.engagements, msg => {
      status.textContent = msg;
    });
    btn.disabled = false;
    if (ok) setTimeout(() => { status.textContent = ''; }, 6000);
  });

  // GitHub Settings modal
  document.getElementById('btn-gh-settings').addEventListener('click', () => {
    const s = loadGHSettings();
    document.getElementById('gh-token').value = s.token || '';
    document.getElementById('gh-owner').value = s.owner || '';
    document.getElementById('gh-repo').value = s.repo || '';
    document.getElementById('gh-branch').value = s.branch || 'main';
    document.getElementById('gh-modal-overlay').classList.add('open');
  });

  document.getElementById('gh-modal-cancel').addEventListener('click', () => {
    document.getElementById('gh-modal-overlay').classList.remove('open');
  });

  document.getElementById('gh-modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('gh-modal-overlay'))
      document.getElementById('gh-modal-overlay').classList.remove('open');
  });

  document.getElementById('gh-modal-save').addEventListener('click', () => {
    saveGHSettings({
      token: document.getElementById('gh-token').value.trim(),
      owner: document.getElementById('gh-owner').value.trim(),
      repo: document.getElementById('gh-repo').value.trim(),
      branch: document.getElementById('gh-branch').value.trim() || 'main'
    });
    document.getElementById('gh-modal-overlay').classList.remove('open');
    document.getElementById('sync-status').textContent = 'GitHub settings saved.';
    setTimeout(() => { document.getElementById('sync-status').textContent = ''; }, 3000);
  });
}

/* ===== Modal ===== */
function openModal(prefillDate) {
  const modal = document.getElementById('modal-overlay');
  modal.classList.add('open');

  // Populate gameboard options
  const gbSelect = document.getElementById('eng-gameboard');
  if (gbSelect.children.length <= 1) {
    INSTANCES_DATA.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.gameboard;
      opt.textContent = g.gameboard;
      gbSelect.appendChild(opt);
    });
  }

  // Set date if provided
  const dateInput = document.getElementById('eng-date');
  dateInput.value = prefillDate || calState.selectedDate || formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('eng-form').reset();
}

document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

document.getElementById('eng-form').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const eng = {
    title: fd.get('title').trim(),
    date: fd.get('date'),
    endDate: fd.get('endDate') || fd.get('date'),
    gameboard: fd.get('gameboard'),
    type: fd.get('type'),
    attendees: fd.get('attendees').trim(),
    notes: fd.get('notes').trim()
  };
  calState.engagements = addEngagement(eng);
  closeModal();
  renderCalendar();
  renderSidePanel();
});

window.deleteEng = function(id) {
  if (!confirm('Delete this engagement?')) return;
  calState.engagements = deleteEngagement(id);
  renderCalendar();
  renderSidePanel();
};

/* ===== Helpers ===== */
function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

/* ===== Init ===== */
renderLinks();
setupInstanceFilters();
renderInstances();
initCalendar();
