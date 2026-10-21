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
// Workday: POST /wday/cxs/<tenant>/<site>/jobs. `search` is the text Workday matches against.
const WORKDAY = [
  { company: "The Hartford", host: "thehartford.wd5.myworkdayjobs.com", tenant: "thehartford", site: "Careers_External", search: "India" },
  { company: "DBS Tech India", host: "dbs.wd3.myworkdayjobs.com", tenant: "dbs", site: "DBS_Careers", search: "Hyderabad" },
  { company: "Teleperformance", host: "onetp.wd1.myworkdayjobs.com", tenant: "onetp", site: "Teleperformance", search: "HYD" },
  { company: "Concentrix", host: "cnx.wd1.myworkdayjobs.com", tenant: "cnx", site: "external_global", search: "Hyderabad" },
  { company: "Accenture", host: "accenture.wd103.myworkdayjobs.com", tenant: "accenture", site: "AccentureCareers", search: ["Trust and Safety Hyderabad", "Content Moderation Hyderabad", "KYC Hyderabad", "AML Hyderabad", "Compliance Hyderabad", "Risk Hyderabad", "Data Annotation Hyderabad"], pages: 2 },
];
// Eightfold: `pcsx` is the newer search API, `v2` the older one.
const EIGHTFOLD = [
  { company: "Microsoft", host: "apply.careers.microsoft.com", domain: "microsoft.com", api: "pcsx", location: "Hyderabad, Telangana, India" },
  { company: "HSBC", host: "hsbc.eightfold.ai", domain: "hsbc.com", api: "v2", location: "Hyderabad", jobBase: "https://portal.careers.hsbc.com/careers/job/" },
];
const SMARTRECRUITERS = [
  { company: "Experian", id: "Experian" },
  { company: "IQ-EQ", id: "IQEQ" },
];
const GREENHOUSE = [];
const LEVER = [];

// Seniority and job families that don't fit the profile (tax, facilities, finance, legal, medical).
const EXCLUDE = /\b(senior manager|manager|director|principal|head|vice president|vp|chief|architect|engineer|engineering|developer|scientist|sde|counsel|attorney|lawyer|paralegal|intern|internship|trainee|lead|leader|partner|tax|vat|gst|accountant|accounting|accounts payable|accounts receivable|payroll|treasury|maintenance|facilities|bbm|technician|nurse|medical|pharmacovigilance|driver|warehouse)\b/i;

// Language a posting asks for, from its title ("Quality Specialist - Telugu", "Investigation Specialist II - JP").
const LANGUAGES = {
  telugu: "Telugu", hindi: "Hindi", bengali: "Bengali", bangla: "Bengali", tamil: "Tamil", kannada: "Kannada", malayalam: "Malayalam",
  marathi: "Marathi", gujarati: "Gujarati", punjabi: "Punjabi", odia: "Odia", urdu: "Urdu",
  spanish: "Spanish", german: "German", french: "French", italian: "Italian", portuguese: "Portuguese", turkish: "Turkish",
  japanese: "Japanese", korean: "Korean", chinese: "Chinese", mandarin: "Chinese", arabic: "Arabic", dutch: "Dutch",
  polish: "Polish", swedish: "Swedish", russian: "Russian", thai: "Thai", vietnamese: "Vietnamese", indonesian: "Indonesian",
};
const LANG_CODES = { JP: "Japanese", ES: "Spanish", FR: "French", PT: "Portuguese", DE: "German", IT: "Italian", TR: "Turkish", AR: "Arabic", ZH: "Chinese", KO: "Korean", NL: "Dutch", PL: "Polish", SV: "Swedish" };

function languagesFor(title) {
  const found = new Set();
  const lower = title.toLowerCase();
  for (const [k, v] of Object.entries(LANGUAGES)) if (new RegExp(`\\b${k}\\b`).test(lower)) found.add(v);
  for (const [k, v] of Object.entries(LANG_CODES)) if (new RegExp(`(^|[\\s\\-–(\\[])${k}($|[\\s\\-–),\\]])`).test(title)) found.add(v);
  return [...found];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const report = [];

async function getJSON(url, init = {}, attempt = 1) {
  const res = await fetch(url, {
    ...init,
    headers: { "user-agent": UA, accept: "application/json", "accept-language": "en-US,en;q=0.9", ...(init.headers || {}) },
    signal: AbortSignal.timeout(25000),
  });
  if ((res.status === 429 || res.status >= 500) && attempt < 3) {
    await sleep(4000 * attempt);
    return getJSON(url, init, attempt + 1);
  }
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
  if (l.includes("gachibowli") || l.includes("puppalaguda")) return { area: "gachibowli", areaFrom: "posting" };
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
  return /hyderabad|telangana|gachibowli|nanakramguda|secunderabad|puppalaguda|\bhyd\b/i.test(location || "");
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
    languages: languagesFor(title),
    area,
    areaFrom,
    posted,
    url,
    roleId,
    source,
  };
}

