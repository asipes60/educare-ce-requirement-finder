# EduCare CE Requirement Finder

This is the LearnWorlds-embeddable CE Requirement Finder.

Live public URL:

```text
https://asipes60.github.io/educare-ce-requirement-finder/
```

## What It Does

- Supports all 50 states in the public selector.
- Supports the first planned license families:
  - LPC / LPCC / LMHC
  - LMFT
  - LCSW / LISW
  - Psychologist
  - BCBA / BCaBA
- Shows verified requirement summaries from the cached public Airtable registry.
- Uses 250 verified records from Growth Hub `CE Requirements`: 50 BACB national certification-maintenance rows and 200 state-board rows across all 50 states.
- Uses NBCC ACEP No. 8109 only after course-level matching is verified.

## Run Locally

```bash
npm test
npm start
```

Then open:

```text
http://localhost:4173
```

The public JSON endpoint is:

```text
http://localhost:4173/api/requirements
```

## LearnWorlds Embed

Use an iframe embed on the LearnWorlds page after the tool is hosted:

```html
<iframe
  src="https://asipes60.github.io/educare-ce-requirement-finder/"
  title="EduCare CE Requirement Finder"
  style="width:100%;min-height:900px;border:0;"
  loading="lazy"
></iframe>
```

## Data Governance

The public app serves `public/requirements.json` through `/api/requirements`. Refresh the cache from the private Airtable source with:

```bash
npm run refresh:registry -- --env /path/to/.env.local
```

The browser receives only public-safe verified fields. Airtable credentials, reviewer notes, and internal course-match IDs are not shipped in the public payload.

## Production Registry Source

Created 2026-06-21 in Airtable Growth Hub. Current public cache refreshed 2026-06-22.

- Base: `EduCare Growth Hub` (`app0SleLSUfJ1ME03`)
- Table: `CE Requirements` (`tblKG69LIBl6DIj3S`)
- Current scope: 250 verified records.

Core fields:

| Field | ID |
|---|---|
| Record Key | `fldKjbQXLHSWYhSKQ` |
| State | `fldJ9nqBIqOnBPI9n` |
| State Code | `fldxQKAXTObQBwnwV` |
| License Family | `fldfh8pX7tDb2eWU5` |
| Board | `fldVGrMdoob2kazkK` |
| Renewal Cycle | `fldWoLMfWM69r8ax3` |
| Total Hours | `fldypy1p2okplBTOS` |
| Unit Label | `fldLu2j7GD1vA6sGh` |
| Required Categories | `fldXI0e97PXmESfsP` |
| Source URLs | `fldOp5WCrJaXkJC7d` |
| Last Reviewed | `fldmBIGYhHoist64g` |
| Verification Status | `fldP8UuJoSpUPCVkn` |
| Course Match IDs | `fldtPAa28KNKY4RVU` |
| Reviewer Notes | `fldkjKlvK84JpjqEA` |

Only records with `Verification Status = Verified` should be eligible for public display.

## Recommendation review (2026-10-20)

Course availability and advertised hours were checked against the live EduCare catalog.
State/profession provider and delivery-method evidence is recorded separately in
`src/course-eligibility.mjs`; see `docs/research/course-eligibility-review.md` for the
complete 150-row review queue. Only verified evidence rows yield recommendations. Provider approval pathways are
tracked separately under `providerAcceptance`; recognition alone never enables a
course. See `docs/research/provider-acceptance-review.md` for the current findings.
California includes four available courses. Reviewed non-California combinations
include only the three general courses; California Minor Consent remains excluded.
This review does not establish mandatory-topic credit or independently audit
instructional hours. Coming-soon BACB courses are excluded. Review availability
before each release.

Matching is derived at lookup from the reviewed catalog in `src/data.mjs` and the state/profession evidence gates, not
from private Airtable IDs. A registry refresh therefore cannot silently erase or
expand eligibility. The browser loads `public/requirements.json` using a module-
relative URL compatible with GitHub Pages subpaths and supported build outputs.
Requirement review dates are preserved; this change does not reverify the 300
existing requirement summaries.

## LearnWorlds copy (published October 20, 2026)

Heading: Find Your Continuing Education Requirements

Select your state and credential to review renewal hours, required topics, and
official sources. Where eligibility has been verified, results also include
relevant EduCare courses. Check the review date and confirm requirements with
your licensing board or certification body before enrolling.

Having trouble loading the Finder? Open the CE Requirement Finder directly.
Destination: https://asipes60.github.io/educare-ce-requirement-finder/?v=20261020-1
Open in a new tab, rel="noopener noreferrer".

The approved introduction and fallback link are published on the LearnWorlds host
page. The iframe and direct-open link use the release query above to avoid old
HTML cached by returning browsers. Entry/dependency modules use the same release
version in their import URLs. Bump these together when publishing changed scripts.

GitHub Pages serves the separate `gh-pages` branch, not `main`. Publish the static
runtime to that branch after updating main. The deployed tree includes
`public/requirements.json`, `src/course-eligibility.mjs`, the other src modules,
index.html, and assets. Keep the same registry under the existing
`api/requirements` and root `requirements.json` paths for compatibility.
Rollback: deploy the preceding static tree to `gh-pages` with a new version query.
See docs/research/live-deployment-verification-20261020.md for the browser checks.
