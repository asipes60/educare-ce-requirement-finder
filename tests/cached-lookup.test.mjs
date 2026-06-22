import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { createRequirementLookup } from "../src/ce-finder.mjs";

describe("cached requirement lookup", () => {
  it("looks up verified records from a cached Airtable registry payload", () => {
    const service = createRequirementLookup([
      {
        id: "OK-psychologist",
        status: "verified",
        stateCode: "OK",
        stateName: "Oklahoma",
        licenseKey: "psychologist",
        licenseLabel: "Psychologist",
        board: "Oklahoma State Board of Examiners of Psychologists",
        renewalCycle: "Annual",
        totalHours: 20,
        unitLabel: "CPE hours",
        requirementSummary: ["20 CPE credits annually."],
        categories: [{ summary: "20 CPE credits annually." }],
        sourceUrls: ["https://oklahoma.gov/psychology/licensees/continuing-education.html"],
        lastReviewed: "2026-06-22",
        courseMatches: [],
      },
    ]);

    const result = service.lookupRequirement("OK", "psychologist");

    assert.equal(result.status, "verified");
    assert.equal(result.stateName, "Oklahoma");
    assert.equal(result.totalHours, 20);
    assert.deepEqual(result.requirementSummary, ["20 CPE credits annually."]);
  });
});
