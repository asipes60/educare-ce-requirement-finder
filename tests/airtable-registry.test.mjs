import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildRegistryCache,
  normalizeAirtableRequirementRecord,
  parseSourceUrls,
} from "../src/airtable-registry.mjs";

const okPsychologistRecord = {
  id: "rec6j1TL6rQxuXN2R",
  fields: {
    fldKjbQXLHSWYhSKQ: "OK-psychologist",
    fldJ9nqBIqOnBPI9n: { name: "Oklahoma" },
    fldxQKAXTObQBwnwV: "OK",
    fldfh8pX7tDb2eWU5: { name: "psychologist" },
    fldVGrMdoob2kazkK: "Oklahoma State Board of Examiners of Psychologists",
    fldWoLMfWM69r8ax3: "Annual",
    fldypy1p2okplBTOS: 20,
    fldLu2j7GD1vA6sGh: { name: "CPE hours" },
    fldXI0e97PXmESfsP:
      "20 CPE credits annually.\nBoard rules specify at least 3 of the 20 credits for HSP-certified licensees in ethics.",
    fldOp5WCrJaXkJC7d:
      "https://oklahoma.gov/psychology/licensees/continuing-education.html\nhttps://oklahoma.gov/psychology/about-the-board/laws-rules.html",
    fldmBIGYhHoist64g: "2026-06-22",
    fldP8UuJoSpUPCVkn: { name: "Verified" },
    fldtPAa28KNKY4RVU: "internal-course-id",
    fldkjKlvK84JpjqEA: "Internal reviewer notes should not ship.",
  },
};

describe("Airtable registry cache", () => {
  it("maps verified Airtable records to public-safe requirement records", () => {
    const result = normalizeAirtableRequirementRecord(okPsychologistRecord);

    assert.equal(result.id, "OK-psychologist");
    assert.equal(result.status, "verified");
    assert.equal(result.stateCode, "OK");
    assert.equal(result.stateName, "Oklahoma");
    assert.equal(result.licenseKey, "psychologist");
    assert.equal(result.licenseLabel, "Psychologist");
    assert.equal(result.totalHours, 20);
    assert.equal(result.unitLabel, "CPE hours");
    assert.equal(result.requirementSummary.length, 2);
    assert.ok(result.sourceUrls[0].includes("continuing-education"));
    assert.ok(!Object.hasOwn(result, "reviewerNotes"));
    assert.ok(!Object.hasOwn(result, "courseMatchIds"));
  });

  it("maps BCBA and BCaBA Airtable records to separate credential keys and totals", () => {
    const bcba = normalizeAirtableRequirementRecord({
      id: "recBcba",
      fields: {
        ...okPsychologistRecord.fields,
        fldKjbQXLHSWYhSKQ: "CA-bcba",
        fldJ9nqBIqOnBPI9n: { name: "California" },
        fldxQKAXTObQBwnwV: "CA",
        fldfh8pX7tDb2eWU5: { name: "BCBA / BCBA-D" },
        fldVGrMdoob2kazkK: "Behavior Analyst Certification Board",
        fldypy1p2okplBTOS: 32,
        fldLu2j7GD1vA6sGh: { name: "CEUs" },
      },
    });
    const bcaba = normalizeAirtableRequirementRecord({
      id: "recBcaba",
      fields: {
        ...okPsychologistRecord.fields,
        fldKjbQXLHSWYhSKQ: "CA-bcaba",
        fldJ9nqBIqOnBPI9n: { name: "California" },
        fldxQKAXTObQBwnwV: "CA",
        fldfh8pX7tDb2eWU5: { name: "BCaBA" },
        fldVGrMdoob2kazkK: "Behavior Analyst Certification Board",
        fldypy1p2okplBTOS: 20,
        fldLu2j7GD1vA6sGh: { name: "CEUs" },
      },
    });

    assert.equal(bcba.licenseKey, "bcba");
    assert.equal(bcba.licenseLabel, "BCBA / BCBA-D");
    assert.equal(bcba.totalHours, 32);
    assert.equal(bcaba.licenseKey, "bcaba");
    assert.equal(bcaba.licenseLabel, "BCaBA");
    assert.equal(bcaba.totalHours, 20);
  });

  it("does not expose records that are not verified", () => {
    const result = normalizeAirtableRequirementRecord({
      ...okPsychologistRecord,
      fields: {
        ...okPsychologistRecord.fields,
        fldP8UuJoSpUPCVkn: { name: "Needs review" },
      },
    });

    assert.equal(result, null);
  });

  it("parses newline and JSON-array source URL fields", () => {
    assert.deepEqual(parseSourceUrls("https://a.example\nhttps://b.example"), [
      "https://a.example",
      "https://b.example",
    ]);
    assert.deepEqual(parseSourceUrls('["https://a.example","https://b.example"]'), [
      "https://a.example",
      "https://b.example",
    ]);
  });

  it("builds a sorted cache payload from verified records only", () => {
    const cache = buildRegistryCache(
      [
        {
          ...okPsychologistRecord,
          fields: {
            ...okPsychologistRecord.fields,
            fldKjbQXLHSWYhSKQ: "WY-lmft",
            fldxQKAXTObQBwnwV: "WY",
          },
        },
        okPsychologistRecord,
      ],
      "2026-06-22T00:00:00.000Z"
    );

    assert.equal(cache.generatedAt, "2026-06-22T00:00:00.000Z");
    assert.deepEqual(cache.records.map((record) => record.id), [
      "OK-psychologist",
      "WY-lmft",
    ]);
  });
});
