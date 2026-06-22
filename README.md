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
