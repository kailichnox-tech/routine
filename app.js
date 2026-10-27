(() => {
'use strict';

/* ================= Konstanten ================= */
const KEY = 'routine-v1';
const TOD = [
  { id: 'morgens', label: 'Morgens', icon: '🌅' },
  { id: 'mittags', label: 'Mittags', icon: '☀️' },
  { id: 'abends', label: 'Abends', icon: '🌆' },
  { id: 'nacht', label: 'Vor dem Schlafen', icon: '🌙' }
];
const DRINKS = [
  { id: 'wasser', label: 'Wasser', icon: '💧' },
  { id: 'sprudel', label: 'Sprudel', icon: '🫧' },
  { id: 'tee', label: 'Tee', icon: '🍵' },
  { id: 'kaffee', label: 'Kaffee', icon: '☕' },
  { id: 'sonstiges', label: 'Sonstiges', icon: '🥤' }
];
const RPE = ['', 'Locker', 'Okay', 'Fordernd', 'Hart', 'Am Limit'];
const QUAL = ['', 'Mies', 'Unruhig', 'Okay', 'Gut', 'Super'];
const QUAL_EMO = ['', '😫', '😕', '😐', '🙂', '😄'];
const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const WD_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

const DEFAULT_SETTINGS = {
  water: { goal: 3000, sizes: [250, 500, 1000], gymBonus: 500, dayStart: '07:00', dayEnd: '22:00' },
  supplements: [
    { id: 'kreatin', name: 'Kreatin', dose: '5 g', time: 'morgens', stock: null },
    { id: 'zink', name: 'Zink', dose: '25 mg', time: 'mittags', stock: null },
    { id: 'magnesium', name: 'Magnesium', dose: '400 mg', time: 'abends', stock: null }
  ],
  gym: { weeklyGoal: 4, types: ['Push', 'Pull', 'Beine', 'Oberkörper', 'Ganzkörper', 'Cardio'] },
  sleep: { goalMin: 480, bedTarget: '23:00' }
};

const clone = o => JSON.parse(JSON.stringify(o));
const uid = () => Math.random().toString(36).slice(2, 9);
const isNum = v => v !== null && v !== undefined && v !== '' && !isNaN(Number(v));

/* ================= Speicher ================= */
// Bringt alte Daten (Version 1) und fehlende Felder auf den aktuellen Stand
function migrate(d) {
  const s = d.settings || {};
  const out = clone(DEFAULT_SETTINGS);
  if (s.water) Object.assign(out.water, s.water);
  else { if (s.goal) out.water.goal = s.goal; if (s.sizes) out.water.sizes = s.sizes; }
  if (Array.isArray(s.supplements)) {
    out.supplements = s.supplements.map(x => {
      const def = DEFAULT_SETTINGS.supplements.find(y => y.id === x.id) || { dose: '', time: 'morgens', stock: null };
      return Object.assign({}, def, x);
    });
  }
  if (s.gym) Object.assign(out.gym, s.gym);
  else if (s.gymTypes) out.gym.types = s.gymTypes;
  if (s.sleep) Object.assign(out.sleep, s.sleep);
  d.settings = out;
  d.days = d.days || {};
  for (const k in d.days) {
    const day = d.days[k];
    day.water = (day.water || []).map(w => Object.assign({ id: uid(), drink: 'wasser' }, w));
    day.supps = day.supps || {};
    for (const id in day.supps) if (typeof day.supps[id] === 'string') day.supps[id] = { t: day.supps[id] };
  }
  d.pendingBed = d.pendingBed || null;
  d.version = 2;
  return d;
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) {}
  return migrate({ days: {} });
}
let db = load();
const S = () => db.settings;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); }
  catch (e) { toast('Speichern hat nicht geklappt'); }
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

/* ================= Datum & Zeit ================= */
const pad = n => String(n).padStart(2, '0');
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const todayKey = () => keyOf(new Date());
const timeNow = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const toMin = t => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fromMin = m => { m = ((Math.round(m) % 1440) + 1440) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };
const durMin = (bed, wake) => { const a = toMin(bed), b = toMin(wake); if (a == null || b == null) return 0; return (b - a + 1440) % 1440; };
const bedScale = m => m < 720 ? m + 1440 : m; // Schlafenszeiten über Mitternacht vergleichbar machen
const fmtDur = m => { m = Math.round(m); const h = Math.floor(m / 60), r = m % 60; return h ? (r ? `${h} h ${pad(r)}` : `${h} h`) : `${r} min`; };
const fmtHM = m => `${Math.floor(Math.round(m) / 60)}:${pad(Math.round(m) % 60)}`;
const shortDate = k => { const d = fromKey(k); return `${d.getDate()}.${d.getMonth() + 1}.`; };
const lastNDays = (n, end = todayKey()) => { const a = []; for (let i = n - 1; i >= 0; i--) a.push(addDays(end, -i)); return a; };
const weekStart = k => { const d = fromKey(k); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return keyOf(d); };
function dayLabel(k) {
  const tk = todayKey();
  if (k === tk) return 'Heute';
  if (k === addDays(tk, -1)) return 'Gestern';
  return `${WD[fromKey(k).getDay()]}, ${shortDate(k)}`;
}

/* ================= Zahlen ================= */
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const fmtNum = (n, dig = 1) => Number(n).toLocaleString('de-DE', { maximumFractionDigits: dig });
const fmtL = ml => fmtNum(ml / 1000, 2) + ' L';
const fmtMl = ml => Math.abs(ml) >= 1000 ? fmtL(ml) : Math.round(ml) + ' ml';

/* ================= Tagesdaten ================= */
const EMPTY = Object.freeze({ water: Object.freeze([]), supps: Object.freeze({}), gym: null, sleep: null });
function day(k, create) {
  if (!db.days[k]) {
    if (!create) return EMPTY;
    db.days[k] = { water: [], supps: {}, gym: null, sleep: null };
  }
  return db.days[k];
}
const hasDay = k => !!db.days[k];
const waterTotal = k => day(k).water.reduce((s, w) => s + w.ml, 0);
const gymDone = k => !!(day(k).gym && day(k).gym.done);
const waterBase = k => day(k).goal || S().water.goal;
const waterGoal = k => waterBase(k) + (gymDone(k) ? (S().water.gymBonus || 0) : 0);
const waterHit = k => hasDay(k) && waterTotal(k) >= waterGoal(k);
const suppTaken = (k, id) => !!day(k).supps[id];
const allSupps = k => S().supplements.length > 0 && hasDay(k) && S().supplements.every(x => suppTaken(k, x.id));
const sleepOf = k => { const s = day(k).sleep; return s && s.bed && s.wake ? s : null; };
const sleepMin = k => { const s = sleepOf(k); return s ? durMin(s.bed, s.wake) : null; };
const sleepHit = k => { const m = sleepMin(k); return m != null && m >= S().sleep.goalMin - 15; };
const firstDay = () => Object.keys(db.days).sort()[0] || todayKey();

function streak(test) {
  const tk = todayKey();
  let k = test(tk) ? tk : addDays(tk, -1); // heute zählt erst, wenn geschafft
  let n = 0;
  while (n < 3650 && test(k)) { n++; k = addDays(k, -1); }
  return n;
}
function longestStreak(test) {
  let best = 0, cur = 0, k = firstDay(); const tk = todayKey();
  while (k <= tk) { if (test(k)) { cur++; best = Math.max(best, cur); } else cur = 0; k = addDays(k, 1); }
  return best;
}
function gymWeekCount(k) { const ws = weekStart(k); let n = 0; for (let i = 0; i < 7; i++) if (gymDone(addDays(ws, i))) n++; return n; }

/* ================= Übungen & Rekorde ================= */
const normEx = s => (s || '').trim().toLowerCase();
function exSessions(name, beforeK) {
  const n = normEx(name); if (!n) return [];
  return Object.keys(db.days).filter(k => !beforeK || k < beforeK).sort().map(k => {
    const g = db.days[k].gym;
    if (!g || !g.done || !g.exercises) return null;
    const ex = g.exercises.find(e => normEx(e.name) === n);
    return ex && ex.sets && ex.sets.length ? { k, ex } : null;
  }).filter(Boolean);
}
const bestKg = ex => Math.max(0, ...(ex.sets || []).map(s => Number(s.kg) || 0));
const exVolume = ex => (ex.sets || []).reduce((s, x) => s + (Number(x.reps) || 0) * (Number(x.kg) || 0), 0);
function setsText(ex) {
  const sets = (ex.sets || []).filter(s => s.reps !== '' || s.kg !== '');
  if (!sets.length) return '–';
  const same = sets.every(s => s.reps == sets[0].reps && s.kg == sets[0].kg);
  const kg = v => isNum(v) && Number(v) ? fmtNum(v) + ' kg' : '';
  if (same) return `${sets.length}× ${sets[0].reps || '?'}${kg(sets[0].kg) ? ' · ' + kg(sets[0].kg) : ''}`;
  return sets.map(s => `${s.reps || '?'}${isNum(s.kg) && Number(s.kg) ? '×' + fmtNum(s.kg) : ''}`).join(' / ') + (sets.some(s => Number(s.kg)) ? ' kg' : '');
}
function isPR(k, ex) {
  const b = bestKg(ex); if (!b) return false;
  const prev = exSessions(ex.name, k); if (!prev.length) return false;
  return b > Math.max(...prev.map(p => bestKg(p.ex)));
}
function allExerciseNames() {
  const m = new Map();
  Object.keys(db.days).sort().forEach(k => {
    const g = db.days[k].gym;
    if (g && g.exercises) g.exercises.forEach(e => { const n = normEx(e.name); if (n) m.set(n, e.name.trim()); });
  });
  return [...m.values()].sort((a, b) => a.localeCompare(b, 'de'));
}
function lastSessionOfType(type, beforeK) {
  const ks = Object.keys(db.days).filter(x => x < beforeK).sort().reverse();
  for (const x of ks) {
    const g = db.days[x].gym;
    if (g && g.done && g.type === type && g.exercises && g.exercises.some(e => e.name)) return x;
  }
  return null;
}

