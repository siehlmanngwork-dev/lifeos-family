import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, writeBatch, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);
const show = (id, on) => ($(id).hidden = !on);

// ---------- Theme (per device) ----------
const applyTheme = (t) => { document.documentElement.dataset.theme = t; localStorage.setItem("dashboard.theme", t); };
applyTheme(localStorage.getItem("dashboard.theme") ||
  (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
$("theme").onclick = () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");

// ---------- Setup check ----------
if (firebaseConfig.apiKey.startsWith("YOUR_")) {
  show("setup", true);
  throw new Error("Fill in firebase-config.js first.");
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------- State ----------
let todos = [];
let filter = "all";
let events = [];
let customTypes = [];
let pendingType = null;
let unsubscribes = [];
let uid = null;
const col = () => collection(db, "users", uid, "todos");
const ecol = () => collection(db, "users", uid, "events");
const tcol = () => collection(db, "users", uid, "eventTypes");

// Event types: each has a name and a colour. Built-ins plus your own (stored in Firestore).
const DEFAULT_TYPES = [
  { id: "meeting", name: "Meeting", color: "#4f6df5" },
  { id: "study", name: "Study", color: "#8b5cf6" },
  { id: "personal", name: "Personal", color: "#14b8a6" },
  { id: "birthday", name: "Birthday", color: "#ec4899" },
  { id: "other", name: "Other", color: "#64748b" },
];
const allTypes = () => [...DEFAULT_TYPES, ...customTypes];
const typeOf = (e) => allTypes().find((t) => t.id === e.type) || { name: "Event", color: "#4f6df5" };
const today = () => new Date().toLocaleDateString("sv"); // YYYY-MM-DD in local time

// ---------- Clock ----------
function tick() {
  const now = new Date();
  const h = now.getHours();
  $("greeting").textContent = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  $("date").textContent = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  $("clock").textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
tick();
setInterval(tick, 15000);

// ---------- Auth ----------
let signUp = false;
$("auth-toggle").onclick = () => {
  signUp = !signUp;
  $("auth-submit").textContent = signUp ? "Create account" : "Sign in";
  $("auth-toggle").textContent = signUp ? "Have an account? Sign in" : "No account yet? Create one";
  $("password").autocomplete = signUp ? "new-password" : "current-password";
  $("auth-msg").textContent = "";
};

const friendly = (e) => ({
  "auth/invalid-credential": "Wrong email or password.",
  "auth/email-already-in-use": "That email already has an account. Sign in instead.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-email": "That email address looks invalid.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase yet.",
}[e.code] || e.message);

$("auth-form").onsubmit = async (e) => {
  e.preventDefault();
  $("auth-msg").textContent = "";
  try {
    const fn = signUp ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
    await fn(auth, $("email").value.trim(), $("password").value);
  } catch (err) {
    $("auth-msg").textContent = friendly(err);
  }
};

$("logout").onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
  unsubscribes.forEach((u) => u());
  unsubscribes = [];
  if (!user) {
    uid = null; todos = []; events = []; customTypes = [];
    show("app", false); show("auth", true);
    return;
  }
  uid = user.uid;
  $("user").textContent = user.email;
  $("password").value = "";
  show("auth", false); show("app", true);
  $("sync").textContent = "· syncing…";
  unsubscribes.push(onSnapshot(col(), (snap) => {
    todos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    $("sync").textContent = snap.metadata.hasPendingWrites ? "· saving…" : "· synced";
    render();
  }, (err) => {
    $("sync").textContent = "· sync error: " + err.code;
  }));
  unsubscribes.push(onSnapshot(ecol(), (snap) => {
    events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderCalendar();
  }, (err) => {
    $("sync").textContent = "· sync error: " + err.code;
  }));
  unsubscribes.push(onSnapshot(tcol(), (snap) => {
    customTypes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderTypeOptions();
    renderCalendar();
  }, (err) => {
    $("sync").textContent = "· sync error: " + err.code;
  }));
});

// ---------- Render ----------
function render() {
  const list = $("list");
  list.innerHTML = "";
  const order = { high: 0, med: 1, low: 2 };
  const shown = todos
    .filter((t) => filter === "all" || (filter === "done") === !!t.done)
    .sort((a, b) => (a.done - b.done) || order[a.priority] - order[b.priority]);

  for (const t of shown) {
    const li = document.createElement("li");
    if (t.done) li.className = "done";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!t.done;
    cb.onchange = () => updateDoc(doc(col(), t.id), { done: cb.checked });

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = t.text;

    const tag = document.createElement("span");
    tag.className = "tag " + t.priority;
    tag.textContent = t.priority === "med" ? "medium" : t.priority;

    li.append(cb, label, tag);

    if (t.due) {
      const due = document.createElement("span");
      due.className = "due" + (!t.done && t.due < today() ? " overdue" : "");
      due.textContent = t.due;
      li.append(due);
    }

    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "×";
    del.title = "Delete";
    del.onclick = () => deleteDoc(doc(col(), t.id));
    li.append(del);

    list.append(li);
  }
  $("empty").hidden = shown.length > 0;

  const done = todos.filter((t) => t.done).length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;
  $("s-total").textContent = todos.length;
  $("s-done").textContent = done;
  $("s-open").textContent = todos.length - done;
  $("s-overdue").textContent = todos.filter((t) => !t.done && t.due && t.due < today()).length;
  $("pct").textContent = pct + "%";
  $("bar").style.width = pct + "%";
  renderCalendar();
}

// ---------- Calendar ----------
const dayKey = (d) => d.toLocaleDateString("sv"); // local YYYY-MM-DD
let calMonth = new Date(); calMonth.setDate(1);
let selectedDay = today();

// Monday-first weekday header (2024-01-01 was a Monday)
$("cal-weekdays").replaceChildren(...Array.from({ length: 7 }, (_, i) => {
  const s = document.createElement("span");
  s.textContent = new Date(2024, 0, 1 + i).toLocaleDateString(undefined, { weekday: "short" });
  return s;
}));

const dayItems = (k) => ({
  deadlines: todos.filter((t) => t.due === k),
  evs: events.filter((e) => e.date === k).sort((a, b) => (a.time || "").localeCompare(b.time || "")),
});

function chip(cls, text, color) {
  const s = document.createElement("span");
  s.className = "ci " + cls;
  s.textContent = text;
  if (color) s.style.setProperty("--c", color);
  return s;
}
// Events: solid pill in the type's colour. Tasks: outlined card with a checkbox glyph
// and a priority-coloured edge, so the two kinds are distinguishable at a glance.
const eventChip = (e, withTime = true) => chip("event", (withTime && e.time ? e.time + " " : "") + e.title, typeOf(e).color);
const taskChip = (t, text = t.text) => chip("task p-" + t.priority + (t.done ? " done" : ""), (t.done ? "☑ " : "☐ ") + text);

function renderCalendar() {
  const y = calMonth.getFullYear(), m = calMonth.getMonth();
  $("cal-title").textContent = calMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const grid = $("cal-grid");
  grid.replaceChildren();

  for (let i = 0; i < 42; i++) {
    const d = new Date(y, m, 1 - offset + i);
    const k = dayKey(d);
    const { deadlines, evs } = dayItems(k);

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "day" + (d.getMonth() !== m ? " other" : "") + (k === today() ? " today" : "") + (k === selectedDay ? " selected" : "");
    cell.onclick = () => { selectedDay = k; renderCalendar(); };

    const num = document.createElement("span");
    num.className = "num";
    num.textContent = d.getDate();
    const marks = document.createElement("div");
    marks.className = "marks";

    const all = [
      ...evs.map((e) => eventChip(e)),
      ...deadlines.map((t) => taskChip(t)),
    ];
    all.slice(0, 3).forEach((c) => marks.append(c));
    if (all.length > 3) marks.append(chip("more", "+" + (all.length - 3)));

    cell.append(num, marks);
    grid.append(cell);
  }
  renderDayDetail();
}

function renderDayDetail() {
  const box = $("day-detail");
  box.replaceChildren();
  const { deadlines, evs } = dayItems(selectedDay);

  const h = document.createElement("h4");
  h.textContent = new Date(selectedDay + "T00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  box.append(h);

  if (!deadlines.length && !evs.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "Nothing scheduled.";
    box.append(p);
    return;
  }

  for (const e of evs) {
    const row = document.createElement("div");
    row.className = "dd-row";
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = (e.time ? e.time + "  " : "") + e.title;
    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "×";
    del.title = "Delete event";
    del.onclick = () => deleteDoc(doc(ecol(), e.id));
    row.append(chip("event", typeOf(e).name, typeOf(e).color), label, del);
    box.append(row);
  }
  for (const t of deadlines) {
    const row = document.createElement("div");
    row.className = "dd-row" + (t.done ? " done" : "");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!t.done;
    cb.onchange = () => updateDoc(doc(col(), t.id), { done: cb.checked });
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = t.text;
    row.append(cb, label, chip("task p-" + t.priority, "Deadline"));
    box.append(row);
  }
}

function renderLegend() {
  const lg = $("legend");
  lg.replaceChildren();
  for (const t of allTypes()) {
    const s = document.createElement("span");
    s.append(chip("event swatch", "", t.color), " " + t.name);
    lg.append(s);
  }
  const task = document.createElement("span");
  task.append(chip("task swatch p-med", ""), " Task deadline");
  lg.append(task);
}

function renderTypeOptions() {
  const sel = $("ev-type");
  const keep = pendingType || sel.value || "meeting";
  sel.replaceChildren(...allTypes().map((t) => {
    const o = document.createElement("option");
    o.value = t.id;
    o.textContent = t.name;
    return o;
  }));
  if (allTypes().some((t) => t.id === keep)) sel.value = keep;
  if (pendingType && allTypes().some((t) => t.id === pendingType)) pendingType = null;
  renderLegend();
}
renderTypeOptions();

$("type-new-btn").onclick = () => { $("type-new").hidden = !$("type-new").hidden; $("type-name").focus(); };
$("type-save").onclick = async () => {
  const name = $("type-name").value.trim();
  if (!name || !uid) return;
  $("type-name").value = "";
  $("type-new").hidden = true;
  const ref = await addDoc(tcol(), { name, color: $("type-color").value });
  pendingType = ref.id;
  renderTypeOptions();
};

const shiftMonth = (n) => { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + n, 1); renderCalendar(); };
$("cal-prev").onclick = () => shiftMonth(-1);
$("cal-next").onclick = () => shiftMonth(1);
$("cal-today").onclick = () => {
  calMonth = new Date(); calMonth.setDate(1);
  selectedDay = today();
  renderCalendar();
};

// Add-event dialog
const dlg = $("event-dialog");
$("event-add").onclick = () => {
  const type = $("ev-type").value;
  $("event-form").reset();
  $("ev-type").value = type; // remember the last-used type
  $("type-new").hidden = true;
  $("ev-date").value = selectedDay;
  dlg.showModal();
  $("ev-title").focus();
};
$("ev-cancel").onclick = () => dlg.close();
$("event-form").onsubmit = async (e) => {
  e.preventDefault();
  const title = $("ev-title").value.trim();
  const date = $("ev-date").value;
  if (!title || !date || !uid) return;
  dlg.close();
  await addDoc(ecol(), { title, date, type: $("ev-type").value, time: $("ev-time").value, created: serverTimestamp() });
  selectedDay = date;
  calMonth = new Date(date + "T00:00"); calMonth.setDate(1);
  renderCalendar();
};

// ---------- Actions ----------
$("form").onsubmit = async (e) => {
  e.preventDefault();
  const text = $("text").value.trim();
  if (!text || !uid) return;
  const data = { text, priority: $("priority").value, due: $("due").value, done: false, created: serverTimestamp() };
  e.target.reset();
  $("priority").value = "med";
  await addDoc(col(), data);
};

document.querySelectorAll(".chip[data-f]").forEach((b) => {
  b.onclick = () => {
    filter = b.dataset.f;
    document.querySelectorAll(".chip[data-f]").forEach((x) => x.classList.toggle("active", x === b));
    render();
  };
});

$("clear").onclick = async () => {
  const batch = writeBatch(db);
  todos.filter((t) => t.done).forEach((t) => batch.delete(doc(col(), t.id)));
  await batch.commit();
};
