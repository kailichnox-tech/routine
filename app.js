(() => {
'use strict';

/* =====================================================
   ICONS (schlichte Linien-Icons statt Emojis)
   ===================================================== */
const ICONS = {
  moon: '<path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z"/>',
  drop: '<path d="M12 3s-6.5 6.8-6.5 11.2a6.5 6.5 0 0 0 13 0C18.5 9.8 12 3 12 3z"/>',
  pill: '<path d="M10.5 20.5a5 5 0 0 1-7-7l6-6a5 5 0 0 1 7 7z"/><path d="M8.5 8.5l7 7"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  home: '<path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  left: '<path d="M14.5 18l-6-6 6-6"/>',
  right: '<path d="M9.5 18l6-6-6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  spark: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  up: '<path d="M12 19V6M6 12l6-6 6 6"/>'
};
const icon = (n, s = 20) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* =====================================================
   DATUM, ZEIT, ZAHLEN
   ===================================================== */
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
const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const WD_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
function dayLabel(k) {
  const tk = todayKey();
  if (k === tk) return 'Heute';
  if (k === addDays(tk, -1)) return 'Gestern';
  return `${WD[fromKey(k).getDay()]}, ${shortDate(k)}`;
}
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const fmtNum = (n, dig = 1) => Number(n).toLocaleString('de-DE', { maximumFractionDigits: dig });
const fmtL = ml => fmtNum(ml / 1000, 2) + ' L';
const fmtMl = ml => Math.abs(ml) >= 1000 ? fmtL(ml) : Math.round(ml) + ' ml';
const clone = o => JSON.parse(JSON.stringify(o));
const uid = () => Math.random().toString(36).slice(2, 9);
const isNum = v => v !== null && v !== undefined && v !== '' && !isNaN(Number(v));

/* =====================================================
   KONSTANTEN & DEIN PLAN
   ===================================================== */
const KEY = 'routine-v1';
const DRINKS = [
  { id: 'wasser', label: 'Wasser' }, { id: 'sprudel', label: 'Sprudel' }, { id: 'tee', label: 'Tee' },
  { id: 'kaffee', label: 'Kaffee' }, { id: 'sonstiges', label: 'Sonstiges' }
];
const RPE = ['', 'Locker', 'Okay', 'Fordernd', 'Hart', 'Am Limit'];
const QUAL = ['', 'Mies', 'Unruhig', 'Okay', 'Gut', 'Super'];
const MUSCLES = ['Brust', 'Rücken', 'Schultern', 'Bizeps', 'Trizeps', 'Bauch', 'Beine', 'Unterarme', 'Sonstiges'];

const DEFAULT_PLAN = [
  { name: 'Push', title: 'Brust-Schwerpunkt', tips: [], items: [
    { name: 'Schrägbankdrücken KH (30°)', sets: 4, reps: '8–12', rest: 90, muscle: 'Brust', note: 'Anlaufsatz mit ca. 70 % × 8 davor' },
    { name: 'Brustpresse Maschine', sets: 4, reps: '8–12', rest: 90, muscle: 'Brust', note: 'Spür-Satz mit 50 % × 10 davor' },
    { name: 'Dips, vorgelehnt', sets: 3, reps: '8–12', rest: 90, muscle: 'Brust', note: 'Mit Zusatzgewicht, sobald du über 15 Wdh kommst (Dip-Gürtel oder KH zwischen den Füßen)' },
    { name: 'Cable Fly von unten', sets: 3, reps: '12–15', rest: 60, muscle: 'Brust', note: 'Kabel ganz unten, schräg nach oben-innen zusammenführen → obere Brust. Ellenbogen leicht gebeugt und fixiert' },
    { name: 'Seitheben sitzend', sets: 3, reps: '12–15', rest: 60, muscle: 'Schultern' },
    { name: 'Trizeps Pushdown', sets: 3, reps: '12–15', rest: 60, muscle: 'Trizeps' }
  ] },
  { name: 'Pull', title: 'Rücken', tips: ['Griffe unterscheiden: Latzug breit, T-Bar neutral/breit, Low Row eng. Nie zweimal derselbe Griff hintereinander.', 'Klimmzüge statt Latzug? Dann neutral greifen.'], items: [
    { name: 'Latzug breit', sets: 4, reps: '8–12', rest: 90, muscle: 'Rücken' },
    { name: 'T-Bar Row', sets: 3, reps: '8–12', rest: 90, muscle: 'Rücken', note: 'Griff neutral oder breit' },
    { name: 'Low Row, V-Griff eng', sets: 3, reps: '8–12', rest: 90, muscle: 'Rücken' },
    { name: 'Face Pulls', sets: 3, reps: '15', rest: 60, muscle: 'Schultern', note: 'Nicht streichen – hintere Schulter und Gelenkstabilität, deine Prävention' },
    { name: 'Bizeps-Curls Kabel', sets: 3, reps: '12–15', rest: 60, muscle: 'Bizeps' }
  ] },
  { name: 'Upper', title: 'Brust + Bauch', tips: [], items: [
    { name: 'Brustpresse schräg', sets: 3, reps: '10–12', rest: 90, muscle: 'Brust', note: 'Spür-Satz mit halbem Gewicht davor' },
    { name: 'Cable Fly von oben', sets: 3, reps: '12–15', rest: 60, muscle: 'Brust', note: 'Kabel hoch, nach unten-innen zusammenführen → untere Brust' },
    { name: 'Schulterdrücken KH', sets: 3, reps: '8–12', rest: 90, muscle: 'Schultern', note: 'Ein Aufwärmsatz davor – die Bewegung geht über Kopf' },
    { name: 'Seitheben', sets: 2, reps: '12–15', rest: 60, muscle: 'Schultern' },
    { name: 'Kabel-Crunch kniend', sets: 3, reps: '10–15', rest: 60, muscle: 'Bauch', note: 'Mit Gewicht – wenn 15 stehen, Gewicht hoch' },
    { name: 'V-Ups mit Gewicht', sets: 3, reps: '10–15', rest: 60, muscle: 'Bauch' }
  ] },
  { name: 'Wochenende', title: 'Freestyle + Bauch', weekend: true, tips: ['Bauch immer zuerst – 10 Minuten, dann ist der Teil im Kasten, der zählt. Danach freestyle.', 'Beine fallen weg. Lassen Sprungkraft oder Stabilität nach: 2 Sätze Beinpresse einbauen.'], items: [
    { name: 'Hängendes Beinheben', sets: 3, reps: '10–15', rest: 60, muscle: 'Bauch' },
    { name: 'Kabel-Crunch kniend', sets: 3, reps: '10–15', rest: 60, muscle: 'Bauch', note: 'Mit Gewicht – wenn 15 stehen, Gewicht hoch' },
    { name: 'Handgelenks-Curls', sets: 2, reps: '15–20', rest: 45, muscle: 'Unterarme', optional: true, note: 'Griffkraft war mehrfach dein Limit bei Zugübungen' }
  ] }
];

const PLAN_INFO = `
  <h4>Aufwärmen (~8 Min)</h4>
  <ol><li>4 Min Cardio locker (Rudergerät, Laufband, Crosstrainer)</li><li>Armkreisen 15× vorwärts, 15× rückwärts</li><li>15× Schulterblätter nach hinten-unten ziehen, je 2 Sek halten</li><li>Bei der ersten Übung 1–2 Aufwärmsätze (zählen nicht mit)</li></ol>
  <h4>Brust-Regel</h4>
  <p>Jede Drückübung beginnt mit einem Spür-Satz: halbes Gewicht, 10 Wdh, langsam. Einzige Aufgabe: die Brust spüren.</p>
  <ol><li>Schulterblätter nach hinten <b>und unten</b>, die ganze Zeit dort halten</li><li>Brustkorb aktiv nach oben rausdrücken</li><li>Ellenbogen enger als 45° zum Körper</li><li>Oben nicht durchstrecken</li><li>Unten kontrolliert (2 Sek), nicht abfedern</li></ol>
  <p>Spürst du die Brust im leichten Satz nicht deutlich: Sitzhöhe oder Bankwinkel korrigieren, bevor Gewicht draufkommt.</p>
  <h4>Gewichte finden &amp; steigern</h4>
  <ol><li>Erster Satz = Testsatz mit einem Gewicht, das eher zu leicht ist</li><li>Mehr als die obere Zielzahl geschafft → nächster Satz deutlich schwerer</li><li>Weniger als die untere Zielzahl → leichter</li><li>Im Zielbereich und die letzten 2 Wdh sind richtig hart → Arbeitsgewicht</li></ol>
  <p><b>Steigern:</b> Erst Wiederholungen bis ans obere Ende in <b>allen</b> Sätzen, dann Gewicht erhöhen. Maschine notieren – Werte sind nur an derselben Maschine vergleichbar.</p>
  <p><b>Wenn die Zeit knapp wird:</b> Arme und Schultern fliegen raus – nie die Brust.</p>`;

const DEFAULT_SETTINGS = {
  water: { goal: 3500, sizes: [250, 500, 1000], gymBonus: 0, dayStart: '07:00', dayEnd: '22:00' },
  supplements: [
    { id: 'kreatin', name: 'Kreatin', dose: '5 g', stock: null },
    { id: 'zink', name: 'Zink', dose: '25 mg', stock: null },
    { id: 'magnesium', name: 'Magnesium', dose: '400 mg', stock: null }
  ],
  gym: { weeklyGoal: 4, types: ['Cardio', 'Sonstiges'], plan: DEFAULT_PLAN },
  sleep: { goalMin: 480, idealMin: 450, idealMax: 510, bedTarget: '23:00' }
};

/* =====================================================
   SPEICHER
   ===================================================== */
function migrate(d) {
  const s = d.settings || {};
  const out = clone(DEFAULT_SETTINGS);
  if (s.water) Object.assign(out.water, s.water);
  else { if (s.goal) out.water.goal = s.goal; if (s.sizes) out.water.sizes = s.sizes; }
  if (Array.isArray(s.supplements)) {
    out.supplements = s.supplements.map(x => {
      const def = DEFAULT_SETTINGS.supplements.find(y => y.id === x.id) || { dose: '', stock: null };
      return Object.assign({}, def, x);
    });
  }
  if (s.gym) Object.assign(out.gym, s.gym);
  else if (s.gymTypes) out.gym.types = s.gymTypes;
  if (s.sleep) Object.assign(out.sleep, s.sleep);
  const v = d.version || 1;
  if (v < 3) { out.gym.plan = clone(DEFAULT_PLAN); out.gym.weeklyGoal = 4; out.gym.types = ['Cardio', 'Sonstiges']; }
  if (v < 4) { // Version 4: 3,5 L Wasser, Schlaf-Idealbereich 7,5–8,5 h
    out.water.goal = 3500; out.water.gymBonus = 0;
    out.sleep.goalMin = 480; out.sleep.idealMin = 450; out.sleep.idealMax = 510;
    const td = (d.days || {})[todayKey()]; if (td) td.goal = 3500;
  }
  if (!Array.isArray(out.gym.plan)) out.gym.plan = clone(DEFAULT_PLAN);
  d.settings = out;
  d.days = d.days || {};
  for (const k in d.days) {
    const day = d.days[k];
    day.water = (day.water || []).map(w => Object.assign({ id: uid(), drink: 'wasser' }, w));
    day.supps = day.supps || {};
    for (const id in day.supps) if (typeof day.supps[id] === 'string') day.supps[id] = { t: day.supps[id] };
  }
  d.pendingBed = d.pendingBed || null;
  d.version = 4;
  return d;
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) {}
  return migrate({ days: {} });
}
let db = load();
const S = () => db.settings;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toast('Speichern hat nicht geklappt'); }
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

/* =====================================================
   TAGESDATEN
   ===================================================== */
const EMPTY = Object.freeze({ water: Object.freeze([]), supps: Object.freeze({}), gym: null, sleep: null });
function day(k, create) {
  if (!db.days[k]) { if (!create) return EMPTY; db.days[k] = { water: [], supps: {}, gym: null, sleep: null }; }
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
const idealMin = () => S().sleep.idealMin || S().sleep.goalMin - 30;
const idealMax = () => S().sleep.idealMax || S().sleep.goalMin + 30;
const sleepHit = k => { const m = sleepMin(k); return m != null && m >= idealMin() && m <= idealMax(); };
function sleepStatus(m) {
  if (m < idealMin()) return { cls: 'low', text: `${fmtDur(idealMin() - m)} unter dem Idealbereich` };
  if (m > idealMax()) return { cls: 'high', text: `${fmtDur(m - idealMax())} über dem Idealbereich` };
  return { cls: 'ok', text: 'Im Idealbereich' };
}
const idealText = () => `${fmtNum(idealMin() / 60)}–${fmtNum(idealMax() / 60)} h`;
const firstDay = () => Object.keys(db.days).sort()[0] || todayKey();
function streak(test) {
  const tk = todayKey();
  let k = test(tk) ? tk : addDays(tk, -1);
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

/* =====================================================
   ÜBUNGEN, REKORDE, FORTSCHRITT
   ===================================================== */
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
const bestReps = ex => Math.max(0, ...(ex.sets || []).map(s => Number(s.reps) || 0));
const totalReps = ex => (ex.sets || []).reduce((a, s) => a + (Number(s.reps) || 0), 0);
const exVolume = ex => (ex.sets || []).reduce((s, x) => s + (Number(x.reps) || 0) * (Number(x.kg) || 0), 0);
function bestSet(ex) {
  let b = null;
  (ex.sets || []).forEach(s => { const kg = Number(s.kg) || 0, r = Number(s.reps) || 0; if (!b || kg > b.kg || (kg === b.kg && r > b.reps)) b = { kg, reps: r }; });
  return b;
}
const e1rm = ex => Math.max(0, ...(ex.sets || []).map(s => (Number(s.kg) || 0) * (1 + (Number(s.reps) || 0) / 30)));
const setStr = s => s ? (s.kg ? `${fmtNum(s.kg)} kg × ${s.reps}` : `${s.reps} Wdh`) : '–';
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
  for (const x of ks) { const g = db.days[x].gym; if (g && g.done && g.type === type && g.exercises && g.exercises.some(e => e.name)) return x; }
  return null;
}
const sessionAt = (sessions, k) => { let r = null; sessions.forEach(p => { if (p.k <= k) r = p; }); return r; };

/* =====================================================
   TRAININGSPLAN
   ===================================================== */
const plan = () => S().gym.plan || [];
const planDay = name => plan().find(p => p.name === name) || null;
const allTypes = () => [...new Set([...plan().map(p => p.name), ...S().gym.types.filter(Boolean)])];
const parseRange = r => { const n = String(r || '').match(/\d+/g) || []; const lo = Number(n[0]) || 0; return [lo, Number(n[1]) || lo]; };
const mainItems = p => p.items.filter(i => !i.optional);
const planSets = p => mainItems(p).reduce((a, i) => a + Number(i.sets || 0), 0);
function planItemFor(name) {
  const n = normEx(name);
  for (const p of plan()) { const it = p.items.find(i => normEx(i.name) === n); if (it) return it; }
  return null;
}
const muscleOf = e => e.muscle || (e.plan && e.plan.muscle) || (planItemFor(e.name) || {}).muscle || null;
function planTargets() {
  const t = {};
  plan().forEach(p => mainItems(p).forEach(i => { if (i.muscle) t[i.muscle] = (t[i.muscle] || 0) + Number(i.sets || 0); }));
  return t;
}
const prioMuscle = () => { const t = planTargets(); return Object.keys(t).sort((a, b) => t[b] - t[a])[0] || null; };
function estMinutes(p) { return Math.round((mainItems(p).reduce((a, i) => a + Number(i.sets || 0) * (40 + Number(i.rest || 60)), 0) + 480) / 300) * 5; }
function nextPlanDay(k) {
  const days = plan(); if (!days.length) return null;
  const dow = fromKey(k).getDay(), wk = days.find(p => p.weekend);
  if (wk && (dow === 6 || (dow === 0 && !(day(addDays(k, -1)).gym || {}).done))) return wk;
  const rot = days.filter(p => !p.weekend); if (!rot.length) return days[0];
  const ks = Object.keys(db.days).filter(x => x < k).sort().reverse();
  for (const x of ks) { const g = db.days[x].gym; if (g && g.done) { const i = rot.findIndex(p => p.name === g.type); if (i >= 0) return rot[(i + 1) % rot.length]; } }
  return rot[0];
}
function progressHint(e, k) {
  const p = e.plan || planItemFor(e.name); if (!p) return null;
  const prev = exSessions(e.name, k);
  if (!prev.length) return { cls: 'new', text: 'Erster Satz ist ein Testsatz – Arbeitsgewicht finden' };
  const [, hi] = parseRange(p.reps), last = prev[prev.length - 1].ex;
  const work = (last.sets || []).filter(s => isNum(s.reps));
  if (hi && work.length >= Number(p.sets) && work.slice(0, Number(p.sets)).every(s => Number(s.reps) >= hi)) {
    return { cls: 'up', text: /dips/i.test(e.name) && !bestKg(last) && work.every(s => Number(s.reps) > 15)
      ? 'Über 15 Wdh – jetzt mit Zusatzgewicht'
      : `Letztes Mal alle Sätze ≥ ${hi} Wdh – Gewicht erhöhen` };
  }
  return { cls: '', text: `Ziel: ${hi} Wdh in allen ${p.sets} Sätzen, dann mehr Gewicht` };
}
function exercisesFromPlan(p, k) {
  return p.items.map(it => {
    const prev = exSessions(it.name, k), last = prev.length ? prev[prev.length - 1].ex : null;
    const sets = [];
    for (let j = 0; j < Number(it.sets || 1); j++) {
      const ls = last && last.sets.length ? last.sets[Math.min(j, last.sets.length - 1)] : null;
      sets.push({ reps: '', kg: ls && isNum(ls.kg) ? ls.kg : '' });
    }
    return { name: it.name, plan: { sets: it.sets, reps: it.reps, rest: it.rest, muscle: it.muscle, note: it.note || '', optional: !!it.optional }, machine: last && last.machine ? last.machine : '', sets };
  });
}

/* Training-Entwurf (falls die App zwischendurch zugeht) */
const DRAFT_KEY = 'routine-draft';
function saveDraft() { if (!sheet || sheet.type !== 'gym') return; try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ k: sheet.k, draft: sheet.draft })); } catch (e) {} }
function loadDraft(k) { try { const d = JSON.parse(localStorage.getItem(DRAFT_KEY)); return d && d.k === k ? d.draft : null; } catch (e) { return null; } }
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }
const draftSets = d => (d.exercises || []).reduce((a, e) => a + (e.sets || []).filter(s => s.reps !== '' && s.reps != null).length, 0);