/* ================= Kleinkram ================= */
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const buzz = () => { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} };
let toastT;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
}
function celebrate(id) { const el = $(id); if (!el) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
const card = (id, title, body, tag = '') => `<div class="card"${id ? ` id="${id}"` : ''}><h2>${title}${tag}</h2>${body}</div>`;

/* ================= Zustand ================= */
let current = todayKey();
let view = 'today';
let drink = 'wasser';
let waterLogOpen = false;
let statTab = 'overview';
let calMonth = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })();
let exChoice = null;
let sheet = null;
let ringFrom = 0;

function render() {
  document.querySelectorAll('.view').forEach(s => s.classList.toggle('on', s.id === 'v-' + view));
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.view === view));
  if (view === 'today') renderToday();
  else if (view === 'stats') renderStats();
  else renderSettings();
}

/* =====================================================
   HEUTE
   ===================================================== */
function renderToday() {
  const k = current, tk = todayKey(), isToday = k === tk;
  const d = fromKey(k);
  const label = isToday ? 'Heute' : k === addDays(tk, -1) ? 'Gestern' : WD_LONG[d.getDay()];
  let h = `<div class="daybar">
      <button class="iconbtn" data-act="day-prev" aria-label="Vorheriger Tag">‹</button>
      <h1>${label}<small>${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}</small></h1>
      <button class="iconbtn" data-act="day-next" aria-label="Nächster Tag" ${isToday ? 'disabled' : ''}>›</button>
    </div>`;
  if (!isToday) h += `<button class="backtoday" data-act="day-today">Zurück zu heute</button>`;
  h += summaryHTML(k) + sleepCard(k) + waterCard(k) + suppCard(k) + gymCard(k);
  $('v-today').innerHTML = `<div class="wrap">${h}</div>`;
  // Wasser-Ring sanft animieren
  const fg = document.querySelector('#c-water .fgc');
  if (fg) requestAnimationFrame(() => requestAnimationFrame(() => { fg.style.strokeDashoffset = fg.dataset.to; }));
}

function summaryHTML(k) {
  const wt = waterTotal(k), wg = waterGoal(k);
  const list = S().supplements, nT = list.filter(x => suppTaken(k, x.id)).length;
  const sm = sleepMin(k), g = day(k).gym;
  const tiles = [
    { to: 'c-sleep', c: 'var(--sleep)', icon: '😴', val: sm != null ? fmtHM(sm) : '–', label: 'Schlaf', p: sm != null ? sm / S().sleep.goalMin : 0 },
    { to: 'c-water', c: 'var(--water)', icon: '💧', val: Math.round(wt / wg * 100) + ' %', label: 'Wasser', p: wt / wg },
    { to: 'c-supp', c: 'var(--supp)', icon: '💊', val: `${nT}/${list.length}`, label: 'Supps', p: list.length ? nT / list.length : 0 },
    { to: 'c-gym', c: 'var(--gym)', icon: '🏋️', val: g && g.done ? '✓' : g && g.rest ? 'Ruhe' : '–', label: 'Gym', p: g && (g.done || g.rest) ? 1 : 0 }
  ];
  return `<div class="summary">${tiles.map(t => `
    <button class="sum" data-act="jump" data-to="${t.to}" style="--c:${t.c}">
      <span class="si">${t.icon}</span><b>${t.val}</b><span class="slab">${t.label}</span>
      <i class="sbar"><i style="width:${Math.min(100, Math.round(t.p * 100))}%"></i></i>
    </button>`).join('')}</div>`;
}

