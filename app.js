(function () {
  "use strict";

  var DATA = window.PROFILE_DATA;
  var STORAGE_KEY = "shraddha-portfolio-v1";
  var MAX_SCORE = 90;
  var TIERS = [
    { min: 75, key: "now", label: "Apply now" },
    { min: 60, key: "prep", label: "Apply with prep" },
    { min: 45, key: "build", label: "Build toward" },
    { min: 0, key: "long", label: "Long-term goal" },
  ];
  var MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

  var skillById = {};
  DATA.skills.forEach(function (s) { skillById[s.id] = s; });

  // ---------- State (saved in the browser) ----------

  function emptyState() {
    return { added: [], removed: [], custom: [], learning: [], personal: {} };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      return normalizeState(JSON.parse(raw));
    } catch (e) {
      return emptyState();
    }
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

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  var state = loadState();

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
      coverage: coverage,
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
    function fallback() { onDone(false); }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { onDone(true); }, fallback);
      } else {
        fallback();
      }
    } catch (e) { fallback(); }
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

  // ---------- Static sections ----------

  function renderProfile() {
    var p = DATA.person;
    $("name").textContent = p.name;
    $("headline").textContent = p.headline;
    $("summary").textContent = p.summary;

    $("contact").innerHTML =
      '<li><span class="c-label">Email</span><span class="c-value">' + esc(p.email) + '</span>' +
      '<button type="button" class="copy" data-copy="' + esc(p.email) + '">Copy</button></li>' +
      '<li><span class="c-label">Phone</span><span class="c-value">' + esc(p.phone) + '</span>' +
      '<button type="button" class="copy" data-copy="' + esc(p.phone) + '">Copy</button></li>' +
      '<li><span class="c-label">LinkedIn</span><a class="c-value" href="' + esc(p.linkedin) + '" target="_blank" rel="noopener">' +
      esc(p.linkedin.replace(/^https?:\/\//, "")) + '</a></li>' +
      '<li><span class="c-label">Based in</span><span class="c-value">' + esc(p.location) + '</span></li>';

    $("highlights").innerHTML = DATA.highlights.map(function (h) {
      return '<div><dt>' + esc(h.value) + '</dt><dd>' + esc(h.label) + '</dd></div>';
    }).join("");
  }

  function renderExperience() {
    var total = 0;
    $("timeline").innerHTML = DATA.experience.map(function (job) {
      var months = monthsBetween(job.start, job.end);
      total += months;
      return '<li class="job">' +
        '<p class="job-dates">' + esc(job.start) + ' – ' + esc(job.end) +
        '<span class="dur">' + esc(formatDuration(months)) + '</span></p>' +
        '<div><h3>' + esc(job.role) + '</h3><p class="org">' + esc(job.company) + ', ' + esc(job.place) + '</p>' +
        '<ul>' + job.points.map(function (pt) { return '<li>' + esc(pt) + '</li>'; }).join("") + '</ul></div></li>';
    }).join("");
    $("tenure").textContent = formatDuration(total) + " of full-time work across compliance, audit and technical support, all in Hyderabad.";

    var pr = DATA.project;
    $("project").innerHTML = '<p class="kicker">Project · ' + esc(pr.tag) + '</p><h3>' + esc(pr.title) + '</h3>' +
      '<ul>' + pr.points.map(function (pt) { return '<li>' + esc(pt) + '</li>'; }).join("") + '</ul>';
  }

  function renderEducation() {
    $("educationList").innerHTML = DATA.education.map(function (e) {
      return '<li><span class="yr">' + esc(e.year) + '</span><div><strong>' + esc(e.title) + '</strong>' +
        '<div class="place">' + esc(e.place) + '</div></div></li>';
    }).join("");
  }

  // ---------- Role matcher ----------

  var openRoles = null;

  function renderMatcher() {
    var have = ownedSet();
    var ranked = rankedRoles(have);
    if (openRoles === null) openRoles = [ranked[0].role.id];

    var picks = ranked.filter(function (r) { return !r.role.fallback; }).slice(0, 3);
    $("topPicks").innerHTML = picks.map(function (r, i) {
      var pct = Math.round(r.score.value);
      var t = tierFor(pct);
      return '<div class="pick tier-' + t.key + '">' +
        '<span class="pick-rank">Best fit #' + (i + 1) + '</span>' +
        '<span class="pick-score">' + pct + '%</span>' +
        '<span class="pick-title">' + esc(r.role.title) + '</span>' +
        '<span class="chip-tier">' + t.label + '</span></div>';
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

      return '<li><details class="role tier-' + t.key + '" data-role="' + role.id + '"' + (isOpen ? " open" : "") + '>' +
        '<summary>' +
          '<span class="role-rank">' + (i + 1) + '</span>' +
          '<span class="role-name">' + esc(role.title) +
            '<span class="chip-tier">' + t.label + '</span>' +
            (role.fallback ? '<span class="chip-tier chip-backup">Backup option</span>' : '') +
          '</span>' +
          '<span class="meter" role="img" aria-label="Match ' + pct + ' percent"><span style="width:' + pct + '%"></span></span>' +
          '<span class="role-pct">' + pct + '%</span>' +
        '</summary>' +
        '<div class="role-body">' +
          '<p class="role-why">' + esc(role.why) + '</p>' +
          '<dl class="breakdown">' +
            '<div><dt>Experience fit</dt><dd>' + sc.exp.toFixed(1) + ' / 45</dd></div>' +
            '<div><dt>Skill coverage</dt><dd>' + sc.skills.toFixed(1) + ' / 31.5</dd></div>' +
            '<div><dt>Hyderabad demand</dt><dd>' + sc.demand.toFixed(1) + ' / 13.5</dd></div>' +
          '</dl>' +
          '<div class="role-cols">' +
            '<div><h4>Skills you have</h4><ul class="tags">' +
              (got.length ? got.map(function (id) {
                return '<li class="tag tag-have">' + esc(skillById[id].label) + '</li>';
              }).join("") : '<li class="muted">None yet</li>') +
            '</ul></div>' +
            '<div><h4>Gaps to close</h4><ul class="tags">' +
              (gaps.length ? gaps.map(function (id) {
                return '<li><button type="button" class="tag tag-gap" data-learn="' + id + '" title="Mark as learned">' +
                  esc(skillById[id].label) + '<span class="weight">' + weightLabel(id) + '</span></button></li>';
              }).join("") : '<li class="muted">No gaps. You cover every skill this role asks for.</li>') +
            '</ul></div>' +
            '<div><h4>Hiring in Hyderabad</h4><ul class="tags">' +
              role.employers.map(function (e) { return '<li class="tag">' + esc(e) + '</li>'; }).join("") +
            '</ul></div>' +
            '<div><h4>Search these job titles</h4><ul class="tags">' +
              role.search.map(function (s) { return '<li class="tag">' + esc(s) + '</li>'; }).join("") +
            '</ul></div>' +
          '</div>' +
        '</div></details></li>';
    }).join("");

    renderNextSkills(have);
  }

  function renderNextSkills(have) {
    var candidates = DATA.skills.filter(function (s) { return !have[s.id]; });
    var gains = candidates.map(function (s) {
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
        '<button type="button" data-learn="' + g.skill.id + '" title="Mark as learned">' + esc(g.skill.label) + '</button>' +
        '<span class="affects">' + esc(g.roles.join(", ")) + '</span></li>';
    }).join("") : '<li class="muted">You cover every skill the matcher tracks.</li>';
  }

  // ---------- Skills ----------

  function renderSkills() {
    var groups = DATA.skillGroups.map(function (g) {
      var skills = DATA.skills.filter(function (s) { return s.group === g.id; });
      skills.sort(function (a, b) { return (owns(b.id) ? 1 : 0) - (owns(a.id) ? 1 : 0); });
      return '<div class="skill-group"><h3>' + esc(g.label) + '</h3><div class="chips">' +
        skills.map(function (s) {
          var on = owns(s.id);
          return '<button type="button" class="chip' + (on ? "" : " is-gap") + '" data-toggle="' + s.id + '" aria-pressed="' + on + '">' +
            esc(s.label) + '</button>';
        }).join("") + '</div></div>';
    });
    if (state.custom.length) {
      groups.push('<div class="skill-group"><h3>Other skills</h3><div class="chips">' +
        state.custom.map(function (c, i) {
          return '<span class="chip is-custom">' + esc(c) +
            '<button type="button" class="chip-remove" data-remove-custom="' + i + '" aria-label="Remove ' + esc(c) + '">×</button></span>';
        }).join("") + '</div></div>');
    }
    $("skillGroups").innerHTML = groups.join("");

    $("skillOptions").innerHTML = DATA.skills.filter(function (s) { return !owns(s.id); })
      .map(function (s) { return '<option value="' + esc(s.label) + '"></option>'; }).join("");

    $("learnSkillPicker").innerHTML = DATA.skills.map(function (s) {
      return '<label><input type="checkbox" value="' + s.id + '" id="ls-' + s.id + '">' + esc(s.label) + '</label>';
    }).join("");
  }

  // ---------- Learning ----------

  function renderLearning() {
    var userItems = state.learning.map(function (l, i) { return { item: l, userIndex: i }; }).reverse();
    var baseItems = DATA.learning.map(function (l, i) { return { item: l, featured: i === 0 }; });
    $("learningList").innerHTML = userItems.concat(baseItems).map(function (entry) {
      var l = entry.item;
      var meta = [l.source, l.date].filter(Boolean).join(" · ");
      var title = l.url
        ? '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.title) + '</a>'
        : esc(l.title);
      var skills = (l.skills || []).filter(function (id) { return skillById[id]; });
      return '<li class="learn' + (entry.featured ? " is-featured" : "") + '">' +
        (meta ? '<span class="learn-meta">' + esc(meta) + '</span>' : '') +
        '<span class="learn-title">' + title + '</span>' +
        (l.note ? '<p class="muted">' + esc(l.note) + '</p>' : '') +
        (skills.length ? '<ul class="tags">' + skills.map(function (id) {
          return '<li class="tag">' + esc(skillById[id].label) + '</li>';
        }).join("") + '</ul>' : '') +
        (entry.userIndex !== undefined
          ? '<button type="button" class="learn-remove" data-remove-learning="' + entry.userIndex + '">Remove entry</button>'
          : '') +
        '</li>';
    }).join("");
  }

  // ---------- Personal ----------

  function renderPersonal() {
    $("personalForm").innerHTML = DATA.personalFields.map(function (f) {
      var val = Object.prototype.hasOwnProperty.call(state.personal, f.id) ? state.personal[f.id] : f.value;
      var input = f.long
        ? '<textarea id="pf-' + f.id + '" data-field="' + f.id + '" rows="3">' + esc(val) + '</textarea>'
        : '<input id="pf-' + f.id + '" data-field="' + f.id + '" value="' + esc(val) + '">';
      return '<div class="field' + (f.long ? " long" : "") + '"><label for="pf-' + f.id + '">' + esc(f.label) + '</label>' + input + '</div>';
    }).join("");
  }

  // ---------- Wiring ----------

  function refreshScores() {
    renderMatcher();
    renderSkills();
  }

  function learnSkill(id) {
    setOwned(id, true);
    saveState();
    refreshScores();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;

    if (t.dataset.copy) {
      var label = t.textContent;
      copyText(t.dataset.copy, function (ok) {
        t.textContent = ok ? "Copied" : "Select it";
        setTimeout(function () { t.textContent = label; }, 1400);
      });
    } else if (t.dataset.toggle) {
      setOwned(t.dataset.toggle, !owns(t.dataset.toggle));
      saveState();
      refreshScores();
    } else if (t.dataset.learn) {
      learnSkill(t.dataset.learn);
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
        learnSkill(match.id);
        flash(msg, "Added " + match.label + ". Role scores updated.");
      }
    } else {
      var exists = state.custom.some(function (c) { return c.toLowerCase() === q.toLowerCase(); });
      if (exists) {
        flash(msg, q + " is already under Other skills.");
      } else {
        state.custom.push(q);
        saveState();
        renderSkills();
        flash(msg, "Added " + q + " under Other skills. The role matcher doesn't track it, so scores stay the same.");
      }
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
      var parsed = JSON.parse($("restoreInput").value);
      state = normalizeState(parsed);
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

  renderAll();
})();
