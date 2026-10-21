// Fetches fresh Hyderabad job openings that match the roles in data.js and writes jobs.json.
// Runs in GitHub Actions (see .github/workflows/jobs.yml). No dependencies; needs Node 20+.
//
//   node scripts/fetch-jobs.mjs           update jobs.json
//   node scripts/fetch-jobs.mjs --probe   only report what each source returns

import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const ROOT = new URL("../", import.meta.url);
const PROBE = process.argv.includes("--probe");
const MAX_AGE_DAYS = 21;
const MAX_JOBS = 250;
const MAX_YEARS = 6;
const UA = "Mozilla/5.0 (compatible; personal-portfolio-job-feed/1.0; +https://github.com/shraddhabiswas2723/personal-portfolio)";

const ctx = { window: {} };
vm.runInNewContext(await readFile(new URL("data.js", ROOT), "utf8"), ctx);
const DATA = ctx.window.PROFILE_DATA;

// Public job-board endpoints that each company's own careers site uses.
const WORKDAY = [
  { companyId: "franklin", company: "Franklin Templeton", host: "franklintempleton.wd5.myworkdayjobs.com", tenant: "franklintempleton", site: "Primary-External-1" },
  { companyId: "schwab", company: "Charles Schwab", host: "schwab.wd1.myworkdayjobs.com", tenant: "schwab", site: "External" },
  { companyId: "hartford", company: "The Hartford", host: "thehartford.wd5.myworkdayjobs.com", tenant: "thehartford", site: "Careers_External" },
  { companyId: "accenture", company: "Accenture", host: "accenture.wd103.myworkdayjobs.com", tenant: "accenture", site: "AccentureCareers" },
];
const SMARTRECRUITERS = [];
const GREENHOUSE = [];
const LEVER = [];

const EXCLUDE = /\b(senior manager|manager|director|principal|head|vice president|vp|chief|architect|engineer|engineering|developer|scientist|sde|counsel|attorney|lawyer|intern|internship|trainee|lead|leader|partner)\b/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const report = [];