/* Pausen-Timer & Bildschirm wach halten */
let rest = null, restTick = null, audioCtx = null, wakeLock = null;
function startRest(sec, label) {
  try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  rest = { end: Date.now() + sec * 1000, total: sec, label };
  clearInterval(restTick); restTick = setInterval(drawRest, 250); drawRest();
}
function stopRest() { rest = null; clearInterval(restTick); drawRest(); }
function beep() {
  if (!audioCtx) return;
  try {
    [0, 0.25, 0.5].forEach(t => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
      g.gain.setValueAtTime(0.25, audioCtx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.18);
      o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.2);
    });
  } catch (e) {}
}
function drawRest() {
  const bar = $('restBar');
  if (!rest) { bar.classList.remove('on'); return; }
  const left = Math.max(0, Math.ceil((rest.end - Date.now()) / 1000));
  if (left <= 0) {
    stopRest(); beep();
    try { navigator.vibrate && navigator.vibrate([250, 120, 250, 120, 400]); } catch (e) {}
    toast('Pause vorbei – nächster Satz');
    return;
  }
  bar.classList.add('on');
  $('rbFill').style.width = (1 - left / rest.total) * 100 + '%';
  $('rbTime').textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`;
  $('rbLabel').textContent = rest.label || 'Pause';
}
async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
    else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) {}
}

/* =====================================================
   KLEINKRAM
   ===================================================== */
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const buzz = () => { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} };
let toastT;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
}
function celebrate(id) { const el = $(id); if (!el) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
const card = (title, body, tag = '', id = '') => `<section class="card"${id ? ` id="${id}"` : ''}>${title ? `<h2>${title}${tag}</h2>` : ''}${body}</section>`;
const statTile = (v, label, sub = '', c = '') => `<div class="stat"><b${c ? ` style="color:${c}"` : ''}>${v}</b><span>${label}</span>${sub ? `<em>${sub}</em>` : ''}</div>`;
const emptyHint = txt => `<p class="hint-empty">${txt}</p>`;
const qualDots = q => `<span class="qdots">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= q ? 'on' : ''}"></i>`).join('')}</span>`;

/* =====================================================
   NAVIGATION
   ===================================================== */
const CATS = {
  sleep: { title: 'Schlaf', icon: 'moon', color: 'var(--sleep)', subs: [['today', 'Heute'], ['history', 'Verlauf']] },
  water: { title: 'Wasser', icon: 'drop', color: 'var(--water)', subs: [['today', 'Heute'], ['history', 'Verlauf']] },
  supps: { title: 'Supplements', icon: 'pill', color: 'var(--supp)', subs: [['today', 'Heute'], ['history', 'Verlauf']] },
  gym: { title: 'Gym', icon: 'dumbbell', color: 'var(--gym)', subs: [['training', 'Training'], ['plan', 'Plan'], ['exercises', 'Übungen'], ['history', 'Verlauf']] }
};
let nav = { view: 'home', cat: null, ex: null };
const sub = { sleep: 'today', water: 'today', supps: 'today', gym: 'training' };
let current = todayKey();
let drink = 'wasser';
let waterLogOpen = false;
let calMonth = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })();
let sheet = null;
let ringFrom = 0;
let planOpen = -1;
let range = 30;

function go(s) {
  nav = { view: s.view, cat: s.cat || null, ex: s.ex || null };
  try { history.pushState({ nav }, ''); } catch (e) {}
  render(); window.scrollTo(0, 0);
}
window.addEventListener('popstate', e => {
  if (sheet) { closeSheet(false, true); return; }
  nav = (e.state && e.state.nav) || { view: 'home' };
  render(); window.scrollTo(0, 0);
});
try { history.replaceState({ nav }, ''); } catch (e) {}

function render() {
  const v = nav.view;
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.view === (v === 'cat' || v === 'exercise' ? 'home' : v)));
  let html = '';
  if (v === 'home') html = renderHome();
  else if (v === 'cat') html = renderCat();
  else if (v === 'exercise') html = renderExercise(nav.ex);
  else if (v === 'calendar') html = renderCalendar();
  else html = renderSettings();
  $('app').innerHTML = `<div class="wrap">${html}</div>`;
  const fg = document.querySelector('#c-water .fgc');
  if (fg) requestAnimationFrame(() => requestAnimationFrame(() => { fg.style.strokeDashoffset = fg.dataset.to; }));
}
const dayIsLive = () => nav.view === 'home' || (nav.view === 'cat' && ['today', 'training'].includes(sub[nav.cat]));

/* =====================================================
   STARTSEITE
   ===================================================== */
function dayNav(k) {
  const isToday = k === todayKey();
  return `<div class="daynav">
    <button class="iconbtn" data-act="day-prev" aria-label="Vorheriger Tag">${icon('left')}</button>
    <button class="daypill" data-act="day-today">${isToday ? 'Heute' : dayLabel(k)}<small>${fromKey(k).getDate()}. ${MONTHS[fromKey(k).getMonth()]}</small></button>
    <button class="iconbtn" data-act="day-next" aria-label="Nächster Tag" ${isToday ? 'disabled' : ''}>${icon('right')}</button>
  </div>`;
}
function renderHome() {
  const k = current, tk = todayKey(), isToday = k === tk, hr = new Date().getHours();
  const greet = hr < 11 ? 'Guten Morgen' : hr < 18 ? 'Hallo' : 'Guten Abend';
  let h = `<header class="hero"><div class="eyebrow">${isToday ? greet : 'Rückblick'}</div><h1>Deine Routine</h1></header>${dayNav(k)}`;
  // Kleine Abend-/Morgen-Hinweise
  const pw = pendingWakeDay();
  if (isToday && db.pendingBed && pw === tk && !sleepOf(tk)) h += `<div class="banner sleepb">${icon('sun', 18)}<span>Guten Morgen – schlafen seit ${pendingBedTime()}</span><button data-act="sleep-wake">Aufgewacht</button></div>`;
  else if (isToday && db.pendingBed && pw > tk) h += `<div class="banner sleepb">${icon('moon', 18)}<span>Gute Nacht – schlafen seit ${pendingBedTime()}</span><button data-act="sleep-cancel">Rückgängig</button></div>`;
  else if (isToday && !db.pendingBed && (hr >= 20 || hr < 3)) h += `<div class="banner sleepb">${icon('moon', 18)}<span>Zeit fürs Bett?</span><button data-act="sleep-bed">Jetzt schlafen</button></div>`;

  // Kategorien
  const sm = sleepMin(k), st = sm != null ? sleepStatus(sm) : null;
  const sleepSub = sm != null ? st.text : (db.pendingBed && pw === k ? `Schläfst seit ${pendingBedTime()}` : 'Noch nicht eingetragen');
  const wt = waterTotal(k), wg = waterGoal(k);
  const list = S().supplements, nT = list.filter(x => suppTaken(k, x.id)).length;
  const g = day(k).gym, dr = loadDraft(k), np = nextPlanDay(k), wc = gymWeekCount(k), wgoal = S().gym.weeklyGoal;
  let gymVal, gymSub;
  if (g && g.done) { gymVal = esc(g.type || 'Training'); gymSub = [g.duration ? g.duration + ' min' : '', (g.exercises || []).reduce((a, e) => a + e.sets.length, 0) + ' Sätze'].filter(Boolean).join(' · '); }
  else if (g && g.rest) { gymVal = 'Ruhetag'; gymSub = 'Erholung'; }
  else if (dr) { gymVal = esc(dr.type || 'Training'); gymSub = `läuft · ${draftSets(dr)} Sätze`; }
  else { gymVal = np ? esc(np.name) : '–'; gymSub = np ? 'als Nächstes laut Plan' : 'Noch kein Training'; }
  const tiles = [
    { c: 'sleep', val: sm != null ? fmtDur(sm) : '–', sub: sleepSub, p: sm != null ? sm / S().sleep.goalMin : 0, ok: sm != null && st.cls === 'ok' },
    { c: 'water', val: fmtNum(wt / 1000, 2) + ' L', sub: wt >= wg ? 'Ziel geschafft' : `von ${fmtL(wg)}`, p: wt / wg, ok: wt >= wg },
    { c: 'supps', val: `${nT}/${list.length}`, sub: list.length && nT === list.length ? 'Alle genommen' : 'genommen', p: list.length ? nT / list.length : 0, ok: list.length && nT === list.length },
    { c: 'gym', val: gymVal, sub: gymSub, p: wc / wgoal, ok: g && g.done, foot: `${wc}/${wgoal} diese Woche` }
  ];
  h += `<div class="tiles">${tiles.map(t => { const C = CATS[t.c]; return `
    <button class="tile ${t.ok ? 'ok' : ''}" data-act="open-cat" data-c="${t.c}" style="--c:${C.color};--cs:var(--${t.c === 'supps' ? 'supp' : t.c}-soft)">
      <span class="tile-top"><span class="tile-ic">${icon(C.icon, 18)}</span>${t.ok ? `<span class="tile-ok">${icon('check', 14)}</span>` : icon('right', 16)}</span>
      <span class="tile-name">${C.title}</span>
      <b class="tile-val">${t.val}</b>
      <span class="tile-sub">${t.sub}</span>
      <i class="bar"><i style="width:${Math.min(100, Math.round(t.p * 100))}%"></i></i>
      ${t.foot ? `<span class="tile-foot">${t.foot}</span>` : ''}
    </button>`; }).join('')}</div>`;

  // Woche auf einen Blick
  const ws = weekStart(k);
  h += card('Diese Woche', `<div class="weekstrip">${[0, 1, 2, 3, 4, 5, 6].map(i => {
    const d = addDays(ws, i), fut = d > tk;
    return `<button class="wday ${d === k ? 'sel' : ''} ${fut ? 'fut' : ''}" data-act="pick-day" data-k="${d}" ${fut ? 'disabled' : ''}>
      <span>${WD[fromKey(d).getDay()]}</span><b>${fromKey(d).getDate()}</b>
      <span class="wdots"><i class="${sleepHit(d) ? 'on sl' : ''}"></i><i class="${waterHit(d) ? 'on w' : ''}"></i><i class="${allSupps(d) ? 'on s' : ''}"></i><i class="${gymDone(d) ? 'on g' : ''}"></i></span></button>`;
  }).join('')}</div>
  <div class="legend"><span><i style="background:var(--sleep)"></i>Schlaf</span><span><i style="background:var(--water)"></i>Wasser</span><span><i style="background:var(--supp)"></i>Supps</span><span><i style="background:var(--gym)"></i>Gym</span></div>`);
  return h;
}

/* =====================================================
   KATEGORIE-SEITEN
   ===================================================== */
function renderCat() {
  const c = nav.cat, C = CATS[c], s = sub[c];
  const live = ['today', 'training'].includes(s);
  let h = `<header class="cathead" style="--c:${C.color}">
    <button class="iconbtn" data-act="back" aria-label="Zurück">${icon('left')}</button>
    <div class="cattitle"><span class="cat-ic">${icon(C.icon, 18)}</span><h1>${live && c === 'supps' ? 'Supps' : C.title}</h1></div>
    ${live ? `<div class="daymini"><button data-act="day-prev" aria-label="Vorheriger Tag">${icon('left', 16)}</button><span>${dayLabel(current)}</span><button data-act="day-next" aria-label="Nächster Tag" ${current === todayKey() ? 'disabled' : ''}>${icon('right', 16)}</button></div>` : '<span></span>'}
  </header>
  <div class="seg">${C.subs.map(([id, l]) => `<button class="${s === id ? 'on' : ''}" data-act="sub" data-s="${id}">${l}</button>`).join('')}</div>`;
  if (s === 'history') h += rangeBar();
  const k = current;
  const views = {
    sleep: { today: () => sleepCard(k) + sleepWeekMini(), history: statsSleep },
    water: { today: () => waterCard(k), history: statsWater },
    supps: { today: () => suppCard(k), history: statsSupps },
    gym: { training: () => gymCard(k) + volumeCard(), plan: planView, exercises: exerciseList, history: statsGym }
  };
  return h + views[c][s]();
}

