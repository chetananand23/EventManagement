(() => {
  const $ = (s) => document.querySelector(s);
  const grid = $("#grid"), empty = $("#empty"), search = $("#search"), filters = $("#filters");
  const modal = $("#modal"), form = $("#regForm"), success = $("#success"), select = $("#eventSelect");
  const state = { query: "", category: "All" };

  const fmt = (iso) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const upcoming = () => EVENTS.filter(e => new Date(e.date) > new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const banner = (e) => e.image
    ? `background:url('${e.image}') center/cover`
    : `background:linear-gradient(135deg,${e.colors[0]},${e.colors[1]})`;

  /* ---------- Theme ---------- */
  const themeBtn = $("#themeToggle");
  const setTheme = (t) => {
    document.documentElement.dataset.theme = t;
    themeBtn.textContent = t === "dark" ? "☀️" : "🌙";
    try { localStorage.setItem("kx-theme", t); } catch {}
  };
  let saved = null;
  try { saved = localStorage.getItem("kx-theme"); } catch {}
  setTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  /* ---------- Events grid ---------- */
  function renderFilters() {
    const cats = ["All", ...new Set(EVENTS.map(e => e.category))];
    filters.innerHTML = cats.map(c => `<button class="chip${c === state.category ? " active" : ""}" data-cat="${c}" aria-pressed="${c === state.category}">${c}</button>`).join("");
  }

  function renderGrid() {
    const q = state.query.toLowerCase();
    const list = EVENTS.filter(e =>
      (state.category === "All" || e.category === state.category) &&
      [e.name, e.venue, e.short, e.category].join(" ").toLowerCase().includes(q)
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    grid.innerHTML = list.map(e => `
      <article class="card">
        <div class="banner" style="${banner(e)}"><span>${e.image ? "" : e.emoji}</span><em>${e.category}</em></div>
        <div class="card-body">
          <h3>${e.name}</h3>
          <p class="meta">${fmt(e.date)}<br>${e.venue}</p>
          <p>${e.short}</p>
          <button class="btn small" data-id="${e.id}">View details</button>
        </div>
      </article>`).join("");
    empty.hidden = list.length > 0;
  }

  search.addEventListener("input", (e) => { state.query = e.target.value.trim(); renderGrid(); });
  filters.addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    state.category = b.dataset.cat; renderFilters(); renderGrid();
  });
  grid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-id]"); if (b) openModal(+b.dataset.id);
  });

  /* ---------- Modal ---------- */
  function openModal(id) {
    const e = EVENTS.find(x => x.id === id);
    $("#mBanner").setAttribute("style", banner(e));
    $("#mBanner").innerHTML = `<span>${e.image ? "" : e.emoji}</span>`;
    $("#mTitle").textContent = e.name;
    $("#mMeta").textContent = `${fmt(e.date)} · ${e.venue}`;
    $("#mDesc").textContent = e.description;
    select.innerHTML = `<option value="">Choose an event</option>` +
      EVENTS.map(x => `<option value="${x.id}">${x.name}</option>`).join("");
    select.value = id;
    form.reset(); select.value = id;
    clearErrors(); form.hidden = false; success.hidden = true;
    modal.showModal();
  }
  $("#closeModal").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  /* ---------- Validation ---------- */
  const rules = {
    name: (v) => /^[A-Za-z][A-Za-z .'-]{2,}$/.test(v) ? "" : "Enter your full name (letters only, at least 3 characters).",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter a valid email, like name@example.com.",
    phone: (v) => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")) ? "" : "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.",
    event: (v) => v ? "" : "Choose the event you want to attend."
  };
  const showError = (f, msg) => {
    form.querySelector(`[data-for="${f}"]`).textContent = msg;
    form.elements[f].setAttribute("aria-invalid", msg ? "true" : "false");
  };
  const clearErrors = () => Object.keys(rules).forEach(f => showError(f, ""));

  Object.keys(rules).forEach(f => form.elements[f].addEventListener("blur", () => showError(f, rules[f](form.elements[f].value.trim()))));

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    let ok = true, firstBad = null;
    Object.keys(rules).forEach(f => {
      const msg = rules[f](form.elements[f].value.trim());
      showError(f, msg);
      if (msg) { ok = false; firstBad = firstBad || form.elements[f]; }
    });
    if (!ok) return firstBad.focus();

    const ev2 = EVENTS.find(x => x.id === +form.elements.event.value);
    const entry = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      eventId: ev2.id, eventName: ev2.name, at: new Date().toISOString()
    };
    try {
      const all = JSON.parse(localStorage.getItem("kx-registrations") || "[]");
      all.push(entry);
      localStorage.setItem("kx-registrations", JSON.stringify(all));
    } catch {}
    form.hidden = true;
    success.hidden = false;
    success.innerHTML = `<h4>You're registered, ${entry.name.split(" ")[0]}!</h4>
      <p>${ev2.name} on ${fmt(ev2.date)} at ${ev2.venue}. We've saved your registration for ${entry.email}.</p>
      <button class="btn small" id="doneBtn">Done</button>`;
    $("#doneBtn").addEventListener("click", () => modal.close());
  });

  /* ---------- Countdown ---------- */
  function tick() {
    const next = upcoming()[0];
    if (!next) { $("#cdName").textContent = "No upcoming events"; return; }
    $("#cdName").textContent = next.name;
    let s = Math.max(0, Math.floor((new Date(next.date) - new Date()) / 1000));
    const p = (n) => String(n).padStart(2, "0");
    $("#cdD").textContent = p(Math.floor(s / 86400)); s %= 86400;
    $("#cdH").textContent = p(Math.floor(s / 3600)); s %= 3600;
    $("#cdM").textContent = p(Math.floor(s / 60));
    $("#cdS").textContent = p(s % 60);
  }

  renderFilters(); renderGrid(); tick(); setInterval(tick, 1000);
})();