async function getJSON(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { "user-agent": UA, accept: "application/json", ...(init.headers || {}) },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---------- Classification ----------

const roleMatchers = DATA.roles.map((r) => ({ id: r.id, phrases: (r.jobTitles || []).map((p) => p.toLowerCase()) }));

function classify(title) {
  const t = title.toLowerCase();
  if (EXCLUDE.test(t)) return null;
  let best = null;
  for (const m of roleMatchers) {
    for (const p of m.phrases) {
      if (t.includes(p) && (!best || p.length > best.len)) best = { id: m.id, len: p.length };
    }
  }
  return best ? best.id : null;
}

const companyByName = DATA.companies.map((c) => ({ c, key: c.name.toLowerCase().split(" (")[0] }));

function companyFor(name) {
  const n = (name || "").toLowerCase();
  const hit = companyByName.find(({ key }) => n.includes(key) || key.includes(n));
  return hit ? hit.c : null;
}

function areaFor(location, company) {
  const l = (location || "").toLowerCase();
  if (l.includes("gachibowli")) return { area: "gachibowli", areaFrom: "posting" };
  if (l.includes("nanakramguda") || l.includes("financial district") || l.includes("waverock")) return { area: "nanakramguda", areaFrom: "posting" };
  if (company) return { area: company.area, areaFrom: "company" };
  return { area: "hyderabad", areaFrom: "none" };
}

function maxYears(text) {
  const m = String(text || "").match(/(\d+)\s*\+?\s*(?:-\s*\d+\s*)?years?/gi);
  if (!m) return null;
  return Math.max(...m.map((s) => parseInt(s, 10)).filter((n) => n < 30));
}

function isHyderabad(location) {
  return /hyderabad|telangana|gachibowli|nanakramguda|secunderabad/i.test(location || "");
}

function toISO(d) {
  const t = d instanceof Date ? d : new Date(d);
  return isNaN(t) ? null : t.toISOString().slice(0, 10);
}

function workdayPosted(text) {
  const s = String(text || "").toLowerCase();
  const now = Date.now();
  if (s.includes("today")) return toISO(new Date(now));
  if (s.includes("yesterday")) return toISO(new Date(now - 86400000));
  const m = s.match(/(\d+)\+?\s*days?/);
  return m ? toISO(new Date(now - parseInt(m[1], 10) * 86400000)) : null;
}

function makeJob({ id, title, companyName, location, posted, url, source, years }) {
  if (!title || !url || !isHyderabad(location)) return null;
  const roleId = classify(title);
  if (!roleId) return null;
  if (years != null && years > MAX_YEARS) return null;
  const company = companyFor(companyName);
  const { area, areaFrom } = areaFor(location, company);
  return {
    id: `${source}:${id}`,
    title: title.trim(),
    company: company ? company.name : companyName,
    companyId: company ? company.id : null,
    location: location.trim(),
    area,
    areaFrom,
    posted,
    url,
    roleId,
    source,
  };
}

// ---------- Sources ----------

async function amazon() {
  const queries = [...new Set(DATA.roles.flatMap((r) => r.search))];
  const jobs = [];
  for (const q of queries) {
    const url = "https://www.amazon.jobs/en/search.json?" + new URLSearchParams({
      base_query: q, loc_query: "Hyderabad, Telangana, IND", country: "IND", result_limit: "100", sort: "recent", offset: "0",
    });
    const data = await getJSON(url);
    for (const j of data.jobs || []) {
      jobs.push(makeJob({
        id: j.id_icims || j.id, title: j.title, companyName: "Amazon",
        location: [j.normalized_location, j.location, j.city].filter(Boolean).join(" · "),
        posted: toISO(j.posted_date), url: "https://www.amazon.jobs" + j.job_path, source: "amazon",
        years: maxYears(j.basic_qualifications),
      }));
    }
    await sleep(400);
  }
  return jobs;
}

async function microsoft() {
  const queries = [...new Set(DATA.roles.map((r) => r.search[0]))];
  const jobs = [];
  for (const q of queries) {
    const url = "https://apply.careers.microsoft.com/api/apply/v2/jobs?" + new URLSearchParams({
      domain: "microsoft.com", query: q, location: "Hyderabad, Telangana, India", start: "0", num: "50", sort_by: "timestamp",
    });
    const data = await getJSON(url);
    for (const p of data.positions || []) {
      jobs.push(makeJob({
        id: p.id, title: p.name, companyName: "Microsoft",
        location: [p.location].concat(p.locations || []).filter(Boolean).join(" · "),
        posted: p.t_create ? toISO(new Date(p.t_create * 1000)) : null,
        url: p.canonicalPositionUrl || `https://apply.careers.microsoft.com/careers/job/${p.id}`, source: "microsoft",
      }));
    }
    await sleep(400);
  }
  return jobs;
}

async function workday(cfg) {
  const jobs = [];
  const base = `https://${cfg.host}/wday/cxs/${cfg.tenant}/${cfg.site}/jobs`;
  for (let offset = 0; offset < 100; offset += 20) {
    const data = await getJSON(base, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ appliedFacets: {}, limit: 20, offset, searchText: "Hyderabad" }),
    });
    const list = data.jobPostings || [];
    for (const p of list) {
      jobs.push(makeJob({
        id: (p.bulletFields && p.bulletFields[0]) || p.externalPath, title: p.title, companyName: cfg.company,
        location: p.locationsText || "", posted: workdayPosted(p.postedOn),
        url: `https://${cfg.host}/${cfg.site}${p.externalPath}`, source: "workday",
      }));
    }
    if (list.length < 20) break;
    await sleep(400);
  }
  return jobs;
}

async function smartrecruiters(cfg) {
  const data = await getJSON(`https://api.smartrecruiters.com/v1/companies/${cfg.id}/postings?` + new URLSearchParams({ city: "Hyderabad", limit: "100" }));
  return (data.content || []).map((p) => makeJob({
    id: p.id, title: p.name, companyName: cfg.company,
    location: [p.location && p.location.city, p.location && p.location.region, p.location && p.location.country].filter(Boolean).join(", "),
    posted: toISO(p.releasedDate), url: `https://jobs.smartrecruiters.com/${cfg.id}/${p.id}`, source: "smartrecruiters",
  }));
}