// ---------- Sources ----------
// Each source returns raw postings: { id, title, companyName, location, posted, url, source, years }.

async function amazon() {
  const queries = [...new Set(DATA.roles.flatMap((r) => r.search))];
  const out = [];
  for (const q of queries) {
    const url = "https://www.amazon.jobs/en/search.json?" + new URLSearchParams({
      base_query: q, loc_query: "Hyderabad, Telangana, IND", country: "IND", result_limit: "100", sort: "recent", offset: "0",
    });
    const data = await getJSON(url);
    for (const j of data.jobs || []) {
      out.push({
        id: j.id_icims || j.id, title: j.title, companyName: "Amazon",
        location: [j.normalized_location, j.location, j.city].filter(Boolean).join(" · "),
        posted: toISO(j.posted_date), url: "https://www.amazon.jobs" + j.job_path, source: "amazon",
        years: maxYears(j.basic_qualifications),
      });
    }
    await sleep(400);
  }
  return out;
}

async function eightfold(cfg) {
  const out = [];
  const queries = cfg.api === "pcsx" ? [""] : [...new Set(DATA.roles.map((r) => r.search[0]))];
  for (const q of queries) {
    for (let start = 0; start < (cfg.api === "pcsx" ? 200 : 50); start += cfg.api === "pcsx" ? 10 : 50) {
      const path = cfg.api === "pcsx" ? "/api/pcsx/search?" : "/api/apply/v2/jobs?";
      const params = { domain: cfg.domain, query: q, location: cfg.location, start: String(start), sort_by: "timestamp" };
      if (cfg.api === "v2") params.num = "50";
      const data = await getJSON(`https://${cfg.host}${path}` + new URLSearchParams(params));
      const list = (data.data && data.data.positions) || data.positions || [];
      for (const p of list) {
        const ts = p.postedTs || p.t_create;
        out.push({
          id: p.id, title: p.name, companyName: cfg.company,
          location: [].concat(p.location || [], p.locations || []).filter(Boolean).join(" · "),
          posted: ts ? toISO(new Date(ts * 1000)) : null,
          url: p.canonicalPositionUrl || (cfg.jobBase ? cfg.jobBase + p.id + "?domain=" + cfg.domain : `https://${cfg.host}/careers/job/${p.id}`),
          source: "eightfold",
        });
      }
      if (list.length < (cfg.api === "pcsx" ? 10 : 50)) break;
      await sleep(700);
    }
    await sleep(500);
  }
  return out;
}

async function workday(cfg) {
  const out = [];
  const base = `https://${cfg.host}/wday/cxs/${cfg.tenant}/${cfg.site}/jobs`;
  for (const searchText of [].concat(cfg.search || "Hyderabad")) {
  for (let offset = 0; offset < 20 * (cfg.pages || 10); offset += 20) {
    const data = await getJSON(base, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ appliedFacets: {}, limit: 20, offset, searchText }),
    });
    const list = data.jobPostings || [];
    for (const p of list) {
      out.push({
        id: (p.bulletFields && p.bulletFields[0]) || p.externalPath, title: p.title, companyName: cfg.company,
        location: [p.locationsText, p.externalPath].filter(Boolean).join(" · "), posted: workdayPosted(p.postedOn),
        url: `https://${cfg.host}/en-US/${cfg.site}${p.externalPath}`, source: "workday",
      });
    }
    if (list.length < 20) break;
    await sleep(500);
  }
  }
  return out;
}

async function smartrecruiters(cfg) {
  const data = await getJSON(`https://api.smartrecruiters.com/v1/companies/${cfg.id}/postings?` + new URLSearchParams({ city: "Hyderabad", limit: "100" }));
  return (data.content || []).map((p) => ({
    id: p.id, title: p.name, companyName: cfg.company,
    location: [p.location && p.location.city, p.location && p.location.region, p.location && p.location.country].filter(Boolean).join(", "),
    posted: toISO(p.releasedDate), url: `https://jobs.smartrecruiters.com/${cfg.id}/${p.id}`, source: "smartrecruiters",
  }));
}

