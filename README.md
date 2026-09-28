# Shraddha Biswas — profile site

A static personal site: profile, experience, skills, learning log, personal details,
and a role matcher that ranks which Hyderabad roles fit best.

## Open it

Double-click `index.html`. No install or build step is needed.

To put it online for free, enable **GitHub Pages** for this repository
(Settings → Pages → Deploy from a branch → `main`, folder `/ (root)`). The site will then live at
https://shraddhabiswas2723.github.io/personal-portfolio/

## Update it

- **Everything on the page** (summary, jobs, skills, roles, learning) is in `data.js`.
- **From the page itself** you can add skills, learning entries and personal details.
  These save in your browser only. Use **Copy backup** in the Personal section to keep a copy,
  and **Restore from backup** to load it on another device.

## How the role match score works

- Experience fit (45%): how directly past work maps to the job.
- Skill coverage (31.5%): weighted share of the role's skills you have.
- Hyderabad demand (13.5%): how many openings the city usually has.

The maximum is 90%, because interviews, timing and referrals can't be predicted from a profile.
The scores are estimates for deciding where to apply first, not guarantees.
Adjust `exp`, `demand` and skill weights per role in `data.js`.

Note: this page shows your phone number and email. Remove them from `data.js` before
hosting it publicly if you'd rather not share them.