async function greenhouse(cfg) {
  const data = await getJSON(`https://boards-api.greenhouse.io/v1/boards/${cfg.token}/jobs`);
  return (data.jobs || []).map((j) => makeJob({
    id: j.id, title: j.title, companyName: cfg.company, location: (j.location && j.location.name) || "",
    posted: toISO(j.updated_at), url: j.absolute_url, source: "greenhouse",
  }));
}

async function lever(cfg) {
  const data = await getJSON(`https://api.lever.co/v0/postings/${cfg.slug}?mode=json`);
  return (data || []).map((p) => makeJob({
    id: p.id, title: p.text, companyName: cfg.company, location: (p.categories && p.categories.location) || "",
    posted: toISO(p.createdAt), url: p.hostedUrl, source: "lever",
  }));
}

const SOURCES = [
  { name: "Amazon", run: amazon },
  { name: "Microsoft", run: microsoft },
  ...WORKDAY.map((c) => ({ name: c.company, run: () => workday(c) })),
  ...SMARTRECRUITERS.map((c) => ({ name: c.company, run: () => smartrecruiters(c) })),
  ...GREENHOUSE.map((c) => ({ name: c.company, run: () => greenhouse(c) })),
  ...LEVER.map((c) => ({ name: c.company, run: () => lever(c) })),
];

// ---------- Main ----------

let previous = { jobs: [] };
try { previous = JSON.parse(await readFile(new URL("jobs.json", ROOT), "utf8")); } catch { /* first run */ }
const firstSeen = new Map((previous.jobs || []).map((j) => [j.id, j.firstSeen]));

const found = new Map();
for (const src of SOURCES) {
  const started = Date.now();
  try {
    const jobs = (await src.run()).filter(Boolean);
    let kept = 0;
    for (const j of jobs) {
      if (!found.has(j.id)) { found.set(j.id, j); kept++; }
    }
    report.push({ name: src.name, ok: true, count: kept });
    console.log(`✓ ${src.name}: ${kept} matching jobs (${Date.now() - started} ms)`);
  } catch (err) {
    report.push({ name: src.name, ok: false, count: 0, error: String(err.message || err).slice(0, 120) });
    console.log(`✗ ${src.name}: ${err.message || err}`);
  }
}

const today = new Date().toISOString().slice(0, 10);
const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10);
const jobs = [...found.values()]
  .map((j) => ({ ...j, firstSeen: firstSeen.get(j.id) || today }))
  .filter((j) => (j.posted || j.firstSeen) >= cutoff)
  .sort((a, b) => (b.posted || b.firstSeen).localeCompare(a.posted || a.firstSeen))
  .slice(0, MAX_JOBS);

const byRole = {};
for (const j of jobs) byRole[j.roleId] = (byRole[j.roleId] || 0) + 1;
console.log(`Total: ${jobs.length} jobs`, byRole);
if (PROBE) {
  for (const j of jobs.slice(0, 25)) console.log(`  ${j.posted || "?"}  ${j.roleId.padEnd(10)} ${j.company} — ${j.title} [${j.location}]`);
  process.exit(0);
}

const sameJobs = JSON.stringify((previous.jobs || []).map((j) => j.id)) === JSON.stringify(jobs.map((j) => j.id));
const lastUpdated = previous.updated ? Date.parse(previous.updated) : 0;
const allFailed = report.every((r) => !r.ok);
let changed = false;
if (allFailed) {
  console.log("Every source failed; keeping the previous jobs.json.");
} else if (sameJobs && Date.now() - lastUpdated < 12 * 3600000) {
  console.log("No new or removed jobs; leaving jobs.json as it is.");
} else {
  await writeFile(new URL("jobs.json", ROOT), JSON.stringify({ updated: new Date().toISOString(), sources: report, jobs }, null, 1) + "\n");
  changed = true;
  console.log("Wrote jobs.json");
}
if (process.env.GITHUB_OUTPUT) await writeFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`, { flag: "a" });
