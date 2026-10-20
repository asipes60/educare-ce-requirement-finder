# Mobile loading and state-source follow-up

Reviewed October 20, 2026, Pacific time. This is a targeted follow-up, not a new verification of all state requirements.

## Published loading changes

The Finder preloads its four existing ES modules using the same URLs as the import graph. The LearnWorlds Finder page has a preconnect and DNS hint for the GitHub Pages origin in both page-specific head slots. The existing analytics consent bridge and native checkout, authentication and security resources were preserved.

Implementation references: [MDN modulepreload](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/modulepreload), [web.dev connection hints](https://web.dev/articles/preconnect-and-dns-prefetch), and [LearnWorlds custom-code slots](https://support.learnworlds.com/support/solutions/articles/12000082908).

## Mobile measurements

All three PageSpeed reports used a Moto G Power emulation, Lighthouse 13.5.0, initial load, slow 4G and HeadlessChromium 153.0.8010.36. No field dataset was available. Scores and timings are lab samples, not proof of a causal improvement or regression.

| Run, Pacific | Score | FCP | LCP | TBT | CLS | Transfer |
|---|---:|---:|---:|---:|---:|---:|
| Baseline, 12:44 | 41 | 11.8 s | 23.1 s | 560 ms | 0.037 | 4,351 KiB |
| After, 14:35:15 | 39 | 11.9 s | 21.8 s | 660 ms | 0 | 4,353 KiB |
| Repeat after, 14:37:07 | 40 | 11.6 s | 23.0 s | 600 ms | 0 | 4,335 KiB |

Reports: [baseline](https://pagespeed.web.dev/analysis/https-educarecomplete-com-ce-requirement-finder/320xadiya2?form_factor=mobile), [first after](https://pagespeed.web.dev/analysis/https-educarecomplete-com-ce-requirement-finder/i2p16um0p4?form_factor=mobile), [repeat after](https://pagespeed.web.dev/analysis/https-educarecomplete-com-ce-requirement-finder/hw7fcjp7ry?form_factor=mobile).

**Result:** no demonstrated overall performance improvement. These runs measured the loading patch before the subsequent state-data release. The repeat run estimates 4,050 ms of render-blocking savings and 1,362 KiB of unused JavaScript. Platform-generated page CSS, synchronous jQuery/Migrate/WebFont resources, Stripe v3 and reCAPTCHA dominate the remaining load. The inspected page CSS transfer was about 166.7 KiB; the Stripe script about 270.6 KiB. These resources precede the page-specific custom head slots. Safely changing their scheduling requires a LearnWorlds-supported template or platform configuration; no request was sent and no interception workaround was installed.

The local browser's requested mobile viewport override did not apply: the DOM stayed 1920px wide. It was reset. The fresh interaction checks are desktop checks; Adam's earlier iPhone 17 Pro Max pass remains the physical-device interaction evidence.

## State-source disposition

Connecticut LMFT and LCSW cache records were normalized from read-back Airtable data. Both requirement review dates are October 20; the other 298 dates were preserved. The cache still contains 300 records. No new jurisdiction, course or mandatory-topic claim was enabled; all 14 existing verified combinations remain.

| Selection | Result | Official evidence |
|---|---|---|
| Connecticut LCSW | Corrected omitted renewal details; course matching stays conditional. | [DPH requirements](https://portal.ct.gov/dph/practitioner-licensing--investigations/socialworker/continuing-education-requirements) |
| Connecticut LMFT | Corrected renewal details; full eligibility now explicitly records additional approval required for home study. | [DPH requirements](https://portal.ct.gov/dph/practitioner-licensing--investigations/mft/marital-and-family-therapist-continuing-education-requirements), [current eRegulations PDF, sections 20-195c-1 and -3](https://eregulations.ct.gov/eRegsPortal/Browse/getDocument?guid=%7BF0A1E155-0200-C090-ADF7-F6B051BFC60C%7D) |
| New Mexico LCSW | NBCC recognition was corroborated. Structured asynchronous classification remains unresolved; held. | [Board FAQ](https://www.rld.nm.gov/boards-and-commissions/individual-boards-and-commissions/social-work-examiners/faqs/), [NMAC 16.63.12](https://www.srca.nm.gov/parts/title16/16.063.0012.html) |
| Arizona LMFT/LCSW | Broad professional-organization pathway documented; EduCare classification, asynchronous treatment and certificate requirements remain unresolved. Renewal/tracker full-text retrieval returned 403; held. | [AAC R4-6-802 and -803](https://apps.azsos.gov/public_services/Title_04/4-06.pdf) |
| Texas LMFT/LCSW | FAQ clarifies formal certificate courses versus informal self-study. Provider type and profession-specific limits still need verification; held. | [BHEC CE FAQ](https://bhec.texas.gov/tbhec/continuing-education-ce-faqs/) |

Existing Ohio and Washington LMFT/LCSW gates remain enabled. New Mexico and Virginia LMFT gates remain enabled. Florida and Virginia LCSW limitations were retained. The national evidence queue remains incomplete. No inquiries were sent.

## Filtered funnel read

Refreshed the existing two ordered 14-day conversion-window funnels on [PostHog dashboard 2198711](https://us.posthog.com/project/659016/dashboard/2198711), for September 20 through October 20 in America/Los_Angeles. Tracking only began October 20. Existing person/admin/known anonymous QA exclusions and test-account filtering were preserved.

The Finder funnel returned no recorded data after those exclusions. The general checkout funnel returned 2 course viewers, 1 checkout start and 0 purchases; the single observed checkout transition took 22 seconds. These are consented, partially observed visitors, and unidentified QA browsers may remain. The sample cannot establish a conversion problem, lost revenue or the effect of these loading changes.

The existing October 22 GA4 receipt follow-up remains scheduled. Aggregate GA4 imports cannot establish transaction-level deduplication, and the verified zero-dollar checkout does not validate paid-card reconciliation.

## Automated release checks

All 33 tests and both builds passed. The cache comparison confirmed that only the two Connecticut records changed, preserving all other records and their review dates. Direct lookups confirmed California LCSW still has four recommendations, Ohio LCSW three, and both Connecticut selections zero. Module preload URLs and dependency imports use the same release version. The final live browser verification is recorded in the accompanying performance report.
