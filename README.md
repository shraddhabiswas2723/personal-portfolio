# Shraddha Biswas — profile site

A static job-search site for compliance, risk and AI roles in Hyderabad, focused on employers
in Gachibowli and Nanakramguda: role matcher with salaries, company list, ATS resume check and
resume generator, skills, learning log and profile.

The look follows the design of [Homarr](https://github.com/homarr-labs/homarr) (Apache-2.0):
its Mantine colour palette and red accent, Inter type, app-shell header and sidebar,
bordered cards, ring progress charts and a dark/light switch.
No Homarr code or logo is included; the styles are rewritten in plain CSS.

## Open it

Double-click `index.html`. No install or build step is needed.

To put it online for free, enable **GitHub Pages** for this repository
(Settings → Pages → Deploy from a branch → `main`, folder `/ (root)`). The site will then live at
https://shraddhabiswas2723.github.io/personal-portfolio/

## Pages

- **Dashboard:** best match, live jobs in your areas, ATS score, projects, the freshest openings for you, the roles to apply for first, and a 15-day plan.
- **Live jobs:** real Hyderabad openings that match your roles, refreshed every 3 hours, with your match %, salary range, area and any language the posting needs. Plus one-click LinkedIn, Naukri, Indeed and Amazon searches filtered to recent postings.
- **Role matcher:** roles ranked by profile match with expected salary (₹ LPA), a **Path to 90%** list of the exact actions that raise each score, employers in Gachibowli and Nanakramguda, and job titles to search.
- **Companies:** employers with offices in Gachibowli or Nanakramguda, filterable by area and role, with careers links.
- **Resume & ATS:** ATS score per role, keyword coverage, projects needed with ideas, and **Generate** for a tailored ATS resume (copy, Word, .txt or PDF).
- **Skills / Learning log / Profile:** skills and what to learn next, every course marked useful or not, experience and application details. Add your languages on the Profile page to hide postings that need a language you don't speak.

Press Ctrl K (⌘ K on Mac) to search roles, companies and skills. The sun/moon button switches light and dark.

## Live jobs: how it works

`scripts/fetch-jobs.mjs` reads the roles in `data.js`, asks company job boards (Amazon Jobs first, more as they're added) for Hyderabad openings, drops senior and unrelated job families, merges repeat postings, and writes `jobs.json`. The workflow in `.github/workflows/jobs.yml` runs it every 3 hours and commits `jobs.json` when openings change, so the online site shows fresh jobs every time it's opened.

To switch it on:

1. Merge this branch into `main` (scheduled workflows only run on the default branch).
2. Turn on GitHub Pages: Settings → Pages → Deploy from a branch → `main`, folder `/ (root)`.
3. Optional: Actions → Refresh live jobs → Run workflow, to refresh straight away.

Opened as a local file (double-click), the site can't read `jobs.json`; use the online site, or the job-site search buttons.

## Update it

- **Everything on the page** (summary, jobs, skills, roles, salaries, companies, keywords, learning) is in `data.js`.
- **From the page itself** you can add skills, learning entries, finished projects, application details
  and tick off next steps. These save in your browser only. Use **Copy backup** on the Profile page
  to keep a copy, and **Restore from backup** to load it on another device.

## How the scores work

**ATS score** (out of 100): keyword match 30, parse-safe layout 12, target title near the top 10,
quantified bullets 10, standard headings 8, contact details 5, action verbs 5, dates and gap 5,
length 5, file and fonts 5, education and certifications 5. Keywords come from Hyderabad job
descriptions. The generated resume only uses keywords for skills you actually have.

**Profile match** (out of 100): how closely you meet what the role asks for.

- Experience (40): how directly past work maps to the job. Fixed by your history.
- Skills (30): weighted share of the role's skills you have.
- Resume keywords (15): ATS score of the resume you send (higher once you generate a tailored one).
- Projects and certificates (10): projects against the number recommended (7) plus a relevant certificate (3).
- Referral (5): whether someone inside can refer you.

90% or more means you meet nearly everything the job asks for. It is not a promise of an offer.
Adjust `exp` and skill weights per role in `data.js`.

Note: this page shows your phone number and email. Remove them from `data.js` before
hosting it publicly if you'd rather not share them.
