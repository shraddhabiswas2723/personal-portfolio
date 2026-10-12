(function () {
  "use strict";

  var DATA = window.PROFILE_DATA;
  var STORAGE_KEY = "shraddha-portfolio-v1";
  var UI_KEY = "shraddha-portfolio-ui-v1";
  var MAX_SCORE = 90;
  var TIERS = [
    { min: 75, key: "now", label: "Apply now" },
    { min: 60, key: "prep", label: "Apply with prep" },
    { min: 45, key: "build", label: "Build toward" },
    { min: 0, key: "long", label: "Long-term goal" },
  ];
  var MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

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
    school: '<path d="M22 9 12 5 2 9l10 4 10-4v6"/><path d="M6 10.6V16a6 3 0 0 0 12 0v-5.4"/>',
    user: '<circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    pin: '<circle cx="12" cy="11" r="3"/><path d="M17.657 16.657 13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    link: '<path d="m9 15 6-6"/><path d="m11 6 .463-.536a5 5 0 0 1 7.071 7.072L18 13"/><path d="m13 18-.397.534a5.068 5.068 0 0 1-7.127 0 4.972 4.972 0 0 1 0-7.071L6 11"/>',
    external: '<path d="M12 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/><path d="m11 13 9-9"/><path d="M15 4h5v5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    trending: '<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
    building: '<path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>',
    flask: '<path d="M9 3h6"/><path d="M10 9V3h4v6l5 10a1 1 0 0 1-.9 1.5H5.9A1 1 0 0 1 5 19z"/>',
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

  // ---------- Saved state ----------

  function emptyState() {
    return { added: [], removed: [], custom: [], learning: [], personal: {} };
  }

  function normalizeState(obj) {
    var s = emptyState();
    if (!obj || typeof obj !== "object") return s;
    ["added", "removed", "custom", "learning"].forEach(function (k) {
      if (Array.isArray(obj[k])) s[k] = obj[k];
    });
    if (obj.personal && typeof obj.personal === "object") s.personal = obj.personal;
    s.added = s.added.filter(function (id) { return skillById[id]; });
    s.removed = s.removed.filter(function (id) { return skillById[id]; });
    s.custom = s.custom.filter(function (c) { return typeof c === "string"; });
    s.learning = s.learning.filter(function (l) { return l && typeof l.title === "string"; });
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
  if (!ui.collapsed || typeof ui.collapsed !== "object") ui.collapsed = {};

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

  // ---------- Scoring ----------

  function scoreRole(role, have) {
    var total = 0, got = 0;
    Object.keys(role.skills).forEach(function (id) {
      var w = role.skills[id];
      total += w;
      if (have[id]) got += w;
    });
    var coverage = total ? (100 * got) / total : 0;
    var raw = 0.5 * role.exp + 0.35 * coverage + 0.15 * role.demand;
    return {
      value: raw * (MAX_SCORE / 100),
      exp: role.exp * 0.45,
      skills: coverage * 0.315,
      demand: role.demand * 0.135,
    };
  }

  function tierFor(score) {
    for (var i = 0; i < TIERS.length; i++) if (score >= TIERS[i].min) return TIERS[i];
    return TIERS[TIERS.length - 1];
  }

  function rankedRoles(have) {
    return DATA.roles
      .map(function (r) { return { role: r, score: scoreRole(r, have) }; })
      .sort(function (a, b) { return b.score.value - a.score.value; });
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

  function ring(pct) {
    var r = 34, c = 2 * Math.PI * r;
    var off = c * (1 - pct / 100);
    return '<div class="ring" role="img" aria-label="Match ' + pct + ' percent">' +
      '<svg viewBox="0 0 84 84"><circle class="ring-track" cx="42" cy="42" r="' + r + '"/>' +
      '<circle class="ring-value" cx="42" cy="42" r="' + r + '" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '"/></svg>' +
      '<span class="ring-label">' + pct + '%</span></div>';
  }

  // ---------- Overview ----------

  function renderProfile() {
    var p = DATA.person;
    $("name").textContent = p.name;
    $("headline").textContent = p.headline;
    $("summary").textContent = p.summary;

    function copyItem(iconName, value) {
      return '<span class="contact-item">' + icon(iconName) + '<span class="value">' + esc(value) + '</span>' +
        '<button type="button" class="copy" data-copy="' + esc(value) + '" aria-label="Copy ' + esc(value) + '">' + icon("copy") + '</button></span>';
    }
    $("contact").innerHTML =
      copyItem("mail", p.email) +
      copyItem("phone", p.phone) +
      '<span class="contact-item">' + icon("link") +
      '<a class="value" href="' + esc(p.linkedin) + '" target="_blank" rel="noopener">LinkedIn' + icon("external") + '</a></span>';

    $("highlights").innerHTML = DATA.highlights.map(function (h) {
      return '<div class="stat"><dt>' + esc(h.value) + '</dt><dd>' + esc(h.label) + '</dd></div>';
    }).join("");
  }

  // ---------- Experience ----------

  function renderExperience() {
    var total = 0;
    $("timeline").innerHTML = DATA.experience.map(function (job, i) {
      var months = monthsBetween(job.start, job.end);
      total += months;
      return '<li class="job' + (i === 0 ? " is-latest" : "") + '">' +
        '<span class="job-bullet">' + icon("briefcase") + '</span>' +
        '<div class="job-head"><h3>' + esc(job.role) + '</h3><span class="job-org">' + esc(job.company) + ', ' + esc(job.place) + '</span></div>' +
        '<div class="job-dates"><span>' + esc(job.start) + ' – ' + esc(job.end) + '</span>' +
        '<span class="badge badge-gray">' + esc(formatDuration(months)) + '</span></div>' +
        '<ul>' + job.points.map(function (pt) { return '<li>' + esc(pt) + '</li>'; }).join("") + '</ul></li>';
    }).join("");
    $("tenure").textContent = formatDuration(total) + " of full-time work across compliance, audit and technical support, all in Hyderabad.";
    $("experienceCount").textContent = DATA.experience.length + " roles";

    var pr = DATA.project;
    $("project").innerHTML = '<div class="project-head">' + icon("flask") + '<h3 class="item-title">' + esc(pr.title) + '</h3>' +
      '<span class="badge badge-blue">' + esc(pr.tag) + '</span></div>' +
      '<ul>' + pr.points.map(function (pt) { return '<li>' + esc(pt) + '</li>'; }).join("") + '</ul>';
  }

  function renderEducation() {
    $("educationList").innerHTML = DATA.education.map(function (e) {
      return '<tr><td>' + esc(e.year) + '</td><td>' + esc(e.title) + '</td><td>' + esc(e.place) + '</td></tr>';
    }).join("");
    $("educationCount").textContent = DATA.education.length;
  }

  // ---------- Role matcher ----------

  var openRoles = null;

  function renderMatcher() {
    var have = ownedSet();
    var ranked = rankedRoles(have);
    if (openRoles === null) openRoles = [ranked[0].role.id];

    var applyNow = ranked.filter(function (r) { return r.score.value >= 75 && !r.role.fallback; }).length;
    $("matcherCount").textContent = applyNow + " to apply now";
    $("navMatcherBadge").textContent = DATA.roles.length;

    var picks = ranked.filter(function (r) { return !r.role.fallback; }).slice(0, 3);
    $("topPicks").innerHTML = picks.map(function (r, i) {
      var pct = Math.round(r.score.value);
      var t = tierFor(pct);
      return '<div class="pick tier-' + t.key + '">' + ring(pct) +
        '<div class="pick-text"><span class="pick-rank">Best fit #' + (i + 1) + '</span>' +
        '<span class="pick-title">' + esc(r.role.title) + '</span>' +
        '<span class="badge">' + t.label + '</span></div></div>';
    }).join("");

    $("roles").innerHTML = ranked.map(function (r, i) {
      var role = r.role, sc = r.score;
      var pct = Math.round(sc.value);
      var t = tierFor(pct);
      var ids = Object.keys(role.skills).sort(function (a, b) { return role.skills[b] - role.skills[a]; });
      var got = ids.filter(function (id) { return have[id]; });
      var gaps = ids.filter(function (id) { return !have[id]; });
      var weightLabel = function (id) { return ["", "nice to have", "important", "core"][role.skills[id]]; };
      var isOpen = openRoles.indexOf(role.id) !== -1;

      return '<li><details class="role tier-' + t.key + '" id="role-' + role.id + '" data-role="' + role.id + '"' + (isOpen ? " open" : "") + '>' +
        '<summary>' +
          '<span class="role-rank">' + (i + 1) + '</span>' +
          '<span class="role-name">' + esc(role.title) +
            '<span class="badge">' + t.label + '</span>' +
            (role.fallback ? '<span class="badge badge-outline">Backup option</span>' : '') +
          '</span>' +
          '<span class="progress" role="img" aria-label="Match ' + pct + ' percent"><span style="width:' + pct + '%"></span></span>' +
          '<span class="role-pct">' + pct + '%</span>' +
          '<span class="chevron">' + icon("chevron") + '</span>' +
        '</summary>' +
        '<div class="role-body">' +
          '<p class="role-why">' + esc(role.why) + '</p>' +
          '<dl class="breakdown">' +
            '<div><dt>Experience fit</dt><dd>' + sc.exp.toFixed(1) + ' / 45</dd></div>' +
            '<div><dt>Skill coverage</dt><dd>' + sc.skills.toFixed(1) + ' / 31.5</dd></div>' +
            '<div><dt>Hyderabad demand</dt><dd>' + sc.demand.toFixed(1) + ' / 13.5</dd></div>' +
          '</dl>' +
          '<div class="role-cols">' +
            '<div><h4>Skills you have</h4><ul class="pills">' +
              (got.length ? got.map(function (id) {
                return '<li class="pill pill-have">' + icon("check") + esc(skillById[id].label) + '</li>';
              }).join("") : '<li class="dimmed">None yet</li>') +
            '</ul></div>' +
            '<div><h4>Gaps to close</h4><ul class="pills">' +
              (gaps.length ? gaps.map(function (id) {
                return '<li><button type="button" class="pill pill-gap" data-learn="' + id + '" title="Mark as learned">' + icon("plus") +
                  esc(skillById[id].label) + ' <span class="weight">· ' + weightLabel(id) + '</span></button></li>';
              }).join("") : '<li class="dimmed">No gaps. You cover every skill this role asks for.</li>') +
            '</ul></div>' +
            '<div><h4>Hiring in Hyderabad</h4><ul class="pills">' +
              role.employers.map(function (e) { return '<li class="pill">' + icon("building") + esc(e) + '</li>'; }).join("") +
            '</ul></div>' +
            '<div><h4>Search these job titles</h4><ul class="pills">' +
              role.search.map(function (s) { return '<li class="pill">' + icon("search") + esc(s) + '</li>'; }).join("") +
            '</ul></div>' +
          '</div>' +
        '</div></details></li>';
    }).join("");

    renderNextSkills(have);
  }

  function renderNextSkills(have) {
    var gains = DATA.skills.filter(function (s) { return !have[s.id]; }).map(function (s) {
      var withSkill = Object.assign({}, have);
      withSkill[s.id] = true;
      var total = 0, roles = [];
      DATA.roles.forEach(function (r) {
        if (!r.skills[s.id]) return;
        var d = scoreRole(r, withSkill).value - scoreRole(r, have).value;
        if (d > 0) { total += d; roles.push(r.title.split(" / ")[0]); }
      });
      return { skill: s, gain: total, roles: roles };
    }).filter(function (g) { return g.gain > 0; })
      .sort(function (a, b) { return b.gain - a.gain; })
      .slice(0, 5);

    $("nextSkills").innerHTML = gains.length ? gains.map(function (g) {
      return '<li><span class="gain">+' + g.gain.toFixed(1) + ' pts</span>' +
        '<button type="button" class="button button-default button-sm" data-learn="' + g.skill.id + '" title="Mark as learned">' + icon("plus") + esc(g.skill.label) + '</button>' +
        '<span class="affects">' + esc(g.roles.join(", ")) + '</span></li>';
    }).join("") : '<li class="dimmed">You cover every skill the matcher tracks.</li>';
  }

  // ---------- Skills ----------

  function renderSkills() {
    var ownedCount = DATA.skills.filter(function (s) { return owns(s.id); }).length + state.custom.length;
    $("skillsCount").textContent = ownedCount + " on profile";
    $("navSkillsBadge").textContent = ownedCount;

    var groups = DATA.skillGroups.map(function (g) {
      var skills = DATA.skills.filter(function (s) { return s.group === g.id; });
      skills.sort(function (a, b) { return (owns(b.id) ? 1 : 0) - (owns(a.id) ? 1 : 0); });
      var have = skills.filter(function (s) { return owns(s.id); }).length;
      return '<div class="item skill-group"><div class="skill-group-head"><h3 class="item-title">' + esc(g.label) + '</h3>' +
        '<span class="dimmed">' + have + ' of ' + skills.length + '</span></div><div class="chips">' +
        skills.map(function (s) {
          var on = owns(s.id);
          return '<button type="button" class="chip ' + (on ? "is-on" : "is-gap") + '" id="skill-' + s.id + '" data-toggle="' + s.id + '" aria-pressed="' + on + '">' +
            icon(on ? "check" : "plus") + esc(s.label) + '</button>';
        }).join("") + '</div></div>';
    });
    if (state.custom.length) {
      groups.push('<div class="item skill-group"><div class="skill-group-head"><h3 class="item-title">Other skills</h3>' +
        '<span class="dimmed">Not scored</span></div><div class="chips">' +
        state.custom.map(function (c, i) {
          return '<span class="chip is-custom">' + esc(c) +
            '<button type="button" class="chip-remove" data-remove-custom="' + i + '" aria-label="Remove ' + esc(c) + '">' + icon("x") + '</button></span>';
        }).join("") + '</div></div>');
    }
    $("skillGroups").innerHTML = groups.join("");

    $("skillOptions").innerHTML = DATA.skills.filter(function (s) { return !owns(s.id); })
      .map(function (s) { return '<option value="' + esc(s.label) + '"></option>'; }).join("");
  }

  function renderPicker() {
    $("learnSkillPicker").innerHTML = DATA.skills.map(function (s) {
      return '<label><input type="checkbox" value="' + s.id + '" id="ls-' + s.id + '">' + esc(s.label) + '</label>';
    }).join("");
  }

  // ---------- Learning ----------

  function renderLearning() {
    var userItems = state.learning.map(function (l, i) { return { item: l, userIndex: i }; }).reverse();
    var baseItems = DATA.learning.map(function (l, i) { return { item: l, featured: i === 0 }; });
    var all = userItems.concat(baseItems);
    $("learningCount").textContent = all.length;
    $("navLearningBadge").textContent = all.length;

    $("learningList").innerHTML = all.map(function (entry) {
      var l = entry.item;
      var title = l.url
        ? '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.title) + icon("external") + '</a>'
        : esc(l.title);
      var skills = (l.skills || []).filter(function (id) { return skillById[id]; });
      var meta = '';
      if (entry.featured) meta += '<span class="badge badge-green">Latest</span>';
      if (entry.userIndex !== undefined) meta += '<span class="badge badge-blue">Added by you</span>';
      if (l.source) meta += '<span class="badge badge-gray">' + esc(l.source) + '</span>';
      if (l.date) meta += '<span class="dimmed" style="font-size:var(--fs-xs)">' + esc(l.date) + '</span>';
      return '<li class="item learn' + (entry.featured ? " is-featured" : "") + '">' +
        (meta ? '<div class="learn-meta">' + meta + '</div>' : '') +
        '<span class="learn-title">' + title + '</span>' +
        (l.note ? '<p class="dimmed">' + esc(l.note) + '</p>' : '') +
        (skills.length ? '<ul class="pills">' + skills.map(function (id) {
          return '<li class="pill">' + esc(skillById[id].label) + '</li>';
        }).join("") + '</ul>' : '') +
        (entry.userIndex !== undefined
          ? '<button type="button" class="button button-subtle button-sm learn-remove" data-remove-learning="' + entry.userIndex + '">' + icon("x") + 'Remove entry</button>'
          : '') +
        '</li>';
    }).join("");
  }

  // ---------- Personal ----------

  function renderPersonal() {
    $("personalForm").innerHTML = DATA.personalFields.map(function (f) {
      var val = Object.prototype.hasOwnProperty.call(state.personal, f.id) ? state.personal[f.id] : f.value;
      var input = f.long
        ? '<textarea class="input" id="pf-' + f.id + '" data-field="' + f.id + '" rows="3">' + esc(val) + '</textarea>'
        : '<input class="input" id="pf-' + f.id + '" data-field="' + f.id + '" value="' + esc(val) + '">';
      return '<div class="field' + (f.long ? " long" : "") + '"><label class="label" for="pf-' + f.id + '">' + esc(f.label) + '</label>' + input + '</div>';
    }).join("");
  }

  // ---------- Collapsible categories ----------

  function setCollapsed(section, collapsed) {
    var btn = section.querySelector(".category-toggle");
    var body = section.querySelector(".category-body");
    if (!btn || !body) return;
    btn.setAttribute("aria-expanded", String(!collapsed));
    body.hidden = collapsed;
  }

  function initCategories() {
    document.querySelectorAll(".category").forEach(function (section) {
      setCollapsed(section, !!ui.collapsed[section.id]);
      section.querySelector(".category-toggle").addEventListener("click", function () {
        var collapsed = this.getAttribute("aria-expanded") === "true";
        setCollapsed(section, collapsed);
        ui.collapsed[section.id] = collapsed;
        saveUi();
      });
    });
  }

  function revealSection(id) {
    var section = $(id);
    if (section && section.classList.contains("category") && ui.collapsed[id]) {
      setCollapsed(section, false);
      ui.collapsed[id] = false;
      saveUi();
    }
    return section;
  }

  // ---------- Navigation ----------

  var navbar = $("navbar");
  var burger = $("burger");
  var overlay = $("navOverlay");

  function setNav(open) {
    navbar.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    overlay.hidden = !open;
  }

  burger.addEventListener("click", function () { setNav(!navbar.classList.contains("is-open")); });
  overlay.addEventListener("click", function () { setNav(false); });

  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      revealSection(link.getAttribute("data-nav"));
      setNav(false);
    });
  });

  function initActiveNav() {
    var links = {};
    document.querySelectorAll(".nav-link").forEach(function (l) { links[l.getAttribute("data-nav")] = l; });
    var ids = Object.keys(links);
    function update() {
      var current = ids[0];
      var line = window.innerHeight * 0.3;
      ids.forEach(function (id) {
        var el = $(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = ids[ids.length - 1];
      ids.forEach(function (id) { links[id].classList.toggle("is-active", id === current); });
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
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

  // ---------- Search (spotlight) ----------

  var searchInput = $("searchInput");
  var results = $("searchResults");
  var header = document.querySelector(".shell-header");
  var activeIndex = 0;
  var currentOptions = [];

  function searchIndex() {
    var have = ownedSet();
    var items = [];
    document.querySelectorAll(".nav-link").forEach(function (l) {
      items.push({ group: "Sections", label: l.textContent.trim().replace(/\d+$/, ""), icon: l.querySelector("[data-icon]").getAttribute("data-icon"), go: { section: l.getAttribute("data-nav") } });
    });
    rankedRoles(have).forEach(function (r) {
      items.push({ group: "Roles", label: r.role.title, extra: Math.round(r.score.value) + "%", icon: "target", keywords: r.role.search.join(" ") + " " + r.role.employers.join(" "), go: { role: r.role.id } });
    });
    DATA.skills.forEach(function (s) {
      items.push({ group: "Skills", label: s.label, extra: owns(s.id) ? "On profile" : "Gap", icon: owns(s.id) ? "check" : "plus", keywords: (s.aliases || []).join(" "), go: { skill: s.id } });
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
    }).slice(0, 12);
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

  function choose(i) {
    var it = currentOptions[i];
    if (!it) return;
    var target;
    if (it.go.section) {
      target = revealSection(it.go.section);
    } else if (it.go.role) {
      revealSection("matcher");
      if (openRoles.indexOf(it.go.role) === -1) openRoles.push(it.go.role);
      target = $("role-" + it.go.role);
      if (target) target.open = true;
    } else if (it.go.skill) {
      revealSection("skills");
      target = $("skill-" + it.go.skill);
    }
    searchInput.value = "";
    closeResults();
    header.classList.remove("is-searching");
    searchInput.blur();
    if (target) {
      target.scrollIntoView({ block: "center" });
      target.classList.remove("flash");
      void target.offsetWidth;
      target.classList.add("flash");
    }
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
    setTimeout(function () {
      closeResults();
      header.classList.remove("is-searching");
    }, 100);
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

  // ---------- Actions ----------

  function refreshScores() {
    renderMatcher();
    renderSkills();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;

    if (t.dataset.copy) {
      copyText(t.dataset.copy, function (ok) {
        t.innerHTML = icon(ok ? "check" : "x");
        t.classList.toggle("is-done", ok);
        t.title = ok ? "Copied" : "Select the text to copy it";
        setTimeout(function () { t.innerHTML = icon("copy"); t.classList.remove("is-done"); t.title = ""; }, 1400);
      });
    } else if (t.dataset.toggle) {
      setOwned(t.dataset.toggle, !owns(t.dataset.toggle));
      saveState();
      refreshScores();
      var again = $("skill-" + t.dataset.toggle);
      if (again) again.focus();
    } else if (t.dataset.learn) {
      setOwned(t.dataset.learn, true);
      saveState();
      refreshScores();
    } else if (t.dataset.removeCustom !== undefined) {
      state.custom.splice(parseInt(t.dataset.removeCustom, 10), 1);
      saveState();
      renderSkills();
    } else if (t.dataset.removeLearning !== undefined) {
      state.learning.splice(parseInt(t.dataset.removeLearning, 10), 1);
      saveState();
      renderLearning();
    }
  });

  $("roles").addEventListener("toggle", function (e) {
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
        refreshScores();
        flash(msg, "Added " + match.label + ". Role scores updated.");
      }
    } else if (state.custom.some(function (c) { return c.toLowerCase() === q.toLowerCase(); })) {
      flash(msg, q + " is already under Other skills.");
    } else {
      state.custom.push(q);
      saveState();
      renderSkills();
      flash(msg, "Added " + q + " under Other skills. The role matcher doesn't track it, so scores stay the same.");
    }
    input.value = "";
  });

  $("learnForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var title = $("learnTitle").value.trim();
    if (!title) return;
    var skills = Array.prototype.slice.call(document.querySelectorAll("#learnSkillPicker input:checked"))
      .map(function (c) { return c.value; });
    state.learning.push({
      title: title,
      source: $("learnSource").value.trim(),
      date: $("learnDate").value.trim(),
      note: $("learnNote").value.trim(),
      skills: skills,
    });
    skills.forEach(function (id) { setOwned(id, true); });
    saveState();
    e.target.reset();
    renderLearning();
    refreshScores();
    flash($("learnMsg"), "Added " + title + (skills.length ? ". Its skills are now on your profile and scores are updated." : "."));
  });

  $("personalForm").addEventListener("input", function (e) {
    var f = e.target.dataset && e.target.dataset.field;
    if (!f) return;
    state.personal[f] = e.target.value;
    saveState();
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

  function renderAll() {
    renderProfile();
    renderExperience();
    renderEducation();
    renderMatcher();
    renderSkills();
    renderLearning();
    renderPersonal();
  }

  fillIcons();
  renderPicker();
  renderAll();
  initCategories();
  initActiveNav();
})();