async function infosys() {
  const data = await getJSON("https://intapgateway.infosysapps.com/careersci/search/intapjbsrch/getCareerSearchJobs?sourceId=1,21&searchText=ALL");
  const list = Array.isArray(data) ? data : data.data || [];
  return list.map((j) => ({
    id: j.referenceCode || j.jobReferenceCode, title: j.postingTitle || j.title, companyName: "Infosys",
    location: j.location || j.city || "", posted: toISO(j.createdOn),
    url: `https://career.infosys.com/jobdesc?jobReferenceCode=${encodeURIComponent(j.referenceCode || "")}&sourceId=${j.sourceId || 1}`, source: "infosys",
  }));
}

async function capgemini() {
  const out = [];
  for (let page = 1; page <= 5; page++) {
    const data = await getJSON(`https://cg-jobstream-api.azurewebsites.net/api/job-search?country_code=in-en&page=${page}&size=100`);
    const list = data.data || data.jobs || data.results || (Array.isArray(data) ? data : []);
    for (const j of list) {
      out.push({
        id: j.id || j.ref || j.job_id || j.apply_job_url, title: j.title || j.job_title || j.name, companyName: "Capgemini",
        location: [j.location, j.city, j.locations && [].concat(j.locations).join(", ")].filter(Boolean).join(" · "),
        posted: toISO(j.created_at || j.posted_date || j.date || j.updated_at),
        url: j.apply_job_url || j.url || j.job_url || "https://www.capgemini.com/in-en/careers/join-capgemini/job-search/", source: "capgemini",
      });
    }
    if (list.length < 100) break;
    await sleep(500);
  }
  return out;
}

async function greenhouse(cfg) {
  const data = await getJSON(`https://boards-api.greenhouse.io/v1/boards/${cfg.token}/jobs`);
  return (data.jobs || []).map((j) => ({
    id: j.id, title: j.title, companyName: cfg.company, location: (j.location && j.location.name) || "",
    posted: toISO(j.updated_at), url: j.absolute_url, source: "greenhouse",
  }));
}

async function lever(cfg) {
  const data = await getJSON(`https://api.lever.co/v0/postings/${cfg.slug}?mode=json`);
  return (data || []).map((p) => ({
    id: p.id, title: p.text, companyName: cfg.company, location: (p.categories && p.categories.location) || "",
    posted: toISO(p.createdAt), url: p.hostedUrl, source: "lever",
  }));
}

const SOURCES = [
  { name: "Amazon", run: amazon },
  ...EIGHTFOLD.map((c) => ({ name: c.company, run: () => eightfold(c) })),
  ...WORKDAY.map((c) => ({ name: c.company, run: () => workday(c) })),
  ...SMARTRECRUITERS.map((c) => ({ name: c.company, run: () => smartrecruiters(c) })),
  { name: "Infosys", run: infosys },
  { name: "Capgemini", run: capgemini },
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
    const raw = (await src.run()).filter((r) => r && r.title);
    const hyd = raw.filter((r) => isHyderabad(r.location));
    let kept = 0;
    for (const r of hyd) {
      const j = makeJob(r);
      if (j && !found.has(j.id)) { found.set(j.id, j); kept++; }
    }
    report.push({ name: src.name, ok: true, count: kept });
    console.log(`✓ ${src.name}: ${raw.length} postings, ${hyd.length} in Hyderabad, ${kept} matching (${Date.now() - started} ms)`);
    if (!kept) for (const r of raw.slice(0, 4)) console.log(`    sample: ${r.title} [${(r.location || "").slice(0, 90)}]`);
  } catch (err) {
    report.push({ name: src.name, ok: false, count: 0, error: String(err.message || err).slice(0, 120) });
    console.log(`✗ ${src.name}: ${err.message || err}`);
  }
}

// A source that failed this run (often a rate limit) keeps its previous jobs until it answers again.
const failed = new Set(report.filter((r) => !r.ok).map((r) => r.name));
for (const j of previous.jobs || []) {
  if (failed.has(j.company) && !found.has(j.id)) found.set(j.id, j);
}

// Merge repeat postings (Amazon lists one post per opening) into one card with a count.
const grouped = new Map();
for (const j of found.values()) {
  const key = [j.company, j.title.toLowerCase().replace(/\s+/g, " "), j.location].join("|");
  const g = grouped.get(key);
  if (!g) grouped.set(key, { ...j, openings: j.openings || 1 });
  else {
    g.openings += j.openings || 1;
    if ((j.posted || "") > (g.posted || "")) Object.assign(g, { ...j, openings: g.openings });
  }
}
found.clear();
for (const g of grouped.values()) found.set(g.id, g);

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