/* ---------- Schlaf ---------- */
function pendingWakeDay() { if (!db.pendingBed) return null; const d = new Date(db.pendingBed); return d.getHours() < 12 ? keyOf(d) : addDays(keyOf(d), 1); }
function pendingBedTime() { if (!db.pendingBed) return null; const d = new Date(db.pendingBed); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function sleepCard(k) {
  const tk = todayKey(), isToday = k === tk;
  const s = sleepOf(k), pw = pendingWakeDay(), pt = pendingBedTime();
  let body = '';
  if (s) {
    const m = durMin(s.bed, s.wake), st = sleepStatus(m);
    // Skala 5–11 h mit markiertem Idealbereich
    const A = 300, Z = 660, pos = v => Math.min(100, Math.max(0, (v - A) / (Z - A) * 100));
    body = `<div class="sleep-top">
        <div><div class="big-num">${fmtDur(m)}</div><div class="muted small">${s.bed} – ${s.wake} Uhr</div></div>
        ${s.quality ? `<div class="qual">${qualDots(s.quality)}<small>${QUAL[s.quality]}</small></div>` : ''}
      </div>
      <div class="rangebar"><i class="band" style="left:${pos(idealMin())}%;width:${pos(idealMax()) - pos(idealMin())}%"></i><i class="mark" style="left:${pos(m)}%"></i></div>
      <div class="row-between small"><span class="status ${st.cls}">${st.text}</span><span class="muted">Ideal ${idealText()}</span></div>
      ${s.wakeups ? `<span class="pill-line">${s.wakeups}× nachts aufgewacht</span>` : ''}
      ${s.note ? `<div class="note">${esc(s.note)}</div>` : ''}
      <button class="ghost full" data-act="sleep-edit" data-k="${k}">${s.quality ? 'Bearbeiten' : 'Bewerten & bearbeiten'}</button>`;
  } else if (db.pendingBed && pw === k) {
    body = `<div class="sleeping"><span class="cat-ic big" style="--c:var(--sleep)">${icon('moon', 22)}</span><div><b>Schlafen seit ${pt} Uhr</b><div class="muted small">${isToday ? 'Guten Morgen! Drück, sobald du wach bist.' : 'Die Aufwachzeit fehlt noch.'}</div></div></div>
      ${isToday ? `<button class="btn primary" data-act="sleep-wake">${icon('sun', 18)} Aufgewacht</button>` : `<button class="btn primary" data-act="sleep-edit" data-k="${k}">Aufwachzeit eintragen</button>`}
      <button class="ghost full" data-act="sleep-cancel">Abbrechen</button>`;
  } else {
    body = `<p class="muted" style="margin:0 0 10px">${isToday ? 'Wie hast du letzte Nacht geschlafen?' : 'Für diese Nacht ist nichts eingetragen.'}</p>
      <button class="btn primary" data-act="sleep-edit" data-k="${k}">Schlaf eintragen</button>`;
  }
  if (isToday) {
    const hr = new Date().getHours();
    if (db.pendingBed && pw > tk) body += `<div class="night">${icon('moon', 16)}<span>Gute Nacht – schlafen seit <b>${pt}</b></span><button data-act="sleep-cancel">Rückgängig</button></div>`;
    else if (!db.pendingBed && (hr >= 18 || hr < 4)) body += `<button class="ghost full" data-act="sleep-bed">${icon('moon', 16)} Ich gehe jetzt schlafen</button>`;
  }
  return card(isToday ? 'Letzte Nacht' : 'Diese Nacht', body, '', 'c-sleep');
}
function sleepWeekMini() {
  const keys = lastNDays(7);
  return card('Letzte 7 Nächte', axisChart({ keys, bars: true, yMin: 4, unit: 'Stunden', band: [idealMin() / 60, idealMax() / 60], yFmt: v => fmtNum(v, 1), h: 160,
    xFmt: k => WD[fromKey(k).getDay()],
    series: [{ name: 'Schlafdauer', color: 'var(--sleep)', fmt: v => fmtDur(v * 60), vals: keys.map(k => { const m = sleepMin(k); return m == null ? null : m / 60; }), dim: keys.map(k => !sleepHit(k)) }] }));
}

/* ---------- Wasser ---------- */
function waterCard(k) {
  const isToday = k === todayKey();
  const total = waterTotal(k), goal = waterGoal(k), bonus = gymDone(k) ? S().water.gymBonus : 0;
  const p = Math.min(1, total / goal), C = 2 * Math.PI * 56, w = day(k).water;
  let status = total >= goal
    ? `<div class="pct ok">Ziel geschafft</div><div class="rest">${total > goal ? fmtMl(total - goal) + ' über dem Ziel' : 'Punktlandung'}</div>`
    : `<div class="pct">${Math.round(p * 100)} % geschafft</div><div class="rest">Noch ${fmtMl(goal - total)}</div>`;
  let pace = '';
  if (isToday && total < goal) {
    const sl = sleepOf(k);
    const start = toMin(sl ? sl.wake : S().water.dayStart), end = toMin(S().water.dayEnd), now = nowMin();
    if (now >= start) {
      const diff = total - goal * Math.min(1, (now - start) / Math.max(60, end - start));
      pace = diff >= -150 ? `<span class="pace ok">Gut im Plan</span>` : `<span class="pace behind">${fmtMl(Math.round(-diff / 50) * 50)} hinter Plan</span>`;
    }
  }
  const drinks = DRINKS.map(x => `<button class="chip sm ${drink === x.id ? 'on' : ''}" data-act="drink" data-id="${x.id}">${x.label}</button>`).join('');
  const btns = S().water.sizes.map(s => `<button class="addbtn" data-act="water-add" data-ml="${s}">+${fmtMl(s)}</button>`).join('');
  let log = '';
  if (w.length) {
    const rows = w.slice().sort((a, b) => (b.t || '').localeCompare(a.t || '')).map(e => {
      const dr = DRINKS.find(x => x.id === e.drink) || DRINKS[0];
      return `<div class="logrow"><span class="lt">${e.t || '–'}</span><span class="lm">${e.ml > 0 ? '+' : ''}${fmtMl(e.ml)}</span><span class="ld">${dr.label}</span><button class="x" data-act="water-del" data-id="${e.id}" aria-label="Eintrag löschen">${icon('x', 14)}</button></div>`;
    }).join('');
    log = `<button class="logtoggle" data-act="water-log">${icon(waterLogOpen ? 'up' : 'right', 14)} ${w.length} ${w.length === 1 ? 'Eintrag' : 'Einträge'}</button>${waterLogOpen ? `<div class="log">${rows}</div>` : ''}`;
  }
  const fromOff = C * (1 - Math.min(1, ringFrom)); ringFrom = p;
  return card('', `
    <div class="water-top">
      <div class="ring"><svg viewBox="0 0 132 132"><circle class="bgc" cx="66" cy="66" r="56"/><circle class="fgc" cx="66" cy="66" r="56" style="stroke-dasharray:${C};stroke-dashoffset:${fromOff}" data-to="${C * (1 - p)}"/></svg>
        <div class="center"><div class="big">${fmtNum(total / 1000, 2)}</div><div class="sub">von ${fmtL(goal)}</div></div></div>
      <div class="water-info">${status}${pace}${bonus ? `<div class="bonus">inkl. +${fmtMl(bonus)} an Gym-Tagen</div>` : ''}</div>
    </div>
    <div class="chips scroll">${drinks}</div>
    <div class="btnrow">${btns}</div>
    <div class="subrow"><button class="ghost" data-act="water-undo" ${w.length ? '' : 'disabled'}>${icon('undo', 16)} Rückgängig</button><button class="ghost" data-act="water-custom">${icon('plus', 16)} Andere Menge</button></div>
    ${log}`, '', 'c-water');
}
function addWater(ml, dr = 'wasser', t = null, k = current) {
  const goal = waterGoal(k), before = waterTotal(k);
  const d = day(k, true);
  if (!d.goal) d.goal = S().water.goal;
  d.water.push({ id: uid(), ml, drink: dr, t: t || (k === todayKey() ? timeNow() : null) });
  save(); buzz(); render();
  if (before < goal && waterTotal(k) >= goal) { celebrate('c-water'); toast('Wasserziel geschafft'); }
}

/* ---------- Supplements (ein Block für den ganzen Tag) ---------- */
function suppCard(k) {
  const list = S().supplements;
  if (!list.length) return card('Supplements', emptyHint('Noch keine Supplements. Füge welche in den Einstellungen hinzu.'));
  const n = list.filter(x => suppTaken(k, x.id)).length, all = n === list.length;
  const body = list.map(x => {
    const taken = day(k).supps[x.id];
    const st = streak(kk => hasDay(kk) && suppTaken(kk, x.id));
    const low = isNum(x.stock) && Number(x.stock) <= 7;
    const subTxt = [x.dose ? esc(x.dose) : '', st > 1 ? `${st} Tage in Folge` : ''].filter(Boolean).join(' · ');
    return `<button class="supp ${taken ? 'done' : ''}" data-act="supp" data-id="${esc(x.id)}">
      <span class="check">${icon('check', 16)}</span>
      <span class="sname"><b>${esc(x.name)}</b>${subTxt ? `<small>${subTxt}</small>` : ''}</span>
      <span class="time">${taken ? (taken.t ? taken.t : 'erledigt') : 'offen'}${low ? `<em class="low">${Number(x.stock) === 0 ? 'Vorrat leer' : 'noch ' + x.stock}</em>` : ''}</span>
    </button>`;
  }).join('');
  return card('Heute', body, `<span class="tag ${all ? 'ok' : ''}">${n}/${list.length}</span>`, 'c-supp');
}

/* ---------- Gym: Training ---------- */
function gymCard(k) {
  const g = day(k).gym, wc = gymWeekCount(k), goal = S().gym.weeklyGoal;
  let body = '';
  if (g && g.done) {
    const ex = (g.exercises || []).filter(e => e.name && e.name.trim());
    const meta = [g.time ? g.time + ' Uhr' : null, g.duration ? g.duration + ' min' : null, g.rpe ? RPE[g.rpe] : null].filter(Boolean).join(' · ');
    const vol = ex.reduce((s, e) => s + exVolume(e), 0);
    body += `<div class="gym-done"><span class="cat-ic big" style="--c:var(--gym)">${icon('check', 20)}</span><div><b>${g.type ? esc(g.type) + '-Training' : 'Training erledigt'}</b><div class="muted small">${meta || 'Tippe auf Bearbeiten für Details'}</div></div></div>`;
    if (ex.length) body += `<div class="exlist">${ex.map(e => `<button class="exrow" data-act="open-ex" data-n="${esc(e.name)}"><span>${esc(e.name)}${isPR(k, e) ? '<em class="pr">Rekord</em>' : ''}</span><span class="muted">${setsText(e)}</span></button>`).join('')}</div>`;
    const mus = {}; ex.forEach(e => { const m = muscleOf(e); if (m) mus[m] = (mus[m] || 0) + e.sets.length; });
    if (Object.keys(mus).length) body += `<div class="muschips">${Object.entries(mus).sort((a, b) => b[1] - a[1]).map(([m, n]) => `<span>${esc(m)} <b>${n}</b></span>`).join('')}</div>`;
    if (vol) body += `<div class="muted small" style="margin-top:6px">Volumen ${fmtNum(vol, 0)} kg · ${ex.reduce((s, e) => s + e.sets.length, 0)} Sätze</div>`;
    if (g.note) body += `<div class="note">${esc(g.note)}</div>`;
    body += `<button class="ghost full" data-act="gym-edit">Bearbeiten</button>`;
  } else if (g && g.rest) {
    body += `<div class="gym-done rest"><span class="cat-ic big" style="--c:var(--muted)">${icon('moon', 20)}</span><div><b>Ruhetag</b><div class="muted small">Erholung gehört zum Training dazu.</div></div></div>
      <div class="subrow"><button class="ghost" data-act="gym-edit">Doch trainiert</button><button class="ghost" data-act="gym-rest">Kein Ruhetag</button></div>`;
  } else {
    const dr = loadDraft(k), np = nextPlanDay(k);
    if (dr) {
      body += `<div class="gym-done"><span class="cat-ic big" style="--c:var(--gym)">${icon('dumbbell', 20)}</span><div><b>${esc(dr.type || 'Training')} läuft</b><div class="muted small">${draftSets(dr)} Sätze eingetragen</div></div></div>
        <button class="btn primary" style="margin-top:8px" data-act="gym-edit">${icon('play', 16)} Training fortsetzen</button>`;
    } else if (np) {
      body += `<div class="nextplan"><div class="eyebrow">Laut Plan als Nächstes</div><b>${esc(np.name)}${np.title ? ' · ' + esc(np.title) : ''}</b>
          <div class="muted small">${mainItems(np).length} Übungen · ${planSets(np)} Sätze · ca. ${estMinutes(np)} min</div></div>
        <button class="btn primary" data-act="gym-start" data-t="${esc(np.name)}">${icon('play', 16)} ${esc(np.name)} starten</button>
        <div class="subrow"><button class="ghost" data-act="gym-edit">Anderes Training</button><button class="ghost" data-act="gym-rest">Ruhetag</button></div>`;
    } else {
      body += `<button class="btn primary" data-act="gym-edit">Training eintragen</button><button class="ghost full" data-act="gym-rest">Heute Ruhetag</button>`;
    }
  }
  body += `<div class="week"><div class="row-between small"><span class="muted">Diese Woche</span><b>${wc} von ${goal} Trainings</b></div><i class="bar"><i style="width:${Math.min(100, wc / goal * 100)}%;background:var(--gym)"></i></i></div>`;
  return card(dayLabel(k), body, '', 'c-gym');
}
function volumeCard() {
  const t = planTargets(), ws = weekStart(todayKey());
  const count = start => {
    const done = {};
    for (let i = 0; i < 7; i++) {
      const g = day(addDays(start, i)).gym;
      if (g && g.done && g.exercises) g.exercises.forEach(e => { const m = muscleOf(e); if (m) done[m] = (done[m] || 0) + (e.sets || []).filter(s => isNum(s.reps)).length; });
    }
    return done;
  };
  const now = count(ws), prev = count(addDays(ws, -7));
  const muscles = [...new Set([...Object.keys(t), ...Object.keys(now)])].sort((a, b) => (t[b] || 0) - (t[a] || 0));
  if (!muscles.length) return '';
  const prio = muscles[0];
  const rows = muscles.map(m => {
    const d = now[m] || 0, tg = t[m] || 0, pct = tg ? Math.min(100, d / tg * 100) : (d ? 100 : 0);
    return `<div class="hrow"><span class="hl">${esc(m)}${m === prio ? '<em class="prio">Priorität</em>' : ''}</span><div class="htrack"><i style="width:${pct}%;background:${tg && d >= tg ? 'var(--supp)' : 'var(--gym)'}"></i></div><span class="hv">${d}${tg ? ' / ' + tg : ''}</span></div>`;
  }).join('');
  const pT = prev[prio] || 0;
  return card('Sätze diese Woche', rows + `<p class="foot">Ziel = dein Plan${pT ? ` · letzte Woche ${pT} ${esc(prio)}-Sätze` : ''}</p>`);
}

/* ---------- Gym: Plan ---------- */
function planView() {
  const t = planTargets(), prio = prioMuscle();
  let h = plan().map(p => `
    <section class="card plancard">
      <div class="plan-h"><div><h2 style="margin:0">${esc(p.name)}</h2><div class="muted small">${esc(p.title || '')} · ${mainItems(p).length} Übungen · ${planSets(p)} Sätze · ca. ${estMinutes(p)} min</div></div>
        ${current === todayKey() && !gymDone(current) ? `<button class="btn primary sm" data-act="gym-start" data-t="${esc(p.name)}">${icon('play', 14)} Start</button>` : ''}</div>
      <div class="ptable">${p.items.map((it, i) => `
        <button class="prow" data-act="open-ex" data-n="${esc(it.name)}">
          <span class="pnum">${i + 1}</span>
          <span class="pname"><b>${esc(it.name)}</b>${it.optional ? '<em class="opt">optional</em>' : ''}${it.note ? `<small>${esc(it.note)}</small>` : ''}</span>
          <span class="pmeta"><b>${it.sets} × ${esc(it.reps)}</b><small>${it.rest} s Pause</small></span>
        </button>`).join('')}</div>
      ${p.tips && p.tips.length ? `<div class="tips">${p.tips.map(x => `<div>${esc(x)}</div>`).join('')}</div>` : ''}
    </section>`).join('');
  h += card('Volumen pro Woche', Object.keys(t).sort((a, b) => t[b] - t[a]).map(m => `<div class="vrow"><span>${esc(m)}${m === prio ? '<em class="prio">Priorität</em>' : ''}</span><b>${t[m]} Sätze</b></div>`).join('')
    + `<p class="foot">Brust steht immer am Anfang, wenn du frisch bist. Steigern darfst du überall – bei der Brust planst du Fortschritt ein.</p>`);
  h += card('Regeln', `<div class="planinfo">${PLAN_INFO}</div>`);
  h += `<button class="secondary" data-act="edit-plan">${icon('edit', 16)} Plan bearbeiten</button>`;
  return h;
}

/* ---------- Gym: Übungen ---------- */
function exStats(name) {
  const s = exSessions(name);
  if (!s.length) return null;
  const last = s[s.length - 1], old = sessionAt(s, addDays(todayKey(), -14));
  const usesKg = s.some(p => bestKg(p.ex));
  const val = p => usesKg ? bestKg(p.ex) : bestReps(p.ex);
  return { s, last, old: old && old !== last ? old : (old && s.length > 1 && old.k < last.k ? old : null), usesKg, val, best: Math.max(...s.map(val)) };
}
function deltaHtml(st) {
  if (!st || !st.old) return '<span class="delta neu">neu</span>';
  const d = st.val(st.last) - st.val(st.old);
  const u = st.usesKg ? ' kg' : ' Wdh';
  return `<span class="delta ${d > 0 ? 'up' : d < 0 ? 'down' : ''}">${d > 0 ? '+' : d < 0 ? '−' : '±'}${fmtNum(Math.abs(d))}${u}</span>`;
}
function exerciseList() {
  const inPlan = new Set();
  let h = `<p class="lead">Tippe auf eine Übung, um deinen Fortschritt zu sehen. Die Veränderung vergleicht mit dem Stand von vor 2 Wochen.</p>`;
  plan().forEach(p => {
    h += card(esc(p.name), p.items.map(it => {
      inPlan.add(normEx(it.name));
      const st = exStats(it.name);
      return `<button class="exitem" data-act="open-ex" data-n="${esc(it.name)}">
        <span class="exi-name"><b>${esc(it.name)}</b><small>${st ? `${st.s.length}× trainiert · zuletzt ${dayLabel(st.last.k)}` : 'Noch nicht trainiert'}</small></span>
        <span class="exi-val">${st ? `<b>${setStr(bestSet(st.last.ex))}</b>${deltaHtml(st)}` : ''}</span>${icon('right', 16)}
      </button>`;
    }).join(''));
  });
  const extra = allExerciseNames().filter(n => !inPlan.has(normEx(n)));
  if (extra.length) h += card('Weitere Übungen', extra.map(n => { const st = exStats(n); return `<button class="exitem" data-act="open-ex" data-n="${esc(n)}"><span class="exi-name"><b>${esc(n)}</b><small>${st.s.length}× trainiert</small></span><span class="exi-val"><b>${setStr(bestSet(st.last.ex))}</b>${deltaHtml(st)}</span>${icon('right', 16)}</button>`; }).join(''));
  return h;
}
function renderExercise(name) {
  const it = planItemFor(name), st = exStats(name);
  let h = `<header class="cathead" style="--c:var(--gym)"><button class="iconbtn" data-act="back" aria-label="Zurück">${icon('left')}</button>
    <div class="cattitle"><h1 class="exh1">${esc(name)}</h1></div><span></span></header>`;
  if (it) {
    const hint = progressHint({ name, plan: it }, addDays(todayKey(), 1));
    h += `<div class="exmeta"><span>${it.sets} × ${esc(it.reps)}</span><span>${it.rest} s Pause</span>${it.muscle ? `<span>${esc(it.muscle)}</span>` : ''}</div>`;
    if (it.note) h += `<p class="lead">${esc(it.note)}</p>`;
    if (hint) h += `<div class="hintline big ${hint.cls}">${hint.text}</div>`;
  }
  if (!st) return h + card('', emptyHint('Diese Übung hast du noch nicht eingetragen. Sobald du sie im Training machst, siehst du hier deinen Fortschritt.'));
  const { s, last, old, usesKg, val } = st;
  const lastBest = bestSet(last.ex), oldBest = old ? bestSet(old.ex) : null;
  const pr = s.reduce((a, p) => val(p) > val(a) ? p : a, s[0]);
  const d = old ? val(last) - val(old) : null;
  const pct = old && val(old) ? Math.round(d / val(old) * 100) : null;
  h += `<div class="stats4">
    ${statTile(setStr(lastBest), 'Letztes Mal', dayLabel(last.k))}
    ${statTile(oldBest ? setStr(oldBest) : '–', 'Vor 2 Wochen', old ? dayLabel(old.k) : 'noch keine Daten')}
    ${statTile(d == null ? '–' : `${d > 0 ? '+' : d < 0 ? '−' : '±'}${fmtNum(Math.abs(d))}${usesKg ? ' kg' : ' Wdh'}`, 'Veränderung', pct != null ? `${pct > 0 ? '+' : ''}${pct} % in 2 Wochen` : '', d > 0 ? 'var(--supp)' : d < 0 ? 'var(--danger)' : '')}
    ${statTile(usesKg ? `${fmtNum(bestKg(pr.ex))} kg` : `${bestReps(pr.ex)} Wdh`, 'Bestwert', dayLabel(pr.k))}
  </div>`;
  h += rangeBar();
  const from = addDays(todayKey(), -range + 1), rs = s.filter(p => p.k >= from);
  if (!rs.length) h += card('', emptyHint('In diesem Zeitraum keine Einheit.'));
  else if (usesKg) {
    h += card('Gewicht (schwerster Satz)', axisChart({ keys: rs.map(p => p.k), unit: 'kg', yFmt: v => fmtNum(v, 1),
      series: [{ name: 'Schwerster Satz', color: 'var(--gym)', fmt: v => fmtNum(v) + ' kg', vals: rs.map(p => bestKg(p.ex)) }] }));
    h += card('Kraft-Schätzung (1RM)', axisChart({ keys: rs.map(p => p.k), unit: 'kg', yFmt: v => fmtNum(v, 0), h: 170,
      series: [{ name: 'Geschätztes Maximum', color: 'var(--yellow-deep)', fmt: v => fmtNum(v, 1) + ' kg', vals: rs.map(p => Math.round(e1rm(p.ex) * 10) / 10) }] })
      + `<p class="foot">Rechnet Gewicht und Wiederholungen zusammen. So siehst du Fortschritt auch, wenn du bei gleichem Gewicht mehr Wdh schaffst.</p>`);
    h += card('Volumen pro Einheit', axisChart({ keys: rs.map(p => p.k), unit: 'kg', bars: true, yMin: 0, h: 160, yFmt: v => v >= 1000 ? fmtNum(v / 1000, 1) + 't' : fmtNum(v, 0),
      series: [{ name: 'Gewicht × Wiederholungen', color: 'var(--gym)', fmt: v => fmtNum(v, 0) + ' kg', vals: rs.map(p => exVolume(p.ex)) }] }));
  } else {
    h += card('Wiederholungen', axisChart({ keys: rs.map(p => p.k), unit: 'Wdh', yFmt: v => fmtNum(v, 0),
      series: [{ name: 'Bester Satz', color: 'var(--gym)', fmt: v => v + ' Wdh', vals: rs.map(p => bestReps(p.ex)) }, { name: 'Gesamt', color: 'var(--yellow-deep)', fmt: v => v + ' Wdh', vals: rs.map(p => totalReps(p.ex)) }] }));
  }
  h += card('Alle Einheiten', s.slice().reverse().map(p => {
    const sets = p.ex.sets.map(x => `<span>${x.kg ? fmtNum(x.kg) + '×' : ''}${x.reps}</span>`).join('');
    return `<div class="hist"><div class="hist-h"><b>${dayLabel(p.k)}</b>${isPR(p.k, p.ex) ? '<em class="pr">Rekord</em>' : ''}<span class="muted small">${usesKg ? fmtNum(exVolume(p.ex), 0) + ' kg Volumen' : totalReps(p.ex) + ' Wdh gesamt'}</span></div>
      <div class="hist-sets">${sets}</div>${p.ex.machine ? `<div class="muted small">${esc(p.ex.machine)}</div>` : ''}</div>`;
  }).join(''));
  return h;
}

/* =====================================================
   EINGABE-FENSTER
   ===================================================== */
function openSheet(type, k, draft, dirty = false) {
  sheet = { type, k, draft, dirty, info: false };
  drawSheet();
  $('sheetBody').scrollTop = 0;
  $('sheet').classList.add('open'); $('sheetBg').classList.add('open');
  document.body.classList.add('noscroll');
  if (type === 'gym') keepAwake(true);
  try { history.pushState({ nav, sheet: true }, ''); } catch (e) {}
}
function closeSheet(force, fromPop) {
  if (!sheet) return;
  const wasGym = sheet.type === 'gym';
  if (!force && wasGym && sheet.dirty) { saveDraft(); toast('Training gemerkt – du kannst jederzeit weitermachen'); }
  sheet = null;
  $('sheet').classList.remove('open'); $('sheetBg').classList.remove('open');
  document.body.classList.remove('noscroll');
  if (document.activeElement) document.activeElement.blur();
  if (wasGym) { keepAwake(false); stopRest(); }
  render();
  if (!fromPop && history.state && history.state.sheet) { try { history.back(); } catch (e) {} }
}
function drawSheet() {
  if (!sheet) return;
  if (sheet.type === 'gym' && sheet.dirty) saveDraft();
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
    <div class="field"><label>Wie hast du geschlafen?</label><div class="qualrow">${[1, 2, 3, 4, 5].map(q => `<button class="qbtn ${d.quality === q ? 'on' : ''}" data-act="sleep-q" data-q="${q}"><span>${q}</span><small>${QUAL[q]}</small></button>`).join('')}</div></div>
    <div class="field"><label>Nachts aufgewacht</label><div class="stepper"><button data-act="sleep-wu" data-d="-1" aria-label="Weniger">−</button><b>${d.wakeups || 0}×</b><button data-act="sleep-wu" data-d="1" aria-label="Mehr">+</button></div></div>
    <div class="field"><label>Notiz</label><textarea class="inp" rows="2" data-in="sleep.note" placeholder="z. B. spät gegessen, Handy im Bett, Koffein …">${esc(d.note || '')}</textarea></div>
    <button class="btn primary" data-act="sleep-save">Speichern</button>
    ${day(sheet.k).sleep ? `<button class="secondary danger" data-act="sleep-del">Eintrag löschen</button>` : ''}`];
}
function durText(d) {
  if (!d.bed || !d.wake) return 'Trag beide Zeiten ein';
  const m = durMin(d.bed, d.wake), st = sleepStatus(m);
  return `Schlafdauer <b>${fmtDur(m)}</b> · <span class="small">${st.text}</span>`;
}

function gymSheet() {
  const d = sheet.draft, k = sheet.k, pd = planDay(d.type);
  const types = allTypes().map(t => `<button class="chip ${d.type === t ? 'on' : ''}" data-act="gs-type" data-t="${esc(t)}">${esc(t)}</button>`).join('');
  let extra = '';
  if (pd) {
    if (!(d.exercises || []).some(e => e.plan)) extra += `<button class="secondary" style="margin:-4px 0 12px" data-act="gs-loadplan">Übungen aus dem ${esc(pd.name)}-Plan laden</button>`;
    extra += `<div class="planhdr"><b>${esc(pd.name)}${pd.title ? ' · ' + esc(pd.title) : ''}</b><span class="muted small">${mainItems(pd).length} Übungen · ${planSets(pd)} Sätze · ca. ${estMinutes(pd)} min${d.startedAt ? ` · läuft seit ${Math.max(0, Math.round((Date.now() - d.startedAt) / 60000))} min` : ''}</span></div>`;
    if (pd.tips && pd.tips.length) extra += `<div class="tips">${pd.tips.map(t => `<div>${esc(t)}</div>`).join('')}</div>`;
  } else if (d.type && !(d.exercises || []).length) {
    const last = lastSessionOfType(d.type, k);
    if (last) extra += `<button class="secondary" style="margin:-4px 0 12px" data-act="gs-tpl" data-from="${last}">Übungen vom letzten ${esc(d.type)}-Training übernehmen (${shortDate(last)})</button>`;
  }
  const info = `<button class="infotoggle" data-act="gs-info">${icon(sheet.info ? 'up' : 'right', 14)} Aufwärmen, Brust-Regel &amp; Steigern</button>${sheet.info ? `<div class="planinfo">${PLAN_INFO}</div>` : ''}`;
  const exs = (d.exercises || []).map((e, i) => e.plan ? planExCard(e, i, k) : customExCard(e, i, k)).join('');
  const names = allExerciseNames().map(n => `<option value="${esc(n)}">`).join('');
  const durs = [30, 45, 60, 75, 90].map(m => `<button class="chip sm ${Number(d.duration) === m ? 'on' : ''}" data-act="gs-dur" data-m="${m}">${m}</button>`).join('');
  const rpe = [1, 2, 3, 4, 5].map(r => `<button class="qbtn ${d.rpe === r ? 'on' : ''}" data-act="gs-rpe" data-r="${r}"><span>${r}</span><small>${RPE[r]}</small></button>`).join('');
  const running = d.startedAt && !d.duration ? `läuft seit ${Math.max(0, Math.round((Date.now() - d.startedAt) / 60000))} min` : 'z. B. 60';
  return [`Training · ${dayLabel(k)}`, `
    <div class="field"><label>Was trainierst du?</label><div class="chips">${types}</div></div>
    ${extra}${info}
    <div class="field" style="margin-top:12px">${exs}<datalist id="exNames">${names}</datalist><button class="secondary" data-act="gs-exadd">${icon('plus', 16)} ${pd ? 'Freestyle-Übung' : 'Übung'} hinzufügen</button></div>
    <div class="field"><label>Dauer (Minuten)</label><div class="durrow"><input class="inp" type="number" inputmode="numeric" min="0" data-in="gym.duration" value="${esc(d.duration)}" placeholder="${running}"><div class="chips nowrap">${durs}</div></div>
      ${d.startedAt ? '<div class="hint">Leer lassen = wird beim Speichern automatisch berechnet.</div>' : ''}</div>
    <div class="field"><label>Wie anstrengend war's?</label><div class="qualrow">${rpe}</div></div>
    <div class="field"><label>Notiz</label><textarea class="inp" rows="2" data-in="gym.note" placeholder="z. B. Brust gut gespürt, Schulter gezwickt …">${esc(d.note || '')}</textarea></div>
    <button class="btn primary" data-act="gs-save">Training speichern</button>
    ${gymDone(k) ? `<button class="secondary danger" data-act="gs-del">Training löschen</button>` : ''}
    ${!gymDone(k) && (sheet.dirty || loadDraft(k)) ? `<button class="secondary danger" data-act="gs-discard">Training verwerfen</button>` : ''}
    <p class="foot" style="text-align:center">Nur Sätze mit Wiederholungen werden gespeichert.</p>`];
}
function setRow(s, i, j, repsPh, restSec) {
  return `<div class="setrow ${s.done ? 'done' : ''}"><span class="setn">${j + 1}</span>
    <input class="inp" type="number" inputmode="numeric" min="0" data-in="set.reps" data-i="${i}" data-j="${j}" value="${esc(s.reps)}" placeholder="${esc(repsPh || 'Wdh.')}">
    <span class="x-mul">×</span>
    <input class="inp" type="number" inputmode="decimal" min="0" step="0.5" data-in="set.kg" data-i="${i}" data-j="${j}" value="${esc(s.kg)}" placeholder="kg">
    <button class="setok" data-act="gs-setdone" data-i="${i}" data-j="${j}" data-rest="${restSec || 90}" aria-label="Satz erledigt, Pause starten">${icon('check', 16)}</button>
    <button class="del sm" data-act="gs-setdel" data-i="${i}" data-j="${j}" aria-label="Satz entfernen">${icon('x', 14)}</button></div>`;
}
function lastTimeText(name, k) {
  const prev = exSessions(name, k);
  if (!prev.length) return '';
  const last = prev[prev.length - 1], best = Math.max(...prev.map(p => bestKg(p.ex)));
  return `Letztes Mal (${shortDate(last.k)}): ${setsText(last.ex)}${best ? ` · Bestwert ${fmtNum(best)} kg` : ''}${last.ex.machine ? ` · ${esc(last.ex.machine)}` : ''}`;
}
function planExCard(e, i, k) {
  const p = e.plan, h = progressHint(e, k), doneN = e.sets.filter(s => s.done).length, complete = e.sets.length && doneN >= e.sets.length;
  return `<div class="excard ${complete ? 'complete' : ''}">
    <div class="exhead2"><span class="exnum">${complete ? icon('check', 14) : i + 1}</span>
      <div class="exname"><b>${esc(e.name)}</b>${p.optional ? '<span class="opt">optional</span>' : ''}<small>${p.sets} × ${esc(p.reps)} · Pause ${p.rest} s${p.muscle ? ' · ' + esc(p.muscle) : ''}</small></div>
      <button class="del sm" data-act="gs-exdel" data-i="${i}" aria-label="Übung entfernen">${icon('x', 14)}</button></div>
    ${p.note ? `<div class="exnote">${esc(p.note)}</div>` : ''}
    <div class="lasttime" id="lt-${i}">${lastTimeText(e.name, k)}</div>
    ${h ? `<div class="hintline ${h.cls}">${h.text}</div>` : ''}
    <div class="sets">${e.sets.map((s, j) => setRow(s, i, j, p.reps, p.rest)).join('')}</div>
    <div class="exfoot"><input class="inp" data-in="ex.machine" data-i="${i}" value="${esc(e.machine || '')}" placeholder="Maschine / Notiz"><button class="ghost sm" data-act="gs-setadd" data-i="${i}">${icon('plus', 14)} Satz</button></div>
  </div>`;
}
function customExCard(e, i, k) {
  return `<div class="excard">
    <div class="exhead"><input class="inp" list="exNames" data-in="ex.name" data-i="${i}" value="${esc(e.name || '')}" placeholder="Übung, z. B. Beinpresse"><button class="del" data-act="gs-exdel" data-i="${i}" aria-label="Übung entfernen">${icon('x', 16)}</button></div>
    <div class="lasttime" id="lt-${i}">${lastTimeText(e.name, k)}</div>
    <div class="sets">${(e.sets || []).map((s, j) => setRow(s, i, j, 'Wdh.', 90)).join('')}</div>
    <div class="exfoot"><input class="inp" data-in="ex.machine" data-i="${i}" value="${esc(e.machine || '')}" placeholder="Maschine / Notiz"><button class="ghost sm" data-act="gs-setadd" data-i="${i}">${icon('plus', 14)} Satz</button></div>
  </div>`;
}
function waterSheet() {
  const d = sheet.draft;
  return ['Andere Menge', `
    <div class="field"><label>Menge (ml)</label><input class="inp" type="number" inputmode="numeric" data-in="w.ml" value="${esc(d.ml)}" placeholder="z. B. 330">
      <div class="chips" style="margin-top:8px">${[150, 200, 330, 750, 1500].map(m => `<button class="chip sm" data-act="ws-ml" data-m="${m}">${fmtMl(m)}</button>`).join('')}</div>
      <div class="hint">Zum Abziehen eine Minuszahl eingeben, z. B. -200.</div></div>
    <div class="field"><label>Getränk</label><div class="chips">${DRINKS.map(x => `<button class="chip sm ${d.drink === x.id ? 'on' : ''}" data-act="ws-drink" data-id="${x.id}">${x.label}</button>`).join('')}</div></div>
    <div class="field"><label>Uhrzeit</label><input class="inp" type="time" data-in="w.t" value="${d.t || ''}"></div>
    <button class="btn primary" data-act="ws-save">Eintragen</button>`];
}

/* =====================================================
   GRAFIKEN
   ===================================================== */
const rangeBar = () => `<div class="seg sm">${[[14, '2 Wochen'], [30, '1 Monat'], [90, '3 Monate']].map(([n, l]) => `<button class="${range === n ? 'on' : ''}" data-act="range" data-n="${n}">${l}</button>`).join('')}</div>`;
function niceTicks(min, max, n = 4) {
  if (min === max) { min -= 1; max += 1; }
  const step0 = (max - min) / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= step0) || 10 * mag;
  const out = [];
  for (let v = Math.floor(min / step) * step; v <= Math.ceil(max / step) * step + step / 2; v += step) out.push(+v.toFixed(6));
  return out;
}
const timeTicks = (lo, hi) => { const out = []; for (let v = Math.floor(lo / 60) * 60; v <= Math.ceil(hi / 60) * 60; v += (hi - lo > 360 ? 120 : 60)) out.push(v); return out; };
function rollingAvg(vals, win = 7) { return vals.map((_, i) => { const w = vals.slice(Math.max(0, i - win + 1), i + 1).filter(v => v != null); return w.length >= 3 ? avg(w) : null; }); }
function axisChart({ keys, series, goal = null, goalLabel = 'Ziel', band = null, bandLabel = 'Idealbereich', yFmt = v => fmtNum(v), unit = '', yMin = null, yMax = null, ticks = null, invertY = false, bars = false, xFmt = shortDate, h = 200 }) {
  const all = series.flatMap(s => s.vals).filter(v => v != null);
  if (!all.length) return emptyHint('In diesem Zeitraum gibt es noch keine Daten.');
  const W = 340, H = h, L = 44, R = 12, T = 18, B = 28;
  const extra = [goal, ...(band || [])].filter(v => v != null);
  let lo = yMin != null ? yMin : Math.min(...all, ...extra);
  let hi = yMax != null ? yMax : Math.max(...all, ...extra);
  if (yMin == null && !ticks) { const p = (hi - lo) * 0.1 || 1; lo -= p; hi += p; }
  if (yMin != null && yMax == null && !ticks) hi += (hi - lo) * 0.08;
  const tk = (ticks || niceTicks)(lo, hi);
  lo = Math.min(lo, tk[0]); hi = Math.max(hi, tk[tk.length - 1]);
  const n = keys.length, cw = (W - L - R) / n;
  const x = i => bars || n === 1 ? L + (i + 0.5) * cw : L + i * (W - L - R) / (n - 1);
  const y = v => { const f = (v - lo) / (hi - lo || 1); return invertY ? T + f * (H - T - B) : T + (1 - f) * (H - T - B); };
  let g = '';
  if (band) { const y1 = y(band[1]), y2 = y(band[0]); g += `<rect class="band" x="${L}" y="${Math.min(y1, y2).toFixed(1)}" width="${W - L - R}" height="${Math.abs(y2 - y1).toFixed(1)}"/>`; }
  tk.forEach(v => { g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text x="${L - 6}" y="${(y(v) + 3.5).toFixed(1)}" text-anchor="end">${yFmt(v)}</text>`; });
  g += `<line class="axis" x1="${L}" x2="${L}" y1="${T - 6}" y2="${H - B}"/><line class="axis" x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}"/>`;
  const step = Math.max(1, Math.ceil(n / 5)), lab = [];
  for (let i = 0; i < n; i++) if (i % step === 0 || i === n - 1) lab.push(i);
  for (let j = lab.length - 2; j >= 0; j--) if (x(lab[j + 1]) - x(lab[j]) < 40) lab.splice(j === lab.length - 2 ? j : j + 1, 1);
  lab.forEach(i => { const isLast = i === n - 1; g += `<line class="axis" x1="${x(i).toFixed(1)}" x2="${x(i).toFixed(1)}" y1="${H - B}" y2="${H - B + 4}"/><text x="${x(i).toFixed(1)}" y="${H - B + 16}" text-anchor="${isLast && !bars && n > 1 ? 'end' : 'middle'}">${xFmt(keys[i])}</text>`; });
  if (unit) g += `<text x="${L - 6}" y="${T - 8}" text-anchor="end" class="unit">${unit}</text>`;
  if (goal != null) g += `<line class="goal" x1="${L}" x2="${W - R}" y1="${y(goal).toFixed(1)}" y2="${y(goal).toFixed(1)}"/><text class="goaltxt" x="${W - R}" y="${(y(goal) - 4).toFixed(1)}" text-anchor="end">${goalLabel}</text>`;
  series.forEach((s, si) => {
    if (bars) {
      const bw = Math.max(2, cw * (series.length > 1 ? 0.8 / series.length : 0.62)), off = series.length > 1 ? (si - (series.length - 1) / 2) * bw : 0;
      s.vals.forEach((v, i) => { if (v == null) return; const y0 = y(Math.max(lo, 0)), yy = y(v); g += `<rect x="${(x(i) - bw / 2 + off).toFixed(1)}" y="${Math.min(yy, y0).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, Math.abs(y0 - yy)).toFixed(1)}" rx="3" fill="${s.color}" opacity="${s.dim && s.dim[i] ? .38 : .92}"/>`; });
    } else {
      let seg = [];
      const flush = () => {
        if (seg.length > 1) {
          const d = seg.map((p, j) => `${j ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
          if (series.length === 1) g += `<path d="${d} L${seg[seg.length - 1][0].toFixed(1)},${H - B} L${seg[0][0].toFixed(1)},${H - B} Z" fill="${s.color}" opacity=".1"/>`;
          g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;
        }
        seg = [];
      };
      s.vals.forEach((v, i) => { if (v == null) flush(); else seg.push([x(i), y(v)]); });
      flush();
      s.vals.forEach((v, i) => { if (v != null && (n <= 31 || i === n - 1)) g += `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.2" fill="#fff" stroke="${s.color}" stroke-width="2"/>`; });
    }
    if (s.trend) {
      const pts = rollingAvg(s.vals).map((v, i) => v == null ? null : [x(i), y(v)]).filter(Boolean);
      if (pts.length > 1) g += `<path d="${pts.map((p, j) => `${j ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}" fill="none" stroke="var(--text)" stroke-width="1.6" stroke-dasharray="5 4" opacity=".5"/>`;
    }
  });
  for (let i = 0; i < n; i++) {
    const vals = series.map(s => s.vals[i] == null ? null : `${s.name ? s.name + ': ' : ''}${(s.fmt || yFmt)(s.vals[i])}`).filter(Boolean);
    if (vals.length) g += `<rect class="hit" x="${(x(i) - cw / 2).toFixed(1)}" y="${T}" width="${cw.toFixed(1)}" height="${H - T - B}" data-act="chart-pt" data-info="${esc(`${xFmt === shortDate ? dayLabel(keys[i]) : xFmt(keys[i])} · ${vals.join(' · ')}`)}"/>`;
  }
  const legend = series.length > 1 || series.some(s => s.trend) || goal != null || band
    ? `<div class="legend">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}${series.some(s => s.trend) ? '<span><i class="ltrend"></i>Trend (Ø 7 Tage)</span>' : ''}${goal != null ? `<span><i class="lgoal"></i>${goalLabel}</span>` : ''}${band ? `<span><i class="lband"></i>${bandLabel}</span>` : ''}</div>`
    : '';
  return `<svg class="axchart" viewBox="0 0 ${W} ${H}" role="img">${g}</svg>${legend}`;
}
function hbars(rows, color) {
  const max = Math.max(1, ...rows.map(r => r.v));
  return rows.map(r => `<div class="hrow"><span class="hl">${r.label}</span><div class="htrack"><i style="width:${r.v / max * 100}%;background:${color}"></i></div><span class="hv">${r.text}</span></div>`).join('');
}
function weekKeys() { const n = Math.max(4, Math.round(range / 7)), ws = weekStart(todayKey()), out = []; for (let i = n - 1; i >= 0; i--) out.push(addDays(ws, -7 * i)); return out; }

/* ---------- Verlauf: Schlaf ---------- */
function statsSleep() {
  const tk = todayKey(), goal = S().sleep.goalMin, kr = lastNDays(range);
  const d7 = lastNDays(7), m7 = d7.map(sleepMin).filter(x => x != null), mr = kr.map(sleepMin).filter(x => x != null);
  if (!mr.length) return card('', emptyHint('Noch keine Nächte eingetragen. Abends „Ich gehe jetzt schlafen“ drücken, morgens „Aufgewacht“.'));
  const qr = kr.map(sleepOf).filter(s => s && s.quality).map(s => s.quality);
  const inRange = kr.filter(sleepHit).length;
  const tiles = `<div class="stats4">
    ${statTile(m7.length ? fmtHM(avg(m7)) + ' h' : '–', 'Ø letzte 7 Tage', `${m7.length} Nächte`, 'var(--sleep)')}
    ${statTile(fmtHM(avg(mr)) + ' h', `Ø ${range} Tage`, `${mr.length} Nächte`, 'var(--sleep)')}
    ${statTile(`${inRange}/${mr.length}`, 'Im Idealbereich', idealText(), 'var(--sleep)')}
    ${statTile(qr.length ? fmtNum(avg(qr)) : '–', 'Ø Qualität', 'von 5', 'var(--sleep)')}
  </div>`;
  const durLine = axisChart({ keys: kr, unit: 'Stunden', band: [idealMin() / 60, idealMax() / 60], yFmt: v => fmtNum(v, 1),
    series: [{ name: 'Schlafdauer', color: 'var(--sleep)', trend: true, fmt: v => fmtDur(v * 60), vals: kr.map(k => { const m = sleepMin(k); return m == null ? null : m / 60; }) }] });
  const timeLine = axisChart({ keys: kr, unit: 'Uhrzeit', invertY: true, ticks: timeTicks, yFmt: v => fromMin(v), goal: bedScale(toMin(S().sleep.bedTarget)), goalLabel: 'Ziel Bettzeit', h: 220,
    series: [
      { name: 'Eingeschlafen', color: 'var(--sleep)', fmt: v => fromMin(v), vals: kr.map(k => { const s = sleepOf(k); return s ? bedScale(toMin(s.bed)) : null; }) },
      { name: 'Aufgewacht', color: 'var(--yellow-deep)', fmt: v => fromMin(v), vals: kr.map(k => { const s = sleepOf(k); return s ? toMin(s.wake) + (toMin(s.wake) < 720 ? 1440 : 0) : null; }) }
    ] });
  const qualLine = axisChart({ keys: kr, unit: 'Qualität', yMin: 1, yMax: 5, ticks: () => [1, 2, 3, 4, 5], yFmt: v => v, h: 170,
    series: [{ name: 'Schlafqualität', color: 'var(--sleep)', trend: true, fmt: v => `${v} – ${QUAL[v]}`, vals: kr.map(k => { const s = sleepOf(k); return s && s.quality ? s.quality : null; }) }] });
  const ss = kr.map(sleepOf).filter(Boolean);
  const beds = ss.map(s => bedScale(toMin(s.bed))), wakes = ss.map(s => toMin(s.wake));
  const sd = a => { const m = avg(a); return Math.sqrt(avg(a.map(x => (x - m) ** 2))); };
  const debt = m7.reduce((s, m) => s + (goal - m), 0);
  return card('', tiles)
    + card('Schlafdauer', durLine + `<p class="foot">Der helle Streifen ist dein Idealbereich (${idealText()}).</p>`)
    + card('Einschlaf- & Aufwachzeit', timeLine)
    + card('Schlafqualität', qualLine)
    + card('Rhythmus', `<div class="stats4">
        ${statTile(fromMin(avg(beds)), 'Ø Einschlafen', `± ${Math.round(sd(beds))} min · Ziel ${S().sleep.bedTarget}`)}
        ${statTile(fromMin(avg(wakes)), 'Ø Aufwachen', `± ${Math.round(sd(wakes))} min`)}
        ${statTile(m7.length ? (debt > 0 ? '−' : '+') + fmtDur(Math.abs(debt)) : '–', debt > 0 ? 'Schlafdefizit' : 'Schlafplus', '7 Tage vs. 8 h')}
        ${statTile(ss.filter(s => s.wakeups != null).length ? fmtNum(avg(ss.filter(s => s.wakeups != null).map(s => s.wakeups))) + '×' : '–', 'Ø nachts wach', 'pro Nacht')}
      </div>`);
}

/* ---------- Verlauf: Wasser ---------- */
function statsWater() {
  const tk = todayKey(), kr = lastNDays(range), logged = kr.filter(k => waterTotal(k) > 0);
  if (!logged.length) return card('', emptyHint('Noch keine Daten in diesem Zeitraum.'));
  const vals = logged.map(waterTotal), hit = logged.filter(waterHit).length;
  const best = logged.reduce((a, b) => waterTotal(b) > waterTotal(a) ? b : a);
  const ms = tk.slice(0, 8) + '01'; let month = 0;
  Object.keys(db.days).forEach(k => { if (k >= ms && k <= tk) month += waterTotal(k); });
  const tiles = `<div class="stats4">
    ${statTile(fmtL(avg(vals)), 'Ø pro Tag', `${range} Tage`, 'var(--water)')}
    ${statTile(`${hit}/${logged.length}`, 'Ziel geschafft', 'Tage', 'var(--water)')}
    ${statTile(fmtL(waterTotal(best)), 'Bester Tag', dayLabel(best), 'var(--water)')}
    ${statTile(fmtNum(month / 1000, 1) + ' L', `Im ${MONTHS[fromKey(tk).getMonth()]}`, 'insgesamt', 'var(--water)')}
  </div>`;
  const chart = axisChart({ keys: kr, bars: true, unit: 'Liter', goal: S().water.goal / 1000, yMin: 0, yFmt: v => fmtNum(v, 1),
    series: [{ name: 'Getrunken', color: 'var(--water)', trend: true, fmt: v => fmtL(v * 1000), vals: kr.map(k => waterTotal(k) ? waterTotal(k) / 1000 : null), dim: kr.map(k => !waterHit(k)) }] });
  const byDrink = {}; let all = 0;
  kr.forEach(k => day(k).water.forEach(w => { if (w.ml > 0) { byDrink[w.drink] = (byDrink[w.drink] || 0) + w.ml; all += w.ml; } }));
  const drinkRows = DRINKS.filter(x => byDrink[x.id]).map(x => ({ label: x.label, v: byDrink[x.id], text: Math.round(byDrink[x.id] / all * 100) + ' %' })).sort((a, b) => b.v - a.v);
  const buckets = [['Morgens', 0, 660], ['Mittags', 660, 840], ['Nachmittag', 840, 1080], ['Abends', 1080, 1440]], bt = buckets.map(() => 0);
  kr.forEach(k => day(k).water.forEach(w => { if (w.ml > 0 && w.t) { const m = toMin(w.t); const i = buckets.findIndex(b => m >= b[1] && m < b[2]); if (i >= 0) bt[i] += w.ml; } }));
  const btSum = bt.reduce((a, b) => a + b, 0);
  return card('', tiles)
    + card('Liter pro Tag', chart + `<p class="foot">Blasse Balken = Ziel verpasst</p>`)
    + card('Was du trinkst', hbars(drinkRows, 'var(--water)'))
    + card('Wann du trinkst', btSum ? hbars(buckets.map((b, i) => ({ label: b[0], v: bt[i], text: Math.round(bt[i] / btSum * 100) + ' %' })), 'var(--water)') : emptyHint('Noch keine Uhrzeiten.'));
}

/* ---------- Verlauf: Supplements (genommen / nicht genommen) ---------- */
function suppHeat(test, fd) {
  const tk = todayKey(), weeks = Math.max(2, Math.ceil(range / 7)), ws = weekStart(tk), start = addDays(ws, -7 * (weeks - 1));
  let cells = '';
  for (let r = 0; r < 7; r++) {
    cells += `<span class="hm-l">${['M', 'D', 'M', 'D', 'F', 'S', 'S'][r]}</span>`;
    for (let c = 0; c < weeks; c++) {
      const k = addDays(start, c * 7 + r);
      const cls = k > tk ? 'fut' : k < fd ? 'pre' : test(k) ? 'on' : 'off';
      cells += `<i class="${cls}" data-act="chart-pt" data-info="${esc(`${dayLabel(k)} · ${cls === 'on' ? 'genommen' : cls === 'off' ? 'nicht genommen' : '–'}`)}"></i>`;
    }
  }
  return `<div class="heat" style="grid-template-columns:14px repeat(${weeks},minmax(0,24px))">${cells}</div><div class="row-between foot"><span>ab ${shortDate(start)}</span><span>diese Woche</span></div>`;
}
function statsSupps() {
  const list = S().supplements, tk = todayKey();
  if (!list.length) return card('', emptyHint('Keine Supplements eingerichtet.'));
  const fd = firstDay(), kr = lastNDays(range).filter(k => k >= fd && (k < tk || allSupps(k)));
  let html = card('', `<div class="stats4">
    ${statTile(streak(allSupps), 'Tage alle in Folge', `Rekord ${longestStreak(allSupps)}`, 'var(--supp)')}
    ${statTile(`${kr.filter(allSupps).length}/${kr.length}`, 'Tage komplett', `${range} Tage`, 'var(--supp)')}
  </div>`);
  list.forEach(x => {
    const test = k => hasDay(k) && suppTaken(k, x.id);
    const span = lastNDays(range).filter(k => k >= fd && (k < tk || test(k)));
    const taken = span.filter(test);
    const times = taken.map(k => day(k).supps[x.id].t).filter(Boolean).map(toMin);
    const stock = isNum(x.stock)
      ? `<div class="stockline ${Number(x.stock) <= 7 ? 'low' : ''}">Vorrat: noch ${x.stock} ${Number(x.stock) === 1 ? 'Portion' : 'Portionen'}${Number(x.stock) > 0 ? ` · reicht bis ca. ${shortDate(addDays(tk, Number(x.stock)))}` : ' · nachkaufen'}</div>` : '';
    html += card(esc(x.name), `
      <div class="mini-stats">
        <span><b>${streak(test)}</b> Tage in Folge</span>
        <span>Rekord <b>${longestStreak(test)}</b></span>
        <span><b>${taken.length}</b> von ${span.length} Tagen</span>
        ${times.length ? `<span>meist <b>${fromMin(avg(times))}</b></span>` : ''}
      </div>
      ${suppHeat(test, fd)}${stock}`, x.dose ? `<span class="tag">${esc(x.dose)}</span>` : '');
  });
  html += `<div class="legend" style="margin:0 2px 10px"><span><i style="background:var(--supp)"></i>genommen</span><span><i style="background:var(--line)"></i>nicht genommen</span></div>`;
  return html;
}

/* ---------- Verlauf: Gym ---------- */
function statsGym() {
  const tk = todayKey(), goal = S().gym.weeklyGoal, kr = lastNDays(range), sess = kr.filter(gymDone);
  const durs = sess.map(k => Number(day(k).gym.duration)).filter(Boolean), rpes = sess.map(k => day(k).gym.rpe).filter(Boolean);
  const tiles = `<div class="stats4">
    ${statTile(`${gymWeekCount(tk)}/${goal}`, 'Diese Woche', 'Trainings', 'var(--gym)')}
    ${statTile(sess.length, `${range} Tage`, 'Trainings', 'var(--gym)')}
    ${statTile(durs.length ? Math.round(avg(durs)) + ' min' : '–', 'Ø Dauer', '', 'var(--gym)')}
    ${statTile(rpes.length ? fmtNum(avg(rpes)) + '/5' : '–', 'Ø Anstrengung', rpes.length ? RPE[Math.round(avg(rpes))] : '', 'var(--gym)')}
  </div>`;
  const wk = weekKeys(), t = planTargets(), prio = prioMuscle();
  let h = card('', tiles);
  h += card('Trainings pro Woche', axisChart({ keys: wk, bars: true, yMin: 0, unit: 'Trainings', goal, goalLabel: 'Wochenziel', xFmt: shortDate, h: 170,
    ticks: (lo, hi) => { const o = []; for (let v = 0; v <= Math.max(hi, goal + 1); v++) o.push(v); return o; }, yFmt: v => v,
    series: [{ name: 'Trainings', color: 'var(--gym)', fmt: v => v + '×', vals: wk.map(gymWeekCount), dim: wk.map(w => gymWeekCount(w) < goal) }] }) + '<p class="foot">X-Achse = Wochenbeginn (Montag)</p>');
  if (prio) {
    const sets = wk.map(w => { let n = 0; for (let i = 0; i < 7; i++) { const g = day(addDays(w, i)).gym; if (g && g.done && g.exercises) g.exercises.forEach(e => { if (muscleOf(e) === prio) n += (e.sets || []).filter(s => isNum(s.reps)).length; }); } return n; });
    h += card(`${esc(prio)}-Sätze pro Woche`, axisChart({ keys: wk, bars: true, yMin: 0, unit: 'Sätze', goal: t[prio], goalLabel: `Plan: ${t[prio]}`, xFmt: shortDate, yFmt: v => fmtNum(v, 0), h: 170,
      series: [{ name: `${prio}-Sätze`, color: 'var(--gym)', fmt: v => v + ' Sätze', vals: sets, dim: sets.map(v => v < t[prio]) }] }));
  }
  const names = allExerciseNames();
  const prs = names.map(n => { const st = exStats(n); return st && { n, st }; }).filter(Boolean).sort((a, b) => b.st.s.length - a.st.s.length);
  h += card('Bestwerte', prs.length ? prs.slice(0, 12).map(({ n, st }) => `<button class="exitem" data-act="open-ex" data-n="${esc(n)}"><span class="exi-name"><b>${esc(n)}</b><small>${st.s.length}× trainiert</small></span><span class="exi-val"><b>${st.usesKg ? fmtNum(st.best) + ' kg' : st.best + ' Wdh'}</b>${deltaHtml(st)}</span>${icon('right', 16)}</button>`).join('') : emptyHint('Noch keine Übungen eingetragen.'));
  const types = {}; lastNDays(90).filter(gymDone).forEach(k => { const ty = day(k).gym.type || 'Ohne Angabe'; types[ty] = (types[ty] || 0) + 1; });
  const typeRows = Object.entries(types).sort((a, b) => b[1] - a[1]).map(([ty, n]) => ({ label: esc(ty), v: n, text: n + '×' }));
  h += card('Trainingsarten · 90 Tage', typeRows.length ? hbars(typeRows, 'var(--gym)') : emptyHint('Noch keine Trainings.'));
  const recent = Object.keys(db.days).filter(gymDone).sort().reverse().slice(0, 8);
  h += card('Letzte Trainings', recent.length ? recent.map(k => { const g = day(k).gym; const nEx = (g.exercises || []).length; return `<button class="wkrow" data-act="pick-day-gym" data-k="${k}"><span class="wd8">${WD[fromKey(k).getDay()]} ${shortDate(k)}</span><span class="wt">${esc(g.type || 'Training')}</span><span class="wm">${[g.duration ? g.duration + ' min' : '', nEx ? nEx + ' Übungen' : ''].filter(Boolean).join(' · ')}</span></button>`; }).join('') : emptyHint('Noch keine Trainings.'));
  return h;
}

/* =====================================================
   KALENDER & ERKENNTNISSE
   ===================================================== */
function renderCalendar() {
  const tk = todayKey(), sl7 = lastNDays(7).map(sleepMin).filter(x => x != null);
  let h = `<header class="hero"><div class="eyebrow">Überblick</div><h1>Kalender</h1></header>`;
  h += card('', `<div class="stats4">
    ${statTile(streak(waterHit), 'Tage Wasserziel in Folge', `Rekord ${longestStreak(waterHit)}`, 'var(--water)')}
    ${statTile(streak(allSupps), 'Tage alle Supps in Folge', `Rekord ${longestStreak(allSupps)}`, 'var(--supp)')}
    ${statTile(`${gymWeekCount(tk)}/${S().gym.weeklyGoal}`, 'Trainings diese Woche', '', 'var(--gym)')}
    ${statTile(sl7.length ? fmtHM(avg(sl7)) + ' h' : '–', 'Ø Schlaf 7 Tage', `Ideal ${idealText()}`, 'var(--sleep)')}
  </div>`);
  const y = calMonth.getFullYear(), m = calMonth.getMonth(), now = new Date();
  const atMax = y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth());
  const offset = (new Date(y, m, 1).getDay() + 6) % 7, daysIn = new Date(y, m + 1, 0).getDate();
  let c = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(w => `<div class="wd">${w}</div>`).join('');
  for (let i = 0; i < offset; i++) c += '<div class="day empty"></div>';
  for (let dn = 1; dn <= daysIn; dn++) {
    const k = keyOf(new Date(y, m, dn));
    const pct = hasDay(k) ? Math.min(100, Math.round(waterTotal(k) / waterGoal(k) * 100)) : 0;
    c += `<button class="day ${k === tk ? 'today' : ''} ${k > tk ? 'future' : ''} ${waterHit(k) ? 'goal' : ''}" data-act="pick-day" data-k="${k}" ${k > tk ? 'disabled' : ''}>
      <div class="fill" style="height:${pct}%"></div><span class="n">${dn}</span>
      <span class="dots">${sleepHit(k) ? '<i class="dot sl"></i>' : ''}${allSupps(k) ? '<i class="dot s"></i>' : ''}${gymDone(k) ? '<i class="dot g"></i>' : ''}</span></button>`;
  }
  h += `<section class="card">
    <div class="monthbar"><button class="iconbtn" data-act="cal-prev" aria-label="Vorheriger Monat">${icon('left')}</button><b>${MONTHS[m]} ${y}</b><button class="iconbtn" data-act="cal-next" aria-label="Nächster Monat" ${atMax ? 'disabled' : ''}>${icon('right')}</button></div>
    <div class="cal">${c}</div>
    <div class="legend"><span><i style="background:var(--water);border-radius:2px"></i>Wasser</span><span><i style="background:var(--sleep)"></i>Schlaf ideal</span><span><i style="background:var(--supp)"></i>Alle Supps</span><span><i style="background:var(--gym)"></i>Gym</span></div></section>`;
  const list = insights();
  h += card('Erkenntnisse', list.length ? list.map(i => `<div class="insight">${icon('spark', 16)}<div>${i}</div></div>`).join('')
    : emptyHint('Trag ein paar Tage lang alles ein. Dann zeigt dir die App hier Zusammenhänge, z. B. ob du nach Magnesium oder nach dem Training besser schläfst.'));
  return h;
}
function insights() {
  const out = [], days = lastNDays(90);
  S().supplements.forEach(x => {
    const w = [], wo = [];
    days.forEach(k => { const s = sleepOf(addDays(k, 1)); if (!s || !hasDay(k)) return; (suppTaken(k, x.id) ? w : wo).push(s); });
    if (w.length >= 3 && wo.length >= 3) {
      const q = a => avg(a.filter(s => s.quality).map(s => s.quality)), dm = a => avg(a.map(s => durMin(s.bed, s.wake)));
      const qw = q(w), qo = q(wo);
      if (Math.abs(dm(w) - dm(wo)) >= 10 || (qw && qo && Math.abs(qw - qo) >= 0.3))
        out.push(`An Tagen <b>mit ${esc(x.name)}</b> schläfst du danach Ø <b>${fmtDur(dm(w))}</b>${qw ? ` (Qualität ${fmtNum(qw)}/5)` : ''}, <b>ohne</b> Ø <b>${fmtDur(dm(wo))}</b>${qo ? ` (${fmtNum(qo)}/5)` : ''}.`);
    }
  });
  { const w = [], wo = []; days.forEach(k => { const m = sleepMin(addDays(k, 1)); if (m == null) return; (gymDone(k) ? w : wo).push(m); });
    if (w.length >= 3 && wo.length >= 3) out.push(`Nach Trainingstagen schläfst du Ø <b>${fmtDur(avg(w))}</b>, nach trainingsfreien Tagen Ø <b>${fmtDur(avg(wo))}</b>.`); }
  { const w = [], wo = []; days.forEach(k => { const t = waterTotal(k); if (!t) return; (gymDone(k) ? w : wo).push(t); });
    if (w.length >= 3 && wo.length >= 3) out.push(`An Gym-Tagen trinkst du Ø <b>${fmtL(avg(w))}</b>, an anderen Tagen Ø <b>${fmtL(avg(wo))}</b>.`); }
  { const good = [], bad = []; days.forEach(k => { const g = day(k).gym, m = sleepMin(k); if (!g || !g.done || !g.rpe || m == null) return; (m >= idealMin() ? good : bad).push(g.rpe); });
    if (good.length >= 3 && bad.length >= 3) out.push(`Nach genug Schlaf fühlt sich dein Training wie <b>${fmtNum(avg(good))}/5</b> an, nach zu wenig Schlaf wie <b>${fmtNum(avg(bad))}/5</b>.`); }
  { const c = [0, 0, 0, 0, 0, 0, 0]; let n = 0; days.forEach(k => { if (gymDone(k)) { c[fromKey(k).getDay()]++; n++; } });
    if (n >= 6) { const max = Math.max(...c); out.push(`Dein häufigster Trainingstag ist der <b>${WD_LONG[c.indexOf(max)]}</b> (${max} von ${n} Trainings).`); } }
  { const sum = Array(7).fill(0), cnt = Array(7).fill(0); days.forEach(k => { const t = waterTotal(k); if (t > 0) { const i = fromKey(k).getDay(); sum[i] += t; cnt[i]++; } });
    const a = sum.map((s, i) => cnt[i] >= 2 ? s / cnt[i] : null), valid = a.filter(x => x != null);
    if (valid.length >= 5) { const min = Math.min(...valid); out.push(`Am <b>${WD_LONG[a.indexOf(min)]}</b> trinkst du am wenigsten (Ø ${fmtL(min)}).`); } }
  { const b = lastNDays(14).map(sleepOf).filter(Boolean).map(s => bedScale(toMin(s.bed)));
    if (b.length >= 5) { const m = avg(b), sd = Math.sqrt(avg(b.map(x => (x - m) ** 2)));
      out.push(sd <= 30 ? `Sehr regelmäßig: Du schläfst meist gegen <b>${fromMin(m)}</b> ein (± ${Math.round(sd)} min).` : `Deine Einschlafzeit schwankt um <b>± ${Math.round(sd)} min</b> (Ø ${fromMin(m)}). Feste Zeiten helfen vielen beim Einschlafen.`); } }
  return out;
}

/* =====================================================
   EINSTELLUNGEN
   ===================================================== */
function planEditorHTML() {
  return S().gym.plan.map((p, d) => {
    const open = planOpen === d;
    const items = !open ? '' : p.items.map((it, i) => `
      <div class="planex">
        <div class="listrow"><input class="inp strong" data-set="plan.name" data-d="${d}" data-i="${i}" value="${esc(it.name)}">
          ${i > 0 ? `<button class="del muted" data-act="set-planex-up" data-d="${d}" data-i="${i}" aria-label="Nach oben">${icon('up', 16)}</button>` : ''}
          <button class="del" data-act="set-planex-del" data-d="${d}" data-i="${i}" aria-label="Entfernen">${icon('x', 16)}</button></div>
        <div class="grid2">
          <div><label class="mini">Sätze</label><input class="inp" type="number" inputmode="numeric" min="1" max="10" data-set="plan.sets" data-d="${d}" data-i="${i}" value="${it.sets}"></div>
          <div><label class="mini">Wiederholungen</label><input class="inp" data-set="plan.reps" data-d="${d}" data-i="${i}" value="${esc(it.reps)}" placeholder="8–12"></div>
          <div><label class="mini">Pause (Sek.)</label><input class="inp" type="number" inputmode="numeric" min="0" step="15" data-set="plan.rest" data-d="${d}" data-i="${i}" value="${it.rest}"></div>
          <div><label class="mini">Muskel</label><select class="inp" data-set="plan.muscle" data-d="${d}" data-i="${i}">${MUSCLES.map(m => `<option ${it.muscle === m ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
        </div>
        <div style="margin-top:6px"><label class="mini">Tipp (optional)</label><input class="inp" data-set="plan.note" data-d="${d}" data-i="${i}" value="${esc(it.note || '')}" placeholder="z. B. Spür-Satz davor"></div>
      </div>`).join('') + `<button class="secondary" style="margin-bottom:8px" data-act="set-planex-add" data-d="${d}">${icon('plus', 16)} Übung zu ${esc(p.name)}</button>`;
    return `<div class="planday ${open ? 'open' : ''}" id="planday-${d}">
      <button class="planhead" data-act="set-planday" data-d="${d}"><span><b>${esc(p.name)}</b> <span class="muted small">${esc(p.title || '')}</span></span><span class="muted small">${mainItems(p).length} Übungen · ${planSets(p)} Sätze ${icon(open ? 'up' : 'right', 14)}</span></button>
      ${items}</div>`;
  }).join('');
}
function renderSettings() {
  const s = S();
  const supps = s.supplements.map((x, i) => `
    <div class="suppset">
      <div class="listrow"><input class="inp strong" data-set="supp.name" data-i="${i}" value="${esc(x.name)}" placeholder="Name"><button class="del" data-act="set-supp-del" data-i="${i}" aria-label="Entfernen">${icon('x', 16)}</button></div>
      <div class="grid2">
        <div><label class="mini">Dosis</label><input class="inp" data-set="supp.dose" data-i="${i}" value="${esc(x.dose || '')}" placeholder="z. B. 5 g"></div>
        <div><label class="mini">Vorrat (Portionen)</label><input class="inp" type="number" inputmode="numeric" min="0" data-set="supp.stock" data-i="${i}" value="${isNum(x.stock) ? x.stock : ''}" placeholder="optional"></div>
      </div>
    </div>`).join('');
  const types = s.gym.types.map((t, i) => `<div class="listrow"><input class="inp" data-set="gym.type" data-i="${i}" value="${esc(t)}" placeholder="z. B. Cardio"><button class="del" data-act="set-type-del" data-i="${i}" aria-label="Entfernen">${icon('x', 16)}</button></div>`).join('');
  return `<header class="hero"><div class="eyebrow">Wird automatisch gespeichert</div><h1>Einstellungen</h1></header>
    ${card('Schlaf', `
      <label class="lbl">Idealbereich (Stunden)</label>
      <div class="grid2">
        <div class="field"><label class="mini">von</label><input class="inp" type="number" inputmode="decimal" step="0.25" min="3" max="14" data-set="sleep.idealMin" value="${idealMin() / 60}"></div>
        <div class="field"><label class="mini">bis</label><input class="inp" type="number" inputmode="decimal" step="0.25" min="3" max="14" data-set="sleep.idealMax" value="${idealMax() / 60}"></div>
      </div>
      <div class="field"><label class="lbl">Ins Bett um</label><input class="inp" type="time" data-set="sleep.bedTarget" value="${s.sleep.bedTarget}"></div>`)}
    ${card('Wasser', `
      <div class="field"><label class="lbl">Tagesziel (ml)</label><input class="inp" type="number" inputmode="numeric" step="250" min="250" data-set="water.goal" value="${s.water.goal}"></div>
      <div class="field"><label class="lbl">Schnell-Knöpfe (ml)</label><div class="grid3">${s.water.sizes.map((v, i) => `<input class="inp" type="number" inputmode="numeric" min="1" data-set="water.size" data-i="${i}" value="${v}">`).join('')}</div></div>
      <div class="field"><label class="lbl">Extra an Gym-Tagen (ml)</label><input class="inp" type="number" inputmode="numeric" step="250" min="0" data-set="water.gymBonus" value="${s.water.gymBonus}"><div class="hint">0 = aus. Sonst wird das an Trainingstagen zum Ziel dazugerechnet.</div></div>
      <div class="grid2">
        <div class="field"><label class="lbl">Trinkzeit von</label><input class="inp" type="time" data-set="water.dayStart" value="${s.water.dayStart}"></div>
        <div class="field"><label class="lbl">bis</label><input class="inp" type="time" data-set="water.dayEnd" value="${s.water.dayEnd}"></div>
      </div>
      <div class="hint" style="margin-top:-6px">Damit rechnet die App aus, ob du „im Plan“ liegst.</div>`)}
    ${card('Supplements', `${supps || emptyHint('Keine Supplements.')}<button class="secondary" data-act="set-supp-add">${icon('plus', 16)} Supplement hinzufügen</button>
      <div class="hint">Mit Vorrat zählt die App bei jedem Abhaken eine Portion runter und warnt dich, wenn es knapp wird.</div>`)}
    ${card('Trainingsplan', `<p class="foot" style="margin:0 0 8px">Tippe auf einen Tag zum Bearbeiten. Änderst du einen Namen, zählt die Übung in der Statistik als neue Übung.</p>
      ${planEditorHTML()}<button class="secondary danger" data-act="set-plan-reset">Plan auf Original zurücksetzen</button>`, '', 'plan-editor')}
    ${card('Gym', `
      <div class="field"><label class="lbl">Wochenziel (Trainings)</label><input class="inp" type="number" inputmode="numeric" min="1" max="7" data-set="gym.weeklyGoal" value="${s.gym.weeklyGoal}"></div>
      <label class="lbl">Weitere Trainingsarten (außer Plan)</label>${types}<button class="secondary" data-act="set-type-add">${icon('plus', 16)} Trainingsart hinzufügen</button>`)}
    ${card('Sicherung', `
      <p class="foot" style="margin:0 0 4px">Deine Daten liegen nur auf diesem Handy. Mach ab und zu eine Sicherung, z. B. bevor du den Browser-Verlauf löschst oder das Handy wechselst.</p>
      <button class="secondary" data-act="export">Sicherung speichern</button>
      <button class="secondary" data-act="import">Sicherung laden</button>
      <button class="secondary danger" data-act="reset">Alle Daten löschen</button>`)}
    <p class="foot" style="text-align:center">Routine · Version 4</p>`;
}
function settingChange(t) {
  const s = S(), f = t.dataset.set, i = Number(t.dataset.i), v = t.value;
  const num = (x, min = 0) => { const n = Math.round(Number(String(x).replace(',', '.'))); return isNaN(n) || n < min ? null : n; };
  const hrs = x => { const h = Number(String(x).replace(',', '.')); return h && h >= 3 && h <= 14 ? Math.round(h * 60) : null; };
  switch (f) {
    case 'water.goal': { const n = num(v, 250); if (!n) { toast('Bitte mindestens 250 ml'); t.value = s.water.goal; return; } s.water.goal = n; const td = db.days[todayKey()]; if (td) td.goal = n; break; }
    case 'water.size': { const n = num(v, 1); if (!n) { toast('Bitte eine gültige Menge'); t.value = s.water.sizes[i]; return; } s.water.sizes[i] = n; break; }
    case 'water.gymBonus': s.water.gymBonus = num(v, 0) || 0; break;
    case 'water.dayStart': case 'water.dayEnd': if (v) s.water[f.split('.')[1]] = v; break;
    case 'supp.name': if (v.trim()) s.supplements[i].name = v.trim(); else t.value = s.supplements[i].name; break;
    case 'supp.dose': s.supplements[i].dose = v.trim(); break;
    case 'supp.stock': s.supplements[i].stock = v === '' ? null : (num(v, 0) ?? 0); break;
    case 'gym.weeklyGoal': s.gym.weeklyGoal = Math.min(7, Math.max(1, num(v, 1) || 1)); t.value = s.gym.weeklyGoal; break;
    case 'gym.type': if (v.trim()) s.gym.types[i] = v.trim(); else { s.gym.types.splice(i, 1); render(); } break;
    case 'sleep.idealMin': case 'sleep.idealMax': {
      const m = hrs(v); if (!m) { toast('Bitte zwischen 3 und 14 Stunden'); t.value = (f === 'sleep.idealMin' ? idealMin() : idealMax()) / 60; return; }
      s.sleep[f.split('.')[1]] = m;
      if (s.sleep.idealMin > s.sleep.idealMax) [s.sleep.idealMin, s.sleep.idealMax] = [s.sleep.idealMax, s.sleep.idealMin];
      s.sleep.goalMin = Math.round((s.sleep.idealMin + s.sleep.idealMax) / 2);
      break;
    }
    case 'sleep.bedTarget': if (v) s.sleep.bedTarget = v; break;
    case 'plan.name': case 'plan.sets': case 'plan.reps': case 'plan.rest': case 'plan.muscle': case 'plan.note': {
      const it = s.gym.plan[Number(t.dataset.d)].items[i];
      if (f === 'plan.name') { if (v.trim()) it.name = v.trim(); else t.value = it.name; }
      if (f === 'plan.sets') { it.sets = Math.min(10, Math.max(1, num(v, 1) || 1)); t.value = it.sets; }
      if (f === 'plan.reps') { if (v.trim()) it.reps = v.trim().replace('-', '–'); else t.value = it.reps; }
      if (f === 'plan.rest') { it.rest = num(v, 0) || 60; t.value = it.rest; }
      if (f === 'plan.muscle') it.muscle = v;
      if (f === 'plan.note') it.note = v.trim();
      break;
    }
    default: return;
  }
  save(); toast('Gespeichert');
}

/* =====================================================
   AKTIONEN (alle Klicks)
   ===================================================== */
const actions = {
  nav: el => {
    const v = el.dataset.view;
    if (v === 'home' && nav.view === 'home') current = todayKey();
    go({ view: v });
  },
  'open-cat': el => go({ view: 'cat', cat: el.dataset.c }),
  back: () => { if (history.state && history.state.nav && history.length > 1) history.back(); else go({ view: 'home' }); },
  sub: el => { sub[nav.cat] = el.dataset.s; render(); window.scrollTo(0, 0); },
  'open-ex': el => go({ view: 'exercise', ex: el.dataset.n }),
  'edit-plan': () => { planOpen = 0; go({ view: 'settings' }); setTimeout(() => { const e = $('plan-editor'); if (e) e.scrollIntoView({ behavior: 'smooth' }); }, 50); },
  'day-prev': () => { current = addDays(current, -1); render(); },
  'day-next': () => { if (current < todayKey()) { current = addDays(current, 1); render(); } },
  'day-today': () => { current = todayKey(); render(); },
  'pick-day': el => { current = el.dataset.k; if (nav.view !== 'home') go({ view: 'home' }); else render(); },
  'pick-day-gym': el => { current = el.dataset.k; sub.gym = 'training'; render(); window.scrollTo(0, 0); },

  /* Wasser */
  drink: el => { drink = el.dataset.id; buzz(); render(); },
  'water-add': el => addWater(Number(el.dataset.ml), drink),
  'water-undo': () => { const d = day(current, true); if (!d.water.length) return; const last = d.water.pop(); save(); buzz(); render(); toast(`${fmtMl(last.ml)} entfernt`); },
  'water-del': el => { const d = day(current, true), i = d.water.findIndex(w => w.id === el.dataset.id); if (i < 0) return; const [w] = d.water.splice(i, 1); save(); buzz(); render(); toast(`${fmtMl(w.ml)} entfernt`); },
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
    const k = current, id = el.dataset.id, d = day(k, true), sp = S().supplements.find(x => x.id === id);
    if (d.supps[id]) { delete d.supps[id]; if (sp && isNum(sp.stock)) sp.stock = Number(sp.stock) + 1; }
    else {
      d.supps[id] = { t: k === todayKey() ? timeNow() : null };
      if (sp && isNum(sp.stock)) {
        sp.stock = Math.max(0, Number(sp.stock) - 1);
        if ([7, 3, 0].includes(sp.stock)) setTimeout(() => toast(sp.stock ? `${sp.name}: nur noch ${sp.stock} Portionen` : `${sp.name} ist leer – nachkaufen`), 1200);
      }
      if (allSupps(k)) { celebrate('c-supp'); toast('Alle Supplements genommen'); }
    }
    save(); buzz(); render();
  },

  /* Schlaf */
  'sleep-edit': el => {
    const k = el.dataset.k || current, s = day(k).sleep;
    const draft = s ? clone(s) : { bed: S().sleep.bedTarget, wake: '07:00', quality: null, wakeups: 0, note: '' };
    if (!s && db.pendingBed && pendingWakeDay() === k) { draft.bed = pendingBedTime(); draft.wake = k === todayKey() ? timeNow() : ''; }
    openSheet('sleep', k, draft);
  },
  'sleep-bed': () => { db.pendingBed = new Date().toISOString(); save(); buzz(); render(); toast('Gute Nacht – morgen früh einfach „Aufgewacht“ drücken'); },
  'sleep-cancel': () => { db.pendingBed = null; save(); render(); },
  'sleep-wake': () => {
    const k = todayKey(), draft = { bed: pendingBedTime(), wake: timeNow(), quality: null, wakeups: 0, note: '' };
    if ((Date.now() - new Date(db.pendingBed).getTime()) / 3600000 > 15) { openSheet('sleep', k, draft); toast('Das wären über 15 Stunden – bitte die Zeiten prüfen'); return; }
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
    save(); closeSheet(true); toast('Schlaf gespeichert');
  },
  'sleep-del': () => { if (!confirm('Schlaf-Eintrag löschen?')) return; day(sheet.k, true).sleep = null; save(); closeSheet(true); },

  /* Gym */
  'gym-edit': () => {
    const dr = loadDraft(current);
    if (dr) { openSheet('gym', current, dr, true); return; }
    const g = day(current).gym;
    openSheet('gym', current, g && g.done ? clone(g) : { done: true, type: null, duration: '', rpe: null, exercises: [], note: '', startedAt: current === todayKey() ? Date.now() : null });
  },
  'gym-start': el => {
    const pd = planDay(el.dataset.t); if (!pd) return;
    if (loadDraft(current) && !confirm('Es läuft schon ein Training. Neu starten und das alte verwerfen?')) return;
    clearDraft();
    openSheet('gym', current, { done: true, type: pd.name, duration: '', rpe: null, note: '', exercises: exercisesFromPlan(pd, current), startedAt: current === todayKey() ? Date.now() : null });
  },
  'gym-rest': () => { const d = day(current, true); d.gym = d.gym && d.gym.rest ? null : { rest: true }; save(); buzz(); render(); },
  'gs-type': el => {
    const d = sheet.draft, t = el.dataset.t;
    d.type = d.type === t ? null : t;
    const pd = planDay(d.type), touched = (d.exercises || []).some(e => (e.sets || []).some(s => s.reps !== '' || s.done));
    if (pd && !touched) d.exercises = exercisesFromPlan(pd, sheet.k);
    sheet.dirty = true; drawSheet();
  },
  'gs-loadplan': () => { const pd = planDay(sheet.draft.type); if (!pd) return; sheet.draft.exercises = exercisesFromPlan(pd, sheet.k).concat(sheet.draft.exercises || []); sheet.dirty = true; drawSheet(); },
  'gs-info': () => { sheet.info = !sheet.info; drawSheet(); },
  'gs-tpl': el => {
    const g = db.days[el.dataset.from].gym;
    sheet.draft.exercises = clone(g.exercises.filter(e => e.name)).map(e => ({ ...e, sets: e.sets.map(s => ({ reps: '', kg: s.kg })) }));
    sheet.dirty = true; drawSheet(); toast('Übernommen – trag deine Wiederholungen ein');
  },
  'gs-dur': el => { sheet.draft.duration = Number(el.dataset.m); sheet.dirty = true; drawSheet(); },
  'gs-rpe': el => { sheet.draft.rpe = Number(el.dataset.r); sheet.dirty = true; buzz(); drawSheet(); },
  'gs-exadd': () => {
    sheet.draft.exercises = sheet.draft.exercises || [];
    sheet.draft.exercises.push({ name: '', machine: '', sets: [{ reps: '', kg: '' }, { reps: '', kg: '' }, { reps: '', kg: '' }] });
    sheet.dirty = true; drawSheet();
    const ins = $('sheetBody').querySelectorAll('[data-in="ex.name"]');
    if (ins.length) { ins[ins.length - 1].focus(); ins[ins.length - 1].scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  },
  'gs-exdel': el => {
    const e = sheet.draft.exercises[Number(el.dataset.i)];
    if ((e.name || (e.sets || []).some(s => s.reps !== '')) && !confirm(`„${e.name || 'Übung'}“ für heute entfernen?`)) return;
    sheet.draft.exercises.splice(Number(el.dataset.i), 1); sheet.dirty = true; drawSheet();
  },
  'gs-setadd': el => { const e = sheet.draft.exercises[Number(el.dataset.i)], last = e.sets[e.sets.length - 1]; e.sets.push({ reps: '', kg: last ? last.kg : '' }); sheet.dirty = true; drawSheet(); },
  'gs-setdel': el => { sheet.draft.exercises[Number(el.dataset.i)].sets.splice(Number(el.dataset.j), 1); sheet.dirty = true; drawSheet(); },
  'gs-setdone': el => {
    const i = Number(el.dataset.i), j = Number(el.dataset.j), e = sheet.draft.exercises[i], s = e.sets[j];
    if (!s.done && (s.reps === '' || s.reps == null)) { toast('Trag erst die Wiederholungen ein'); const inp = $('sheetBody').querySelector(`[data-in="set.reps"][data-i="${i}"][data-j="${j}"]`); if (inp) inp.focus(); return; }
    s.done = !s.done; sheet.dirty = true; buzz();
    if (s.done) {
      const nextOpen = e.sets.findIndex(x => !x.done);
      const nextEx = sheet.draft.exercises.slice(i + 1).find(x => (x.sets || []).some(y => !y.done));
      const label = nextOpen >= 0 ? `${e.name} · Satz ${nextOpen + 1}` : (nextEx ? `Weiter: ${nextEx.name || 'nächste Übung'}` : 'Letzte Pause');
      if (nextOpen >= 0 || nextEx) startRest(Number(el.dataset.rest) || 90, label); else { stopRest(); toast('Alle Sätze geschafft – jetzt speichern'); }
    }
    drawSheet();
  },
  'rest-plus': () => { if (rest) { rest.end += 15000; rest.total += 15; drawRest(); } },
  'rest-stop': () => stopRest(),
  'gs-save': () => {
    const d = clone(sheet.draft), k = sheet.k, wasDone = gymDone(k);
    const cleanV = v => v === '' || v == null || isNaN(Number(v)) ? '' : Number(v);
    d.done = true;
    d.exercises = (d.exercises || []).filter(e => e.name && e.name.trim()).map(e => {
      const o = { name: e.name.trim(), sets: (e.sets || []).filter(s => s.reps !== '' && s.reps != null).map(s => ({ reps: cleanV(s.reps), kg: cleanV(s.kg) })) };
      if (e.plan) o.plan = e.plan;
      if (e.machine && e.machine.trim()) o.machine = e.machine.trim();
      const m = muscleOf(e); if (m) o.muscle = m;
      return o;
    }).filter(e => e.sets.length);
    if (!d.duration && d.startedAt) { const m = Math.round((Date.now() - d.startedAt) / 60000); if (m >= 5 && m <= 300) d.duration = m; }
    d.duration = d.duration ? Number(d.duration) : '';
    delete d.startedAt;
    if (!d.time) d.time = k === todayKey() ? timeNow() : null;
    day(k, true).gym = d; save(); clearDraft(); closeSheet(true);
    const prs = d.exercises.filter(e => isPR(k, e));
    if (prs.length) { celebrate('c-gym'); toast(`Neuer Rekord: ${prs.map(e => e.name).join(', ')}`); }
    else toast(wasDone ? 'Gespeichert' : 'Stark – Training gespeichert');
  },
  'gs-del': () => { if (!confirm('Training löschen?')) return; day(sheet.k, true).gym = null; save(); clearDraft(); closeSheet(true); },
  'gs-discard': () => { if (!confirm('Dieses Training verwerfen? Alle Einträge darin gehen verloren.')) return; clearDraft(); closeSheet(true); },
  'sheet-close': () => closeSheet(),

  /* Grafiken & Kalender */
  range: el => { range = Number(el.dataset.n); render(); },
  'chart-pt': el => { buzz(); toast(el.dataset.info); },
  'cal-prev': () => { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1); render(); },
  'cal-next': () => { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1); render(); },

  /* Einstellungen */
  'set-supp-add': () => {
    S().supplements.push({ id: 's' + uid(), name: 'Neues Supplement', dose: '', stock: null }); save(); render();
    const ins = document.querySelectorAll('[data-set="supp.name"]'), last = ins[ins.length - 1]; if (last) { last.focus(); last.select(); }
  },
  'set-supp-del': el => {
    const i = Number(el.dataset.i), x = S().supplements[i];
    if (!confirm(`${x.name} entfernen? Bisherige Einträge bleiben in der Statistik.`)) return;
    S().supplements.splice(i, 1); save(); render();
  },
  'set-type-add': () => { S().gym.types.push(''); render(); const ins = document.querySelectorAll('[data-set="gym.type"]'); if (ins.length) ins[ins.length - 1].focus(); },
  'set-type-del': el => { S().gym.types.splice(Number(el.dataset.i), 1); save(); render(); },
  'set-planday': el => { const d = Number(el.dataset.d); planOpen = planOpen === d ? -1 : d; render(); const e = $('planday-' + d); if (e && planOpen === d) e.scrollIntoView({ block: 'start' }); },
  'set-planex-add': el => {
    S().gym.plan[Number(el.dataset.d)].items.push({ name: 'Neue Übung', sets: 3, reps: '10–12', rest: 60, muscle: 'Sonstiges', note: '' });
    save(); render();
    const ins = document.querySelectorAll(`[data-set="plan.name"][data-d="${el.dataset.d}"]`), last = ins[ins.length - 1]; if (last) { last.focus(); last.select(); }
  },
  'set-planex-del': el => {
    const p = S().gym.plan[Number(el.dataset.d)], it = p.items[Number(el.dataset.i)];
    if (!confirm(`„${it.name}“ aus dem ${p.name}-Plan entfernen?`)) return;
    p.items.splice(Number(el.dataset.i), 1); save(); render();
  },
  'set-planex-up': el => { const p = S().gym.plan[Number(el.dataset.d)], i = Number(el.dataset.i); if (i > 0) { [p.items[i - 1], p.items[i]] = [p.items[i], p.items[i - 1]]; save(); render(); } },
  'set-plan-reset': () => { if (!confirm('Trainingsplan auf das Original zurücksetzen? Deine Änderungen am Plan gehen verloren (Trainings bleiben).')) return; S().gym.plan = clone(DEFAULT_PLAN); save(); render(); toast('Plan zurückgesetzt'); },
  export: () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `routine-sicherung-${todayKey()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  import: () => $('importFile').click(),
  reset: () => {
    if (!confirm('Wirklich ALLE Daten löschen? Das kann man nicht rückgängig machen.')) return;
    if (!confirm('Ganz sicher? Vielleicht vorher eine Sicherung speichern?')) return;
    db = migrate({ days: {} }); save(); clearDraft(); current = todayKey(); render(); toast('Alles gelöscht');
  }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.act];
  if (fn) fn(el, e);
});
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
    case 'ex.machine': d.exercises[Number(t.dataset.i)].machine = t.value; break;
    case 'set.reps': d.exercises[Number(t.dataset.i)].sets[Number(t.dataset.j)].reps = t.value; break;
    case 'set.kg': d.exercises[Number(t.dataset.i)].sets[Number(t.dataset.j)].kg = t.value.replace(',', '.'); break;
    case 'w.ml': d.ml = t.value; break;
    case 'w.t': d.t = t.value; break;
  }
  if (sheet.type === 'gym') saveDraft();
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.set) return settingChange(t);
  if (t.dataset.in === 'ex.name' && sheet) { const box = $('lt-' + t.dataset.i); if (box) box.innerHTML = lastTimeText(t.value, sheet.k); }
});
$('importFile').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!data || typeof data !== 'object' || !data.days || !data.settings) throw 0;
    if (!confirm('Sicherung laden? Die aktuellen Daten auf diesem Handy werden ersetzt.')) return;
    db = migrate(data); save(); current = todayKey(); render(); toast('Sicherung geladen');
  } catch (err) { toast('Das ist keine gültige Sicherung'); }
});

// Wischen links/rechts wechselt den Tag (auf Startseite und Tages-Ansichten)
let sx = null, sy = null;
$('app').addEventListener('touchstart', e => {
  if (e.target.closest('.chips, input, textarea, .axchart, .heat')) { sx = null; return; }
  sx = e.touches[0].clientX; sy = e.touches[0].clientY;
}, { passive: true });
$('app').addEventListener('touchend', e => {
  if (sx === null || sheet || !dayIsLive()) return;
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  sx = null;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) actions[dx > 0 ? 'day-prev' : 'day-next']();
}, { passive: true });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheet) closeSheet(); });

let lastSeenToday = todayKey();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const tk = todayKey();
  if (tk !== lastSeenToday) { if (current === lastSeenToday) current = tk; lastSeenToday = tk; }
  if (!sheet) render();
  else if (sheet.type === 'gym') { keepAwake(true); drawRest(); }
});

save();
render();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
