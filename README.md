# Shraddha Biswas — profile site

A static personal site: profile, experience, skills, learning log, personal details,
and a role matcher that ranks which Hyderabad roles fit best.

The look follows the design of [Homarr](https://github.com/homarr-labs/homarr) (Apache-2.0):
its Mantine colour palette and red accent, Inter type, app-shell header and sidebar,
collapsible category cards, ring progress charts and a dark/light switch.
No Homarr code or logo is included; the styles are rewritten in plain CSS.

## Open it

Double-click `index.html`. No install or build step is needed.

To put it online for free, enable **GitHub Pages** for this repository
(Settings → Pages → Deploy from a branch → `main`, folder `/ (root)`). The site will then live at
https://shraddhabiswas2723.github.io/personal-portfolio/

## Use it

- **Search:** press Ctrl K (⌘ K on Mac) to jump to any section, role or skill.
- **Sidebar:** jump between sections; on a phone, open it with the menu button.
- **Sections:** click a section title to collapse or expand it. The page remembers your choice.
- **Colour scheme:** the sun/moon button switches between light and dark.

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
