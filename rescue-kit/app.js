(function () {
  "use strict";

  var STORE_KEY = "seller-rescue-kit-v1";
  var DAY_MS = 86400000;
  var HORIZON = 60; // days of forecast and of history shown

  // Amazon's published seller performance targets. `window` is the rolling period in days.
  var METRICS = {
    odr: {
      id: "odr", name: "Order Defect Rate", short: "Order defects", window: 60, limit: 0.01, dir: "max", dp: 2,
      unit: "defective orders", base: "orders",
      num: function (r) { return r.negative_feedback + r.a_to_z + r.chargebacks; },
      den: function (r) { return r.orders; },
      tips: [
        "<strong>Appeal A-to-z claims you can win.</strong> Claims decided in your favour are removed from your Order Defect Rate.",
        "<strong>Fix the buyer's problem first, then ask.</strong> Buyers can remove negative feedback themselves. Never offer anything in return; that breaks Amazon's rules.",
        "<strong>Stop new defects at the source.</strong> Every new one stays in the window for 60 days, so prevention beats any clean-up.",
      ],
    },
    lsr: {
      id: "lsr", name: "Late Shipment Rate", short: "Late shipments", window: 30, limit: 0.04, dir: "max", dp: 1,
      unit: "late shipments", base: "shipments",
      num: function (r) { return r.late; },
      den: function (r) { return r.orders - r.cancelled; },
      tips: [
        "<strong>Confirm shipment on the day you hand over.</strong> A late confirmation counts as a late shipment even if the parcel left on time.",
        "<strong>Set a handling time you can always meet.</strong> One extra day of handling costs less than a late-shipment warning.",
        "<strong>Keep a backup courier</strong> for PIN codes your main courier delays in peak or monsoon season.",
      ],
    },
    cr: {
      id: "cr", name: "Pre-fulfilment Cancel Rate", short: "Cancellations", window: 7, limit: 0.025, dir: "max", dp: 2,
      unit: "cancellations", base: "orders",
      num: function (r) { return r.cancelled; },
      den: function (r) { return r.orders; },
      tips: [
        "<strong>Sync your stock daily.</strong> Most seller cancellations are items sold that weren't on the shelf.",
        "<strong>Buyer-requested cancellations don't count</strong> when the buyer uses the cancel option in their order, so point buyers to it.",
        "<strong>The window is only 7 days,</strong> so one clean week fixes this metric.",
      ],
    },
    vtr: {
      id: "vtr", name: "Valid Tracking Rate", short: "Tracking", window: 30, limit: 0.95, dir: "min", dp: 1,
      unit: "tracked shipments", base: "shipments",
      num: function (r) { return r.tracked; },
      den: function (r) { return r.orders - r.cancelled; },
      tips: [],
    },
  };
  var PLANNABLE = ["odr", "lsr", "cr"];
  var COLUMNS = ["date", "orders", "negative_feedback", "a_to_z", "chargebacks", "late", "cancelled", "tracked"];

  var ISSUES = {
    odr: { label: "Order Defect Rate above 1%", metric: "Order Defect Rate", target: "under 1%" },
    lsr: { label: "Late Shipment Rate above 4%", metric: "Late Shipment Rate", target: "under 4%" },
    cr: { label: "Pre-fulfilment Cancel Rate above 2.5%", metric: "Pre-fulfilment Cancel Rate", target: "under 2.5%" },
    vtr: { label: "Valid Tracking Rate below 95%", metric: "Valid Tracking Rate", target: "over 95%" },
    condition: { label: "Product condition complaints", metric: "product condition complaints" },
    inauthentic: { label: "Inauthentic item complaints", metric: "inauthentic item complaints" },
    listing: { label: "Listing policy violation", metric: "listing policy compliance" },
  };
  var CAUSE_KINDS = ["Process", "People", "Product", "Delivery partner", "Supplier", "Systems"];
  var FREQUENCIES = ["Every order", "Daily", "Weekly", "Monthly", "Quarterly", "Before each peak season"];

  // ---------- Dates & numbers ----------

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function parseIso(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getMonth() === +m[2] - 1 ? d : null;
  }
  function daysBetween(a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS); }
  function fmtShort(d) { return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }
  function fmtLong(d) { return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  function fmtMonthDay(d) { return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" }); }
  function pct(rate, dp) { return (rate * 100).toFixed(dp) + "%"; }
  function num(n) { return Math.round(n).toLocaleString("en-IN"); }
  function plural(n, one, many) { return num(n) + " " + (Math.round(n) === 1 ? one : many || one + "s"); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function $(id) { return document.getElementById(id); }

  // ---------- Sample seller (made up) ----------

  // Small seeded generator so the sample looks the same on every visit.
  function seeded(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function poisson(rand, lambda) {
    var l = Math.exp(-lambda), k = 0, p = 1;
    do { k++; p *= rand(); } while (p > l);
    return k - 1;
  }

  // 120 days ending today. Courier trouble 55–36 days ago made shipments late;
  // the late, damaged parcels brought negative feedback and A-to-z claims 52–38 days ago.
  function sampleRows(today) {
    var rand = seeded(2723);
    var rows = [];
    for (var d = -119; d <= 0; d++) {
      var date = addDays(today, d);
      var weekend = date.getDay() === 0 || date.getDay() === 6;
      var orders = Math.round(27 + rand() * 9 + (weekend ? 5 : 0));
      var defects = d >= -52 && d <= -38;
      var lateSpell = d >= -55 && d <= -36;
      var cancelled = poisson(rand, orders * 0.011);
      var shipped = orders - cancelled;
      rows.push({
        date: iso(date),
        orders: orders,
        negative_feedback: poisson(rand, defects ? 1.3 : 0.07),
        a_to_z: poisson(rand, defects ? 0.6 : 0.03),
        chargebacks: poisson(rand, 0.015),
        late: poisson(rand, shipped * (lateSpell ? 0.075 : 0.014)),
        cancelled: cancelled,
        tracked: shipped - poisson(rand, shipped * 0.022),
      });
    }
    return rows;
  }

  // The plan's facts are worked out from the sample rows, so its numbers match the charts.
  function samplePlan(today) {
    var rows = sampleRows(today);
    var from = addDays(today, -52), to = addDays(today, -38);
    var spell = rows.slice(rows.length - 53, rows.length - 37);
    var defects = spell.reduce(function (t, r) { return t + r.negative_feedback + r.a_to_z + r.chargebacks; }, 0);
    var orders = spell.reduce(function (t, r) { return t + r.orders; }, 0);
    var peak = 0;
    for (var i = 59; i < rows.length; i++) {
      var n = 0, d = 0;
      for (var k = i - 59; k <= i; k++) { n += rows[k].negative_feedback + rows[k].a_to_z + rows[k].chargebacks; d += rows[k].orders; }
      peak = Math.max(peak, n / d);
    }
    return {
      seller: "Kalamkari Kraft",
      issue: "odr",
      facts: "Between " + fmtMonthDay(from) + " and " + fmtMonthDay(to) + ", " + defects + " of our " + orders + " orders received 1–2 star feedback or an A-to-z claim, and our Order Defect Rate rose to " + pct(peak, 1) + ". Most buyers said their saree arrived 3–6 days late or in a torn package.",
      whys: [
        "Buyers left negative feedback and filed claims because parcels arrived late or damaged.",
        "Our courier for Tier-3 PIN codes held parcels at a flooded hub for up to 6 days during the monsoon.",
        "We used one courier for every PIN code and had no backup route.",
        "Nobody checked delivery delays daily; tracking was only looked at after a buyer complained.",
        "We had no written process for monitoring shipments after dispatch or switching couriers when one is delayed.",
      ],
      kinds: ["Process", "Delivery partner"],
      fixes: [
        { text: "Contacted all " + defects + " affected buyers and refunded or replaced their orders", date: iso(addDays(today, -34)) },
        { text: "Moved Tier-3 PIN codes to a second courier with a weather-delay SLA", date: iso(addDays(today, -31)) },
        { text: "Switched to waterproof mailers with double-sealed tape for all sarees", date: iso(addDays(today, -29)) },
      ],
      prevents: [
        { text: "Daily delayed-shipment report: any parcel 2 days past its promised date is escalated to the courier and the buyer is updated", owner: "Operations lead", freq: "Daily" },
        { text: "Review Order Defect Rate, feedback and A-to-z claims against an internal target of 0.5%", owner: "Owner", freq: "Weekly" },
        { text: "Monsoon plan: switch flagged PIN codes to the backup courier from June to September", owner: "Operations lead", freq: "Before each peak season" },
        { text: "Written packing and shipping SOP, with refresher training for all 4 packing staff", owner: "Packing supervisor", freq: "Monthly" },
      ],
    };
  }

  // ---------- State ----------

  var TODAY = startOfDay(new Date());
  var state = {
    rows: sampleRows(TODAY),
    sample: true,
    plan: samplePlan(TODAY),
    metric: "odr",
    whatIf: 0,
    perDay: null,
  };

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!saved) return;
      if (Array.isArray(saved.rows) && saved.rows.length >= 8) { state.rows = saved.rows; state.sample = false; }
      if (saved.plan && typeof saved.plan === "object") state.plan = Object.assign(samplePlan(TODAY), saved.plan);
      if (METRICS[saved.metric] && PLANNABLE.indexOf(saved.metric) !== -1) state.metric = saved.metric;
    } catch (e) { /* storage unavailable: keep the sample */ }
  }

  var saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify({ rows: state.sample ? null : state.rows, plan: state.plan, metric: state.metric }));
      } catch (e) { /* not saved; the page still works */ }
    }, 300);
  }

  // ---------- Metric maths ----------

  function lastDate() { return parseIso(state.rows[state.rows.length - 1].date); }

  function recentPerDay() {
    var tail = state.rows.slice(-30);
    return Math.max(1, Math.round(tail.reduce(function (s, r) { return s + r.orders; }, 0) / tail.length));
  }

  // Window totals for row index i of a list of {num, den}.
  function windowAt(list, i, w) {
    var n = 0, d = 0;
    for (var k = Math.max(0, i - w + 1); k <= i; k++) { n += list[k].num; d += list[k].den; }
    return { num: n, den: d, rate: d ? n / d : 0, full: i - w + 1 >= 0 };
  }

  // History plus a forecast of HORIZON days. Future days get `perDay` orders and the what-if problems spread over
  // the next 30 days, earliest first. `tomorrow` adds problems on the first forecast day.
  function series(metric, perDay, extra, tomorrow) {
    var m = METRICS[metric];
    var end = lastDate();
    var list = state.rows.map(function (r) { return { date: parseIso(r.date), num: m.num(r), den: m.den(r), future: false }; });
    for (var k = 1; k <= HORIZON; k++) {
      var add = (k <= 30 ? Math.ceil(k * extra / 30) - Math.ceil((k - 1) * extra / 30) : 0) + (k === 1 ? tomorrow || 0 : 0);
      list.push({ date: addDays(end, k), num: add, den: perDay, future: true });
    }
    var out = [];
    var todayIdx = state.rows.length - 1;
    for (var i = 0; i < list.length; i++) {
      var off = i - todayIdx;
      if (off < -HORIZON) continue;
      var w = windowAt(list, i, m.window);
      if (!w.full) continue;
      out.push({ offset: off, date: list[i].date, rate: w.rate, num: w.num, den: w.den, future: list[i].future });
    }
    return { metric: m, points: out, list: list, todayIdx: todayIdx };
  }

  function isBad(m, rate) { return m.dir === "max" ? rate >= m.limit : rate < m.limit; }

  function recovery(s) {
    var m = s.metric;
    var pts = s.points;
    var now = pts.filter(function (p) { return p.offset === 0; })[0];
    var first = null, backOver = null;
    pts.forEach(function (p) {
      if (p.offset < 0) return;
      if (!first && !isBad(m, p.rate)) first = p;
      else if (first && !backOver && isBad(m, p.rate)) backOver = p;
    });
    return { now: now, first: first, backOver: backOver };
  }

  // Past problems still inside the window, grouped by the day they stop counting.
  function dropOffs(s, rec) {
    var m = s.metric;
    var byDate = {};
    var order = [];
    for (var i = Math.max(0, s.todayIdx - m.window + 1); i <= s.todayIdx; i++) {
      var p = s.list[i];
      if (!p.num) continue;
      var leave = addDays(p.date, m.window);
      var key = iso(leave);
      if (!byDate[key]) { byDate[key] = { date: leave, count: 0, from: p.date }; order.push(key); }
      byDate[key].count += p.num;
    }
    var rateOn = {};
    s.points.forEach(function (p) { rateOn[iso(p.date)] = p.rate; });
    return order.map(function (k) {
      var d = byDate[k];
      d.rate = rateOn[k];
      d.crosses = rec.first && iso(rec.first.date) === k && rec.now && isBad(m, rec.now.rate);
      return d;
    });
  }

  // ---------- Health tiles ----------

  var ICON_OK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_WARN = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5l6 11H2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 7v3M8 12v.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var ICON_BAD = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  function stateOf(m, rate) {
    if (isBad(m, rate)) return { cls: "is-bad", label: m.dir === "max" ? "Over the limit" : "Under the limit", icon: ICON_BAD };
    var near = m.dir === "max" ? rate >= m.limit * 0.8 : rate < m.limit + 0.01;
    return near ? { cls: "is-warn", label: "Close to the limit", icon: ICON_WARN } : { cls: "is-good", label: "Healthy", icon: ICON_OK };
  }

  function renderTiles() {
    var end = lastDate();
    $("healthAsOf").textContent = "Using data up to " + fmtLong(end) + ". Each metric counts its own rolling window.";
    $("tiles").innerHTML = Object.keys(METRICS).map(function (id) {
      var m = METRICS[id];
      var list = state.rows.map(function (r) { return { num: m.num(r), den: m.den(r) }; });
      var w = windowAt(list, list.length - 1, m.window);
      var st = stateOf(m, w.rate);
      var target = (m.dir === "max" ? "Target under " : "Target over ") + pct(m.limit, m.limit < 0.02 ? 0 : 1) + " · last " + m.window + " days";
      var detail = num(w.num) + " " + m.unit + " of " + num(w.den) + " " + m.base;
      var plan = PLANNABLE.indexOf(id) !== -1 ? '<button type="button" data-plan-metric="' + id + '">' + (isBad(m, w.rate) ? "Plan the recovery" : "See the trend") + '</button>' : "";
      return '<li class="tile ' + st.cls + '"><span class="tile-name">' + esc(m.name) + '</span>' +
        '<span class="tile-value">' + pct(w.rate, m.dp) + '</span>' +
        '<span class="state">' + st.icon + st.label + '</span>' +
        '<span class="tile-limit">' + target + '</span>' +
        '<span class="tile-detail">' + detail + '</span>' + plan + '</li>';
    }).join("");
  }

  // ---------- Recovery planner ----------

  function renderMetricPick() {
    $("metricPick").innerHTML = PLANNABLE.map(function (id) {
      var on = id === state.metric;
      return '<button type="button" role="radio" aria-checked="' + on + '" data-metric="' + id + '">' + esc(METRICS[id].name) + '</button>';
    }).join("");
  }

  var current = null; // latest series, used by the chart's hover layer

  function renderRecovery() {
    var m = METRICS[state.metric];
    var perDay = state.perDay || recentPerDay();
    $("ordersPerDay").value = perDay;
    $("whatIfValue").textContent = state.whatIf;
    $("whatIf").setAttribute("aria-valuetext", plural(state.whatIf, "new " + m.unit.replace(/s$/, ""), "new " + m.unit));

    var s = series(state.metric, perDay, state.whatIf);
    current = s;
    var rec = recovery(s);
    var drops = dropOffs(s, rec);
    var now = rec.now;
    var over = now && isBad(m, now.rate);

    // Same forecast at the account's recent pace of problems, as a reality check against the "no new problems" default.
    var recentProblems = state.rows.slice(-30).reduce(function (t, r) { return t + m.num(r); }, 0);
    var paced = recovery(series(state.metric, perDay, recentProblems));
    var plusOne = recovery(series(state.metric, perDay, state.whatIf, 1));

    var allowed = now ? Math.max(0, Math.ceil(m.limit * now.den) - 1) : 0;
    var facts = [];
    facts.push({ hero: true, label: "Today", value: now ? pct(now.rate, m.dp) : "–", note: now ? num(now.num) + " " + m.unit + " in " + num(now.den) + " " + m.base + " (" + m.window + " days)" : "" });
    if (over) {
      facts.push({ hero: true, label: "Back under " + pct(m.limit, m.limit < 0.02 ? 0 : 1), value: rec.first ? fmtLong(rec.first.date) : "Not within " + HORIZON + " days",
        note: rec.first ? "in " + plural(rec.first.offset, "day") + (state.whatIf ? ", with " + plural(state.whatIf, "new problem") : ", if nothing new goes wrong") : "Raise orders per day or cut new problems" });
    } else {
      facts.push({ hero: true, label: "Status", value: "Under the limit", note: rec.backOver ? "but this forecast goes back over on " + fmtShort(rec.backOver.date) : "and stays there in this forecast" });
    }
    facts.push({ label: "Most " + m.unit + " allowed now", value: num(allowed), note: over ? "You have " + num(now.num) + ", so " + num(now.num - allowed) + " must leave the window" : "You have " + num(now ? now.num : 0) + ", leaving room for " + num(Math.max(0, allowed - (now ? now.num : 0))) + " more" });
    if (over && rec.first && plusOne.first) {
      var cost = plusOne.first.offset - rec.first.offset;
      facts.push({ label: "If one more goes wrong tomorrow", value: cost > 0 ? "+" + plural(cost, "day") : "Same date", note: cost > 0 ? "later before you're back under the limit" : "you'd still be back under on " + fmtShort(rec.first.date) });
    }
    $("facts").innerHTML = facts.map(function (f) {
      return '<div class="' + (f.hero ? "is-hero" : "") + '"><dt>' + esc(f.label) + '</dt><dd>' + esc(f.value) + (f.note ? '<span class="fact-note"><br>' + esc(f.note) + '</span>' : '') + '</dd></div>';
    }).join("");

    $("chartTitle").textContent = m.name + ", rolling " + m.window + " days";
    $("limitLegend").textContent = "Limit " + pct(m.limit, m.limit < 0.02 ? 0 : 1);
    drawChart(s, rec);

    // Drop-off list
    $("dropNote").textContent = drops.length
      ? "Each problem stops counting " + m.window + " days after its order date. Rates are from the forecast above."
      : "No " + m.unit + " in the current window.";
    $("drops").innerHTML = drops.map(function (d) {
      return '<li class="' + (d.crosses ? "is-cross" : "") + '"><span class="drop-date">' + fmtShort(d.date) + '</span>' +
        '<span class="drop-what">' + plural(d.count, m.unit.replace(/s$/, ""), m.unit) + ' from ' + fmtShort(d.from) + ' leave' + (d.crosses ? ' · back under the limit' : '') + '</span>' +
        '<span class="drop-rate">' + (d.rate != null ? pct(d.rate, m.dp) : "") + '</span></li>';
    }).join("");

    // Advice
    var lines = [];
    if (over) {
      lines.push("<strong>Time is your biggest lever.</strong> " + plural(Math.max(0, now.num - allowed), m.unit.replace(/s$/, ""), m.unit) + " must leave the window. \"When problems leave your window\" shows the day each one goes.");
      if (paced.first && rec.first && recentProblems > state.whatIf) {
        var same = iso(paced.first.date) === iso(rec.first.date);
        lines.push("<strong>At your recent pace</strong> of " + plural(recentProblems, m.unit.replace(/s$/, ""), m.unit) + " a month, " + (same ? "you'd still be back under on " + fmtLong(paced.first.date) + "." : "you'd be back under on " + fmtLong(paced.first.date) + " instead."));
      } else if (!paced.first && recentProblems) {
        lines.push("<strong>At your recent pace</strong> of " + plural(recentProblems, m.unit.replace(/s$/, ""), m.unit) + " a month, you wouldn't get back under the limit within " + HORIZON + " days.");
      }
    } else {
      lines.push("<strong>You're under the limit.</strong> Keep at least " + plural(Math.max(0, allowed - now.num), m.unit.replace(/s$/, ""), m.unit) + " of headroom in the window.");
    }
    $("advice").innerHTML = lines.concat(m.tips).map(function (t) { return "<li>" + t + "</li>"; }).join("");

    // Numbers table (weekly)
    var rows = s.points.filter(function (p) { return p.offset % 7 === 0; });
    $("numbersTable").innerHTML = '<thead><tr><th scope="col">Date</th><th scope="col">' + esc(m.unit.charAt(0).toUpperCase() + m.unit.slice(1)) + ' in window</th><th scope="col">' + esc(m.base.charAt(0).toUpperCase() + m.base.slice(1)) + ' in window</th><th scope="col">Rate</th><th scope="col">Source</th></tr></thead><tbody>' +
      rows.map(function (p) {
        return '<tr><td>' + fmtLong(p.date) + '</td><td>' + num(p.num) + '</td><td>' + num(p.den) + '</td><td>' + pct(p.rate, m.dp) + '</td><td>' + (p.future ? "Forecast" : p.offset === 0 ? "Today" : "Your data") + '</td></tr>';
      }).join("") + '</tbody>';
  }

  // ---------- Chart ----------

  var NS = "http://www.w3.org/2000/svg";
  var chartGeom = null;

  function niceStep(max, count) {
    var raw = max / count;
    var mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var f = raw / mag;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
  }

  function drawChart(s, rec) {
    var m = s.metric;
    var box = $("chart");
    var W = Math.max(300, box.clientWidth || 640);
    var H = W < 520 ? 240 : 280;
    var pad = { l: 46, r: 16, t: 26, b: 28 };
    var pts = s.points;
    var x0 = pts[0].offset, x1 = pts[pts.length - 1].offset;
    var maxRate = Math.max(m.limit * 1.6, d3max(pts) * 1.12);
    var step = niceStep(maxRate, 4);
    var yMax = Math.ceil(maxRate / step) * step;
    function X(off) { return pad.l + (off - x0) / (x1 - x0) * (W - pad.l - pad.r); }
    function Y(rate) { return pad.t + (1 - rate / yMax) * (H - pad.t - pad.b); }
    chartGeom = { X: X, x0: x0, x1: x1, pad: pad, W: W, H: H, Y: Y };

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("role", "img");
    svg.setAttribute("tabindex", "0");
    var nowPt = pts.filter(function (p) { return p.offset === 0; })[0];
    svg.setAttribute("aria-label", m.name + " chart. Today " + (nowPt ? pct(nowPt.rate, m.dp) : "") + "; limit " + pct(m.limit, 1) + (rec.first && nowPt && isBad(m, nowPt.rate) ? "; back under on " + fmtLong(rec.first.date) : "") + ". Use the left and right arrow keys to read each day.");

    function el(tag, attrs, parent) {
      var e = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      (parent || svg).appendChild(e);
      return e;
    }
    function text(x, y, str, cls, anchor) {
      var t = el("text", { x: x, y: y, class: cls || "", "text-anchor": anchor || "start" });
      t.textContent = str;
      return t;
    }

    // Over-limit zone, then grid and y ticks
    if (m.dir === "max") el("rect", { class: "zone", x: pad.l, y: Y(yMax), width: W - pad.l - pad.r, height: Math.max(0, Y(m.limit) - Y(yMax)) });
    for (var v = 0; v <= yMax + 1e-9; v += step) {
      el("line", { class: "grid", x1: pad.l, x2: W - pad.r, y1: Y(v), y2: Y(v) });
      text(pad.l - 8, Y(v) + 4, pct(v, step < 0.01 ? 1 : 0), "tick-label", "end");
    }
    // x labels every 15 days
    for (var o = Math.ceil(x0 / 15) * 15; o <= x1; o += 15) {
      var d = addDays(lastDate(), o);
      text(X(o), H - 8, o === 0 ? "" : fmtShort(d), "tick-label", "middle");
    }

    var past = pts.filter(function (p) { return p.offset <= 0; });
    var future = pts.filter(function (p) { return p.offset >= 0; });
    function path(list) { return list.map(function (p, i) { return (i ? "L" : "M") + X(p.offset).toFixed(1) + " " + Y(p.rate).toFixed(1); }).join(" "); }
    if (past.length > 1) {
      el("path", { class: "area", d: path(past) + " L" + X(past[past.length - 1].offset).toFixed(1) + " " + Y(0) + " L" + X(past[0].offset).toFixed(1) + " " + Y(0) + " Z" });
      el("path", { class: "line", d: path(past) });
    }
    if (future.length > 1) el("path", { class: "line line-forecast", d: path(future) });

    // Limit line and label
    el("line", { class: "limit", x1: pad.l, x2: W - pad.r, y1: Y(m.limit), y2: Y(m.limit) });
    text(W - pad.r, Y(m.limit) - 6, "Limit " + pct(m.limit, m.limit < 0.02 ? 0 : 1), "limit-label", "end");

    // Today marker
    if (x0 < 0) {
      el("line", { class: "today", x1: X(0), x2: X(0), y1: pad.t - 6, y2: H - pad.b });
      text(X(0), pad.t - 10, "Today", "today-label", "middle");
    }

    // Recovery point
    if (rec.first && nowPt && isBad(m, nowPt.rate)) {
      var rx = X(rec.first.offset), ry = Y(rec.first.rate);
      el("circle", { class: "dot dot-good", cx: rx, cy: ry, r: 5 });
      var label = "Under on " + fmtShort(rec.first.date);
      var right = rx < W - 150;
      text(rx + (right ? 10 : -10), ry - 10, label, "good-label", right ? "start" : "end");
    }
    if (nowPt) el("circle", { class: "dot", cx: X(0), cy: Y(nowPt.rate), r: 4.5 });

    // Hover layer
    var cross = el("line", { class: "cross", x1: 0, x2: 0, y1: pad.t, y2: H - pad.b, visibility: "hidden" });
    var hoverDot = el("circle", { class: "dot", cx: 0, cy: 0, r: 4.5, visibility: "hidden" });
    var hit = el("rect", { x: pad.l, y: 0, width: W - pad.l - pad.r, height: H, fill: "transparent" });
    var focusIdx = pts.indexOf(nowPt);

    function show(i) {
      var p = pts[i];
      if (!p) return;
      focusIdx = i;
      var x = X(p.offset), y = Y(p.rate);
      cross.setAttribute("x1", x); cross.setAttribute("x2", x); cross.setAttribute("visibility", "visible");
      hoverDot.setAttribute("cx", x); hoverDot.setAttribute("cy", y); hoverDot.setAttribute("visibility", "visible");
      var tip = $("tooltip");
      tip.innerHTML = "";
      var dEl = document.createElement("span"); dEl.className = "tip-date"; dEl.textContent = fmtLong(p.date);
      var vEl = document.createElement("strong"); vEl.textContent = pct(p.rate, m.dp);
      var nEl = document.createElement("span"); nEl.textContent = num(p.num) + " of " + num(p.den) + " " + m.base;
      var tEl = document.createElement("span"); tEl.className = "tip-tag"; tEl.textContent = p.future ? "Forecast" : p.offset === 0 ? "Today" : "Your data";
      [dEl, vEl, nEl, tEl].forEach(function (n) { tip.appendChild(n); });
      tip.hidden = false;
      var scale = box.clientWidth / W;
      var left = x * scale + 18;
      var tw = tip.offsetWidth || 180;
      if (left + tw > box.clientWidth) left = x * scale - tw - 18;
      tip.style.left = (left + 14) + "px";
    }
    function hide() {
      cross.setAttribute("visibility", "hidden");
      hoverDot.setAttribute("visibility", "hidden");
      $("tooltip").hidden = true;
    }
    function nearest(evt) {
      var r = svg.getBoundingClientRect();
      var sx = (evt.clientX - r.left) * (W / r.width);
      var off = x0 + (sx - pad.l) / (W - pad.l - pad.r) * (x1 - x0);
      var best = 0, bd = Infinity;
      pts.forEach(function (p, i) { var dd = Math.abs(p.offset - off); if (dd < bd) { bd = dd; best = i; } });
      return best;
    }
    hit.addEventListener("pointermove", function (e) { show(nearest(e)); });
    hit.addEventListener("pointerdown", function (e) { show(nearest(e)); });
    svg.addEventListener("pointerleave", hide);
    svg.addEventListener("focus", function () { show(focusIdx); });
    svg.addEventListener("blur", hide);
    svg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        show(Math.max(0, Math.min(pts.length - 1, focusIdx + (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 7 : 1))));
      }
    });

    box.innerHTML = "";
    box.appendChild(svg);
  }

  function d3max(pts) { return pts.reduce(function (mx, p) { return Math.max(mx, p.rate); }, 0); }

  // ---------- Plan of Action ----------

  function renderPlanForm() {
    var p = state.plan;
    $("pSeller").value = p.seller || "";
    $("pIssue").value = ISSUES[p.issue] ? p.issue : "odr";
    $("pFacts").value = p.facts || "";
    var prompts = ["Why did this happen?", "Why?", "Why?", "Why?", "Why? (root cause)"];
    $("whys").innerHTML = prompts.map(function (q, i) {
      return '<li><label for="why' + i + '">Why ' + (i + 1) + '</label><input type="text" id="why' + i + '" data-why="' + i + '" placeholder="' + esc(q) + '" value="' + esc(p.whys[i] || "") + '"></li>';
    }).join("");
    $("causeKinds").innerHTML = CAUSE_KINDS.map(function (k, i) {
      return '<label for="kind' + i + '"><input type="checkbox" id="kind' + i + '" data-kind="' + esc(k) + '"' + (p.kinds.indexOf(k) !== -1 ? " checked" : "") + '>' + esc(k) + '</label>';
    }).join("");
    renderRows();
  }

  function renderRows() {
    var p = state.plan;
    $("fixes").innerHTML = p.fixes.map(function (f, i) {
      return '<div class="row"><input type="text" id="fix' + i + '" data-fix="' + i + '" data-field="text" aria-label="Fix ' + (i + 1) + '" placeholder="What you changed or did" value="' + esc(f.text) + '">' +
        '<input type="date" id="fixDate' + i + '" data-fix="' + i + '" data-field="date" aria-label="Date done" value="' + esc(f.date || "") + '">' +
        '<button type="button" class="remove" data-remove-fix="' + i + '" aria-label="Remove fix ' + (i + 1) + '">×</button></div>';
    }).join("");
    $("prevents").innerHTML = p.prevents.map(function (s, i) {
      return '<div class="row row-prevent"><input type="text" id="prev' + i + '" data-prevent="' + i + '" data-field="text" aria-label="Step ' + (i + 1) + '" placeholder="What you will keep doing" value="' + esc(s.text) + '">' +
        '<input type="text" id="prevOwner' + i + '" data-prevent="' + i + '" data-field="owner" aria-label="Owner" placeholder="Owner (role)" value="' + esc(s.owner || "") + '">' +
        '<select id="prevFreq' + i + '" data-prevent="' + i + '" data-field="freq" aria-label="How often"><option value="">How often?</option>' +
          FREQUENCIES.map(function (f) { return '<option' + (s.freq === f ? " selected" : "") + '>' + esc(f) + '</option>'; }).join("") + '</select>' +
        '<button type="button" class="remove" data-remove-prevent="' + i + '" aria-label="Remove step ' + (i + 1) + '">×</button></div>';
    }).join("");
  }

  function filled(list) { return list.filter(function (x) { return x && String(x.text || x).trim(); }); }

  function draftText() {
    var p = state.plan;
    var issue = ISSUES[p.issue] || ISSUES.odr;
    var whys = p.whys.map(function (w) { return (w || "").trim(); }).filter(Boolean);
    var root = whys[whys.length - 1];
    var fixes = filled(p.fixes);
    var prevents = filled(p.prevents);
    var out = [];
    out.push("Plan of Action" + (p.seller ? ": " + p.seller.trim() : ""));
    out.push("Issue: " + issue.label);
    out.push("");
    if (p.facts.trim()) { out.push("What happened"); out.push(p.facts.trim()); out.push(""); }
    out.push("1. Root cause");
    if (root) out.push("• " + root);
    if (whys.length > 1) {
      out.push("• How we found it (5 Whys):");
      whys.forEach(function (w, i) { out.push("   " + (i + 1) + ". " + w); });
    }
    if (p.kinds.length) out.push("• Area: " + p.kinds.join(", ").toLowerCase() + ".");
    out.push("");
    out.push("2. Actions we have already taken");
    if (!fixes.length) out.push("• (Add the fixes you've completed)");
    fixes.forEach(function (f) { out.push("• " + endStop(f.text.trim()).slice(0, -1) + (f.date ? " (completed " + fmtLong(parseIso(f.date) || new Date(f.date)) + ")." : ".")); });
    out.push("");
    out.push("3. Steps to prevent this from happening again");
    if (!prevents.length) out.push("• (Add the steps you'll keep doing)");
    prevents.forEach(function (s) {
      var tail = [s.owner ? "Owner: " + s.owner.trim() : "", s.freq ? "Frequency: " + s.freq.toLowerCase() : ""].filter(Boolean).join(". ");
      out.push("• " + endStop(s.text.trim()) + (tail ? " " + tail + "." : ""));
    });
    out.push("");
    out.push(issue.target
      ? "We now track our " + issue.metric + " " + (prevents.some(function (s) { return /weekly|daily/i.test(s.freq || ""); }) ? "every week" : "regularly") + " to keep it " + issue.target + ", and our team has been trained on these changes."
      : "Our team has been trained on these changes, and we review " + issue.metric + " regularly.");
    out.push("");
    out.push("Thank you for reviewing our plan.");
    return out.join("\n");
  }

  function endStop(s) { return /[.!?]$/.test(s) ? s : s + "."; }

  var BLAME = /\b(competitors?|unfair(ly)?|unjust|fault|blame|angry|upset|beg(ging)?|desperate|sabotage|fake complaints?)\b|!{2,}|amazon'?s (mistake|error|fault)/i;
  var VAGUE = /\b(mistake|error|oversight|accident(al|ally)?|unintentional(ly)?|misunderstanding|human error|by chance)\b/i;
  var DATEISH = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b|\d{1,2}[\/.-]\d{1,2}|\d{4}-\d{2}-\d{2}|\b(day|days|week|weeks|month|months)\b/i;

  function strength() {
    var p = state.plan;
    var whys = p.whys.map(function (w) { return (w || "").trim(); }).filter(Boolean);
    var root = whys[whys.length - 1] || "";
    var rootWords = root.split(/\s+/).filter(Boolean).length;
    var fixes = filled(p.fixes);
    var prevents = filled(p.prevents);
    var allText = [p.facts].concat(whys, fixes.map(function (f) { return f.text; }), prevents.map(function (s) { return s.text; })).join(" ");
    var checks = [
      { pts: 15, ok: /\d/.test(p.facts) && DATEISH.test(p.facts), label: "What happened has numbers and dates", tip: "Say how many orders, which rate and over which dates." },
      { pts: 15, ok: whys.length >= 3, label: "The 5 Whys go at least 3 levels deep", tip: "Keep asking why until you reach a process you control." },
      { pts: 10, ok: rootWords >= 8 && !(VAGUE.test(root) && rootWords < 15), label: "The root cause is specific", tip: "\"Human error\" or \"a mistake\" isn't a root cause. Name the missing check or process." },
      { pts: 5, ok: p.kinds.length > 0, label: "The root cause area is named", tip: "Pick process, people, product, partner, supplier or systems." },
      { pts: 10, ok: fixes.length >= 2, label: "At least 2 fixes are already done", tip: "Amazon wants to see action taken, not only promises." },
      { pts: 10, ok: fixes.length > 0 && fixes.every(function (f) { return f.date; }), label: "Every fix has the date it was done", tip: "Add a completion date to each fix." },
      { pts: 10, ok: prevents.length >= 2, label: "At least 2 prevention steps", tip: "Add the checks you'll keep doing so it can't happen again." },
      { pts: 15, ok: prevents.length > 0 && prevents.every(function (s) { return s.owner && s.owner.trim() && s.freq; }), label: "Every prevention step has an owner and a frequency", tip: "Say who does it and how often." },
      { pts: 10, ok: !BLAME.test(allText), label: "No blame or emotional language", tip: "Leave out competitors, fairness and pleading. Stick to facts and fixes." },
    ];
    var score = checks.reduce(function (s, c) { return s + (c.ok ? c.pts : 0); }, 0);
    return { score: score, checks: checks };
  }

  function renderPlanOutput() {
    $("draft").textContent = draftText();
    var st = strength();
    $("score").textContent = st.score;
    var fill = $("meterFill");
    fill.style.width = st.score + "%";
    var cls = st.score >= 80 ? "is-good" : st.score >= 50 ? "is-warn" : "is-bad";
    $("meter").className = "meter " + cls;
    $("meter").setAttribute("aria-label", "Plan strength " + st.score + " out of 100");
    $("checks").innerHTML = st.checks.map(function (c) {
      return '<li class="' + (c.ok ? "ok" : "no") + '">' + (c.ok ? ICON_OK : ICON_WARN) +
        '<span>' + esc(c.label) + (c.ok ? "" : '<span class="tip">' + esc(c.tip) + '</span>') + '</span><span class="pts">' + (c.ok ? "+" + c.pts : "0/" + c.pts) + '</span></li>';
    }).join("");
  }

  // ---------- Data ----------

  function toCsv(rows) {
    return [COLUMNS.join(",")].concat(rows.map(function (r) { return COLUMNS.map(function (c) { return r[c]; }).join(","); })).join("\n");
  }

  function parseCsv(text) {
    var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    if (lines.length < 2) throw new Error("Add a header row and at least 8 days of numbers.");
    var head = lines[0].toLowerCase().split(",").map(function (h) { return h.trim(); });
    var missing = COLUMNS.filter(function (c) { return head.indexOf(c) === -1; });
    if (missing.length) throw new Error("Missing column" + (missing.length > 1 ? "s" : "") + ": " + missing.join(", ") + ".");
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      var cells = lines[i].split(",").map(function (c) { return c.trim(); });
      var r = {};
      for (var k = 0; k < COLUMNS.length; k++) {
        var c = COLUMNS[k];
        var v = cells[head.indexOf(c)];
        if (c === "date") {
          var d = parseIso(v);
          if (!d) throw new Error("Line " + (i + 1) + ": the date \"" + (v || "") + "\" isn't YYYY-MM-DD.");
          r.date = iso(d);
        } else {
          var n = Number(v);
          if (v === "" || v == null || !isFinite(n) || n < 0) throw new Error("Line " + (i + 1) + ": " + c + " must be a number of 0 or more.");
          r[c] = n;
        }
      }
      if (r.cancelled > r.orders) throw new Error("Line " + (i + 1) + ": cancelled is more than orders.");
      if (rows.length && daysBetween(parseIso(rows[rows.length - 1].date), parseIso(r.date)) !== 1) throw new Error("Line " + (i + 1) + ": dates must be one day apart, oldest first, with no gaps.");
      rows.push(r);
    }
    if (rows.length < 8) throw new Error("Add at least 8 days of numbers.");
    return rows;
  }

  function renderSampleNote() {
    if (state.sample) {
      $("sampleNote").querySelector(".chip").textContent = "Sample data";
      $("sellerName").textContent = "Kalamkari Kraft";
      $("sellerBlurb").textContent = "is a made-up Hyderabad seller of hand-painted sarees. Monsoon courier delays pushed its Order Defect Rate over 1%.";
    } else {
      $("sampleNote").querySelector(".chip").textContent = "Your data";
      $("sellerName").textContent = state.plan.seller || "Your account";
      $("sellerBlurb").textContent = "has " + state.rows.length + " days of data, " + fmtLong(parseIso(state.rows[0].date)) + " to " + fmtLong(lastDate()) + ". Saved in this browser only.";
    }
  }

  // ---------- Render & events ----------

  function renderAll() {
    renderSampleNote();
    renderTiles();
    renderMetricPick();
    renderRecovery();
    renderPlanForm();
    renderPlanOutput();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.metric) {
      state.metric = t.dataset.metric; state.whatIf = 0; $("whatIf").value = 0;
      renderMetricPick(); renderRecovery(); save();
    } else if (t.dataset.planMetric) {
      state.metric = t.dataset.planMetric; state.whatIf = 0; $("whatIf").value = 0;
      renderMetricPick(); renderRecovery(); save();
      $("recovery").scrollIntoView({ block: "start" });
    } else if (t.dataset.removeFix !== undefined) {
      state.plan.fixes.splice(+t.dataset.removeFix, 1); renderRows(); renderPlanOutput(); save();
    } else if (t.dataset.removePrevent !== undefined) {
      state.plan.prevents.splice(+t.dataset.removePrevent, 1); renderRows(); renderPlanOutput(); save();
    }
  });

  $("addFix").addEventListener("click", function () {
    state.plan.fixes.push({ text: "", date: "" }); renderRows(); renderPlanOutput();
    var inputs = $("fixes").querySelectorAll('input[data-field="text"]');
    inputs[inputs.length - 1].focus();
  });
  $("addPrevent").addEventListener("click", function () {
    state.plan.prevents.push({ text: "", owner: "", freq: "" }); renderRows(); renderPlanOutput();
    var inputs = $("prevents").querySelectorAll('input[data-field="text"]');
    inputs[inputs.length - 1].focus();
  });

  $("planForm").addEventListener("input", onPlanInput);
  $("planForm").addEventListener("change", onPlanInput);
  $("planForm").addEventListener("submit", function (e) { e.preventDefault(); });
  function onPlanInput(e) {
    var t = e.target, p = state.plan;
    if (t.id === "pSeller") p.seller = t.value;
    else if (t.id === "pIssue") p.issue = t.value;
    else if (t.id === "pFacts") p.facts = t.value;
    else if (t.dataset.why !== undefined) p.whys[+t.dataset.why] = t.value;
    else if (t.dataset.kind) {
      p.kinds = Array.prototype.map.call($("causeKinds").querySelectorAll("input:checked"), function (x) { return x.dataset.kind; });
    } else if (t.dataset.fix !== undefined) p.fixes[+t.dataset.fix][t.dataset.field] = t.value;
    else if (t.dataset.prevent !== undefined) p.prevents[+t.dataset.prevent][t.dataset.field] = t.value;
    else return;
    renderPlanOutput();
    if (!state.sample && t.id === "pSeller") renderSampleNote();
    save();
  }

  $("ordersPerDay").addEventListener("change", function () {
    var v = Math.round(Number(this.value));
    state.perDay = isFinite(v) && v >= 1 ? v : null;
    renderRecovery();
  });
  $("whatIf").addEventListener("input", function () {
    state.whatIf = +this.value;
    renderRecovery();
  });

  $("copyPlan").addEventListener("click", function () {
    var btn = this, text = draftText();
    function done(ok) {
      btn.textContent = ok ? "Copied" : "Select and copy";
      if (!ok) { var r = document.createRange(); r.selectNodeContents($("draft")); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
      setTimeout(function () { btn.textContent = "Copy plan"; }, 1800);
    }
    try { navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); }); } catch (err) { done(false); }
  });

  var confirmTimer = null;
  $("loadSample").addEventListener("click", function () {
    var btn = this;
    if (!btn.dataset.armed) {
      btn.dataset.armed = "1";
      btn.textContent = "Click again to replace your data and plan";
      clearTimeout(confirmTimer);
      confirmTimer = setTimeout(function () { delete btn.dataset.armed; btn.textContent = "Reload sample"; }, 4000);
      return;
    }
    delete btn.dataset.armed;
    btn.textContent = "Reload sample";
    state.rows = sampleRows(TODAY); state.sample = true; state.plan = samplePlan(TODAY);
    state.perDay = null; state.whatIf = 0; $("whatIf").value = 0;
    $("csvMsg").textContent = "";
    renderAll(); save();
  });

  $("sampleCsv").addEventListener("click", function () {
    $("csv").value = toCsv(sampleRows(TODAY));
    $("csvMsg").classList.remove("is-error");
    $("csvMsg").textContent = "Sample filled in. Edit it or replace it with your own numbers.";
  });

  $("applyCsv").addEventListener("click", function () {
    var msg = $("csvMsg");
    try {
      var rows = parseCsv($("csv").value);
      state.rows = rows; state.sample = false; state.perDay = null; state.whatIf = 0; $("whatIf").value = 0;
      msg.classList.remove("is-error");
      msg.textContent = "Using " + rows.length + " days of your data.";
      renderAll(); save();
      $("health").scrollIntoView({ block: "start" });
    } catch (err) {
      msg.classList.add("is-error");
      msg.textContent = err.message;
    }
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { if (current) drawChart(current, recovery(current)); }, 120);
  });

  load();
  $("csv").value = state.sample ? "" : toCsv(state.rows);
  $("csv").placeholder = COLUMNS.join(",") + "\n2026-10-01,32,0,0,0,1,0,31\n…";
  renderAll();
})();