/* ---------- Schlaf ---------- */
function pendingWakeDay() {
  if (!db.pendingBed) return null;
  const d = new Date(db.pendingBed);
  return d.getHours() < 12 ? keyOf(d) : addDays(keyOf(d), 1);
}
function pendingBedTime() {
  if (!db.pendingBed) return null;
  const d = new Date(db.pendingBed);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function sleepCard(k) {
  const tk = todayKey(), isToday = k === tk;
  const s = sleepOf(k), goal = S().sleep.goalMin;
  const pw = pendingWakeDay(), pt = pendingBedTime();
  let body = '';
  if (s) {
    const m = durMin(s.bed, s.wake), diff = m - goal;
    const diffTxt = Math.abs(diff) < 10 ? 'Genau im Ziel ✓' : diff > 0 ? `${fmtDur(diff)} über Ziel` : `${fmtDur(-diff)} unter Ziel`;
    body = `<div class="sleep-top">
        <div><div class="big-num">${fmtDur(m)}</div><div class="muted small">${s.bed} – ${s.wake} Uhr</div></div>
        ${s.quality ? `<div class="qual"><span>${QUAL_EMO[s.quality]}</span><small>${QUAL[s.quality]}</small></div>` : ''}
      </div>
      <div class="meter"><i style="width:${Math.min(100, m / goal * 100)}%;background:var(--sleep)"></i></div>
      <div class="row-between muted small"><span>${diffTxt}</span><span>Ziel ${fmtDur(goal)}</span></div>
      ${s.wakeups ? `<span class="pill-line">🌗 ${s.wakeups}× nachts aufgewacht</span>` : ''}
      ${s.note ? `<div class="note">„${esc(s.note)}“</div>` : ''}
      <button class="ghost full" data-act="sleep-edit" data-k="${k}">${s.quality ? 'Bearbeiten' : 'Bewerten & bearbeiten'}</button>`;
  } else if (db.pendingBed && pw === k) {
    body = `<div class="sleeping">😴<div><b>Schlafen seit ${pt} Uhr</b><div class="muted small">${isToday ? 'Guten Morgen! Drück, sobald du wach bist.' : 'Die Aufwachzeit fehlt noch.'}</div></div></div>
      ${isToday ? `<button class="bigbtn sleepc" data-act="sleep-wake">☀️ Aufgewacht</button>` : `<button class="bigbtn sleepc" data-act="sleep-edit" data-k="${k}">Aufwachzeit eintragen</button>`}
      <button class="ghost full" data-act="sleep-cancel">Abbrechen</button>`;
  } else {
    body = `<p class="muted" style="margin:0 0 12px">${isToday ? 'Wie hast du letzte Nacht geschlafen?' : 'Für diese Nacht ist nichts eingetragen.'}</p>
      <button class="bigbtn sleepc" data-act="sleep-edit" data-k="${k}">Schlaf eintragen</button>`;
  }
  if (isToday) {
    const hr = new Date().getHours();
    if (db.pendingBed && pw > tk) body += `<div class="night">🌙<span>Gute Nacht! Schlafen seit <b>${pt}</b></span><button data-act="sleep-cancel">Rückgängig</button></div>`;
    else if (!db.pendingBed && (hr >= 18 || hr < 4)) body += `<button class="ghost full" data-act="sleep-bed">🌙 Ich gehe jetzt schlafen</button>`;
  }
  return card('c-sleep', '😴 Schlaf', body, s ? `<span class="tag" style="background:var(--sleep-soft);color:var(--sleep)">Letzte Nacht</span>` : '');
}

/* ---------- Wasser ---------- */
function waterCard(k) {
  const isToday = k === todayKey();
  const total = waterTotal(k), goal = waterGoal(k), bonus = gymDone(k) ? S().water.gymBonus : 0;
  const p = Math.min(1, total / goal);
  const C = 2 * Math.PI * 56;
  const w = day(k).water;
  let status;
  if (total >= goal) status = `<div class="pct ok">Ziel geschafft! 🎉</div><div class="rest">${total > goal ? fmtMl(total - goal) + ' über dem Ziel' : 'Punktlandung'}</div>`;
  else status = `<div class="pct">${Math.round(p * 100)} % geschafft</div><div class="rest">Noch ${fmtMl(goal - total)}</div>`;
  let pace = '';
  if (isToday && total < goal) {
    const sl = sleepOf(k);
    const start = toMin(sl ? sl.wake : S().water.dayStart), end = toMin(S().water.dayEnd), now = nowMin();
    if (now >= start) {
      const frac = Math.min(1, (now - start) / Math.max(60, end - start));
      const diff = total - goal * frac;
      pace = diff >= -150
        ? `<span class="pace ok">✓ Du liegst gut im Plan</span>`
        : `<span class="pace behind">≈ ${fmtMl(Math.round(-diff / 50) * 50)} hinter Plan</span>`;
    }
  }
  const drinks = DRINKS.map(x => `<button class="chip sm ${drink === x.id ? 'on w' : ''}" data-act="drink" data-id="${x.id}">${x.icon} ${x.label}</button>`).join('');
  const btns = S().water.sizes.map(s => `<button class="addbtn" data-act="water-add" data-ml="${s}">+${fmtMl(s)}</button>`).join('');
  let log = '';
  if (w.length) {
    const rows = w.slice().sort((a, b) => (b.t || '').localeCompare(a.t || '')).map(e => {
      const dr = DRINKS.find(x => x.id === e.drink) || DRINKS[0];
      return `<div class="logrow"><span>${dr.icon}</span><span class="lt">${e.t || '–'}</span><span class="lm">${e.ml > 0 ? '+' : ''}${fmtMl(e.ml)}</span><span class="ld muted small">${dr.label}</span><button class="x" data-act="water-del" data-id="${e.id}" aria-label="Eintrag löschen">×</button></div>`;
    }).join('');
    log = `<button class="logtoggle" data-act="water-log">${waterLogOpen ? '▾' : '▸'} ${w.length} ${w.length === 1 ? 'Eintrag' : 'Einträge'} ansehen</button>${waterLogOpen ? `<div class="log">${rows}</div>` : ''}`;
  }
  const fromOff = C * (1 - Math.min(1, ringFrom)); ringFrom = p;
  return card('c-water', '💧 Wasser', `
    <div class="water-top">
      <div class="ring"><svg viewBox="0 0 132 132"><circle class="bgc" cx="66" cy="66" r="56"/><circle class="fgc" cx="66" cy="66" r="56" style="stroke-dasharray:${C};stroke-dashoffset:${fromOff}" data-to="${C * (1 - p)}"/></svg>
        <div class="center"><div class="big">${fmtNum(total / 1000, 2)}</div><div class="sub">von ${fmtL(goal)}</div></div></div>
      <div class="water-info">${status}${pace}${bonus ? `<div class="bonus">🏋️ inkl. +${fmtMl(bonus)} Gym-Bonus</div>` : ''}</div>
    </div>
    <div class="chips scroll">${drinks}</div>
    <div class="btnrow">${btns}</div>
    <div class="subrow"><button class="ghost" data-act="water-undo" ${w.length ? '' : 'disabled'}>↶ Rückgängig</button><button class="ghost" data-act="water-custom">＋ Andere Menge</button></div>
    ${log}`);
}
function addWater(ml, dr = 'wasser', t = null, k = current) {
  const goal = waterGoal(k), before = waterTotal(k);
  const d = day(k, true);
  if (!d.goal) d.goal = S().water.goal;
  d.water.push({ id: uid(), ml, drink: dr, t: t || (k === todayKey() ? timeNow() : null) });
  save(); buzz(); render();
  if (before < goal && waterTotal(k) >= goal) { celebrate('c-water'); toast('💧 Wasserziel geschafft!'); }
}

/* ---------- Supplements ---------- */
function suppCard(k) {
  const list = S().supplements;
  if (!list.length) return card('c-supp', '💊 Supplements', '<p class="muted" style="margin:0">Noch keine Supplements. Füge welche in den Einstellungen hinzu.</p>');
  const n = list.filter(x => suppTaken(k, x.id)).length;
  let body = '';
  TOD.forEach(t => {
    const items = list.filter(x => (x.time || 'morgens') === t.id);
    if (!items.length) return;
    body += `<div class="group-label">${t.icon} ${t.label}</div>`;
    body += items.map(x => {
      const taken = day(k).supps[x.id];
      const st = streak(kk => hasDay(kk) && suppTaken(kk, x.id));
      const low = isNum(x.stock) && Number(x.stock) <= 7;
      const sub = [x.dose ? esc(x.dose) : '', st > 1 ? `🔥 ${st} Tage` : ''].filter(Boolean).join(' · ');
      return `<button class="supp ${taken ? 'done' : ''}" data-act="supp" data-id="${esc(x.id)}">
        <span class="check">✓</span>
        <span class="sname"><b>${esc(x.name)}</b>${sub ? `<small>${sub}</small>` : ''}</span>
        <span class="time">${taken ? (taken.t ? taken.t + ' Uhr' : 'genommen') : 'offen'}${low ? `<em class="low">${Number(x.stock) === 0 ? 'Vorrat leer!' : 'noch ' + x.stock + ' übrig'}</em>` : ''}</span>
      </button>`;
    }).join('');
  });
  const all = n === list.length;
  return card('c-supp', '💊 Supplements', body, `<span class="tag" ${all ? 'style="background:var(--supp-soft);color:var(--supp)"' : ''}>${all ? '✓ ' : ''}${n}/${list.length}</span>`);
}

/* ---------- Gym ---------- */
function gymCard(k) {
  const g = day(k).gym, wc = gymWeekCount(k), goal = S().gym.weeklyGoal;
  let body = '';
  if (g && g.done) {
    const ex = (g.exercises || []).filter(e => e.name && e.name.trim());
    const meta = [g.time ? g.time + ' Uhr' : null, g.duration ? g.duration + ' min' : null, g.rpe ? RPE[g.rpe] : null].filter(Boolean).join(' · ');
    const vol = ex.reduce((s, e) => s + exVolume(e), 0);
    body += `<div class="gym-done"><span class="gd-icon">💪</span><div><b>${g.type ? esc(g.type) + '-Training' : 'Training erledigt'}</b><div class="muted small">${meta || 'Tippe auf Bearbeiten für Details'}</div></div></div>`;
    if (ex.length) body += `<div class="exlist">${ex.map(e => `<div class="exrow"><span>${esc(e.name)}${isPR(k, e) ? '<em class="pr">🏆 Rekord</em>' : ''}</span><span class="muted">${setsText(e)}</span></div>`).join('')}</div>`;
    if (vol) body += `<div class="muted small" style="margin-top:6px">Gesamtvolumen: <b>${fmtNum(vol, 0)} kg</b> · ${ex.reduce((s, e) => s + e.sets.length, 0)} Sätze</div>`;
    if (g.note) body += `<div class="note">„${esc(g.note)}“</div>`;
    body += `<button class="ghost full" data-act="gym-edit">Bearbeiten</button>`;
  } else if (g && g.rest) {
    body += `<div class="gym-done rest"><span class="gd-icon">😌</span><div><b>Ruhetag</b><div class="muted small">Erholung gehört zum Training dazu.</div></div></div>
      <div class="subrow"><button class="ghost" data-act="gym-edit">Doch trainiert</button><button class="ghost" data-act="gym-rest">Kein Ruhetag</button></div>`;
  } else {
    body += `<button class="bigbtn gymc" data-act="gym-edit">🏋️ Training eintragen</button>
      <button class="ghost full" data-act="gym-rest">😌 Heute Ruhetag</button>`;
  }
  body += `<div class="week"><div class="row-between small"><span class="muted">Diese Woche</span><b>${wc} von ${goal} Trainings${wc >= goal ? ' ✓' : ''}</b></div><div class="meter"><i style="width:${Math.min(100, wc / goal * 100)}%;background:var(--gym)"></i></div></div>`;
  return card('c-gym', '🏋️ Gym', body);
}

/* =====================================================
   EINGABE-FENSTER
   ===================================================== */
function openSheet(type, k, draft) {
  sheet = { type, k, draft, dirty: false };
  drawSheet();
  $('sheetBody').scrollTop = 0;
  $('sheet').classList.add('open'); $('sheetBg').classList.add('open');
  document.body.classList.add('noscroll');
}
function closeSheet(force) {
  if (!sheet) return;
  if (!force && sheet.dirty && sheet.type === 'gym' && !confirm('Änderungen am Training verwerfen?')) return;
  sheet = null;
  $('sheet').classList.remove('open'); $('sheetBg').classList.remove('open');
  document.body.classList.remove('noscroll');
  if (document.activeElement) document.activeElement.blur();
  render();
}
function drawSheet() {
  if (!sheet) return;
  const [title, body] = { sleep: sleepSheet, gym: gymSheet, water: waterSheet }[sheet.type]();
  $('sheetTitle').textContent = title;
  $('sheetBody').innerHTML = body;
}

function sleepSheet() {
  const d = sheet.draft;
  return [`Schlaf · ${dayLabel(sheet.k)}`, `
    <p class="muted small" style="margin-top:0">Die Nacht <b>vor</b> diesem Tag.</p>
    <div class="grid2">
      <div class="field"><label>Eingeschlafen</label><input class="inp" type="time" data-in="sleep.bed" value="${d.bed || ''}"></div>
      <div class="field"><label>Aufgewacht</label><input class="inp" type="time" data-in="sleep.wake" value="${d.wake || ''}"></div>
    </div>
    <div class="durbox" id="durBox">${durText(d)}</div>
    <div class="field"><label>Wie hast du geschlafen?</label><div class="qualrow">${[1, 2, 3, 4, 5].map(q => `<button class="qbtn ${d.quality === q ? 'on' : ''}" data-act="sleep-q" data-q="${q}"><span>${QUAL_EMO[q]}</span><small>${QUAL[q]}</small></button>`).join('')}</div></div>
    <div class="field"><label>Nachts aufgewacht</label><div class="stepper"><button data-act="sleep-wu" data-d="-1" aria-label="Weniger">−</button><b>${d.wakeups || 0}×</b><button data-act="sleep-wu" data-d="1" aria-label="Mehr">+</button></div></div>
    <div class="field"><label>Notiz</label><textarea class="inp" rows="2" data-in="sleep.note" placeholder="z. B. spät gegessen, Handy im Bett, Koffein …">${esc(d.note || '')}</textarea></div>
    <button class="primary" data-act="sleep-save">Speichern</button>
    ${day(sheet.k).sleep ? `<button class="secondary danger" data-act="sleep-del">Eintrag löschen</button>` : ''}`];
}
function durText(d) {
  if (!d.bed || !d.wake) return 'Trag beide Zeiten ein';
  const m = durMin(d.bed, d.wake), goal = S().sleep.goalMin;
  return `Schlafdauer: <b>${fmtDur(m)}</b> <span class="small">(${m >= goal ? '+' : '−'}${fmtDur(Math.abs(m - goal))} zum Ziel)</span>`;
}

function gymSheet() {
  const d = sheet.draft, k = sheet.k;
  const types = S().gym.types.filter(Boolean).map(t => `<button class="chip ${d.type === t ? 'on g' : ''}" data-act="gs-type" data-t="${esc(t)}">${esc(t)}</button>`).join('');
  let tpl = '';
  if (d.type && !(d.exercises || []).length) {
    const last = lastSessionOfType(d.type, k);
    if (last) tpl = `<button class="secondary" style="margin:-6px 0 16px" data-act="gs-tpl" data-from="${last}">↺ Übungen vom letzten ${esc(d.type)}-Training übernehmen (${shortDate(last)})</button>`;
  }
  const durs = [30, 45, 60, 75, 90].map(m => `<button class="chip sm ${Number(d.duration) === m ? 'on g' : ''}" data-act="gs-dur" data-m="${m}">${m}</button>`).join('');
  const rpe = [1, 2, 3, 4, 5].map(r => `<button class="qbtn g ${d.rpe === r ? 'on' : ''}" data-act="gs-rpe" data-r="${r}"><span>${r}</span><small>${RPE[r]}</small></button>`).join('');
  const exs = (d.exercises || []).map((e, i) => `
    <div class="excard">
      <div class="exhead"><input class="inp" list="exNames" data-in="ex.name" data-i="${i}" value="${esc(e.name || '')}" placeholder="Übung, z. B. Bankdrücken"><button class="del" data-act="gs-exdel" data-i="${i}" aria-label="Übung entfernen">×</button></div>
      <div class="lasttime" id="lt-${i}">${lastTimeText(e.name, k)}</div>
      <div class="sets">${(e.sets || []).map((s, j) => `
        <div class="setrow"><span class="setn">${j + 1}</span>
          <input class="inp" type="number" inputmode="numeric" min="0" data-in="set.reps" data-i="${i}" data-j="${j}" value="${esc(s.reps)}" placeholder="Wdh.">
          <span class="x-mul">×</span>
          <input class="inp" type="number" inputmode="decimal" min="0" step="0.5" data-in="set.kg" data-i="${i}" data-j="${j}" value="${esc(s.kg)}" placeholder="kg">
          <button class="del sm" data-act="gs-setdel" data-i="${i}" data-j="${j}" aria-label="Satz entfernen">×</button></div>`).join('')}</div>
      <button class="ghost full sm" style="margin-top:4px" data-act="gs-setadd" data-i="${i}">＋ Satz</button>
    </div>`).join('');
  const names = allExerciseNames().map(n => `<option value="${esc(n)}">`).join('');
  return [`Training · ${dayLabel(k)}`, `
    <div class="field"><label>Was hast du trainiert?</label><div class="chips">${types}</div></div>
    ${tpl}
    <div class="field"><label>Dauer (Minuten)</label><div class="durrow"><input class="inp" type="number" inputmode="numeric" min="0" data-in="gym.duration" value="${esc(d.duration)}" placeholder="z. B. 60"><div class="chips nowrap">${durs}</div></div></div>
    <div class="field"><label>Wie anstrengend war's?</label><div class="qualrow">${rpe}</div></div>
    <div class="field"><label>Übungen <span class="muted small">(optional, für Rekorde & Fortschritt)</span></label>${exs}<datalist id="exNames">${names}</datalist><button class="secondary" data-act="gs-exadd">＋ Übung hinzufügen</button></div>
    <div class="field"><label>Notiz</label><textarea class="inp" rows="2" data-in="gym.note" placeholder="z. B. Pump war krass, Schulter gezwickt …">${esc(d.note || '')}</textarea></div>
    <button class="primary" style="background:var(--gym)" data-act="gs-save">Speichern</button>
    ${gymDone(k) ? `<button class="secondary danger" data-act="gs-del">Training löschen</button>` : ''}`];
}
function lastTimeText(name, k) {
  const prev = exSessions(name, k);
  if (!prev.length) return '';
  const last = prev[prev.length - 1];
  const best = Math.max(...prev.map(p => bestKg(p.ex)));
  return `Letztes Mal (${shortDate(last.k)}): ${setsText(last.ex)}${best ? ` · Bestwert ${fmtNum(best)} kg` : ''}`;
}

function waterSheet() {
  const d = sheet.draft;
  return ['Andere Menge', `
    <div class="field"><label>Menge (ml)</label><input class="inp" type="number" inputmode="numeric" data-in="w.ml" value="${esc(d.ml)}" placeholder="z. B. 330">
      <div class="chips" style="margin-top:8px">${[150, 200, 330, 750, 1500].map(m => `<button class="chip sm" data-act="ws-ml" data-m="${m}">${fmtMl(m)}</button>`).join('')}</div>
      <div class="hint">Zum Abziehen eine Minuszahl eingeben, z. B. -200.</div></div>
    <div class="field"><label>Getränk</label><div class="chips">${DRINKS.map(x => `<button class="chip sm ${d.drink === x.id ? 'on w' : ''}" data-act="ws-drink" data-id="${x.id}">${x.icon} ${x.label}</button>`).join('')}</div></div>
    <div class="field"><label>Uhrzeit</label><input class="inp" type="time" data-in="w.t" value="${d.t || ''}"></div>
    <button class="primary" data-act="ws-save">Eintragen</button>`];
}

/* =====================================================
   STATISTIK
   ===================================================== */
function renderStats() {
  const tabs = [['overview', 'Übersicht'], ['water', 'Wasser'], ['supps', 'Supps'], ['gym', 'Gym'], ['sleep', 'Schlaf']];
  const body = { overview: statsOverview, water: statsWater, supps: statsSupps, gym: statsGym, sleep: statsSleep }[statTab]();
  $('v-stats').innerHTML = `<div class="wrap">
    <div class="daybar"><h1>Statistik</h1></div>
    <div class="seg">${tabs.map(([id, l]) => `<button class="${statTab === id ? 'on' : ''}" data-act="stat-tab" data-t="${id}">${l}</button>`).join('')}</div>
    ${body}</div>`;
}
const statTile = (v, label, c, sub = '') => `<div class="stat"><b style="color:${c}">${v}</b><span>${label}</span>${sub ? `<em>${sub}</em>` : ''}</div>`;
const emptyHint = txt => `<p class="muted small" style="margin:0">${txt}</p>`;

function barChart(items, color) {
  const max = Math.max(1, ...items.map(i => Math.max(i.v, (i.goal || 0) * 1.1)));
  return `<div class="bars">${items.map(i => `
    <div class="bar" title="${esc(i.title || '')}"><div class="track">
      ${i.goal ? `<div class="gl" style="bottom:${i.goal / max * 100}%"></div>` : ''}
      <div class="b" style="height:${i.v / max * 100}%;background:${color};opacity:${i.ok === false ? .4 : 1}"></div>
    </div><span>${i.label}</span></div>`).join('')}</div>`;
}
function hbars(rows, color) {
  const max = Math.max(1, ...rows.map(r => r.v));
  return rows.map(r => `<div class="hrow"><span class="hl">${r.label}</span><div class="htrack"><i style="width:${r.v / max * 100}%;background:${color}"></i></div><span class="hv">${r.text}</span></div>`).join('');
}
function lineChart(pts, color, unit) {
  if (pts.length < 2) return emptyHint('Ab 2 Einheiten mit Gewicht erscheint hier deine Kurve.');
  const W = 320, H = 150, L = 34, R = 10, T = 14, B = 22;
  const vs = pts.map(p => p.v); let lo = Math.min(...vs), hi = Math.max(...vs);
  const padv = (hi - lo) * 0.2 || Math.max(2, hi * 0.05); lo -= padv; hi += padv;
  const x = i => L + i * (W - L - R) / (pts.length - 1);
  const y = v => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const gridVals = [lo + padv, (lo + hi) / 2, hi - padv];
  return `<svg class="svgline" viewBox="0 0 ${W} ${H}">
    ${gridVals.map(v => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 3}" text-anchor="end">${fmtNum(v)}</text>`).join('')}
    <path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.v)}" r="3.5" fill="${color}"/>`).join('')}
    ${pts.map((p, i) => (i === 0 || i === pts.length - 1 || pts.length <= 6) ? `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${p.label}</text>` : '').join('')}
  </svg><div class="muted small">in ${unit}</div>`;
}

/* ---------- Übersicht ---------- */
function statsOverview() {
  const tk = todayKey();
  const sl7 = lastNDays(7).map(sleepMin).filter(x => x != null);
  const tiles = `<div class="stats4">
    ${statTile(streak(waterHit), 'Tage Wasserziel in Folge', 'var(--water)', `Rekord: ${longestStreak(waterHit)}`)}
    ${statTile(streak(allSupps), 'Tage alle Supps in Folge', 'var(--supp)', `Rekord: ${longestStreak(allSupps)}`)}
    ${statTile(`${gymWeekCount(tk)}/${S().gym.weeklyGoal}`, 'Trainings diese Woche', 'var(--gym)')}
    ${statTile(sl7.length ? fmtHM(avg(sl7)) + ' h' : '–', 'Ø Schlaf 7 Tage', 'var(--sleep)')}
  </div>`;
  return card('', 'Auf einen Blick', tiles) + calendarCard() + insightsCard();
}
function calendarCard() {
  const tk = todayKey(), y = calMonth.getFullYear(), m = calMonth.getMonth(), now = new Date();
  const atMax = y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth());
  const offset = (new Date(y, m, 1).getDay() + 6) % 7, daysIn = new Date(y, m + 1, 0).getDate();
  let h = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(w => `<div class="wd">${w}</div>`).join('');
  for (let i = 0; i < offset; i++) h += '<div class="day empty"></div>';
  for (let dn = 1; dn <= daysIn; dn++) {
    const k = keyOf(new Date(y, m, dn));
    const pct = hasDay(k) ? Math.min(100, Math.round(waterTotal(k) / waterGoal(k) * 100)) : 0;
    const cls = ['day', k === tk ? 'today' : '', k > tk ? 'future' : '', waterHit(k) ? 'goal' : ''].join(' ');
    h += `<button class="${cls}" data-act="cal-day" data-k="${k}" ${k > tk ? 'disabled' : ''}>
      <div class="fill" style="height:${pct}%"></div><span class="n">${dn}</span>
      <span class="dots">${sleepHit(k) ? '<i class="dot sl"></i>' : ''}${allSupps(k) ? '<i class="dot s"></i>' : ''}${gymDone(k) ? '<i class="dot g"></i>' : ''}</span></button>`;
  }
  return `<div class="card">
    <div class="monthbar"><button class="iconbtn" data-act="cal-prev" aria-label="Vorheriger Monat">‹</button><b>${MONTHS[m]} ${y}</b><button class="iconbtn" data-act="cal-next" aria-label="Nächster Monat" ${atMax ? 'disabled' : ''}>›</button></div>
    <div class="cal">${h}</div>
    <div class="legend"><span><i style="background:var(--water);border-radius:2px"></i>Wasser-Füllstand</span><span><i style="background:var(--sleep)"></i>Schlafziel</span><span><i style="background:var(--supp)"></i>Alle Supps</span><span><i style="background:var(--gym)"></i>Gym</span></div>
    <p class="muted small" style="margin:10px 0 0">Tippe auf einen Tag, um ihn anzusehen oder nachzutragen.</p></div>`;
}
function insights() {
  const out = [], days = lastNDays(90);
  // Abend-Supplements → Schlaf in der Nacht danach
  S().supplements.filter(x => x.time === 'abends' || x.time === 'nacht').forEach(x => {
    const w = [], wo = [];
    days.forEach(k => { const s = sleepOf(addDays(k, 1)); if (!s || !hasDay(k)) return; (suppTaken(k, x.id) ? w : wo).push(s); });
    if (w.length >= 3 && wo.length >= 3) {
      const q = a => avg(a.filter(s => s.quality).map(s => s.quality));
      const dm = a => avg(a.map(s => durMin(s.bed, s.wake)));
      const qw = q(w), qo = q(wo);
      out.push({ icon: '💊', text: `Nach Abenden <b>mit ${esc(x.name)}</b> schläfst du Ø <b>${fmtDur(dm(w))}</b>${qw ? ` (Qualität ${fmtNum(qw)}/5)` : ''}, <b>ohne</b> Ø <b>${fmtDur(dm(wo))}</b>${qo ? ` (${fmtNum(qo)}/5)` : ''}.` });
    }
  });
  { // Training → Schlaf
    const w = [], wo = [];
    days.forEach(k => { const m = sleepMin(addDays(k, 1)); if (m == null) return; (gymDone(k) ? w : wo).push(m); });
    if (w.length >= 3 && wo.length >= 3) out.push({ icon: '🏋️', text: `Nach Trainingstagen schläfst du Ø <b>${fmtDur(avg(w))}</b>, nach trainingsfreien Tagen Ø <b>${fmtDur(avg(wo))}</b>.` });
  }
  { // Wasser an Gym-Tagen
    const w = [], wo = [];
    days.forEach(k => { const t = waterTotal(k); if (!t) return; (gymDone(k) ? w : wo).push(t); });
    if (w.length >= 3 && wo.length >= 3) out.push({ icon: '💧', text: `An Gym-Tagen trinkst du Ø <b>${fmtL(avg(w))}</b>, an anderen Tagen Ø <b>${fmtL(avg(wo))}</b>.` });
  }
  { // Schlaf → Trainingsgefühl
    const good = [], bad = [];
    days.forEach(k => { const g = day(k).gym, m = sleepMin(k); if (!g || !g.done || !g.rpe || m == null) return; (m >= S().sleep.goalMin - 30 ? good : bad).push(g.rpe); });
    if (good.length >= 3 && bad.length >= 3) out.push({ icon: '⚡', text: `Nach genug Schlaf fühlt sich dein Training im Schnitt wie <b>${fmtNum(avg(good))}/5</b> an, nach zu wenig Schlaf wie <b>${fmtNum(avg(bad))}/5</b>.` });
  }
  { // häufigster Trainingstag
    const c = [0, 0, 0, 0, 0, 0, 0]; let n = 0;
    days.forEach(k => { if (gymDone(k)) { c[fromKey(k).getDay()]++; n++; } });
    if (n >= 6) { const max = Math.max(...c); out.push({ icon: '📅', text: `Dein häufigster Trainingstag ist der <b>${WD_LONG[c.indexOf(max)]}</b> (${max} von ${n} Trainings).` }); }
  }
  { // schwächster Wasser-Wochentag
    const sum = Array(7).fill(0), cnt = Array(7).fill(0);
    days.forEach(k => { const t = waterTotal(k); if (t > 0) { const i = fromKey(k).getDay(); sum[i] += t; cnt[i]++; } });
    const a = sum.map((s, i) => cnt[i] >= 2 ? s / cnt[i] : null), valid = a.filter(x => x != null);
    if (valid.length >= 5) { const min = Math.min(...valid); out.push({ icon: '🔎', text: `Am <b>${WD_LONG[a.indexOf(min)]}</b> trinkst du am wenigsten (Ø ${fmtL(min)}).` }); }
  }
  { // Schlafrhythmus
    const b = lastNDays(14).map(sleepOf).filter(Boolean).map(s => bedScale(toMin(s.bed)));
    if (b.length >= 5) {
      const m = avg(b), sd = Math.sqrt(avg(b.map(x => (x - m) ** 2)));
      out.push({ icon: '🕰️', text: sd <= 30
        ? `Sehr regelmäßig: Du schläfst meist gegen <b>${fromMin(m)}</b> ein (± ${Math.round(sd)} min).`
        : `Deine Einschlafzeit schwankt um <b>± ${Math.round(sd)} min</b> (Ø ${fromMin(m)}). Feste Zeiten helfen vielen beim Einschlafen.` });
    }
  }
  return out;
}
function insightsCard() {
  const list = insights();
  return card('', '💡 Erkenntnisse', list.length
    ? list.map(i => `<div class="insight"><span>${i.icon}</span><div>${i.text}</div></div>`).join('')
    : emptyHint('Trag ein paar Tage lang alles ein. Dann zeigt dir die App hier Zusammenhänge, z. B. ob du nach Magnesium oder nach dem Training besser schläfst.'));
}

/* ---------- Wasser ---------- */
function statsWater() {
  const tk = todayKey(), d30 = lastNDays(30), logged = d30.filter(k => waterTotal(k) > 0);
  if (!logged.length) return card('', '💧 Wasser', emptyHint('Noch keine Daten. Trink was! 😉'));
  const vals = logged.map(waterTotal), hit = logged.filter(waterHit).length;
  const best = logged.reduce((a, b) => waterTotal(b) > waterTotal(a) ? b : a);
  const ms = tk.slice(0, 8) + '01';
  let month = 0; Object.keys(db.days).forEach(k => { if (k >= ms && k <= tk) month += waterTotal(k); });
  const tiles = `<div class="stats4">
    ${statTile(fmtL(avg(vals)), 'Ø pro Tag', 'var(--water)', 'letzte 30 Tage')}
    ${statTile(Math.round(hit / logged.length * 100) + ' %', 'Ziel geschafft', 'var(--water)', `${hit} von ${logged.length} Tagen`)}
    ${statTile(fmtL(waterTotal(best)), 'Bester Tag', 'var(--water)', dayLabel(best))}
    ${statTile(fmtNum(month / 1000, 1) + ' L', `Im ${MONTHS[fromKey(tk).getMonth()]}`, 'var(--water)', 'insgesamt')}
  </div>`;
  const k14 = lastNDays(14);
  const chart = barChart(k14.map(k => ({ label: k === tk ? 'H' : fromKey(k).getDate(), v: waterTotal(k), goal: waterGoal(k), ok: waterHit(k), title: `${dayLabel(k)}: ${fmtMl(waterTotal(k))}` })), 'var(--water)');
  // Getränke
  const byDrink = {}; let all = 0;
  d30.forEach(k => day(k).water.forEach(w => { if (w.ml > 0) { byDrink[w.drink] = (byDrink[w.drink] || 0) + w.ml; all += w.ml; } }));
  const drinkRows = DRINKS.filter(x => byDrink[x.id]).map(x => ({ label: `${x.icon} ${x.label}`, v: byDrink[x.id], text: Math.round(byDrink[x.id] / all * 100) + ' %' })).sort((a, b) => b.v - a.v);
  // Tageszeit
  const buckets = [['🌅 Morgens', 0, 660], ['☀️ Mittags', 660, 840], ['🌤️ Nachmittag', 840, 1080], ['🌙 Abends', 1080, 1440]];
  const bt = buckets.map(() => 0);
  d30.forEach(k => day(k).water.forEach(w => { if (w.ml > 0 && w.t) { const m = toMin(w.t); const i = buckets.findIndex(b => m >= b[1] && m < b[2]); if (i >= 0) bt[i] += w.ml; } }));
  const btSum = bt.reduce((a, b) => a + b, 0);
  const timeRows = buckets.map((b, i) => ({ label: b[0], v: bt[i], text: btSum ? Math.round(bt[i] / btSum * 100) + ' %' : '–' }));
  // Wochentage
  const sum = Array(7).fill(0), cnt = Array(7).fill(0);
  lastNDays(90).forEach(k => { const t = waterTotal(k); if (t > 0) { const i = (fromKey(k).getDay() + 6) % 7; sum[i] += t; cnt[i]++; } });
  const wdChart = barChart(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((l, i) => ({ label: l, v: cnt[i] ? sum[i] / cnt[i] : 0, goal: S().water.goal, title: cnt[i] ? fmtL(sum[i] / cnt[i]) : '' })), 'var(--water)');
  return card('', '💧 Wasser · 30 Tage', tiles)
    + card('', 'Letzte 14 Tage', chart + `<p class="muted small" style="margin:8px 0 0">Gestrichelt = Tagesziel · blass = Ziel verpasst</p>`)
    + card('', 'Was du trinkst', hbars(drinkRows, 'var(--water)'))
    + card('', 'Wann du trinkst', btSum ? hbars(timeRows, 'var(--water)') : emptyHint('Noch keine Uhrzeiten.'))
    + card('', 'Ø nach Wochentag', wdChart);
}

/* ---------- Supplements ---------- */
function statsSupps() {
  const list = S().supplements, tk = todayKey();
  if (!list.length) return card('', '💊 Supplements', emptyHint('Keine Supplements eingerichtet.'));
  const fd = firstDay(), d30 = lastNDays(30);
  // Heute zählt nur mit, wenn schon erledigt (der Tag läuft ja noch)
  const spanFor = test => d30.filter(k => k >= fd && (k < tk || test(k)));
  const span = spanFor(allSupps);
  const allPct = span.length ? Math.round(span.filter(allSupps).length / span.length * 100) : 0;
  let html = card('', '💊 Alle zusammen', `<div class="stats4">
    ${statTile(streak(allSupps), 'Tage alle in Folge', 'var(--supp)', `Rekord: ${longestStreak(allSupps)}`)}
    ${statTile(allPct + ' %', 'Tage komplett', 'var(--supp)', `letzte ${span.length} Tage`)}
  </div>`);
  list.forEach(x => {
    const test = k => hasDay(k) && suppTaken(k, x.id);
    const spanX = spanFor(test), taken = spanX.filter(test);
    const pct = spanX.length ? Math.round(taken.length / spanX.length * 100) : 0;
    const times = taken.map(k => day(k).supps[x.id].t).filter(Boolean).map(toMin);
    const strip = d30.map(k => `<i class="${test(k) ? 'on' : ''} ${k < fd ? 'pre' : ''}" title="${shortDate(k)}"></i>`).join('');
    const stock = isNum(x.stock)
      ? `<div class="small" style="margin-top:10px;${Number(x.stock) <= 7 ? 'color:var(--warn);font-weight:650' : ''}">📦 Vorrat: noch ${x.stock} ${Number(x.stock) === 1 ? 'Portion' : 'Portionen'}${Number(x.stock) > 0 ? ` · reicht bis ca. ${shortDate(addDays(tk, Number(x.stock)))}` : ' · nachkaufen!'}</div>`
      : '';
    const tod = TOD.find(t => t.id === x.time);
    html += card('', `${esc(x.name)}`, `
      <div class="mini-stats">
        <span>🔥 <b>${streak(test)}</b> Tage</span>
        <span>Rekord <b>${longestStreak(test)}</b></span>
        <span>Quote <b>${pct} %</b></span>
        ${times.length ? `<span>Ø <b>${fromMin(avg(times))} Uhr</b></span>` : ''}
      </div>
      <div class="strip">${strip}</div>
      <div class="row-between small muted" style="margin-top:4px"><span>vor 30 Tagen</span><span>heute</span></div>
      ${stock}`, `<span class="tag">${esc(x.dose || '')}${x.dose && tod ? ' · ' : ''}${tod ? tod.label : ''}</span>`);
  });
  return html;
}

/* ---------- Gym ---------- */
function statsGym() {
  const tk = todayKey(), goal = S().gym.weeklyGoal;
  const d30 = lastNDays(30), sessions30 = d30.filter(gymDone);
  const ms = tk.slice(0, 8) + '01';
  const month = Object.keys(db.days).filter(k => k >= ms && k <= tk && gymDone(k)).length;
  const durs = sessions30.map(k => Number(day(k).gym.duration)).filter(Boolean);
  const rpes = sessions30.map(k => day(k).gym.rpe).filter(Boolean);
  const tiles = `<div class="stats4">
    ${statTile(`${gymWeekCount(tk)}/${goal}`, 'Diese Woche', 'var(--gym)')}
    ${statTile(month, `Im ${MONTHS[fromKey(tk).getMonth()]}`, 'var(--gym)', 'Trainings')}
    ${statTile(durs.length ? Math.round(avg(durs)) + ' min' : '–', 'Ø Dauer', 'var(--gym)', 'letzte 30 Tage')}
    ${statTile(rpes.length ? fmtNum(avg(rpes)) + '/5' : '–', 'Ø Anstrengung', 'var(--gym)', rpes.length ? RPE[Math.round(avg(rpes))] : '')}
  </div>`;
  // Wochen
  const ws = weekStart(tk), weeks = [];
  for (let i = 7; i >= 0; i--) { const w = addDays(ws, -7 * i); weeks.push({ label: i === 0 ? 'Jetzt' : shortDate(w), v: gymWeekCount(w), goal, ok: gymWeekCount(w) >= goal || i === 0, title: `Woche ab ${shortDate(w)}` }); }
  // Arten
  const types = {}; lastNDays(90).filter(gymDone).forEach(k => { const t = day(k).gym.type || 'Ohne Angabe'; types[t] = (types[t] || 0) + 1; });
  const typeRows = Object.entries(types).sort((a, b) => b[1] - a[1]).map(([t, n]) => ({ label: esc(t), v: n, text: n + '×' }));
  // Letzte Trainings
  const recent = Object.keys(db.days).filter(gymDone).sort().reverse().slice(0, 8);
  const recentRows = recent.map(k => { const g = day(k).gym; const nEx = (g.exercises || []).length; return `<button class="wkrow" data-act="cal-day" data-k="${k}"><span class="wd8">${WD[fromKey(k).getDay()]} ${shortDate(k)}</span><span class="wt">${esc(g.type || 'Training')}</span><span class="wm">${[g.duration ? g.duration + ' min' : '', nEx ? nEx + ' Übungen' : '', g.rpe ? RPE[g.rpe] : ''].filter(Boolean).join(' · ')}</span></button>`; }).join('');
  // Rekorde
  const names = allExerciseNames();
  const prs = names.map(n => { const s = exSessions(n); let best = 0, bk = null; s.forEach(p => { const b = bestKg(p.ex); if (b > best) { best = b; bk = p.k; } }); return { n, sessions: s.length, best, bk }; }).filter(p => p.sessions).sort((a, b) => b.sessions - a.sessions);
  const prRows = prs.slice(0, 12).map(p => `<div class="exrow"><span>${esc(p.n)} <span class="muted small">· ${p.sessions}×</span></span><span>${p.best ? `<b>${fmtNum(p.best)} kg</b> <span class="muted small">${shortDate(p.bk)}</span>` : '<span class="muted">ohne Gewicht</span>'}</span></div>`).join('');
  // Fortschritt
  const withKg = prs.filter(p => p.best);
  if (!exChoice || !withKg.some(p => p.n === exChoice)) exChoice = withKg.length ? withKg[0].n : null;
  let progress = emptyHint('Trag beim Training Übungen mit Gewicht ein, dann siehst du hier deinen Fortschritt.');
  if (exChoice) {
    const pts = exSessions(exChoice).filter(p => bestKg(p.ex)).slice(-12).map(p => ({ label: shortDate(p.k), v: bestKg(p.ex) }));
    const first = pts[0], last = pts[pts.length - 1];
    progress = `<select class="inp" data-stat="ex">${withKg.map(p => `<option ${p.n === exChoice ? 'selected' : ''}>${esc(p.n)}</option>`).join('')}</select>
      ${lineChart(pts, 'var(--gym)', 'kg (schwerster Satz)')}
      ${pts.length >= 2 ? `<p class="small" style="margin:8px 0 0">Seit ${first.label}: <b style="color:var(--gym)">${last.v - first.v >= 0 ? '+' : ''}${fmtNum(last.v - first.v)} kg</b></p>` : ''}`;
  }
  return card('', '🏋️ Gym', tiles)
    + card('', 'Trainings pro Woche', barChart(weeks, 'var(--gym)') + `<p class="muted small" style="margin:8px 0 0">Gestrichelt = dein Wochenziel (${goal}×)</p>`)
    + card('', '📈 Fortschritt', progress)
    + card('', '🏆 Bestwerte', prRows || emptyHint('Noch keine Übungen eingetragen.'))
    + card('', 'Trainingsarten · 90 Tage', typeRows.length ? hbars(typeRows, 'var(--gym)') : emptyHint('Noch keine Trainings.'))
    + card('', 'Letzte Trainings', recentRows || emptyHint('Noch keine Trainings.'));
}

/* ---------- Schlaf ---------- */
function statsSleep() {
  const tk = todayKey(), goal = S().sleep.goalMin;
  const d7 = lastNDays(7), d30 = lastNDays(30);
  const m7 = d7.map(sleepMin).filter(x => x != null), m30 = d30.map(sleepMin).filter(x => x != null);
  if (!m30.length) return card('', '😴 Schlaf', emptyHint('Noch keine Nächte eingetragen. Tipp: Abends „Ich gehe jetzt schlafen“ drücken, morgens „Aufgewacht“.'));
  const q30 = d30.map(sleepOf).filter(s => s && s.quality).map(s => s.quality);
  const debt = m7.reduce((s, m) => s + (goal - m), 0);
  const tiles = `<div class="stats4">
    ${statTile(m7.length ? fmtHM(avg(m7)) + ' h' : '–', 'Ø Schlaf', 'var(--sleep)', `letzte 7 Tage (${m7.length} Nächte)`)}
    ${statTile(fmtHM(avg(m30)) + ' h', 'Ø Schlaf', 'var(--sleep)', `letzte 30 Tage (${m30.length} Nächte)`)}
    ${statTile(q30.length ? `${QUAL_EMO[Math.round(avg(q30))]} ${fmtNum(avg(q30))}` : '–', 'Ø Qualität', 'var(--sleep)', 'von 5')}
    ${statTile(m7.length ? (debt > 0 ? '−' : '+') + fmtDur(Math.abs(debt)) : '–', debt > 0 ? 'Schlafdefizit' : 'Schlafplus', 'var(--sleep)', '7 Tage vs. Ziel')}
  </div>`;
  const k14 = lastNDays(14);
  const win = sleepWindowChart(k14);
  const durChart = barChart(k14.map(k => ({ label: k === tk ? 'H' : fromKey(k).getDate(), v: (sleepMin(k) || 0) / 60, goal: goal / 60, ok: sleepHit(k), title: sleepMin(k) != null ? fmtDur(sleepMin(k)) : '' })), 'var(--sleep)');
  const ss = d30.map(sleepOf).filter(Boolean);
  const beds = ss.map(s => bedScale(toMin(s.bed))), wakes = ss.map(s => toMin(s.wake));
  const sd = a => { const m = avg(a); return Math.sqrt(avg(a.map(x => (x - m) ** 2))); };
  const rhythm = `<div class="stats4">
    ${statTile(fromMin(avg(beds)), 'Ø Einschlafen', 'var(--sleep)', `± ${Math.round(sd(beds))} min · Ziel ${S().sleep.bedTarget}`)}
    ${statTile(fromMin(avg(wakes)), 'Ø Aufwachen', 'var(--sleep)', `± ${Math.round(sd(wakes))} min`)}
  </div>`;
  const qc = [5, 4, 3, 2, 1].map(q => ({ label: `${QUAL_EMO[q]} ${QUAL[q]}`, v: q30.filter(x => x === q).length, text: q30.filter(x => x === q).length + '×' }));
  const wu = ss.filter(s => s.wakeups != null).map(s => s.wakeups);
  return card('', '😴 Schlaf', tiles)
    + card('', 'Schlafenszeiten · 14 Tage', win + `<p class="muted small" style="margin:8px 0 0">Jeder Balken = eine Nacht, von Einschlafen bis Aufwachen. Je kräftiger, desto besser geschlafen.</p>`)
    + card('', 'Schlafdauer · 14 Tage', durChart + `<p class="muted small" style="margin:8px 0 0">In Stunden · gestrichelt = Ziel ${fmtDur(goal)}</p>`)
    + card('', 'Rhythmus · 30 Tage', rhythm)
    + card('', 'Qualität · 30 Tage', q30.length ? hbars(qc, 'var(--sleep)') + (wu.length ? `<p class="muted small" style="margin:6px 0 0">Ø ${fmtNum(avg(wu))}× nachts aufgewacht</p>` : '') : emptyHint('Bewerte deine Nächte, dann siehst du hier die Verteilung.'));
}
function sleepWindowChart(keys) {
  const A = 1200, R = 960; // 20:00 bis 12:00
  const cols = keys.map(k => {
    const s = sleepOf(k); let bar = '';
    if (s) {
      const b = bedScale(toMin(s.bed)), d = durMin(s.bed, s.wake);
      const top = Math.min(100, Math.max(0, (b - A) / R * 100));
      const h = Math.max(1, Math.min(100 - top, d / R * 100));
      bar = `<i style="top:${top}%;height:${h}%;opacity:${s.quality ? .4 + s.quality * .12 : .75}" title="${s.bed}–${s.wake}"></i>`;
    }
    return `<div class="swcol"><div class="swtrack">${bar}</div><span>${fromKey(k).getDate()}</span></div>`;
  }).join('');
  const ticks = [20, 22, 0, 2, 4, 6, 8, 10, 12].map((h, i) => `<div class="swtick" style="top:${i * 12.5}%"><span>${pad(h)}</span></div>`).join('');
  return `<div class="sw"><div class="swgrid">${ticks}</div><div class="swcols">${cols}</div></div>`;
}

/* =====================================================
   EINSTELLUNGEN
   ===================================================== */
function renderSettings() {
  const s = S();
  const supps = s.supplements.map((x, i) => `
    <div class="suppset">
      <div class="listrow"><input class="inp" style="font-weight:600" data-set="supp.name" data-i="${i}" value="${esc(x.name)}" placeholder="Name"><button class="del" data-act="set-supp-del" data-i="${i}" aria-label="Entfernen">×</button></div>
      <div class="grid2">
        <div><label class="mini">Dosis</label><input class="inp" data-set="supp.dose" data-i="${i}" value="${esc(x.dose || '')}" placeholder="z. B. 5 g"></div>
        <div><label class="mini">Wann</label><select class="inp" data-set="supp.time" data-i="${i}">${TOD.map(t => `<option value="${t.id}" ${x.time === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}</select></div>
      </div>
      <div style="margin-top:8px"><label class="mini">Vorrat in Portionen (optional)</label><input class="inp" type="number" inputmode="numeric" min="0" data-set="supp.stock" data-i="${i}" value="${isNum(x.stock) ? x.stock : ''}" placeholder="leer = nicht zählen"></div>
    </div>`).join('');
  const types = s.gym.types.map((t, i) => `<div class="listrow"><input class="inp" data-set="gym.type" data-i="${i}" value="${esc(t)}" placeholder="z. B. Push"><button class="del" data-act="set-type-del" data-i="${i}" aria-label="Entfernen">×</button></div>`).join('');
  $('v-settings').innerHTML = `<div class="wrap">
    <div class="daybar"><h1>Einstellungen</h1></div>
    <p class="muted small" style="margin:-4px 0 14px;text-align:center">Änderungen werden automatisch gespeichert.</p>

    ${card('', '😴 Schlaf', `
      <div class="grid2">
        <div class="field"><label>Ziel (Stunden)</label><input class="inp" type="number" inputmode="decimal" step="0.25" min="3" max="14" data-set="sleep.goal" value="${s.sleep.goalMin / 60}"></div>
        <div class="field"><label>Ins Bett um</label><input class="inp" type="time" data-set="sleep.bedTarget" value="${s.sleep.bedTarget}"></div>
      </div>`)}

    ${card('', '💧 Wasser', `
      <div class="field"><label>Tagesziel (ml)</label><input class="inp" type="number" inputmode="numeric" step="250" min="250" data-set="water.goal" value="${s.water.goal}"></div>
      <div class="field"><label>Schnell-Knöpfe (ml)</label><div class="grid3">${s.water.sizes.map((v, i) => `<input class="inp" type="number" inputmode="numeric" min="1" data-set="water.size" data-i="${i}" value="${v}">`).join('')}</div></div>
      <div class="field"><label>Extra an Gym-Tagen (ml)</label><input class="inp" type="number" inputmode="numeric" step="250" min="0" data-set="water.gymBonus" value="${s.water.gymBonus}"><div class="hint">Wird an Trainingstagen zum Ziel dazugerechnet. 0 = aus.</div></div>
      <div class="grid2">
        <div class="field"><label>Trinkzeit von</label><input class="inp" type="time" data-set="water.dayStart" value="${s.water.dayStart}"></div>
        <div class="field"><label>bis</label><input class="inp" type="time" data-set="water.dayEnd" value="${s.water.dayEnd}"></div>
      </div>
      <div class="hint" style="margin-top:-8px">Damit rechnet die App aus, ob du „im Plan“ liegst. Wenn du deinen Schlaf einträgst, zählt deine Aufwachzeit als Start.</div>`)}

    ${card('', '💊 Supplements', `${supps || emptyHint('Keine Supplements.')}<button class="secondary" data-act="set-supp-add">＋ Supplement hinzufügen</button>
      <div class="hint">Mit Vorrat zählt die App bei jedem Abhaken eine Portion runter und warnt dich, wenn es knapp wird.</div>`)}

    ${card('', '🏋️ Gym', `
      <div class="field"><label>Wochenziel (Trainings)</label><input class="inp" type="number" inputmode="numeric" min="1" max="7" data-set="gym.weeklyGoal" value="${s.gym.weeklyGoal}"></div>
      <label class="lbl">Trainingsarten</label>${types}<button class="secondary" data-act="set-type-add">＋ Trainingsart hinzufügen</button>`)}

    ${card('', '💾 Sicherung', `
      <p class="muted small" style="margin:0 0 4px">Deine Daten liegen nur auf diesem Handy. Mach ab und zu eine Sicherung, z. B. bevor du den Browser-Verlauf löschst oder das Handy wechselst.</p>
      <button class="secondary" data-act="export">⬇ Sicherung speichern</button>
      <button class="secondary" data-act="import">⬆ Sicherung laden</button>
      <button class="secondary danger" data-act="reset">Alle Daten löschen</button>`)}
    <p class="muted small" style="text-align:center">Routine · Version 2</p>
  </div>`;
}
function settingChange(t) {
  const s = S(), f = t.dataset.set, i = Number(t.dataset.i), v = t.value;
  const num = (x, min = 0) => { const n = Math.round(Number(String(x).replace(',', '.'))); return isNaN(n) || n < min ? null : n; };
  switch (f) {
    case 'water.goal': { const n = num(v, 250); if (!n) { toast('Bitte mindestens 250 ml'); t.value = s.water.goal; return; } s.water.goal = n; const td = db.days[todayKey()]; if (td) td.goal = n; break; }
    case 'water.size': { const n = num(v, 1); if (!n) { toast('Bitte eine gültige Menge'); t.value = s.water.sizes[i]; return; } s.water.sizes[i] = n; break; }
    case 'water.gymBonus': s.water.gymBonus = num(v, 0) || 0; break;
    case 'water.dayStart': case 'water.dayEnd': if (v) s.water[f.split('.')[1]] = v; break;
    case 'supp.name': if (v.trim()) s.supplements[i].name = v.trim(); else t.value = s.supplements[i].name; break;
    case 'supp.dose': s.supplements[i].dose = v.trim(); break;
    case 'supp.time': s.supplements[i].time = v; break;
    case 'supp.stock': s.supplements[i].stock = v === '' ? null : (num(v, 0) ?? 0); break;
    case 'gym.weeklyGoal': s.gym.weeklyGoal = Math.min(7, Math.max(1, num(v, 1) || 1)); t.value = s.gym.weeklyGoal; break;
    case 'gym.type': if (v.trim()) s.gym.types[i] = v.trim(); else { s.gym.types.splice(i, 1); renderSettings(); } break;
    case 'sleep.goal': { const h = Number(String(v).replace(',', '.')); if (!h || h < 3 || h > 14) { toast('Ziel zwischen 3 und 14 Stunden'); t.value = s.sleep.goalMin / 60; return; } s.sleep.goalMin = Math.round(h * 60); break; }
    case 'sleep.bedTarget': if (v) s.sleep.bedTarget = v; break;
    default: return;
  }
  save(); toast('Gespeichert ✓');
}

