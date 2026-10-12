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

- **Dashboard:** contact details, best match, ATS score, project count, the three roles to apply for first, and a next-steps checklist.
- **Role matcher:** roles ranked by match score with expected salary (₹ LPA), employers in Gachibowli and Nanakramguda, job titles to search, and skill gaps.
- **Companies:** employers with offices in Gachibowli or Nanakramguda, filterable by area and role, with careers links. "Verify" marks offices that only secondary sources place there.
- **Resume & ATS:** ATS score of the current resume per role, keyword coverage, projects recommended, project ideas, and **Generate** for a tailored plain-text ATS resume (copy, Word, .txt or PDF).
- **Skills / Learning log / Profile:** skills you have and what to learn next, every course marked useful or not useful, experience, and application details.

Press Ctrl K (⌘ K on Mac) to search roles, companies and skills. The sun/moon button switches light and dark.

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

**Role match score:**

- Experience fit (45%): how directly past work maps to the job.
- Skill coverage (31.5%): weighted share of the role's skills you have.
- Hyderabad demand (13.5%): how many openings the city usually has.

The maximum is 90%, because interviews, timing and referrals can't be predicted from a profile.
The scores are estimates for deciding where to apply first, not guarantees.
Adjust `exp`, `demand` and skill weights per role in `data.js`.

Note: this page shows your phone number and email. Remove them from `data.js` before
hosting it publicly if you'd rather not share them.
