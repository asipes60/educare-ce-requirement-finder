import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  getLicenseOptions,
  getPublicRequirements,
  getStateOptions,
  lookupRequirement,
} from "../src/ce-finder.mjs";

describe("CE requirement lookup", () => {
  it("returns the verified California LPCC benchmark with required categories and sources", () => {
    const result = lookupRequirement("CA", "lpc-lpcc-lmhc");

    assert.equal(result.status, "verified");
    assert.equal(result.stateCode, "CA");
    assert.equal(result.licenseKey, "lpc-lpcc-lmhc");
    assert.equal(result.totalHours, 36);
    assert.equal(result.renewalCycle, "Every 2 years");
    assert.match(result.board, /California Board of Behavioral Sciences/);
    assert.ok(result.lastReviewed);
    assert.ok(result.sourceUrls.some((url) => url.includes("bbs.ca.gov")));
    assert.ok(
      result.categories.some(
        (category) =>
          category.name === "Law and Ethics" &&
          category.hours === 6 &&
          category.recurrence === "Every renewal"
      )
    );
  });

  it("does not invent requirements for unverified state and license combinations", () => {
    const result = lookupRequirement("TX", "lcsw-lisw");

    assert.equal(result.status, "needs_review");
    assert.equal(result.stateCode, "TX");
    assert.equal(result.licenseKey, "lcsw-lisw");
    assert.equal(result.totalHours, null);
    assert.deepEqual(result.categories, []);
    assert.deepEqual(result.courseMatches, []);
  });

  it("exposes all 50 states for the public state selector", () => {
    const states = getStateOptions();

    assert.equal(states.length, 50);
    assert.deepEqual(states[0], { code: "AL", name: "Alabama" });
    assert.deepEqual(states.at(-1), { code: "WY", name: "Wyoming" });
  });

  it("exposes BCBA/BCBA-D and BCaBA as separate public license options", () => {
    const licenseKeys = getLicenseOptions().map((license) => license.key);

    assert.ok(licenseKeys.includes("bcba"));
    assert.ok(licenseKeys.includes("bcaba"));
    assert.ok(!licenseKeys.includes("bcba-bcaba"));
  });

  it("keeps conservative course matching from implying pending NBCC approval", () => {
    const result = lookupRequirement("CA", "lpc-lpcc-lmhc");

    assert.equal(result.courseMatches.length, 0);
    assert.doesNotMatch(JSON.stringify(result), /NBCC approved/i);
  });

  it("exports only public-safe verified and placeholder data", () => {
    const publicRequirements = getPublicRequirements();

    assert.ok(publicRequirements.length >= 250);
    assert.ok(
      publicRequirements.every((record) =>
        ["verified", "needs_review"].includes(record.status)
      )
    );
    assert.ok(
      publicRequirements.every(
        (record) =>
          !Object.hasOwn(record, "internalNotes") &&
          !Object.hasOwn(record, "reviewerEmail")
      )
    );
  });
});
