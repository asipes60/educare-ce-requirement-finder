# EduCare CE Requirement Finder

This is a self-contained prototype for the LearnWorlds CE Requirement Finder page.

## What It Does

- Supports all 50 states in the public selector.
- Supports the first planned license families:
  - LPC / LPCC / LMHC
  - LMFT
  - LCSW / LISW
  - Psychologist
  - BCBA / BCaBA
- Shows verified requirement summaries only when a source-reviewed record exists.
- Uses California BBS as the first verified seed:
  - LPCC / LPC / LMHC
  - LMFT
  - LCSW / LISW
- Keeps all other state-license combinations in `needs_review` status.
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
  src="https://YOUR-HOSTED-CE-FINDER-URL"
  title="EduCare CE Requirement Finder"
  style="width:100%;min-height:900px;border:0;"
  loading="lazy"
></iframe>
```

## Data Governance

This prototype uses local seed data. The production version should replace local records
with a backend endpoint that reads verified Airtable records, caches public-safe data, and
never exposes Airtable credentials in browser JavaScript.

## Production Registry Source

Created 2026-06-21 in Airtable Growth Hub.

- Base: `EduCare Growth Hub` (`app0SleLSUfJ1ME03`)
- Table: `CE Requirements` (`tblKG69LIBl6DIj3S`)
- Seed records:
  - `CA-lpc-lpcc-lmhc` (`recR8PqfoeNL6vW3z`)
  - `CA-lmft` (`reclfKlT3au5rYON6`)
  - `CA-lcsw-lisw` (`recZHTPd01qQ9kX0n`)

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
