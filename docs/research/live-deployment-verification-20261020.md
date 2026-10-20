# Live deployment verification, October 20, 2026

Published host: https://educarecomplete.com/ce-requirement-finder
Direct Finder: https://asipes60.github.io/educare-ce-requirement-finder/?v=20261020-1
Source main revision: 68e525dabc01baeb7e291cbb86d0f84fd5a6d6d9
GitHub Pages deployment revision: 0049e8e807ebf6cff743c4a4de61dbb2d370c574

## Changes published

- GitHub Pages had been serving the previous gh-pages tree despite the main push.
  Published the tested runtime and required registry/module files to gh-pages.
- Browser reproduced mixed old scripts and new HTML; public HTTP responses matched
  main and declared max-age=600. Versioned entry and dependency module URLs; host
  iframe and fallback also use the release query to avoid cached old HTML.
- Saved the approved LearnWorlds heading, explanatory paragraph and persistent
  direct-open link. Saved confirmation and public page DOM both verified.
- The fallback was clicked and opened the current Finder in a separate tab.
- Public host embed displayed Registry loaded and four California matches.

## Desktop browser matching checks

| State | Professions checked | Expected matches per selection | Result |
|---|---|---|---|
| California | Counselor, LMFT, LCSW | 4 | Pass (3 selections) |
| Ohio | Counselor, LMFT, LCSW | 3 | Pass (3 selections) |
| Washington | Counselor, LMFT, LCSW | 3 | Pass (3 selections) |
| Virginia | Counselor, LMFT | 3 | Pass (2 selections) |
| Connecticut | Counselor | 3 | Pass |
| New Mexico | Counselor, LMFT | 3 | Pass (2 selections) |
| Pennsylvania | Counselor | 0 | Pass |
| Oregon | Counselor | 0 | Pass |
| California | Psychologist, BCBA/BCBA-D, BCaBA | 0 | Pass (3 selections) |

All 14 enabled selections and five held/unsupported selections passed. The
California cards displayed 5, 4, 3 and 1 CE hours, review dates and source links.
All four View course destinations opened the intended LearnWorlds course pages
with their expected course headings. No enrollment or purchase was submitted.

## Validation and limits

- 19 automated tests passed; site and Vercel builds passed after URL versioning.
- Tests used the existing signed-in desktop Chrome session.
- This is functional desktop verification, not a fresh mobile LCP measurement or
  an anonymous checkout test. The live outage/error branch was not fault-injected.
- An existing blank LearnWorlds popup overlay was dismissed during inspection;
  its settings were not changed.
- No new state eligibility claims or requirement totals were added in deployment.

Screenshot: [Published host](finder-live-20261020.jpg).
