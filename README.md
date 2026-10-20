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
  - BCBA / BCBA-D
  - BCaBA
- Shows verified requirement summaries from the cached public Airtable registry.
- Uses 300 verified records from Growth Hub `CE Requirements`: 100 BACB national certification-maintenance rows (50 BCBA/BCBA-D and 50 BCaBA) and 200 state-board rows across all 50 states.
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

Use the complete published markup in `integrations/learnworlds-ce-finder.html`.
It includes the introduction, direct-open fallback, responsive iframe, and a
height listener restricted to the GitHub Pages origin and the expected frame.
The embedded app reports its content height so results fill the page without
an internal scrollbar. Keep the host listener when replacing the iframe.

## Data Governance

The public app serves `public/requirements.json` through `/api/requirements`. Refresh the cache from the private Airtable source with:

```bash
npm run refresh:registry -- --env /path/to/.env.local
```

The browser receives only public-safe verified fields. Airtable credentials, reviewer notes, and internal course-match IDs are not shipped in the public payload.

## Production Registry Source

Created 2026-06-21 in Airtable Growth Hub. Current public cache updated 2026-10-20. Requirement review dates are retained per record.

- Base: `EduCare Growth Hub` (`app0SleLSUfJ1ME03`)
- Table: `CE Requirements` (`tblKG69LIBl6DIj3S`)
- Current scope: 300 verified records.

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
Destination: https://asipes60.github.io/educare-ce-requirement-finder/?v=20261020-4-verified
Open in a new tab, rel="noopener noreferrer".

The approved introduction and fallback link are published on the LearnWorlds host
page. The iframe and direct-open link use the release query above to avoid old
HTML cached by returning browsers. Entry/dependency modules use `20261020-4` in their import URLs.
Update both release versions when publishing changed scripts.

GitHub Pages serves the separate `gh-pages` branch, not `main`. Publish the static
runtime to that branch after updating main. The deployed tree includes
`public/requirements.json`, `src/course-eligibility.mjs`, the other src modules,
index.html, and assets. Keep the same registry under the existing
`api/requirements` and root `requirements.json` paths for compatibility.
Rollback: deploy the preceding static tree to `gh-pages` with a new version query.
See docs/research/live-deployment-verification-20261020.md for the browser checks.

## Responsive layout verification (October 20, 2026)

Results and loading status share the second desktop grid column; below 760px,
the form and results use one column. The embed hides its duplicate introduction,
loads eagerly, and expands to its content height. Host mobile spacing is scoped
to the Finder section. Course links have a minimum 44px target height.

Live desktop checks confirmed side-by-side results, automatic height adjustment,
and California, Ohio, and Pennsylvania recommendation behavior. A 390px mobile
render confirmed readable controls without horizontal clipping. The registry JSON
was compacted by about 83KB without changing its data; refreshes preserve this.
All 20 tests and both builds passed. PageSpeed returned HTTP 429, so no new mobile
performance score or LCP measurement is claimed.

## Consented funnel analytics

`integrations/consented-analytics-bridge.js` is installed on the LearnWorlds host
in both logged-in and logged-out head slots, inside a separate
`<script type="text/plain" data-accept-cookie="analytics">` block after existing
PostHog initialization. Do not add an unconditional copy to the standalone app.
The app sends only result status/match count and course paths to the expected host.
The host verifies iframe source and origin before capturing the allowlisted events.

The bridge forwards supported native ecommerce dataLayer events without replacing
LearnWorlds' GA4 configuration. Purchase confirmations require a transaction ID
and use a deterministic insert ID. No form text, goal drafts, item names, or
customer fields are forwarded. Standalone Finder interactions are not tracked.

Live Finder results-view and course-click receipt were verified in PostHog.
A zero-dollar learner checkout verified native view/cart/checkout/purchase receipt
and enrollment on October 20. The legacy purchase item-ID mapping was subsequently
fixed; no historical transaction was resent. Paid-card revenue and a new post-fix
purchase remain unobserved. GA4 daily report receipt is scheduled for a delayed
follow-up; these imports cannot establish transaction-level deduplication.

The host now follows LearnWorlds analytics_storage consent updates. Withdrawal
immediately blocks custom events and calls the SDK opt-out; explicit acceptance
restores collection. Queued ecommerce activity is replayed only after the latest
explicit analytics grant, so accepting cookies does not backfill earlier activity.
A controlled signed-out browser test verified rejection, acceptance, withdrawal
without a reload, and reacceptance against PostHog event receipts. This was not a
pristine new browser profile. HTTP, network, and malformed-registry failures are
covered by application startup tests; forcing an outage in the connected browser
was blocked because the isolated local test server was unreachable. The direct-open
fallback and all four course destinations loaded successfully in the browser.

The October 20 catalog check found four available NBCC courses, all represented
in matching. Coming-soon BACB courses, the HIPAA 2.0 draft, and non-CE resources
remain excluded. All 150 state/profession evidence gates remain enforced. Existing
provider pathways for CA, CT, NM, OH, VA, and WA were checked against their official
sources; no new jurisdiction or mandated-category claim was enabled. Connecticut
counselor requirements now include the previously omitted 1-hour cultural-competency
requirement in both Airtable and the cache. Only this requirement review date changed.
The cache refresh default now expects all 300 records. All 33 tests and both builds
passed for this release. Real-phone layout checks passed by owner report; a fresh
mobile laboratory measurement remains outstanding.
