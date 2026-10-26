(function () {
  "use strict";

  var DATA = window.PROFILE_DATA;
  var STORAGE_KEY = "shraddha-portfolio-v2";
  var UI_KEY = "shraddha-portfolio-ui-v2";
  // Profile match out of 100: how closely you meet what the role asks for.
  var W = { exp: 40, skills: 30, resume: 15, proof: 10, referral: 5 };
  var TIERS = [
    { min: 90, key: "now", label: "Strong match", note: "90% and above" },
    { min: 75, key: "prep", label: "Apply now", note: "75–89%" },
    { min: 60, key: "build", label: "Apply with prep", note: "60–74%" },
    { min: 0, key: "long", label: "Long-term goal", note: "below 60%" },
  ];
  var MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  var VIEWS = ["dashboard", "jobs", "ai", "roles", "companies", "resume", "skills", "learning", "profile"];
  // Same test the job feed uses: AI roles, or AI words in the title. The feed also flags jobs by description (job.ai).
  var AI_ROLE_IDS = ["aidata", "aiops", "aigov"];
  var AI_TITLE = /\b(ai|aiml|genai|gen ai|generative|llms?|ml|machine learning|agi|artificial intelligence|annotation|annotator|rater|data associate|language data|prompt)\b/i;

  // Stroke icons drawn in the Tabler style that Homarr uses.
  var ICONS = {
    menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    search: '<circle cx="10" cy="10" r="7"/><path d="M21 21l-6-6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M3 12h1m8-9v1m8 8h1m-9 8v1M5.6 5.6l.7.7m12.1-.7-.7.7m0 11.4.7.7m-12.1-.7-.7.7"/>',
    moon: '<path d="M12 3h.393a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992z"/>',
    home: '<path d="M5 12H3l9-9 9 9h-2"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/><path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>',
    target: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="9"/>',
    bolt: '<path d="M13 3v7h6l-8 11v-7H5l8-11"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M12 12v.01"/><path d="M3 13a20 20 0 0 0 18 0"/>',
    book: '<path d="M3 19a9 9 0 0 1 9 0 9 9 0 0 1 9 0"/><path d="M3 6a9 9 0 0 1 9 0 9 9 0 0 1 9 0"/><path d="M3 6v13"/><path d="M12 6v13"/><path d="M21 6v13"/>',
    user: '<circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 18 6-6"/><path d="m13 6 6 6"/>',
    pin: '<circle cx="12" cy="11" r="3"/><path d="M17.657 16.657 13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    link: '<path d="m9 15 6-6"/><path d="m11 6 .463-.536a5 5 0 0 1 7.071 7.072L18 13"/><path d="m13 18-.397.534a5.068 5.068 0 0 1-7.127 0 4.972 4.972 0 0 1 0-7.071L6 11"/>',
    external: '<path d="M12 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/><path d="m11 13 9-9"/><path d="M15 4h5v5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    alert: '<path d="M12 9v4"/><path d="M10.363 3.591 2.257 17.125a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636-2.87L13.637 3.59a1.914 1.914 0 0 0-3.274 0z"/><path d="M12 16h.01"/>',
    building: '<path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>',
    file: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/><path d="M9 9h1"/><path d="M9 13h6"/><path d="M9 17h6"/>',
    sparkles: '<path d="M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6z"/>',
    download: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="m7 11 5 5 5-5"/><path d="M12 4v12"/>',
    printer: '<path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/><path d="M17 9V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4"/><rect x="7" y="13" width="10" height="8" rx="2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M11 12h1v4h1"/>',
    flask: '<path d="M9 3h6"/><path d="M10 9V3h4v6l5 10a1 1 0 0 1-.9 1.5H5.9A1 1 0 0 1 5 19z"/>',
    rupee: '<path d="M18 5H6h3a4 4 0 0 1 0 8H6l7 6"/><path d="M6 9h12"/>',
    live: '<path d="M6.7 17.3a8 8 0 0 1 0-10.6"/><path d="M17.3 6.7a8 8 0 0 1 0 10.6"/><path d="M9.5 14.5a3.5 3.5 0 0 1 0-5"/><path d="M14.5 9.5a3.5 3.5 0 0 1 0 5"/><circle cx="12" cy="12" r="1"/>',
    handshake: '<path d="M11 17l2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    refresh: '<path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>',
  };

  function icon(name) {
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || "") + '</svg>';
  }

  function fillIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach(function (el) {
      if (!el.firstChild) el.innerHTML = icon(el.getAttribute("data-icon"));
    });
  }

  var skillById = {};
  DATA.skills.forEach(function (s) { skillById[s.id] = s; });
  var roleById = {};
  DATA.roles.forEach(function (r) { roleById[r.id] = r; });
  var areaById = {};
  DATA.areas.forEach(function (a) { areaById[a.id] = a; });

  // ---------- Saved state ----------

  function emptyState() {
    return { added: [], removed: [], custom: [], learning: [], projects: [], personal: {}, steps: {}, generated: {}, referrals: {} };
  }

  function normalizeState(obj) {
    var s = emptyState();
    if (!obj || typeof obj !== "object") return s;
    ["added", "removed", "custom", "learning", "projects"].forEach(function (k) {
      if (Array.isArray(obj[k])) s[k] = obj[k];
    });
    ["personal", "steps", "generated", "referrals"].forEach(function (k) {
      if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) s[k] = obj[k];
    });
    s.added = s.added.filter(function (id) { return skillById[id]; });
    s.removed = s.removed.filter(function (id) { return skillById[id]; });
    s.custom = s.custom.filter(function (c) { return typeof c === "string"; });
    s.learning = s.learning.filter(function (l) { return l && typeof l.title === "string"; });
    s.projects = s.projects.filter(function (p) { return p && typeof p.title === "string"; });
    return s;
  }

  function readJSON(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }

  var state = normalizeState(readJSON(STORAGE_KEY));
  var ui = readJSON(UI_KEY) || {};

  function saveState() { writeJSON(STORAGE_KEY, state); }
  function saveUi() { writeJSON(UI_KEY, ui); }

  function owns(id) {
    var s = skillById[id];
    if (!s) return false;
    if (s.have) return state.removed.indexOf(id) === -1;
    return state.added.indexOf(id) !== -1;
  }

  function setOwned(id, on) {
    var s = skillById[id];
    if (!s) return;
    state.added = state.added.filter(function (x) { return x !== id; });
    state.removed = state.removed.filter(function (x) { return x !== id; });
    if (s.have && !on) state.removed.push(id);
    if (!s.have && on) state.added.push(id);
  }

  function ownedSet() {
    var set = {};
    DATA.skills.forEach(function (s) { if (owns(s.id)) set[s.id] = true; });
    return set;
  }

  // ---------- Role scoring ----------

  function certList() {
    return DATA.learning.filter(function (l) { return l.useful === "yes" && l.onResume; })
      .map(function (l) { return l.title; })
      .concat(state.learning.map(function (l) { return l.title; }))
      .join(" | ").toLowerCase();
  }

  // ATS scores and other inputs shared by every role score in one render.
  function scoreContext() {
    var ats = {};
    DATA.roles.forEach(function (r) {
      var current = atsScore(DATA.resumeText, r).total;
      var tailored = atsScore(buildResume(r), r).total;
      ats[r.id] = { current: current, tailored: tailored, used: state.generated[r.id] ? tailored : current };
    });
    return { ats: ats, certs: certList(), projects: allProjects().length };
  }

  function scoreRole(role, have, ctx) {
    var total = 0, got = 0;
    Object.keys(role.skills).forEach(function (id) {
      var w = role.skills[id];
      total += w;
      if (have[id]) got += w;
    });
    var coverage = total ? got / total : 0;
    var certHit = (role.certTerms || []).some(function (t) { return ctx.certs.indexOf(t.toLowerCase()) !== -1; });
    var parts = {
      exp: W.exp * role.exp / 100,
      skills: W.skills * coverage,
      resume: W.resume * ctx.ats[role.id].used / 100,
      proof: 7 * Math.min(1, ctx.projects / role.projectsNeeded) + (certHit ? 3 : 0),
      referral: state.referrals[role.id] ? W.referral : 0,
    };
    var value = parts.exp + parts.skills + parts.resume + parts.proof + parts.referral;
    // Best reachable: every skill, project, certificate and referral, plus the better of the two resumes.
    var bestAts = Math.max(ctx.ats[role.id].tailored, ctx.ats[role.id].used);
    var max = parts.exp + W.skills + W.resume * bestAts / 100 + W.proof + W.referral;
    return { value: value, parts: parts, certHit: certHit, max: max };
  }

  function tierFor(score) {
    for (var i = 0; i < TIERS.length; i++) if (score >= TIERS[i].min) return TIERS[i];
    return TIERS[TIERS.length - 1];
  }

  function rankedRoles(have, ctx) {
    return DATA.roles
      .map(function (r) { var sc = scoreRole(r, have, ctx); return { role: r, score: sc, pct: Math.round(sc.value) }; })
      .sort(function (a, b) { return b.score.value - a.score.value; });
  }

  // The concrete actions that raise one role's match, biggest gain first.
  function pathActions(role, have, ctx, sc) {
    var acts = [];
    var a = ctx.ats[role.id];
    if (!state.generated[role.id] && a.tailored > a.current) {
      acts.push({ gain: W.resume * (a.tailored - a.current) / 100, label: "Generate a tailored resume for this role", time: "10 minutes", kind: "resume" });
    }
    var total = 0;
    Object.keys(role.skills).forEach(function (id) { total += role.skills[id]; });
    Object.keys(role.skills).filter(function (id) { return !have[id]; }).forEach(function (id) {
      var sk = skillById[id];
      acts.push({ gain: W.skills * role.skills[id] / total, label: "Learn " + sk.label, detail: sk.how, time: sk.time, kind: "skill", id: id });
    });
    var missing = role.projectsNeeded - ctx.projects;
    if (missing > 0) {
      var done = allProjects().map(function (pr) { return pr.title; });
      role.projectIdeas.filter(function (i) { return done.indexOf(i.title) === -1; }).slice(0, missing).forEach(function (idea) {
        acts.push({ gain: 7 / role.projectsNeeded, label: "Build the " + idea.title.toLowerCase() + " project", detail: idea.detail, time: "2–4 days", kind: "project", ref: role.id + ":" + role.projectIdeas.indexOf(idea) });
      });
    }
    if (!sc.certHit) acts.push({ gain: 3, label: "Add the " + role.certSuggestion, time: "see Learning log", kind: "cert" });
    if (!state.referrals[role.id]) {
      acts.push({ gain: W.referral, label: "Get a referral for this role", detail: "Ask former Amazon colleagues, or alumni working at the companies listed below.", time: "1–3 days", kind: "referral", id: role.id });
    }
    acts.sort(function (x, y) { return y.gain - x.gain; });
    return acts;
  }

  function salaryText(role) {
    return role.salary ? "₹" + role.salary.low + "–" + role.salary.high + " LPA" : "Not available";
  }

  function demandText(role) {
    return role.demand >= 70 ? "High" : role.demand >= 45 ? "Medium" : "Low";
  }

  // ---------- Helpers ----------

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function $(id) { return document.getElementById(id); }

  function flash(el, msg, isError) {
    el.textContent = msg;
    el.classList.toggle("is-error", !!isError);
  }

  function copyText(text, onDone) {
    function fail() { onDone(false); }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { onDone(true); }, fail);
      } else {
        fail();
      }
    } catch (e) { fail(); }
  }

  function parseMonth(str) {
    var parts = String(str).trim().split(/\s+/);
    var m = MONTHS.indexOf(parts[0].slice(0, 3).toLowerCase());
    var y = parseInt(parts[1], 10);
    if (m === -1 || isNaN(y)) return null;
    return y * 12 + m;
  }

  function monthsBetween(start, end) {
    var a = parseMonth(start), b = parseMonth(end);
    return a == null || b == null ? 0 : b - a + 1;
  }

  function formatDuration(months) {
    var y = Math.floor(months / 12), m = months % 12;
    var parts = [];
    if (y) parts.push(y + (y === 1 ? " yr" : " yrs"));
    if (m) parts.push(m + (m === 1 ? " mo" : " mos"));
    return parts.join(" ");
  }

  function findSkill(query) {
    var q = query.trim().toLowerCase();
    if (!q) return null;
    var exact = DATA.skills.filter(function (s) {
      return s.label.toLowerCase() === q || (s.aliases || []).indexOf(q) !== -1;
    })[0];
    if (exact) return exact;
    if (q.length < 3) return null;
    return DATA.skills.filter(function (s) {
      if (s.label.toLowerCase().indexOf(q) !== -1) return true;
      return (s.aliases || []).some(function (a) { return a.length >= 3 && (q.indexOf(a) !== -1 || a.indexOf(q) !== -1); });
    })[0] || null;
  }

  function ring(pct, label) {
    var r = 34, c = 2 * Math.PI * r;
    var off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
    return '<div class="ring" role="img" aria-label="' + esc(label || pct + " percent") + '">' +
      '<svg viewBox="0 0 84 84"><circle class="ring-track" cx="42" cy="42" r="' + r + '"/>' +
      '<circle class="ring-value" cx="42" cy="42" r="' + r + '" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '"/></svg>' +
      '<span class="ring-label">' + pct + (label ? "" : "%") + '</span></div>';
  }

  function areaLabel(area) {
    var a = areaById[area];
    return a ? a.short || a.label : "Hyderabad";
  }

  function priorityAreasLabel() {
    return DATA.areas.filter(function (a) { return a.priority; }).map(function (a) { return a.short || a.label; }).join(" & ");
  }

  // Options for an area dropdown, with how many items each would show.
  function areaOptions(value, count) {
    return [["mine", priorityAreasLabel()], ["all", "All Hyderabad"]]
      .concat(DATA.areas.map(function (a) { return [a.id, a.label]; }))
      .map(function (o) {
        return '<option value="' + o[0] + '"' + (value === o[0] ? " selected" : "") + '>' + esc(o[1]) + ' (' + count(o[0]) + ')</option>';
      }).join("");
  }

  function jobsInArea(list, value) {
    if (value === "all") return list;
    return list.filter(value === "mine" ? inMyAreas : function (j) { return j.area === value; });
  }

  // ---------- Projects ----------

  function allProjects() {
    return DATA.projects.concat(state.projects);
  }

  // ---------- Resume text & ATS scoring ----------

  var ACTION_VERBS = ["audited", "investigated", "performed", "conducted", "evaluated", "resolved", "diagnosed", "compiled", "programmed", "supported", "led", "ran", "built", "designed", "created", "analysed", "analyzed", "reviewed", "documented", "identified", "reduced", "improved", "managed", "delivered", "developed", "automated", "tested", "assessed", "recommended", "wrote", "partnered", "collaborated", "translated", "mapped", "scored", "drafted", "monitored", "detected", "enforced", "applied", "cleaned", "validated", "achieved", "decreased", "handled", "examined"];

  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // Matches a term at the start of a word, so "SLA" doesn't match inside "translating"
  // but "investigat" still matches "investigated".
  function keywordFound(text, kw) {
    var hay = text.toLowerCase();
    return [kw.term].concat(kw.alt || []).some(function (t) {
      return new RegExp("(^|[^a-z0-9])" + escRe(t.toLowerCase())).test(hay);
    });
  }

  function sectionText(text, heading) {
    var lines = text.split("\n");
    var out = [], inside = false;
    lines.forEach(function (l) {
      var isHeading = /^[A-Z][A-Z &]{3,}$/.test(l.trim());
      if (isHeading) inside = l.toUpperCase().indexOf(heading) !== -1;
      else if (inside) out.push(l);
    });
    return out.join("\n");
  }

  function hasKeyword(kw) {
    if (kw.skill) return owns(kw.skill);
    return !!kw.has;
  }

  function bulletsOf(text) {
    return text.split("\n").map(function (l) { return l.trim(); })
      .filter(function (l) { return /^[•\-*]\s+/.test(l); })
      .map(function (l) { return l.replace(/^[•\-*]\s+/, ""); })
      .filter(function (l) { return l.length > 70; });
  }

  function atsScore(text, role) {
    var lower = text.toLowerCase();
    var checks = [];

    var kws = role.keywords;
    var matched = kws.filter(function (k) { return keywordFound(text, k); });
    var kwPts = 30 * matched.length / kws.length;
    checks.push({ label: "Keyword match", detail: matched.length + " of " + kws.length + " role keywords found", pts: kwPts, max: 30 });

    checks.push({ label: "Parse-safe layout", detail: "Single column, no tables, icons or text boxes", pts: 12, max: 12 });

    var top = lower.slice(0, 700);
    var titleHits = role.titleTerms.filter(function (t) { return top.indexOf(t.toLowerCase()) !== -1; }).length;
    var titlePts = 10 * Math.min(1, titleHits / Math.min(2, role.titleTerms.length));
    checks.push({ label: "Target title near the top", detail: titleHits ? "Role title appears in headline or summary" : "Headline and summary don't name this role", pts: titlePts, max: 10 });

    var bullets = bulletsOf(text);
    var quant = bullets.filter(function (b) { return /\d/.test(b); }).length;
    var qRatio = bullets.length ? quant / bullets.length : 0;
    checks.push({ label: "Quantified bullets", detail: quant + " of " + bullets.length + " bullets have a number", pts: 10 * Math.min(1, qRatio / 0.5), max: 10 });

    var headings = [/summary/, /skills/, /experience/, /education/, /certification/, /project/];
    var found = headings.filter(function (h) { return h.test(lower); }).length;
    checks.push({ label: "Standard section headings", detail: found + " of 6 standard headings", pts: 8 * found / 6, max: 8 });

    var contact = [/@/, /\+?\d[\d\s]{9,}/, /linkedin/, /hyderabad/].filter(function (re) { return re.test(lower); }).length;
    checks.push({ label: "Contact details in body", detail: contact + " of 4 (email, phone, LinkedIn, city)", pts: 5 * contact / 4, max: 5 });

    var verbStart = bullets.filter(function (b) {
      var w = b.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, "");
      return ACTION_VERBS.indexOf(w) !== -1;
    }).length;
    var noPronoun = !/(^|\s)(i|my|me)\s/.test(bullets.join(" ").toLowerCase());
    var verbRatio = bullets.length ? verbStart / bullets.length : 0;
    checks.push({ label: "Action-verb bullets", detail: verbStart + " of " + bullets.length + " start with an action verb", pts: 5 * verbRatio * (noPronoun ? 1 : 0.6), max: 5 });

    var hasGapLine = /present/.test(lower);
    checks.push({ label: "Dates and career gap", detail: hasGapLine ? "Dates consistent and the 2026 break is explained" : "Explain the break since Mar 2026", pts: hasGapLine ? 5 : 2.5, max: 5 });

    var words = text.split(/\s+/).filter(Boolean).length;
    var lenPts = words >= 380 && words <= 800 ? 5 : words <= 1000 ? 3 : 1;
    checks.push({ label: "Length", detail: words + " words (aim for 400–800, one page)", pts: lenPts, max: 5 });

    checks.push({ label: "File and fonts", detail: "Text-based file with a standard font", pts: 5, max: 5 });

    var certText = sectionText(text, "CERTIFICATION").toLowerCase();
    var certHit = (role.certTerms || []).some(function (t) { return certText.indexOf(t.toLowerCase()) !== -1; });
    var degree = /bachelor|bca/.test(lower);
    checks.push({ label: "Education and certifications", detail: (degree ? "Degree listed" : "Degree missing") + (certHit ? ", relevant certificate listed" : ", no certificate this role asks for"), pts: (degree ? 2.5 : 0) + (certHit ? 2.5 : 0), max: 5 });

    var total = checks.reduce(function (s, c) { return s + c.pts; }, 0);
    return { total: Math.round(total), checks: checks, matched: matched };
  }

  function skillNames(have, group) {
    return DATA.skills.filter(function (s) { return have[s.id] && s.group === group; }).map(function (s) { return s.resume || s.label; });
  }

  // Builds an ATS resume for one role from real experience only.
  function buildResume(role) {
    var have = ownedSet();
    var roleTerms = role.keywords.filter(hasKeyword).map(function (k) { return k.term; });
    var seen = {};
    var core = roleTerms.filter(function (t) { var k = t.toLowerCase(); if (seen[k]) return false; seen[k] = true; return true; });
    var tools = skillNames(have, "data");
    var ai = skillNames(have, "ai");
    var skills = ["Core: " + core.join(", ")];
    if (tools.length) skills.push("Tools: " + tools.join(", "));
    if (ai.length) skills.push("AI: " + ai.join(", "));
    return resumeText(role.resumeHeadline, role.resumeSummary, skills, role.bulletFocus || []);
  }

  // One resume for any job: every skill you have, grouped, and bullets in their own order.
  function buildUniversalResume() {
    var have = ownedSet();
    var skills = DATA.skillGroups.map(function (g) {
      var names = skillNames(have, g.id);
      return names.length ? g.label + ": " + names.join(", ") : "";
    }).filter(Boolean);
    if (state.custom.length) skills.push("Other: " + state.custom.join(", "));
    var u = DATA.universalResume;
    return resumeText(u.headline, u.summary, skills, []);
  }

  // The parts every resume shares. `focus` moves the bullets that mention these words to the top of each job.
  function resumeText(headline, summary, skills, focus) {
    var p = DATA.person;
    var lines = [];
    lines.push(p.name.toUpperCase());
    lines.push(headline);
    lines.push(p.location + " | " + p.phone + " | " + p.email + " | " + p.linkedin.replace(/^https?:\/\//, ""));
    lines.push("");

    lines.push("PROFESSIONAL SUMMARY");
    lines.push(summary);
    lines.push("");

    lines.push("SKILLS");
    skills.forEach(function (s) { lines.push(s); });
    lines.push("");

    lines.push("WORK EXPERIENCE");
    DATA.experience.forEach(function (job) {
      lines.push(job.role + " | " + job.company + ", " + job.place + " | " + job.start + " – " + job.end);
      var pts = job.points.slice();
      pts.sort(function (a, b) {
        function hits(t) { var l = t.toLowerCase(); return focus.filter(function (f) { return l.indexOf(f) !== -1; }).length; }
        return hits(b) - hits(a);
      });
      pts.forEach(function (pt) { lines.push("• " + pt); });
      lines.push("");
    });
    lines.push("Career break: Upskilling in " + DATA.careerBreak + " | Mar 2026 – Present");
    lines.push("");

    var projects = allProjects();
    if (projects.length) {
      lines.push("PROJECTS");
      projects.forEach(function (pr) {
        lines.push(pr.title + (pr.tools ? " | " + pr.tools : ""));
        (pr.points || []).forEach(function (pt) { lines.push("• " + pt); });
      });
      lines.push("");
    }

    var certs = DATA.learning.filter(function (l) { return l.useful === "yes" && l.onResume; }).map(function (l) { return l.title + " – " + l.source; });
    state.learning.forEach(function (l) { certs.push(l.title + (l.source ? " – " + l.source : "")); });
    if (certs.length) {
      lines.push("CERTIFICATIONS");
      certs.forEach(function (c) { lines.push("• " + c); });
      lines.push("");
    }

    lines.push("EDUCATION");
    DATA.education.forEach(function (e) { lines.push(e.title + " | " + e.place + " | " + e.year); });
    return lines.join("\n");
  }

  // ---------- Live jobs ----------

  var LIVE = { status: "loading", data: null, seen: null };
  var jobFilter = { area: "mine", role: "all", sort: "new" };
  var aiFilter = { area: "all", sort: "new" };
  var openNext = {};

  var FEED = DATA.feed;
  var IS_ARTIFACT = document.documentElement.classList.contains("is-artifact");
  var TOKEN_KEY = "shraddha-portfolio-github-token";

  function savedToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; }
  }

  function readFeed(r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json().then(function (d) {
      if (!d || !Array.isArray(d.jobs)) throw new Error("Not a job feed");
      return d;
    });
  }

  // The newest jobs.json, read from the repository through GitHub's API so it skips the Pages and CDN delay.
  // Falls back to the copy served with the site (and always uses it in the preview).
  function fetchFeed() {
    function local() { return fetch("jobs.json?t=" + Date.now(), { cache: "no-store" }).then(readFeed); }
    if (IS_ARTIFACT || !FEED) return local();
    var headers = { Accept: "application/vnd.github.raw+json" };
    var token = savedToken();
    if (token) headers.Authorization = "Bearer " + token;
    return fetch("https://api.github.com/repos/" + FEED.repo + "/contents/jobs.json?ref=" + encodeURIComponent(FEED.branch), { headers: headers, cache: "no-store" })
      .then(readFeed)
      .catch(local);
  }

  function applyFeed(data, firstLoad) {
    LIVE.data = data;
    LIVE.status = "ok";
    if (firstLoad) {
      var prev = Array.isArray(ui.seenJobs) ? ui.seenJobs : null;
      LIVE.seen = prev ? new Set(prev) : null;
    }
    ui.seenJobs = data.jobs.map(function (j) { return j.id; });
    saveUi();
    renderScored();
  }

  function loadJobs() {
    fetchFeed().then(function (data) { applyFeed(data, true); }, function () {
      LIVE.status = "error";
      renderScored();
    });
  }

  // ---------- Refresh ----------

  var refresh = { busy: false, note: "" };

  function setRefresh(busy, note) {
    refresh.busy = busy;
    refresh.note = note || "";
    document.querySelectorAll("[data-refresh]").forEach(function (b) {
      b.disabled = busy;
      b.classList.toggle("is-busy", busy);
    });
    document.querySelectorAll("[data-refresh-note]").forEach(function (p) {
      p.innerHTML = refresh.note;
      p.hidden = !refresh.note;
    });
  }

  function jobIds() { return LIVE.data ? LIVE.data.jobs.map(function (j) { return j.id; }) : []; }

  function addedSince(before, data) {
    var had = new Set(before);
    return data.jobs.filter(function (j) { return !had.has(j.id); }).length;
  }

  function openingsText(n) { return n + (n === 1 ? " new opening" : " new openings"); }

  function runUrl() { return "https://github.com/" + FEED.repo + "/actions/workflows/" + FEED.workflow; }

  function startRun(token) {
    return fetch("https://api.github.com/repos/" + FEED.repo + "/actions/workflows/" + FEED.workflow + "/dispatches", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({ ref: FEED.branch }),
    }).then(function (r) {
      if (r.status === 204) return;
      throw new Error(r.status === 401 ? "GitHub didn't accept the token" : r.status === 403 || r.status === 404 ? "the token can't start job checks for personal-portfolio" : "GitHub answered " + r.status);
    });
  }

  // Polls until a check that started after `beforeUpdated` has saved a new list (a manual run always saves one).
  function waitForCheck(before, beforeUpdated) {
    var tries = 0;
    function later() { return new Promise(function (res) { setTimeout(res, 20000); }); }
    function poll() {
      tries++;
      return fetchFeed().then(function (data) {
        if (data.updated !== beforeUpdated && Date.parse(data.updated) > Date.parse(beforeUpdated || 0)) {
          applyFeed(data);
          var n = addedSince(before, data);
          setRefresh(false, "Checked every job board just now: " + (n ? openingsText(n) + " (marked New)." : "no new openings since you opened the page."));
          return;
        }
        if (tries >= 30) { setRefresh(false, "The check is taking longer than usual. Press Refresh again in a few minutes."); return; }
        return later().then(poll);
      }, function () {
        if (tries >= 30) { setRefresh(false, "Couldn't reach the job list. Check your internet connection and press Refresh again."); return; }
        return later().then(poll);
      });
    }
    return later().then(poll);
  }

  function refreshJobs() {
    if (refresh.busy) return;
    var before = jobIds();
    setRefresh(true, "Getting the newest list…");
    fetchFeed().then(function (data) {
      applyFeed(data, !LIVE.seen && before.length === 0);
      var n = addedSince(before, data);
      var summary = "Newest list loaded (last changed " + hoursAgoText(data.updated) + ")" + (n ? ": " + openingsText(n) + "." : ".");
      var token = savedToken();
      if (IS_ARTIFACT) {
        setRefresh(false, summary + " This preview shows a saved copy; on your live site Refresh gets the newest openings.");
      } else if (token) {
        startRun(token).then(function () {
          setRefresh(true, summary + " Now checking every company job board. This takes about 3 minutes; you can keep using the site.");
          return waitForCheck(jobIds(), data.updated);
        }, function (err) {
          setRefresh(false, summary + " Couldn't start a fresh check: " + esc(err.message) + '. Check the token under <a href="#jobs" data-open-setup>One-click refresh</a>.');
        });
      } else {
        setRefresh(false, summary + ' Job boards are checked every hour. To check right now, <a href="' + esc(runUrl()) + '" target="_blank" rel="noopener" data-run-github>run the check on GitHub</a> (press "Run workflow"), or set up <a href="#jobs" data-open-setup>one-click refresh</a>.');
      }
    }, function () {
      setRefresh(false, "Couldn't reach the job list. Check your internet connection and press Refresh again.");
    });
  }

  function renderTokenState() {
    var on = !!savedToken();
    $("tokenSummary").textContent = on ? "One-click refresh is on: Refresh also checks every job board" : "One-click refresh: check every job board when you press Refresh (optional)";
    $("forgetToken").hidden = !on;
  }

  function isNewJob(j) {
    if (LIVE.seen) return !LIVE.seen.has(j.id);
    return daysAgo(j.posted || j.firstSeen) <= 2;
  }

  function daysAgo(iso) {
    if (!iso) return 99;
    var d = Date.parse(iso + "T00:00:00");
    return Math.max(0, Math.floor((Date.now() - d) / 86400000));
  }

  function agoText(iso) {
    var n = daysAgo(iso);
    return n === 0 ? "Today" : n === 1 ? "Yesterday" : n + " days ago";
  }

  function hoursAgoText(iso) {
    var h = Math.round((Date.now() - Date.parse(iso)) / 3600000);
    if (h < 1) return "less than an hour ago";
    if (h < 48) return h + (h === 1 ? " hour ago" : " hours ago");
    return Math.round(h / 24) + " days ago";
  }

  function inMyAreas(j) { return !!(areaById[j.area] && areaById[j.area].priority); }

  // Languages listed on the Profile page. Jobs asking for a language that isn't listed are hidden.
  function myLanguages() {
    var v = Object.prototype.hasOwnProperty.call(state.personal, "languages") ? state.personal.languages : "";
    return String(v || "").toLowerCase();
  }

  function languageOk(j) {
    var mine = myLanguages();
    if (!mine || !(j.languages || []).length) return true;
    return j.languages.every(function (l) { return mine.indexOf(l.toLowerCase()) !== -1; });
  }

  function liveJobs() {
    return LIVE.data && Array.isArray(LIVE.data.jobs) ? LIVE.data.jobs.filter(function (j) { return roleById[j.roleId] && languageOk(j); }) : [];
  }

  function isAiJob(j) {
    return !!j.ai || AI_ROLE_IDS.indexOf(j.roleId) !== -1 || AI_TITLE.test(j.title);
  }

  function experienceMonths() {
    return DATA.experience.reduce(function (sum, job) { return sum + monthsBetween(job.start, job.end); }, 0);
  }

  function isStretch(j) { return j.years != null && j.years * 12 > experienceMonths() + 3; }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return "the company's site"; }
  }

  function yearsBadge(j) {
    if (j.years == null) return "";
    return '<span class="badge ' + (isStretch(j) ? "badge-yellow" : "badge-gray") + '" title="From the minimum qualifications">Asks ' + j.years + '+ yrs</span>';
  }

  // The checklist under "What to do next" on an AI job card.
  function nextSteps(j, role, pct, sc, have, ctx) {
    var mine = formatDuration(experienceMonths());
    var a = ctx.ats[role.id];
    var steps = [];
    steps.push({ cls: "is-ok", title: "It's a genuine posting",
      text: "Listed on " + hostOf(j.url) + ", " + j.company + "'s own job board. Real employers never charge a fee, so ignore anyone who asks." });

    var fit = [pct + "% match for " + role.short + ", paying about " + salaryText(role) + "."];
    var warn = false;
    if (j.years != null) {
      warn = isStretch(j);
      fit.push("Asks for " + j.years + "+ years; you have " + mine + (warn ? ", so apply as a stretch and lead with your Amazon audit results." : "."));
    }
    if ((j.languages || []).length) {
      warn = true;
      fit.push("Needs " + j.languages.join(" & ") + ". Apply only if you read and write it fluently; expect a language test.");
    }
    steps.push({ cls: warn ? "is-warn" : "is-ok", title: "Check it suits you", text: fit.join(" ") });

    steps.push({ cls: state.generated[role.id] ? "is-ok" : "", title: "Send a resume made for this job",
      text: state.generated[role.id] ? "Your tailored " + role.short + " resume is ready (ATS " + a.tailored + "/100)."
        : "Generate the " + role.short + " version first. It lifts your ATS score from " + a.current + " to " + a.tailored + ".",
      btn: '<a class="button button-default button-sm" href="#resume" data-ats-role="' + role.id + '">' + icon("file") + (state.generated[role.id] ? "Open resume" : "Generate resume") + '</a>' });

    var act = pathActions(role, have, ctx, sc).filter(function (x) { return x.kind !== "resume" && x.kind !== "referral"; })[0];
    if (act) {
      steps.push({ title: "Strengthen your application",
        text: act.label + (act.detail ? ". " + act.detail : "") + " (+" + act.gain.toFixed(1) + "% match" + (act.time ? ", about " + act.time : "") + ")",
        btn: '<a class="button button-default button-sm" href="#roles" data-open-role="' + role.id + '">' + icon("target") + 'Your plan for 90%</a>' });
    }

    var people = "https://www.linkedin.com/search/results/people/?" + new URLSearchParams({ keywords: j.company + " " + role.short + " Hyderabad" });
    steps.push({ cls: state.referrals[role.id] ? "is-ok" : "", title: "Ask for a referral",
      text: "A referral adds 5% to your match and gets your resume read sooner. Message people at " + j.company + " in Hyderabad, starting with former Amazon colleagues.",
      btn: '<a class="button button-default button-sm" href="' + esc(people) + '" target="_blank" rel="noopener">' + icon("link") + 'Find people on LinkedIn</a>' +
        '<button type="button" class="button button-default button-sm" data-referral="' + role.id + '">' + icon(state.referrals[role.id] ? "check" : "handshake") + (state.referrals[role.id] ? "Referral added" : "I have a referral") + '</button>' });

    steps.push({ title: "Apply on the official site",
      text: "Apply within a few days of the posting date, note the date, and follow up with the recruiter after a week.",
      btn: '<a class="button button-sm" href="' + esc(j.url) + '" target="_blank" rel="noopener">Apply on ' + esc(hostOf(j.url)) + icon("external") + '</a>' });

    return '<details class="job-next" data-job="' + esc(j.id) + '"' + (openNext[j.id] ? " open" : "") + '><summary>What to do next' + icon("chevron") + '</summary><ol class="next-steps">' + steps.map(function (st) {
      return '<li class="' + st.cls + '"><strong>' + esc(st.title) + '</strong><span class="dimmed">' + esc(st.text) + '</span>' +
        (st.btn ? '<span class="button-row">' + st.btn + '</span>' : '') + '</li>';
    }).join("") + '</ol></details>';
  }

  function jobCard(j, scores, more) {
    var role = roleById[j.roleId];
    var pct = scores[j.roleId];
    var t = tierFor(pct);
    var area = !areaById[j.area] ? '<span class="badge badge-gray">Hyderabad</span>'
      : '<span class="badge ' + (inMyAreas(j) ? "badge-red" : "badge-gray") + '" title="' + (j.areaFrom === "posting" ? "Area named in the posting" : "Company office in this area; check the posting") + '">' + icon("pin") + areaLabel(j.area) + '</span>';
    return '<li class="job tier-' + t.key + '">' +
      '<div class="job-main">' +
        '<a class="job-title" href="' + esc(j.url) + '" target="_blank" rel="noopener">' + esc(j.title) + icon("external") + '</a>' +
        '<span class="job-company">' + esc(j.company) + ' · ' + esc(j.location.split(" · ")[0]) + (j.openings > 1 ? ' · ' + j.openings + ' openings' : '') + '</span>' +
        '<span class="job-badges">' + (isNewJob(j) ? '<span class="badge badge-green">New</span>' : '') + area +
          '<span class="badge badge-blue">' + esc(role.short) + '</span>' +
          ((j.languages || []).length ? '<span class="badge badge-yellow">Needs ' + esc(j.languages.join(" & ")) + '</span>' : '') + yearsBadge(j) +
          '<span class="job-posted">' + icon("clock") + agoText(j.posted || j.firstSeen) + '</span></span>' +
      '</div>' +
      '<div class="job-side">' +
        '<span class="job-match"><strong>' + pct + '%</strong> match</span>' +
        '<span class="salary">' + salaryText(role) + '</span>' +
        '<span class="button-row"><a class="button button-sm" href="' + esc(j.url) + '" target="_blank" rel="noopener">Apply' + icon("external") + '</a>' +
        '<a class="button button-default button-sm" href="#resume" data-ats-role="' + role.id + '">Tailor resume</a></span>' +
      '</div>' + (more ? more(j, role, pct) : '') + '</li>';
  }

  function feedStatus() {
    if (LIVE.status === "loading") return "Loading live jobs…";
    if (LIVE.status === "error") return "Live jobs load when the site is online (GitHub Pages). Until then, use the job-site searches below.";
    var d = LIVE.data;
    var ok = [];
    (d.jobs || []).forEach(function (j) { if (ok.indexOf(j.company) === -1) ok.push(j.company); });
    var hidden = (d.jobs || []).filter(function (j) { return roleById[j.roleId] && !languageOk(j); }).length;
    var langNote = hidden ? " " + hidden + " hidden because they need a language you haven't listed." :
      (!myLanguages() && (d.jobs || []).some(function (j) { return (j.languages || []).length; }) ? " Add your languages on the Profile page to hide postings that need other languages." : "");
    return "Last changed " + hoursAgoText(d.updated) + ", from " + (ok.length ? ok.join(", ") : "company job boards") + ". Checked every hour." + langNote;
  }

  function renderJobs(scores) {
    var all = liveJobs();
    var mine = all.filter(inMyAreas);
    $("jobAreaFilter").innerHTML = areaOptions(jobFilter.area, function (v) { return jobsInArea(all, v).length; });
    $("jobSort").innerHTML = [["new", "Newest"], ["match", "Best match"]].map(function (x) {
      return '<button type="button" data-job-sort="' + x[0] + '" aria-pressed="' + (jobFilter.sort === x[0]) + '">' + x[1] + '</button>';
    }).join("");
    $("jobRoleFilter").innerHTML = '<option value="all">All matched roles</option>' + DATA.roles.map(function (r) {
      var n = all.filter(function (j) { return j.roleId === r.id; }).length;
      return '<option value="' + r.id + '"' + (jobFilter.role === r.id ? " selected" : "") + '>' + esc(r.short) + ' (' + n + ')</option>';
    }).join("");

    var list = jobsInArea(all, jobFilter.area).filter(function (j) { return jobFilter.role === "all" || j.roleId === jobFilter.role; });
    list = list.slice().sort(function (x, y) {
      if (jobFilter.sort === "match" && scores[y.roleId] !== scores[x.roleId]) return scores[y.roleId] - scores[x.roleId];
      return (y.posted || y.firstSeen || "").localeCompare(x.posted || x.firstSeen || "");
    });
    $("jobsStatus").textContent = feedStatus();
    $("jobList").innerHTML = list.length ? list.slice(0, 120).map(function (j) { return jobCard(j, scores); }).join("")
      : (LIVE.status === "ok" ? '<li class="empty">No openings match these filters right now. Try All Hyderabad, press Refresh, or use the job-site searches below.</li>' : "");

    var newMine = mine.filter(isNewJob).length;
    document.querySelector('[data-count="jobs"]').textContent = LIVE.status === "ok" ? (newMine ? newMine + " new" : String(mine.length)) : "";
  }

  function liveLinks(ranked) {
    function slug(t) { return t.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
    $("liveLinks").innerHTML = ranked.slice(0, 6).map(function (r) {
      var q = r.role.search[0];
      var links = [
        ["LinkedIn · 24 h", "https://www.linkedin.com/jobs/search/?" + new URLSearchParams({ keywords: q, location: "Hyderabad, Telangana, India", f_TPR: "r86400", f_E: "2,3" })],
        ["Naukri · 1 day", "https://www.naukri.com/" + slug(q) + "-jobs-in-hyderabad-secunderabad?experience=3&jobAge=1"],
        ["Indeed · 1 day", "https://in.indeed.com/jobs?" + new URLSearchParams({ q: q, l: "Hyderabad, Telangana", fromage: "1" })],
        ["Amazon Jobs", "https://www.amazon.jobs/en/search?" + new URLSearchParams({ base_query: q, loc_query: "Hyderabad, Telangana, IND", sort: "recent" })],
      ];
      return '<div class="live-row"><div><strong>' + esc(r.role.short) + '</strong><span class="dimmed small">“' + esc(q) + '” · ' + r.pct + '% match</span></div>' +
        '<div class="button-row">' + links.map(function (l) {
          return '<a class="button button-default button-sm" href="' + esc(l[1]) + '" target="_blank" rel="noopener">' + l[0] + icon("external") + '</a>';
        }).join("") + '</div></div>';
    }).join("");
  }

  // ---------- AI jobs ----------

  function leadCard(l, scores) {
    var role = roleById[l.roleId];
    var pct = scores[l.roleId];
    var fit = { now: ["Apply now", "badge-green", tierFor(pct).key], stretch: ["Stretch", "badge-yellow", "build"], later: ["Later", "badge-gray", "long"] }[l.fit];
    return '<li class="job tier-' + fit[2] + '">' +
      '<div class="job-main">' +
        '<a class="job-title" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.title) + icon("external") + '</a>' +
        '<span class="job-company">' + esc(l.company) + ' · ' + esc(l.place) + '</span>' +
        '<span class="job-badges"><span class="badge ' + fit[1] + '">' + fit[0] + '</span><span class="badge badge-blue">' + esc(role.short) + '</span>' +
          '<a class="job-posted" href="' + esc(l.source) + '" target="_blank" rel="noopener">' + icon("info") + 'Seen on ' + esc(hostOf(l.source)) + '</a></span>' +
        '<span class="dimmed small">' + esc(l.asks) + (l.note ? " " + esc(l.note) : "") + '</span>' +
      '</div>' +
      '<div class="job-side">' +
        '<span class="job-match"><strong>' + pct + '%</strong> match</span>' +
        '<span class="salary">' + salaryText(role) + '</span>' +
        '<span class="button-row"><a class="button button-sm" href="' + esc(l.url) + '" target="_blank" rel="noopener">Official site' + icon("external") + '</a>' +
        '<a class="button button-default button-sm" href="#resume" data-ats-role="' + role.id + '">Tailor resume</a></span>' +
      '</div></li>';
  }

  function renderAi(ranked, have, ctx, scores) {
    var all = liveJobs().filter(isAiJob);
    var mine = all.filter(inMyAreas);

    $("aiRoles").innerHTML = ranked.filter(function (r) { return AI_ROLE_IDS.indexOf(r.role.id) !== -1; }).map(function (r) {
      var t = tierFor(r.pct);
      var n = all.filter(function (j) { return j.roleId === r.role.id; }).length;
      var act = pathActions(r.role, have, ctx, r.score)[0];
      return '<li class="top-role tier-' + t.key + '">' + ring(r.pct) +
        '<div class="top-role-text"><a href="#roles" data-open-role="' + r.role.id + '">' + esc(r.role.title) + '</a>' +
        '<span class="salary">' + salaryText(r.role) + '</span>' +
        '<span class="top-role-meta"><span class="badge">' + t.label + '</span><span class="dimmed small">' + (LIVE.status === "ok" ? n + " live" : "") + '</span></span>' +
        (act ? '<span class="ai-next">Next: <strong>' + esc(act.label) + '</strong> (+' + act.gain.toFixed(1) + '%)</span>' : '') + '</div></li>';
    }).join("");

    $("aiAreaFilter").innerHTML = areaOptions(aiFilter.area, function (v) { return jobsInArea(all, v).length; });
    $("aiSort").innerHTML = [["new", "Newest"], ["match", "Best match"]].map(function (x) {
      return '<button type="button" data-ai-sort="' + x[0] + '" aria-pressed="' + (aiFilter.sort === x[0]) + '">' + x[1] + '</button>';
    }).join("");

    var list = jobsInArea(all, aiFilter.area).slice().sort(function (x, y) {
      if (aiFilter.sort === "match" && scores[y.roleId] !== scores[x.roleId]) return scores[y.roleId] - scores[x.roleId];
      return (y.posted || y.firstSeen || "").localeCompare(x.posted || x.firstSeen || "");
    });
    var companies = [];
    all.forEach(function (j) { if (companies.indexOf(j.company) === -1) companies.push(j.company); });
    $("aiStatus").textContent = LIVE.status !== "ok" ? feedStatus()
      : all.length + (all.length === 1 ? " AI opening" : " AI openings") + (companies.length ? " from " + companies.join(", ") : "") +
        ". Last changed " + hoursAgoText(LIVE.data.updated) + "; checked every hour.";
    $("aiJobList").innerHTML = list.length ? list.map(function (j) {
      return jobCard(j, scores, function (job, role, pct) { return nextSteps(job, role, pct, scoreRole(role, have, ctx), have, ctx); });
    }).join("") : (LIVE.status === "ok" ? '<li class="empty">No AI openings match this filter right now. Try All Hyderabad, or the openings to check below.</li>' : "");

    $("aiLeadsNote").textContent = "Seen on job boards and company pages on " + DATA.aiLeadsChecked + ". Confirm each is still open on the official site.";
    $("aiLeads").innerHTML = DATA.aiLeads.map(function (l) { return leadCard(l, scores); }).join("");

    var sf = DATA.aiSafety;
    $("aiSafety").innerHTML =
      '<div class="safety-real"><h3>' + icon("check") + 'Signs it\'s real</h3><ul>' + sf.real.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div>' +
      '<div class="safety-scam"><h3>' + icon("alert") + 'Signs of a scam</h3><ul>' + sf.scam.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div>' +
      '<div class="safety-foot"><span>' + esc(sf.freelance) + '</span><span>Every job in the list above comes straight from the company\'s own careers site.</span></div>';

    var newAi = all.filter(isNewJob).length;
    document.querySelector('[data-count="ai"]').textContent = LIVE.status === "ok" ? (newAi ? newAi + " new" : String(all.length)) : "";
  }

  // ---------- Dashboard ----------

  function renderDashboard(ranked, ctx, scores) {
    var p = DATA.person;
    $("headline").textContent = p.headline;

    function copyItem(iconName, value) {
      return '<span class="contact-item">' + icon(iconName) + '<span class="value">' + esc(value) + '</span>' +
        '<button type="button" class="copy" data-copy="' + esc(value) + '" aria-label="Copy ' + esc(value) + '">' + icon("copy") + '</button></span>';
    }
    $("contact").innerHTML =
      copyItem("mail", p.email) +
      copyItem("phone", p.phone) +
      '<span class="contact-item">' + icon("link") +
      '<a class="value" href="' + esc(p.linkedin) + '" target="_blank" rel="noopener">LinkedIn' + icon("external") + '</a></span>' +
      '<span class="contact-item">' + icon("pin") + '<span class="value">' + esc(p.location) + '</span></span>';

    var best = ranked[0];
    var ats = ctx.ats[best.role.id];
    var projects = ctx.projects;
    var jobs = liveJobs();
    var mine = jobs.filter(inMyAreas);
    var newMine = mine.filter(isNewJob).length;
    $("kpis").innerHTML =
      '<a class="kpi" href="#roles"><dd>' + best.pct + '%</dd><dt>Best match</dt><span class="kpi-note">' + esc(best.role.short) + ' · up to ' + Math.round(best.score.max) + '%</span></a>' +
      '<a class="kpi" href="#jobs"><dd>' + (LIVE.status === "ok" ? mine.length : "–") + '</dd><dt>Live jobs in your areas</dt><span class="kpi-note">' + (LIVE.status === "ok" ? newMine + " new since your last visit" : "Shown on the online site") + '</span></a>' +
      '<a class="kpi" href="#resume"><dd>' + ats.used + '<span class="dimmed" style="font-size:var(--fs-sm)">/100</span></dd><dt>ATS score</dt><span class="kpi-note">' + (state.generated[best.role.id] ? "Tailored resume" : "Current resume · tailored scores " + ats.tailored) + '</span></a>' +
      '<a class="kpi" href="#resume"><dd>' + projects + '<span class="dimmed" style="font-size:var(--fs-sm)"> of ' + best.role.projectsNeeded + '</span></dd><dt>Projects</dt><span class="kpi-note">Recommended for ' + esc(best.role.short) + '</span></a>';

    var top = (jobs.length ? (mine.length ? mine : jobs) : []).slice().sort(function (x, y) {
      var nx = isNewJob(x) ? 1 : 0, ny = isNewJob(y) ? 1 : 0;
      if (nx !== ny) return ny - nx;
      if (scores[y.roleId] !== scores[x.roleId]) return scores[y.roleId] - scores[x.roleId];
      return (y.posted || "").localeCompare(x.posted || "");
    }).slice(0, 5);
    $("dashJobsStatus").textContent = feedStatus();
    $("dashJobs").innerHTML = top.map(function (j) { return jobCard(j, scores); }).join("");

    $("topRoles").innerHTML = ranked.slice(0, 3).map(function (r) {
      var t = tierFor(r.pct);
      var steps = pathActions(r.role, ownedSet(), ctx, r.score);
      var run = r.score.value, n = 0;
      for (var i = 0; i < steps.length && run < 90; i++) { run += steps[i].gain; n++; }
      var note = r.pct >= 90 ? "Already above 90%" : run >= 90 ? n + (n === 1 ? " step" : " steps") + " to 90%" : "Up to " + Math.round(r.score.max) + "%";
      return '<li class="top-role tier-' + t.key + '">' + ring(r.pct) +
        '<div class="top-role-text"><a href="#roles" data-open-role="' + r.role.id + '">' + esc(r.role.title) + '</a>' +
        '<span class="salary">' + salaryText(r.role) + '</span>' +
        '<span class="top-role-meta"><span class="badge">' + t.label + '</span><span class="dimmed small">' + note + '</span></span></div></li>';
    }).join("");

    var plan = DATA.plan;
    var done = plan.filter(function (s) { return state.steps[s.id]; }).length;
    $("stepsProgress").textContent = done + " of " + plan.length + " done";
    $("steps").innerHTML = plan.map(function (s) {
      var isDone = !!state.steps[s.id];
      return '<li class="step' + (isDone ? " is-done" : "") + '"><label for="step-' + s.id + '">' +
        '<input type="checkbox" id="step-' + s.id + '" data-step="' + s.id + '"' + (isDone ? " checked" : "") + '>' +
        '<span class="step-text"><span class="step-day">' + esc(s.day) + '</span><strong>' + esc(s.title) + '</strong><span class="dimmed">' + esc(s.detail) + '</span></span></label></li>';
    }).join("");
  }

  // ---------- Role matcher ----------

  var openRoles = [];

  function pathHtml(role, have, ctx, sc) {
    var acts = pathActions(role, have, ctx, sc);
    if (!acts.length) return '<p class="dimmed small">Nothing left to add for this role.</p>';
    var run = sc.value, reached = sc.value >= 90;
    var items = acts.map(function (a) {
      var before = run;
      run += a.gain;
      var mark = !reached && before < 90 && run >= 90;
      if (mark) reached = true;
      var btn = "";
      if (a.kind === "resume") btn = '<a class="button button-default button-sm" href="#resume" data-ats-role="' + role.id + '">' + icon("file") + 'Generate</a>';
      if (a.kind === "skill") btn = '<button type="button" class="button button-default button-sm" data-learn="' + a.id + '">' + icon("check") + 'I\'ve learned this</button>';
      if (a.kind === "project") btn = '<button type="button" class="button button-default button-sm" data-add-project="' + a.ref + '">' + icon("check") + 'I\'ve built this</button>';
      if (a.kind === "referral") btn = '<button type="button" class="button button-default button-sm" data-referral="' + role.id + '">' + icon("handshake") + 'I have a referral</button>';
      return '<li class="path-step' + (mark ? " is-goal" : "") + '">' +
        '<span class="path-gain">+' + a.gain.toFixed(1) + '</span>' +
        '<span class="path-text"><strong>' + esc(a.label) + '</strong>' +
          '<span class="dimmed">' + esc([a.detail, a.time ? "about " + a.time : ""].filter(Boolean).join(" · ")) + '</span></span>' +
        '<span class="path-after">' + Math.round(run) + '%' + (mark ? ' <span class="badge badge-green">90% reached</span>' : '') + '</span>' +
        (btn ? '<span class="path-btn">' + btn + '</span>' : '') + '</li>';
    }).join("");
    var head = '<p class="dimmed small">' + (sc.max < 90
      ? 'The highest you can reach here is ' + Math.round(sc.max) + '%, because your experience covers ' + role.exp + '% of what this role expects.'
      : 'Experience gives you ' + sc.parts.exp.toFixed(1) + ' of ' + W.exp + ' points and only changes with new work experience, so the most you can reach here is ' + Math.round(sc.max) + '%.') + '</p>';
    return head + '<ol class="path">' + items + '</ol>';
  }

  function renderRoles(ranked, have, ctx, jobCounts) {
    $("tierLegend").innerHTML = TIERS.map(function (t) {
      return '<span class="tier-' + t.key + '"><span class="badge">' + t.label + '</span>' + t.note + '</span>';
    }).join("");

    $("roleList").innerHTML = ranked.map(function (r, i) {
      var role = r.role, sc = r.score, pct = r.pct;
      var t = tierFor(pct);
      var ids = Object.keys(role.skills).sort(function (a, b) { return role.skills[b] - role.skills[a]; });
      var got = ids.filter(function (id) { return have[id]; });
      // Your priority areas first.
      var companies = DATA.companies.filter(function (c) { return c.roles.indexOf(role.id) !== -1; })
        .sort(function (a, b) { return (areaById[b.area].priority ? 1 : 0) - (areaById[a.area].priority ? 1 : 0); });
      var isOpen = openRoles.indexOf(role.id) !== -1;
      var live = jobCounts[role.id] || 0;

      return '<li><details class="role tier-' + t.key + '" id="role-' + role.id + '" data-role="' + role.id + '"' + (isOpen ? " open" : "") + '>' +
        '<summary>' +
          '<span class="role-rank">' + (i + 1) + '</span>' +
          '<span class="role-title">' + esc(role.title) + '</span>' +
          '<span class="role-meta"><span class="badge">' + t.label + '</span>' +
            '<span class="salary">' + salaryText(role) + '</span>' +
            (LIVE.status === "ok" ? '<span class="dimmed small">' + live + ' live ' + (live === 1 ? "job" : "jobs") + '</span>' : '<span class="dimmed small">' + companies.length + ' employers in your areas</span>') +
            (state.referrals[role.id] ? '<span class="badge badge-green">' + icon("handshake") + 'Referral</span>' : '') +
          '</span>' +
          '<span class="role-score"><strong>' + pct + '%</strong><span class="progress" role="img" aria-label="Match ' + pct + ' percent"><span style="width:' + pct + '%"></span></span></span>' +
          '<span class="role-chev">' + icon("chevron") + '</span>' +
        '</summary>' +
        '<div class="role-body">' +
          '<p class="role-why">' + esc(role.why) + '</p>' +
          '<dl class="facts five">' +
            '<div><dt>Experience</dt><dd>' + sc.parts.exp.toFixed(1) + ' / ' + W.exp + '</dd></div>' +
            '<div><dt>Skills</dt><dd>' + sc.parts.skills.toFixed(1) + ' / ' + W.skills + '</dd></div>' +
            '<div><dt>Resume keywords</dt><dd>' + sc.parts.resume.toFixed(1) + ' / ' + W.resume + '</dd></div>' +
            '<div><dt>Projects &amp; certificates</dt><dd>' + sc.parts.proof.toFixed(1) + ' / ' + W.proof + '</dd></div>' +
            '<div><dt>Referral</dt><dd>' + sc.parts.referral.toFixed(0) + ' / ' + W.referral + '</dd></div>' +
          '</dl>' +
          '<section class="path-wrap"><h3>' + (pct >= 90 ? "You're above 90%. Keep going:" : "Path to 90%") + '</h3>' + pathHtml(role, have, ctx, sc) + '</section>' +
          '<dl class="facts">' +
            '<div><dt>Expected salary</dt><dd>' + salaryText(role) + '</dd></div>' +
            '<div><dt>Openings in Hyderabad</dt><dd>' + demandText(role) + '</dd></div>' +
            '<div><dt>Projects recommended</dt><dd>' + role.projectsNeeded + '</dd></div>' +
            '<div><dt>Skills you have</dt><dd>' + got.length + ' of ' + ids.length + '</dd></div>' +
          '</dl>' +
          (role.salary && role.salary.note ? '<p class="dimmed small">' + icon("rupee") + ' ' + esc(role.salary.note) + '</p>' : '') +
          '<div class="role-cols">' +
            '<div><h3>Hiring in Hyderabad</h3><ul class="pills">' +
              companies.map(function (c) {
                return '<li class="pill">' + icon("building") + esc(c.name) + ' <span class="dimmed">· ' + areaLabel(c.area) + '</span></li>';
              }).join("") +
            '</ul></div>' +
            '<div><h3>Search these job titles</h3><ul class="pills">' +
              role.search.map(function (q) { return '<li class="pill">' + icon("search") + esc(q) + '</li>'; }).join("") +
            '</ul></div>' +
          '</div>' +
          '<div class="button-row">' +
            '<a class="button button-default button-sm" href="#jobs" data-job-role="' + role.id + '">' + icon("live") + 'Live jobs for this role</a>' +
            '<a class="button button-default button-sm" href="#resume" data-ats-role="' + role.id + '">' + icon("file") + 'Check resume for this role</a>' +
            (state.referrals[role.id] ? '<button type="button" class="button button-subtle button-sm" data-referral="' + role.id + '">Remove referral</button>' : '') +
          '</div>' +
        '</div></details></li>';
    }).join("");

    $("methodBody").innerHTML =
      '<p><strong>Match score</strong> (out of 100) measures how closely your profile meets what the role asks for:</p><ul>' +
      '<li><strong>Experience (40):</strong> how directly your work history maps to the job, including whether employers want the exact title on paper. This part is fixed by your history.</li>' +
      '<li><strong>Skills (30):</strong> the weighted share of the role\'s core and supporting skills you have.</li>' +
      '<li><strong>Resume keywords (15):</strong> the ATS score of the resume you send. Generating a tailored resume raises it.</li>' +
      '<li><strong>Projects and certificates (10):</strong> projects against the number recommended (7), plus a relevant certificate (3).</li>' +
      '<li><strong>Referral (5):</strong> whether someone inside can refer you.</li></ul>' +
      '<p>90% or more means you meet nearly everything the job asks for. It is not a promise of an offer: interviews, timing and competition still decide that.</p>' +
      '<p><strong>Salary.</strong> Annual CTC for about 3 years\' experience in Hyderabad, from ' + esc(DATA.salarySources) + '. Amazon, Microsoft and Google usually pay at the top of each range; outsourcing firms pay at the bottom.</p>' +
      '<p><strong>Removed:</strong> ' + esc(DATA.removedRoles) + '</p>';
  }

  // ---------- Companies ----------

  var companyFilter = { area: "all", role: "all" };

  function renderCompanies() {
    function inArea(c, v) {
      if (v === "all") return true;
      return [c.area].concat(c.alsoIn || []).some(function (a) { return v === "mine" ? areaById[a].priority : a === v; });
    }
    $("areaFilter").innerHTML = areaOptions(companyFilter.area, function (v) {
      return DATA.companies.filter(function (c) { return inArea(c, v); }).length;
    }).replace(">All Hyderabad (", ">All areas (");
    $("roleFilter").innerHTML = '<option value="all">All target roles</option>' + DATA.roles.map(function (r) {
      return '<option value="' + r.id + '"' + (companyFilter.role === r.id ? " selected" : "") + '>' + esc(r.short) + '</option>';
    }).join("");

    var list = DATA.companies.filter(function (c) {
      if (!inArea(c, companyFilter.area)) return false;
      if (companyFilter.role !== "all" && c.roles.indexOf(companyFilter.role) === -1) return false;
      return true;
    });
    $("companyRows").innerHTML = list.length ? list.map(function (c) {
      var also = (c.alsoIn || []).length ? '<span class="company-also">also ' + c.alsoIn.map(areaLabel).join(", ") + '</span>' : '';
      return '<tr id="company-' + c.id + '"><td><div class="company-name">' + esc(c.name) +
        (c.confirmed ? '' : ' <span class="badge badge-yellow" title="Only secondary sources place this office here">Verify</span>') + '</div>' +
        '<div class="company-campus">' + esc(c.campus) + '</div>' +
        '<div class="company-area-inline company-campus">' + areaLabel(c.area) + also + '</div></td>' +
        '<td>' + areaLabel(c.area) + also + '</td>' +
        '<td><ul class="pills">' + c.roles.map(function (id) { return roleById[id] ? '<li class="pill">' + esc(roleById[id].short) + '</li>' : ''; }).join("") + '</ul></td>' +
        '<td><a class="button button-default button-sm" href="' + esc(c.careers) + '" target="_blank" rel="noopener">Careers' + icon("external") + '</a></td></tr>';
    }).join("") : '<tr><td colspan="4" class="dimmed">No companies match these filters.</td></tr>';
    $("companyNote").textContent = DATA.companyNote;
  }

  // ---------- Resume & ATS ----------

  function atsRoleId(ranked) {
    if (ui.atsRole && roleById[ui.atsRole]) return ui.atsRole;
    return ranked[0].role.id;
  }

  function atsTier(score) {
    return score >= 80 ? "now" : score >= 65 ? "prep" : score >= 50 ? "build" : "long";
  }

  function atsBox(score, title, note) {
    return '<div class="ats-box tier-' + atsTier(score) + '">' + ring(score, score + " out of 100") +
      '<div class="ats-box-text"><strong>' + title + '</strong><span class="dimmed">' + note + '</span></div></div>';
  }

  // The universal resume and how it scores against every role, next to the score of a resume made for that role.
  function renderUniversal(ctx) {
    var text = buildUniversalResume();
    $("universalPreview").textContent = text;
    var rows = DATA.roles.map(function (r) {
      return { role: r, score: atsScore(text, r).total, tailored: ctx.ats[r.id].tailored };
    }).sort(function (a, b) { return b.score - a.score; });
    var avg = Math.round(rows.reduce(function (s, x) { return s + x.score; }, 0) / rows.length);
    var best = rows[0], worst = rows[rows.length - 1];
    $("universalScore").innerHTML = atsBox(avg, "Average across your " + rows.length + " roles",
      "Highest for " + esc(best.role.short) + " (" + best.score + "), lowest for " + esc(worst.role.short) + " (" + worst.score + ")");
    $("universalFit").innerHTML = rows.map(function (x) {
      return '<li class="tier-' + atsTier(x.score) + '">' +
        '<span class="fit-role">' + esc(x.role.short) + '</span>' +
        '<span class="progress" role="img" aria-label="Universal resume scores ' + x.score + ' out of 100"><span style="width:' + x.score + '%"></span></span>' +
        '<strong class="fit-score">' + x.score + '</strong>' +
        '<a class="fit-tailored" href="#resume" data-ats-role="' + x.role.id + '" title="Make a resume for ' + esc(x.role.title) + '">Tailored: ' + x.tailored + icon("arrow") + '</a>' +
      '</li>';
    }).join("");
  }

  function renderResume(ranked, ctx) {
    var mode = ui.resumeMode === "universal" ? "universal" : "tailored";
    document.querySelectorAll(".resume-mode [data-resume-mode]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-resume-mode") === mode));
    });
    $("universalPane").hidden = mode !== "universal";
    $("tailoredPane").hidden = mode !== "tailored";
    renderUniversal(ctx);

    var roleId = atsRoleId(ranked);
    var role = roleById[roleId];
    $("atsRole").innerHTML = ranked.map(function (r) {
      return '<option value="' + r.role.id + '"' + (r.role.id === roleId ? " selected" : "") + '>' + esc(r.role.title) + ' (' + r.pct + '%)</option>';
    }).join("");

    var current = atsScore(DATA.resumeText, role);
    var generatedText = buildResume(role);
    var generated = atsScore(generatedText, role);
    $("atsCompare").innerHTML =
      atsBox(current.total, "Current resume", "Your PDF resume as it is today") +
      atsBox(generated.total, "Generated resume", "After you press Generate below");

    $("atsChecks").innerHTML = current.checks.map(function (c) {
      var ratio = c.pts / c.max;
      var cls = ratio >= 0.9 ? "ok" : ratio >= 0.5 ? "warn" : "bad";
      return '<li class="check ' + cls + '">' + icon(cls === "ok" ? "check" : cls === "warn" ? "alert" : "x") +
        '<span class="check-text">' + esc(c.label) + '<span class="dimmed">' + esc(c.detail) + '</span></span>' +
        '<span class="check-pts">' + (Math.round(c.pts * 10) / 10) + ' / ' + c.max + '</span></li>';
    }).join("");

    var projects = allProjects();
    var need = role.projectsNeeded;
    var enough = projects.length >= need;
    $("projectBadge").className = "badge " + (enough ? "badge-green" : "badge-yellow");
    $("projectBadge").textContent = enough ? "Enough" : (need - projects.length) + " more needed";
    $("projectCount").innerHTML = '<strong>' + projects.length + '</strong> of <strong>' + need + '</strong> projects recommended for ' + esc(role.short) + '. ' + esc(role.projectNote || "");
    $("projectList").innerHTML = projects.map(function (pr, i) {
      var userIdx = i - DATA.projects.length;
      return '<li>' + icon("check") + '<span><strong>' + esc(pr.title) + '</strong>' + (pr.tools ? ' <span class="dimmed">· ' + esc(pr.tools) + '</span>' : '') +
        (userIdx >= 0 ? ' <button type="button" class="button button-subtle button-sm" data-remove-project="' + userIdx + '">Remove</button>' : '') + '</span></li>';
    }).join("");
    $("projectIdeas").innerHTML = role.projectIdeas.map(function (idea, i) {
      return '<li><strong>' + esc(idea.title) + '</strong><span class="dimmed">' + esc(idea.detail) + '</span>' +
        '<span><button type="button" class="button button-subtle button-sm" data-add-project="' + role.id + ':' + i + '">' + icon("check") + 'I\'ve built this</button></span></li>';
    }).join("");

    var inResume = 0, canAdd = 0, missing = 0;
    $("keywordList").innerHTML = role.keywords.map(function (k) {
      if (keywordFound(DATA.resumeText, k)) { inResume++; return '<li class="pill pill-have">' + icon("check") + esc(k.term) + '</li>'; }
      if (hasKeyword(k)) { canAdd++; return '<li class="pill">' + icon("plus") + esc(k.term) + '</li>'; }
      missing++;
      return '<li class="pill pill-gap">' + esc(k.term) + '</li>';
    }).join("");
    $("keywordSummary").textContent = inResume + " in resume · " + canAdd + " to add · " + missing + " to learn";
    $("generateHint").textContent = "Tailored for " + role.title;
  }

  // ---------- Skills ----------

  function renderSkills(ranked, ctx) {
    var have = ownedSet();
    var ownedCount = Object.keys(have).length + state.custom.length;
    $("haveCount").textContent = ownedCount;

    var groups = DATA.skillGroups.map(function (g) {
      var skills = DATA.skills.filter(function (s) { return s.group === g.id && owns(s.id); });
      if (!skills.length) return "";
      return '<div class="skill-group"><h3>' + esc(g.label) + '</h3><div class="chips">' +
        skills.map(function (s) {
          return '<button type="button" class="chip" id="skill-' + s.id + '" data-toggle="' + s.id + '" title="Remove from your profile">' + icon("check") + esc(s.label) + '</button>';
        }).join("") + '</div></div>';
    }).join("");
    if (state.custom.length) {
      groups += '<div class="skill-group"><h3>Other (not scored)</h3><div class="chips">' +
        state.custom.map(function (c, i) {
          return '<span class="chip is-custom">' + esc(c) +
            '<button type="button" class="chip-remove" data-remove-custom="' + i + '" aria-label="Remove ' + esc(c) + '">' + icon("x") + '</button></span>';
        }).join("") + '</div></div>';
    }
    $("haveSkills").innerHTML = groups;

    var gaps = DATA.skills.filter(function (s) { return !have[s.id]; }).map(function (s) {
      var withSkill = Object.assign({}, have);
      withSkill[s.id] = true;
      var total = 0, roles = [];
      DATA.roles.forEach(function (r) {
        if (!r.skills[s.id]) return;
        var d = scoreRole(r, withSkill, ctx).value - scoreRole(r, have, ctx).value;
        if (d > 0) { total += d; roles.push(r.short); }
      });
      return { skill: s, gain: total, roles: roles };
    }).filter(function (g) { return g.gain > 0; }).sort(function (a, b) { return b.gain - a.gain; });
    $("gapCount").textContent = gaps.length;
    $("gapSkills").innerHTML = gaps.length ? gaps.map(function (g) {
      return '<li class="gap-item" id="skill-' + g.skill.id + '"><strong>' + esc(g.skill.label) + '</strong>' +
        '<span class="gain">+' + g.gain.toFixed(1) + ' pts</span>' +
        '<span class="dimmed">' + (g.skill.how ? esc(g.skill.how) + ' · ' : '') + 'Helps ' + esc(g.roles.join(", ")) + '</span>' +
        '<span><button type="button" class="button button-default button-sm" data-learn="' + g.skill.id + '">' + icon("check") + 'I\'ve learned this</button></span></li>';
    }).join("") : '<li class="dimmed">You cover every skill the matcher tracks.</li>';

    $("skillOptions").innerHTML = DATA.skills.filter(function (s) { return !have[s.id]; })
      .map(function (s) { return '<option value="' + esc(s.label) + '"></option>'; }).join("");
  }

  function renderPicker() {
    $("learnSkillPicker").innerHTML = DATA.skills.map(function (s) {
      return '<label><input type="checkbox" value="' + s.id + '" id="ls-' + s.id + '">' + esc(s.label) + '</label>';
    }).join("");
  }

  // ---------- Learning ----------

  var USE = {
    yes: { cls: "use-yes", label: "Useful" },
    no: { cls: "use-no", label: "Not useful" },
  };

  function renderLearning() {
    $("learnLegend").innerHTML =
      '<span class="use-yes"><span class="badge">Useful</span>Put it on your resume and mention it in interviews</span>' +
      '<span class="use-no"><span class="badge">Not useful</span>Leave it off your resume; it won\'t move a Hyderabad recruiter</span>';

    var userItems = state.learning.map(function (l, i) { return { item: l, userIndex: i }; }).reverse();
    var all = userItems.concat(DATA.learning.map(function (l) { return { item: l }; }));
    $("learningList").innerHTML = all.map(function (entry) {
      var l = entry.item;
      var use = USE[l.useful] || null;
      var title = l.url
        ? '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.title) + icon("external") + '</a>'
        : esc(l.title);
      var skills = (l.skills || []).filter(function (id) { return skillById[id]; });
      return '<li class="learn' + (use ? " " + use.cls : "") + '">' +
        '<div class="learn-main">' +
          '<span class="learn-title">' + title + '</span>' +
          '<span class="learn-source">' + esc([l.source, l.date].filter(Boolean).join(" · ")) + '</span>' +
          (l.why ? '<p class="learn-why">' + esc(l.why) + '</p>' : (l.note ? '<p class="learn-why">' + esc(l.note) + '</p>' : '')) +
          (l.action ? '<p class="learn-action">' + icon("arrow") + '<span>' + esc(l.action) + '</span></p>' : '') +
          (skills.length ? '<ul class="pills">' + skills.map(function (id) { return '<li class="pill">' + esc(skillById[id].label) + '</li>'; }).join("") + '</ul>' : '') +
        '</div>' +
        '<div class="learn-side">' +
          (use ? '<span class="badge">' + use.label + '</span>' : '<span class="badge badge-blue">Added by you</span>') +
          (entry.userIndex !== undefined ? '<button type="button" class="button button-subtle button-sm" data-remove-learning="' + entry.userIndex + '">' + icon("x") + 'Remove</button>' : '') +
        '</div></li>';
    }).join("");
  }

  // ---------- Profile ----------

  function renderProfile() {
    $("summary").textContent = DATA.person.summary;
    var total = 0;
    $("timeline").innerHTML = DATA.experience.map(function (job, i) {
      var months = monthsBetween(job.start, job.end);
      total += months;
      return '<li class="job' + (i === 0 ? " is-latest" : "") + '">' +
        '<span class="job-bullet">' + icon("briefcase") + '</span>' +
        '<h3>' + esc(job.role) + '</h3><div class="job-org">' + esc(job.company) + ', ' + esc(job.place) + '</div>' +
        '<div class="job-dates"><span>' + esc(job.start) + ' – ' + esc(job.end) + '</span><span class="badge">' + esc(formatDuration(months)) + '</span></div>' +
        '<ul>' + job.points.map(function (pt) { return '<li>' + esc(pt) + '</li>'; }).join("") + '</ul></li>';
    }).join("");
    $("tenure").textContent = formatDuration(total) + " of relevant experience in Hyderabad. Upskilling in AI governance and prompt engineering since March 2026.";

    $("education").innerHTML = DATA.education.map(function (e) {
      return '<div class="edu"><strong>' + esc(e.title) + '</strong><span class="dimmed">' + esc(e.place) + ' · ' + esc(e.year) + '</span></div>';
    }).join("");
    $("results").innerHTML = DATA.results.map(function (h) {
      return '<div><dt>' + esc(h.value) + '</dt><dd>' + esc(h.label) + '</dd></div>';
    }).join("");

    $("personalForm").innerHTML = DATA.personalFields.map(function (f) {
      var val = Object.prototype.hasOwnProperty.call(state.personal, f.id) ? state.personal[f.id] : f.value;
      var input = f.long
        ? '<textarea class="input" id="pf-' + f.id + '" data-field="' + f.id + '" rows="3" placeholder="' + esc(f.placeholder || "") + '">' + esc(val) + '</textarea>'
        : '<input class="input" id="pf-' + f.id + '" data-field="' + f.id + '" value="' + esc(val) + '" placeholder="' + esc(f.placeholder || "") + '">';
      return '<div class="field' + (f.long ? " long" : "") + '"><label class="label" for="pf-' + f.id + '">' + esc(f.label) + '</label>' + input + '</div>';
    }).join("");
  }

  // ---------- Render ----------

  function renderScored() {
    var have = ownedSet();
    var ctx = scoreContext();
    var ranked = rankedRoles(have, ctx);
    var scores = {};
    ranked.forEach(function (r) { scores[r.role.id] = r.pct; });
    var jobCounts = {};
    liveJobs().forEach(function (j) { jobCounts[j.roleId] = (jobCounts[j.roleId] || 0) + 1; });
    renderDashboard(ranked, ctx, scores);
    renderJobs(scores);
    renderAi(ranked, have, ctx, scores);
    liveLinks(ranked);
    renderRoles(ranked, have, ctx, jobCounts);
    renderResume(ranked, ctx);
    renderSkills(ranked, ctx);
    document.querySelector('[data-count="roles"]').textContent = DATA.roles.length;
    document.querySelector('[data-count="companies"]').textContent = DATA.companies.length;
    document.querySelector('[data-count="skills"]').textContent = Object.keys(have).length + state.custom.length;
  }

  function renderAll() {
    renderScored();
    renderCompanies();
    renderLearning();
    renderProfile();
    document.querySelector('[data-count="learning"]').textContent = DATA.learning.length + state.learning.length;
  }

  // ---------- Views ----------

  var navbar = $("navbar");
  var burger = $("burger");
  var overlay = $("navOverlay");

  function setNav(open) {
    navbar.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    overlay.hidden = !open;
  }

  function showView(name, focusEl) {
    if (VIEWS.indexOf(name) === -1) name = "dashboard";
    document.querySelectorAll(".view").forEach(function (v) { v.hidden = v.getAttribute("data-view") !== name; });
    document.querySelectorAll(".nav-link").forEach(function (l) {
      var active = l.getAttribute("data-view") === name;
      l.classList.toggle("is-active", active);
      if (active) l.setAttribute("aria-current", "page"); else l.removeAttribute("aria-current");
    });
    setNav(false);
    if (focusEl) {
      focusEl.scrollIntoView({ block: "center" });
      focusEl.classList.remove("flash");
      void focusEl.offsetWidth;
      focusEl.classList.add("flash");
    } else {
      window.scrollTo(0, 0);
    }
  }

  function viewFromHash() {
    var h = (location.hash || "").replace("#", "");
    return VIEWS.indexOf(h) !== -1 ? h : "dashboard";
  }

  window.addEventListener("hashchange", function () { showView(viewFromHash()); });
  burger.addEventListener("click", function () { setNav(!navbar.classList.contains("is-open")); });
  overlay.addEventListener("click", function () { setNav(false); });

  function openRole(id) {
    if (openRoles.indexOf(id) === -1) openRoles.push(id);
    var el = $("role-" + id);
    if (el) el.open = true;
    return el;
  }

  // ---------- Theme ----------

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") document.documentElement.setAttribute("data-theme", theme);
  }

  function currentTheme() {
    var set = document.documentElement.getAttribute("data-theme");
    if (set === "light" || set === "dark") return set;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  applyTheme(ui.theme);
  $("themeToggle").addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    ui.theme = next;
    saveUi();
  });

  // ---------- Search ----------

  var searchInput = $("searchInput");
  var results = $("searchResults");
  var header = document.querySelector(".shell-header");
  var activeIndex = 0;
  var currentOptions = [];

  function searchIndex() {
    var have = ownedSet();
    var items = [];
    document.querySelectorAll(".nav-link").forEach(function (l) {
      items.push({ group: "Pages", label: l.childNodes[1].textContent.trim(), icon: l.querySelector("[data-icon]").getAttribute("data-icon"), go: { view: l.getAttribute("data-view") } });
    });
    rankedRoles(have, scoreContext()).forEach(function (r) {
      items.push({ group: "Roles", label: r.role.title, extra: r.pct + "% · " + salaryText(r.role), icon: "target", keywords: r.role.search.join(" "), go: { role: r.role.id } });
    });
    DATA.companies.forEach(function (c) {
      items.push({ group: "Companies", label: c.name, extra: areaLabel(c.area), icon: "building", keywords: c.campus, go: { company: c.id } });
    });
    DATA.skills.forEach(function (s) {
      items.push({ group: "Skills", label: s.label, extra: owns(s.id) ? "You have" : "To learn", icon: owns(s.id) ? "check" : "plus", keywords: (s.aliases || []).join(" "), go: { skill: s.id } });
    });
    return items;
  }

  function renderResults() {
    var q = searchInput.value.trim().toLowerCase();
    if (!q) { closeResults(); return; }
    var words = q.split(/\s+/);
    currentOptions = searchIndex().filter(function (it) {
      var hay = (it.label + " " + (it.keywords || "")).toLowerCase();
      return words.every(function (w) { return hay.indexOf(w) !== -1; });
    }).slice(0, 14);
    activeIndex = 0;
    if (!currentOptions.length) {
      results.innerHTML = '<div class="search-empty">Nothing found for “' + esc(searchInput.value.trim()) + '”</div>';
    } else {
      var html = "", lastGroup = "";
      currentOptions.forEach(function (it, i) {
        if (it.group !== lastGroup) { html += '<div class="search-group">' + it.group + '</div>'; lastGroup = it.group; }
        html += '<button type="button" class="search-option" role="option" id="opt-' + i + '" data-index="' + i + '" aria-selected="' + (i === 0) + '">' +
          icon(it.icon) + '<span>' + esc(it.label) + '</span>' + (it.extra ? '<span class="dimmed">' + esc(it.extra) + '</span>' : '') + '</button>';
      });
      results.innerHTML = html;
    }
    results.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  function closeResults() {
    results.hidden = true;
    results.innerHTML = "";
    searchInput.setAttribute("aria-expanded", "false");
  }

  function highlight(i) {
    var opts = results.querySelectorAll(".search-option");
    if (!opts.length) return;
    activeIndex = (i + opts.length) % opts.length;
    opts.forEach(function (o, k) { o.setAttribute("aria-selected", String(k === activeIndex)); });
    opts[activeIndex].scrollIntoView({ block: "nearest" });
    searchInput.setAttribute("aria-activedescendant", "opt-" + activeIndex);
  }

  function go(view, el) {
    if (location.hash !== "#" + view) history.replaceState(null, "", "#" + view);
    showView(view, el);
  }

  function choose(i) {
    var it = currentOptions[i];
    if (!it) return;
    searchInput.value = "";
    closeResults();
    header.classList.remove("is-searching");
    searchInput.blur();
    if (it.go.view) { go(it.go.view); return; }
    if (it.go.role) { go("roles"); go("roles", openRole(it.go.role)); return; }
    if (it.go.company) {
      companyFilter = { area: "all", role: "all" };
      renderCompanies();
      go("companies", $("company-" + it.go.company));
      return;
    }
    if (it.go.skill) { go("skills"); go("skills", $("skill-" + it.go.skill)); }
  }

  searchInput.addEventListener("input", renderResults);
  searchInput.addEventListener("focus", function () { if (searchInput.value.trim()) renderResults(); });
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); highlight(activeIndex + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); highlight(activeIndex - 1); }
    else if (e.key === "Enter") { e.preventDefault(); choose(activeIndex); }
    else if (e.key === "Escape") { searchInput.value = ""; closeResults(); header.classList.remove("is-searching"); searchInput.blur(); }
  });
  results.addEventListener("mousedown", function (e) { e.preventDefault(); });
  results.addEventListener("click", function (e) {
    var opt = e.target.closest(".search-option");
    if (opt) choose(parseInt(opt.getAttribute("data-index"), 10));
  });
  searchInput.addEventListener("blur", function () {
    setTimeout(function () { closeResults(); header.classList.remove("is-searching"); }, 100);
  });
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      header.classList.add("is-searching");
      searchInput.focus();
    }
  });
  $("mobileSearch").addEventListener("click", function () {
    header.classList.add("is-searching");
    searchInput.focus();
  });
  if (/Mac|iPhone|iPad/.test(navigator.platform || "")) document.querySelector(".kbd").textContent = "⌘ K";

  // ---------- Resume actions ----------

  var lastResumeRole = null;

  // The two resumes on Resume & ATS, each with its own preview and message line.
  var RESUME_OUT = {
    tailored: { msg: "resumeMsg", preview: "resumePreview" },
    universal: { msg: "universalMsg", preview: "universalPreview" },
  };

  function resumeFileName(kind, ext) {
    var label = kind === "tailored" && lastResumeRole ? lastResumeRole.short.replace(/[^A-Za-z0-9]+/g, "_") + "_" : "";
    return "Shraddha_Biswas_" + label + "Resume." + ext;
  }

  function resumeHtml(text) {
    var body = esc(text).split("\n").map(function (line, i) {
      if (i === 0) return '<h1 style="font-size:18pt;margin:0">' + line + '</h1>';
      if (/^[A-Z][A-Z &]+$/.test(line)) return '<h2 style="font-size:12pt;margin:14pt 0 4pt;border-bottom:1px solid #999">' + line + '</h2>';
      if (/^• /.test(line)) return '<p style="margin:0 0 2pt 14pt;text-indent:-10pt">' + line + '</p>';
      if (!line) return '';
      return '<p style="margin:0 0 2pt">' + line + '</p>';
    }).join("\n");
    return '<!doctype html><html><head><meta charset="utf-8"><title>Shraddha Biswas Resume</title></head>' +
      '<body style="font-family:Calibri,Arial,sans-serif;font-size:10.5pt;line-height:1.35;max-width:7.5in;margin:0.6in auto;color:#000">' + body + '</body></html>';
  }

  // In the Claude preview, files are saved through the viewer's `downloads` capability,
  // which asks the viewer to confirm. Until it answers (or if it can't), save buttons stay hidden there.
  var downloads = null;
  if (IS_ARTIFACT && window.claude && window.claude.use) {
    window.claude.use("downloads").then(function (d) {
      downloads = d;
      document.documentElement.classList.toggle("can-save", !!d);
    }, function () { /* no downloads in this view */ });
  }

  // Resolves true when the file was handed to the browser.
  function download(name, type, content, msg) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: type });
    if (IS_ARTIFACT) {
      if (!downloads) { flash(msg, "This view can't save files. Use Copy text instead.", true); return Promise.resolve(false); }
      return downloads.save({ filename: name, data: blob }).then(function () {
        flash(msg, "Saved " + name + ".");
        return true;
      }, function (err) {
        var code = err && err.code;
        if (code === "declined") flash(msg, "Not saved. Press the button again when you want the file.");
        else if (code === "rate_limited") flash(msg, "A save is already waiting for you to confirm.", true);
        else flash(msg, "This view couldn't save the file. Use Copy text instead.", true);
        return false;
      });
    }
    try {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      flash(msg, "Downloaded " + name + ".");
      return Promise.resolve(true);
    } catch (e) {
      flash(msg, "This browser blocked the download. Use Copy text instead.", true);
      return Promise.resolve(false);
    }
  }

  // ---------- Resume PDF ----------
  // A text-based A4 PDF drawn with jsPDF, so ATS tools can read and search every word.
  // The library (vendor/, MIT licence) loads the first time it's needed.

  var pdfLib = null;

  function loadPdfLib() {
    if (window.jspdf) return Promise.resolve(window.jspdf.jsPDF);
    if (!pdfLib) {
      pdfLib = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = "vendor/jspdf.umd.min.js";
        s.onload = function () { if (window.jspdf) resolve(window.jspdf.jsPDF); else reject(new Error("no jsPDF")); };
        s.onerror = function () { pdfLib = null; reject(new Error("jsPDF failed to load")); };
        document.head.appendChild(s);
      });
    }
    return pdfLib;
  }

  // PDF's built-in Helvetica covers Latin-1 plus a few typographic marks; swap or drop anything else.
  var WIN_ANSI_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
  function pdfSafe(s) {
    return s.replace(/₹\s?/g, "Rs ").replace(/→/g, "->").replace(/[^\u0000-ÿ]/g, function (c) {
      return WIN_ANSI_EXTRA.indexOf(c) !== -1 ? c : "";
    });
  }

  // Lays out the resume text: name, headline, contact links, then each section with a rule under its heading.
  function drawResumePdf(JsPDF, text, pt) {
    var p = DATA.person;
    var doc = new JsPDF({ unit: "pt", format: "a4", compress: true });
    var pageW = doc.internal.pageSize.getWidth(), pageH = doc.internal.pageSize.getHeight();
    var margin = 40, width = pageW - 2 * margin, right = pageW - margin;
    var lead = pt * 1.3;
    var ink = "#111111", soft = "#4a4a4a";
    var lines = pdfSafe(text).split("\n");
    var y = margin + pt * 2;
    var section = "";

    function setFont(style, size, color) {
      doc.setFont("helvetica", style);
      doc.setFontSize(size || pt);
      doc.setTextColor(color || ink);
    }
    function room(h) { if (y + h > pageH - margin) { doc.addPage(); y = margin + pt; } }
    function wrap(str, firstW, w) {
      var out = [], cur = "", limit = firstW;
      str.split(/\s+/).filter(Boolean).forEach(function (word) {
        var test = cur ? cur + " " + word : word;
        if (cur && doc.getTextWidth(test) > limit) { out.push(cur); cur = word; limit = w; } else cur = test;
      });
      if (cur) out.push(cur);
      return out;
    }
    // A bold lead-in, then normal text wrapped under it; `date` sits on the right of the first line.
    function row(bold, rest, date, x) {
      x = x || margin;
      var w = right - x;
      setFont("normal");
      var dateW = date ? doc.getTextWidth(date) + 14 : 0;
      setFont("bold");
      var boldW = bold ? doc.getTextWidth(bold + " ") : 0;
      setFont("normal");
      var parts = rest ? wrap(rest, w - dateW - boldW, w) : [];
      room(lead * (1 + (section === "WORK EXPERIENCE" && date ? 1 : 0)));
      if (bold) { setFont("bold"); doc.text(bold, x, y); setFont("normal"); }
      if (parts.length) doc.text(parts[0], x + boldW, y);
      if (date) { setFont("normal", pt, soft); doc.text(date, right, y, { align: "right" }); setFont("normal"); }
      y += lead;
      parts.slice(1).forEach(function (l) { room(lead); doc.text(l, x, y); y += lead; });
    }
    function bullet(str) {
      var indent = pt * 1.1;
      setFont("normal");
      wrap(str, width - indent, width - indent).forEach(function (l, i) {
        room(lead);
        if (i === 0) doc.text("•", margin + 2, y);
        doc.text(l, margin + indent, y);
        y += lead;
      });
    }
    function heading(str) {
      room(lead * 3);
      y += pt * 0.55;
      setFont("bold", pt + 1.5);
      doc.text(str, margin, y, { charSpace: 0.6 });
      doc.setDrawColor("#9a9a9a");
      doc.setLineWidth(0.6);
      doc.line(margin, y + 4, right, y + 4);
      y += 4 + lead;
      setFont("normal");
    }

    // Name, headline and contact line.
    setFont("bold", pt * 2.1);
    doc.text(lines[0], margin, y);
    y += pt * 1.7;
    setFont("normal", pt + 1.5, soft);
    wrap(lines[1], width, width).forEach(function (l) { doc.text(l, margin, y); y += lead * 1.05; });
    setFont("normal", pt - 0.5);
    var sep = "  |  ", x = margin;
    lines[2].split(" | ").forEach(function (item, i) {
      item = item.replace(/^www\./, "");
      var label = (i ? sep : "") + item;
      if (x + doc.getTextWidth(label) > right) { x = margin; y += lead; label = item; }
      var url = item.indexOf("@") !== -1 ? "mailto:" + item : /linkedin\.com/.test(item) ? p.linkedin : null;
      if (url) {
        var lead0 = label.slice(0, label.length - item.length);
        doc.text(lead0, x, y);
        doc.setTextColor("#1a4fa0");
        doc.textWithLink(item, x + doc.getTextWidth(lead0), y, { url: url });
        doc.setTextColor(ink);
      } else {
        doc.text(label, x, y);
      }
      x += doc.getTextWidth(label);
    });
    y += lead * 0.9;

    lines.slice(3).forEach(function (l) {
      if (!l.trim()) { y += pt * 0.3; return; }
      if (/^[A-Z][A-Z &]{3,}$/.test(l.trim())) { section = l.trim(); heading(section); return; }
      if (/^• /.test(l)) { bullet(l.slice(2)); return; }
      var parts = l.split(" | ");
      var colon = l.indexOf(": ");
      if (section === "SKILLS" && colon > 0) { row(l.slice(0, colon + 1), l.slice(colon + 2)); return; }
      if (section === "WORK EXPERIENCE" && parts.length === 3) { row(parts[0], "| " + parts[1], parts[2]); y += pt * 0.1; return; }
      if (section === "WORK EXPERIENCE" && parts.length === 2) {
        var c = parts[0].indexOf(": ");
        if (c > 0) row(parts[0].slice(0, c + 1), parts[0].slice(c + 2), parts[1]); else row(parts[0], "", parts[1]);
        return;
      }
      if (section === "EDUCATION" && parts.length === 3) { row(parts[0], "| " + parts[1], parts[2]); return; }
      if (section === "PROJECTS" && parts.length >= 2) { row(parts[0], "| " + parts.slice(1).join(" | ")); return; }
      row("", l);
    });

    var pages = doc.getNumberOfPages();
    if (pages > 1) {
      for (var n = 1; n <= pages; n++) {
        doc.setPage(n);
        setFont("normal", pt - 1.5, soft);
        doc.text(p.name + "  ·  Page " + n + " of " + pages, pageW / 2, pageH - margin / 2, { align: "center" });
      }
    }
    doc.setProperties({ title: p.name + " – Resume", subject: lines[1], author: p.name, creator: p.name + " job search site" });
    doc.setLanguage("en-IN");
    return doc;
  }

  // One page when a slightly smaller font fits it; otherwise the full size over two pages.
  function resumePdf(text) {
    return loadPdfLib().then(function (JsPDF) {
      var sizes = [10, 9.5, 9];
      for (var i = 0; i < sizes.length; i++) {
        var doc = drawResumePdf(JsPDF, text, sizes[i]);
        if (doc.getNumberOfPages() === 1) return doc.output("blob");
      }
      return drawResumePdf(JsPDF, text, sizes[0]).output("blob");
    });
  }

  function savePdf(kind, text, msg, done) {
    if (IS_ARTIFACT && !downloads) {
      flash(msg, "This view can't save files, so there's no PDF here. Use Copy text, or open your website to download the PDF.", true);
      return;
    }
    flash(msg, "Making your PDF…");
    resumePdf(text).then(function (blob) {
      var name = resumeFileName(kind, "pdf");
      return download(name, "application/pdf", blob, msg).then(function (ok) { if (ok && done) done(name); });
    }).catch(function () {
      flash(msg, "The PDF couldn't be made. Check your connection and try again, or use Download Word.", true);
    });
  }

  $("generateBtn").addEventListener("click", function () {
    var role = roleById[$("atsRole").value];
    var text = buildResume(role);
    var msg = $("resumeMsg");
    lastResumeRole = role;
    $("resumePreview").textContent = text;
    $("resumeOutput").hidden = false;
    var score = atsScore(text, role).total;
    state.generated[role.id] = true;
    saveState();
    renderScored();
    savePdf("tailored", text, msg, function (name) {
      flash(msg, (IS_ARTIFACT ? "Saved " : "Downloaded ") + name + ". Estimated ATS score " + score + "/100, and this role's match is updated. Read it through before sending.");
    });
  });

  // Generate PDF, Copy, Download Word and Download .txt, for whichever resume the buttons sit under.
  document.querySelectorAll("[data-resume]").forEach(function (row) {
    var kind = row.getAttribute("data-resume");
    var msg = $(RESUME_OUT[kind].msg), preview = $(RESUME_OUT[kind].preview);
    row.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-resume-act]");
      if (!btn) return;
      var act = btn.getAttribute("data-resume-act");
      var text = preview.textContent;
      if (act === "copy") {
        copyText(text, function (ok) {
          if (ok) { flash(msg, "Resume copied. Paste it into Word or Google Docs and save as .docx or PDF."); return; }
          var range = document.createRange();
          range.selectNodeContents(preview);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          flash(msg, "Your browser blocked copying. The resume is selected; copy it with Ctrl+C or Cmd+C.", true);
        });
      } else if (act === "txt") {
        download(resumeFileName(kind, "txt"), "text/plain;charset=utf-8", text, msg);
      } else if (act === "doc") {
        download(resumeFileName(kind, "doc"), "application/msword", resumeHtml(text), msg);
      } else if (act === "pdf") {
        savePdf(kind, text, msg);
      }
    });
  });

  $("atsRole").addEventListener("change", function () {
    ui.atsRole = this.value;
    saveUi();
    $("resumeOutput").hidden = true;
    renderScored();
  });

  // ---------- Click actions ----------

  document.addEventListener("click", function (e) {
    var link = e.target.closest("[data-open-role]");
    if (link) {
      e.preventDefault();
      go("roles");
      go("roles", openRole(link.getAttribute("data-open-role")));
      return;
    }
    var jobRoleLink = e.target.closest("[data-job-role]");
    if (jobRoleLink) {
      jobFilter.role = jobRoleLink.getAttribute("data-job-role");
      jobFilter.area = "all";
      renderScored();
      return;
    }
    if (e.target.closest("[data-run-github]")) {
      // Opens GitHub in a new tab; new openings show up here once that run saves them.
      var before = jobIds();
      setRefresh(true, 'After you press "Run workflow" on GitHub, the new openings appear here in about 3 minutes.');
      waitForCheck(before, LIVE.data ? LIVE.data.updated : null);
      return;
    }
    if (e.target.closest("[data-open-setup]")) {
      e.preventDefault();
      if (location.hash !== "#jobs") location.hash = "#jobs";
      var setup = $("refreshSetup");
      setup.open = true;
      setTimeout(function () { setup.scrollIntoView({ block: "start" }); $("tokenInput").focus(); }, 0);
      return;
    }
    var atsLink = e.target.closest("[data-ats-role]");
    if (atsLink) {
      ui.atsRole = atsLink.getAttribute("data-ats-role");
      ui.resumeMode = "tailored";
      saveUi();
      if (!lastResumeRole || lastResumeRole.id !== ui.atsRole) $("resumeOutput").hidden = true;
      renderScored();
      if (location.hash === "#resume") window.scrollTo(0, 0);
      return;
    }
    var modeLink = e.target.closest("[data-resume-mode]");
    if (modeLink) {
      e.preventDefault();
      ui.resumeMode = modeLink.getAttribute("data-resume-mode");
      saveUi();
      renderScored();
      if (modeLink.tagName === "A") window.scrollTo(0, 0);
      return;
    }

    var t = e.target.closest("button");
    if (!t) return;
    if (t.hasAttribute("data-refresh")) { refreshJobs(); return; }

    if (t.dataset.copy) {
      copyText(t.dataset.copy, function (ok) {
        t.innerHTML = icon(ok ? "check" : "x");
        t.classList.toggle("is-done", ok);
        setTimeout(function () { t.innerHTML = icon("copy"); t.classList.remove("is-done"); }, 1400);
      });
    } else if (t.dataset.toggle) {
      setOwned(t.dataset.toggle, !owns(t.dataset.toggle));
      saveState();
      renderScored();
    } else if (t.dataset.learn) {
      setOwned(t.dataset.learn, true);
      saveState();
      renderScored();
    } else if (t.dataset.referral) {
      var rid = t.dataset.referral;
      if (state.referrals[rid]) delete state.referrals[rid]; else state.referrals[rid] = true;
      saveState();
      renderScored();
    } else if (t.dataset.jobSort) {
      jobFilter.sort = t.dataset.jobSort;
      renderScored();
    } else if (t.dataset.aiSort) {
      aiFilter.sort = t.dataset.aiSort;
      renderScored();
    } else if (t.dataset.addProject) {
      var parts = t.dataset.addProject.split(":");
      var idea = roleById[parts[0]].projectIdeas[parseInt(parts[1], 10)];
      if (!state.projects.some(function (p) { return p.title === idea.title; })) {
        state.projects.push({ title: idea.title, tools: idea.tools || "", points: idea.resumePoints || [] });
        saveState();
      }
      renderScored();
    } else if (t.dataset.removeProject !== undefined) {
      state.projects.splice(parseInt(t.dataset.removeProject, 10), 1);
      saveState();
      renderScored();
    } else if (t.dataset.removeCustom !== undefined) {
      state.custom.splice(parseInt(t.dataset.removeCustom, 10), 1);
      saveState();
      renderScored();
    } else if (t.dataset.removeLearning !== undefined) {
      state.learning.splice(parseInt(t.dataset.removeLearning, 10), 1);
      saveState();
      renderLearning();
      renderScored();
    }
  });

  document.addEventListener("change", function (e) {
    var step = e.target.dataset && e.target.dataset.step;
    if (step) {
      state.steps[step] = e.target.checked;
      saveState();
      e.target.closest(".step").classList.toggle("is-done", e.target.checked);
      var done = DATA.plan.filter(function (s) { return state.steps[s.id]; }).length;
      $("stepsProgress").textContent = done + " of " + DATA.plan.length + " done";
    }
  });

  $("jobAreaFilter").addEventListener("change", function () {
    jobFilter.area = this.value;
    renderScored();
  });

  $("aiAreaFilter").addEventListener("change", function () {
    aiFilter.area = this.value;
    renderScored();
  });

  $("areaFilter").addEventListener("change", function () {
    companyFilter.area = this.value;
    renderCompanies();
  });

  $("saveToken").addEventListener("click", function () {
    var v = $("tokenInput").value.trim();
    if (!/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(v)) {
      flash($("tokenMsg"), "That doesn't look like a GitHub token. It starts with github_pat_.", true);
      return;
    }
    try { localStorage.setItem(TOKEN_KEY, v); } catch (e) {
      flash($("tokenMsg"), "This browser won't save it (private window?).", true);
      return;
    }
    $("tokenInput").value = "";
    renderTokenState();
    flash($("tokenMsg"), "Saved in this browser. Press Refresh to check every job board now.");
  });

  $("forgetToken").addEventListener("click", function () {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* nothing saved */ }
    renderTokenState();
    flash($("tokenMsg"), "Token removed from this browser. You can also delete it on GitHub.");
  });

  $("jobRoleFilter").addEventListener("change", function () {
    jobFilter.role = this.value;
    renderScored();
  });

  $("roleFilter").addEventListener("change", function () {
    companyFilter.role = this.value;
    renderCompanies();
  });

  $("aiJobList").addEventListener("toggle", function (e) {
    var d = e.target;
    if (!d.dataset || !d.dataset.job) return;
    if (d.open) openNext[d.dataset.job] = true; else delete openNext[d.dataset.job];
  }, true);

  $("roleList").addEventListener("toggle", function (e) {
    var d = e.target;
    if (!d.dataset || !d.dataset.role) return;
    openRoles = openRoles.filter(function (id) { return id !== d.dataset.role; });
    if (d.open) openRoles.push(d.dataset.role);
  }, true);

  $("addSkillForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = $("skillInput");
    var q = input.value.trim();
    var msg = $("skillMsg");
    if (!q) return;
    var match = findSkill(q);
    if (match) {
      if (owns(match.id)) {
        flash(msg, match.label + " is already on your profile.");
      } else {
        setOwned(match.id, true);
        saveState();
        renderScored();
        flash(msg, "Added " + match.label + ". Role scores updated.");
      }
    } else if (state.custom.some(function (c) { return c.toLowerCase() === q.toLowerCase(); })) {
      flash(msg, q + " is already on your list.");
    } else {
      state.custom.push(q);
      saveState();
      renderScored();
      flash(msg, "Added " + q + ". The role matcher doesn't track it, so scores stay the same.");
    }
    input.value = "";
  });

  $("learnForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var title = $("learnTitle").value.trim();
    if (!title) return;
    var skills = Array.prototype.slice.call(document.querySelectorAll("#learnSkillPicker input:checked")).map(function (c) { return c.value; });
    state.learning.push({ title: title, source: $("learnSource").value.trim(), date: $("learnDate").value.trim(), note: $("learnNote").value.trim(), skills: skills });
    skills.forEach(function (id) { setOwned(id, true); });
    saveState();
    e.target.reset();
    renderLearning();
    renderScored();
    document.querySelector('[data-count="learning"]').textContent = DATA.learning.length + state.learning.length;
    flash($("learnMsg"), "Added " + title + (skills.length ? ". Its skills are on your profile and scores are updated." : "."));
  });

  $("personalForm").addEventListener("input", function (e) {
    var f = e.target.dataset && e.target.dataset.field;
    if (!f) return;
    state.personal[f] = e.target.value;
    saveState();
    if (f === "languages") renderScored();
  });
  $("personalForm").addEventListener("submit", function (e) { e.preventDefault(); });

  $("copyBackup").addEventListener("click", function () {
    var text = JSON.stringify(state);
    var box = $("backupFallback");
    copyText(text, function (ok) {
      if (ok) {
        box.hidden = true;
        flash($("backupMsg"), "Backup copied. Paste it somewhere safe, such as a note or an email to yourself.");
      } else {
        box.hidden = false;
        box.value = text;
        box.focus();
        box.select();
        flash($("backupMsg"), "Your browser blocked copying. The backup is selected above; copy it with Ctrl+C or Cmd+C.");
      }
    });
  });
  $("showRestore").addEventListener("click", function () {
    $("restoreBox").hidden = !$("restoreBox").hidden;
    $("resetConfirm").hidden = true;
  });
  $("doRestore").addEventListener("click", function () {
    try {
      state = normalizeState(JSON.parse($("restoreInput").value));
      saveState();
      renderAll();
      $("restoreBox").hidden = true;
      $("restoreInput").value = "";
      flash($("backupMsg"), "Backup restored.");
    } catch (err) {
      flash($("backupMsg"), "That text isn't a valid backup. Paste the full text you copied with Copy backup.", true);
    }
  });
  $("resetBtn").addEventListener("click", function () {
    $("resetConfirm").hidden = false;
    $("restoreBox").hidden = true;
  });
  $("cancelReset").addEventListener("click", function () { $("resetConfirm").hidden = true; });
  $("confirmReset").addEventListener("click", function () {
    state = emptyState();
    saveState();
    renderAll();
    $("resetConfirm").hidden = true;
    flash($("backupMsg"), "Page changes cleared.");
  });

  fillIcons();
  renderPicker();
  renderAll();
  showView(viewFromHash());
  renderTokenState();
  loadJobs();
})();