/* =====================================================
   AKTIONEN (alle Klicks)
   ===================================================== */
const actions = {
  nav: el => {
    const v = el.dataset.view;
    if (v === 'today' && view === 'today') current = todayKey();
    view = v; render(); window.scrollTo(0, 0);
  },
  'day-prev': () => { current = addDays(current, -1); render(); },
  'day-next': () => { if (current < todayKey()) { current = addDays(current, 1); render(); } },
  'day-today': () => { current = todayKey(); render(); window.scrollTo(0, 0); },
  jump: el => { const t = $(el.dataset.to); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); },

  /* Wasser */
  drink: el => { drink = el.dataset.id; buzz(); render(); },
  'water-add': el => addWater(Number(el.dataset.ml), drink),
  'water-undo': () => {
    const d = day(current, true); if (!d.water.length) return;
    const last = d.water.pop(); save(); buzz(); render(); toast(`${fmtMl(last.ml)} entfernt`);
  },
  'water-del': el => {
    const d = day(current, true), i = d.water.findIndex(w => w.id === el.dataset.id);
    if (i < 0) return;
    const [w] = d.water.splice(i, 1); save(); buzz(); render(); toast(`${fmtMl(w.ml)} entfernt`);
  },
  'water-log': () => { waterLogOpen = !waterLogOpen; render(); },
  'water-custom': () => openSheet('water', current, { ml: '', drink, t: current === todayKey() ? timeNow() : '12:00' }),
  'ws-ml': el => { sheet.draft.ml = Number(el.dataset.m); drawSheet(); },
  'ws-drink': el => { sheet.draft.drink = el.dataset.id; drawSheet(); },
  'ws-save': () => {
    const { ml: raw, drink: dr, t } = sheet.draft, k = sheet.k;
    const ml = Math.round(Number(String(raw).replace(',', '.')));
    if (!ml) return toast('Bitte eine Menge eingeben');
    if (ml < 0 && waterTotal(k) + ml < 0) return toast('So viel ist nicht eingetragen');
    closeSheet(true); addWater(ml, dr, t || null, k);
  },

  /* Supplements */
  supp: el => {
    const k = current, id = el.dataset.id, d = day(k, true);
    const sp = S().supplements.find(x => x.id === id);
    if (d.supps[id]) {
      delete d.supps[id];
      if (sp && isNum(sp.stock)) sp.stock = Number(sp.stock) + 1;
    } else {
      d.supps[id] = { t: k === todayKey() ? timeNow() : null };
      if (sp && isNum(sp.stock)) {
        sp.stock = Math.max(0, Number(sp.stock) - 1);
        if ([7, 3, 0].includes(sp.stock)) setTimeout(() => toast(sp.stock ? `📦 ${sp.name}: nur noch ${sp.stock} Portionen` : `📦 ${sp.name} ist leer – nachkaufen!`), 1200);
      }
      if (allSupps(k)) { celebrate('c-supp'); toast('💊 Alle Supplements genommen'); }
    }
    save(); buzz(); render();
  },

  /* Schlaf */
  'sleep-edit': el => {
    const k = el.dataset.k || current, s = day(k).sleep;
    let draft = s ? clone(s) : { bed: S().sleep.bedTarget, wake: '07:00', quality: null, wakeups: 0, note: '' };
    if (!s && db.pendingBed && pendingWakeDay() === k) { draft.bed = pendingBedTime(); draft.wake = k === todayKey() ? timeNow() : ''; }
    openSheet('sleep', k, draft);
  },
  'sleep-bed': () => { db.pendingBed = new Date().toISOString(); save(); buzz(); render(); toast('🌙 Gute Nacht! Morgen früh einfach „Aufgewacht“ drücken.'); },
  'sleep-cancel': () => { db.pendingBed = null; save(); render(); },
  'sleep-wake': () => {
    const k = todayKey(), draft = { bed: pendingBedTime(), wake: timeNow(), quality: null, wakeups: 0, note: '' };
    const hours = (Date.now() - new Date(db.pendingBed).getTime()) / 3600000;
    if (hours > 15) { // vermutlich vergessen zu drücken: erst prüfen lassen
      openSheet('sleep', k, draft);
      toast('Das wären über 15 Stunden – bitte die Zeiten prüfen');
      return;
    }
    day(k, true).sleep = clone(draft); db.pendingBed = null; save(); buzz(); render();
    openSheet('sleep', k, draft);
  },
  'sleep-q': el => { sheet.draft.quality = Number(el.dataset.q); sheet.dirty = true; buzz(); drawSheet(); },
  'sleep-wu': el => { sheet.draft.wakeups = Math.max(0, (sheet.draft.wakeups || 0) + Number(el.dataset.d)); sheet.dirty = true; drawSheet(); },
  'sleep-save': () => {
    const d = sheet.draft;
    if (!d.bed || !d.wake) return toast('Bitte beide Zeiten eintragen');
    const m = durMin(d.bed, d.wake);
    if ((m < 60 || m > 15 * 60) && !confirm(`${fmtDur(m)} Schlaf – stimmt das so?`)) return;
    day(sheet.k, true).sleep = clone(d);
    if (db.pendingBed && pendingWakeDay() === sheet.k) db.pendingBed = null;
    save(); closeSheet(true); toast('😴 Schlaf gespeichert');
  },
  'sleep-del': () => { if (!confirm('Schlaf-Eintrag löschen?')) return; day(sheet.k, true).sleep = null; save(); closeSheet(true); },

  /* Gym */
  'gym-edit': () => {
    const g = day(current).gym;
    const draft = g && g.done ? clone(g) : { done: true, type: null, duration: '', rpe: null, exercises: [], note: '' };
    openSheet('gym', current, draft);
  },
  'gym-rest': () => {
    const d = day(current, true);
    d.gym = d.gym && d.gym.rest ? null : { rest: true };
    save(); buzz(); render();
  },
  'gs-type': el => { sheet.draft.type = sheet.draft.type === el.dataset.t ? null : el.dataset.t; sheet.dirty = true; drawSheet(); },
  'gs-tpl': el => {
    const g = db.days[el.dataset.from].gym;
    sheet.draft.exercises = clone(g.exercises.filter(e => e.name));
    sheet.dirty = true; drawSheet(); toast('Übernommen – pass die Werte an');
  },
  'gs-dur': el => { sheet.draft.duration = Number(el.dataset.m); sheet.dirty = true; drawSheet(); },
  'gs-rpe': el => { sheet.draft.rpe = Number(el.dataset.r); sheet.dirty = true; buzz(); drawSheet(); },
  'gs-exadd': () => {
    sheet.draft.exercises = sheet.draft.exercises || [];
    sheet.draft.exercises.push({ name: '', sets: [{ reps: '', kg: '' }] });
    sheet.dirty = true; drawSheet();
    const ins = $('sheetBody').querySelectorAll('[data-in="ex.name"]');
    if (ins.length) { ins[ins.length - 1].focus(); ins[ins.length - 1].scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  },
  'gs-exdel': el => {
    const e = sheet.draft.exercises[Number(el.dataset.i)];
    if (e.name && !confirm(`„${e.name}“ entfernen?`)) return;
    sheet.draft.exercises.splice(Number(el.dataset.i), 1); sheet.dirty = true; drawSheet();
  },
  'gs-setadd': el => {
    const e = sheet.draft.exercises[Number(el.dataset.i)];
    const last = e.sets[e.sets.length - 1];
    e.sets.push(last ? { reps: last.reps, kg: last.kg } : { reps: '', kg: '' });
    sheet.dirty = true; drawSheet();
  },
  'gs-setdel': el => { sheet.draft.exercises[Number(el.dataset.i)].sets.splice(Number(el.dataset.j), 1); sheet.dirty = true; drawSheet(); },
  'gs-save': () => {
    const d = sheet.draft, k = sheet.k, wasDone = gymDone(k);
    const clean = v => v === '' || v == null || isNaN(Number(v)) ? '' : Number(v);
    d.done = true;
    d.exercises = (d.exercises || []).filter(e => e.name && e.name.trim()).map(e => ({
      name: e.name.trim(),
      sets: (e.sets || []).filter(s => s.reps !== '' || s.kg !== '').map(s => ({ reps: clean(s.reps), kg: clean(s.kg) }))
    }));
    d.duration = d.duration ? Number(d.duration) : '';
    if (!d.time) d.time = k === todayKey() ? timeNow() : null;
    const waterBefore = waterHit(k);
    day(k, true).gym = d; save(); closeSheet(true);
    const prs = d.exercises.filter(e => isPR(k, e));
    if (prs.length) { celebrate('c-gym'); toast(`🏆 Neuer Rekord: ${prs.map(e => e.name).join(', ')}!`); }
    else toast(wasDone ? 'Gespeichert ✓' : (waterBefore && !waterHit(k) && S().water.gymBonus ? `💪 Stark! Wasserziel heute +${fmtMl(S().water.gymBonus)}` : '💪 Stark!'));
  },
  'gs-del': () => { if (!confirm('Training löschen?')) return; day(sheet.k, true).gym = null; save(); closeSheet(true); },
  'sheet-close': () => closeSheet(),

  /* Statistik */
  'stat-tab': el => { statTab = el.dataset.t; render(); },
  'cal-day': el => { current = el.dataset.k; view = 'today'; render(); window.scrollTo(0, 0); },
  'cal-prev': () => { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1); render(); },
  'cal-next': () => { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1); render(); },

  /* Einstellungen */
  'set-supp-add': () => {
    S().supplements.push({ id: 's' + uid(), name: 'Neues Supplement', dose: '', time: 'morgens', stock: null });
    save(); renderSettings();
    const ins = document.querySelectorAll('[data-set="supp.name"]'); const last = ins[ins.length - 1];
    if (last) { last.focus(); last.select(); }
  },
  'set-supp-del': el => {
    const i = Number(el.dataset.i), x = S().supplements[i];
    if (!confirm(`${x.name} entfernen? Bisherige Einträge bleiben in der Statistik.`)) return;
    S().supplements.splice(i, 1); save(); renderSettings();
  },
  'set-type-add': () => {
    S().gym.types.push(''); renderSettings();
    const ins = document.querySelectorAll('[data-set="gym.type"]'); if (ins.length) ins[ins.length - 1].focus();
  },
  'set-type-del': el => { S().gym.types.splice(Number(el.dataset.i), 1); save(); renderSettings(); },
  export: () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `routine-sicherung-${todayKey()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  import: () => $('importFile').click(),
  reset: () => {
    if (!confirm('Wirklich ALLE Daten löschen? Das kann man nicht rückgängig machen.')) return;
    if (!confirm('Ganz sicher? Vielleicht vorher eine Sicherung speichern?')) return;
    db = migrate({ days: {} }); save(); current = todayKey(); render(); toast('Alles gelöscht');
  }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.act];
  if (fn) fn(el, e);
});

// Tippen in Eingabe-Fenstern
document.addEventListener('input', e => {
  const t = e.target, f = t.dataset.in;
  if (!f || !sheet) return;
  const d = sheet.draft; sheet.dirty = true;
  switch (f) {
    case 'sleep.bed': d.bed = t.value; $('durBox').innerHTML = durText(d); break;
    case 'sleep.wake': d.wake = t.value; $('durBox').innerHTML = durText(d); break;
    case 'sleep.note': d.note = t.value; break;
    case 'gym.duration': d.duration = t.value; break;
    case 'gym.note': d.note = t.value; break;
    case 'ex.name': d.exercises[Number(t.dataset.i)].name = t.value; break;
    case 'set.reps': d.exercises[Number(t.dataset.i)].sets[Number(t.dataset.j)].reps = t.value; break;
    case 'set.kg': d.exercises[Number(t.dataset.i)].sets[Number(t.dataset.j)].kg = t.value.replace(',', '.'); break;
    case 'w.ml': d.ml = t.value; break;
    case 'w.t': d.t = t.value; break;
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.set) return settingChange(t);
  if (t.dataset.stat === 'ex') { exChoice = t.value; renderStats(); return; }
  if (t.dataset.in === 'ex.name' && sheet) { const box = $('lt-' + t.dataset.i); if (box) box.textContent = lastTimeText(t.value, sheet.k); }
});
$('importFile').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!data || typeof data !== 'object' || !data.days || !data.settings) throw 0;
    if (!confirm('Sicherung laden? Die aktuellen Daten auf diesem Handy werden ersetzt.')) return;
    db = migrate(data); save(); current = todayKey(); render(); toast('Sicherung geladen ✓');
  } catch (err) { toast('Das ist keine gültige Sicherung'); }
});

// Wischen links/rechts wechselt den Tag
let sx = null, sy = null;
$('v-today').addEventListener('touchstart', e => {
  if (e.target.closest('.chips, input, textarea')) { sx = null; return; }
  sx = e.touches[0].clientX; sy = e.touches[0].clientY;
}, { passive: true });
$('v-today').addEventListener('touchend', e => {
  if (sx === null || sheet) return;
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  sx = null;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) actions[dx > 0 ? 'day-prev' : 'day-next']();
}, { passive: true });

// Zurück-Taste (Android) schließt ein offenes Fenster
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheet) closeSheet(); });

// Über Mitternacht offen gelassen oder wieder geöffnet: auf den neuen Tag springen
let lastSeenToday = todayKey();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const tk = todayKey();
  if (tk !== lastSeenToday) { if (current === lastSeenToday) current = tk; lastSeenToday = tk; }
  if (!sheet) render();
});

save();
render();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
})();
