import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { createRequirementLookup, getLicenseOptions, getStateOptions, lookupRequirement } from "../src/ce-finder.mjs";
import { courseEligibility } from "../src/course-eligibility.mjs";
import { educareCourses } from "../src/data.mjs";

const cache = JSON.parse(readFileSync(new URL("../public/requirements.json", import.meta.url), "utf8"));
const internalFields = /"(?:reviewerNotes|internalNotes|reviewerEmail|courseMatchIds|courseEligibilityStatus|courseEligibilityNotes|eligibilityNotes|availabilityNote|providerAcceptance|basis)"/;

async function startApp() {
  const controls = new Map();
  for (const key of ["#state", "#license", "#load-status", "#lookup-form", "#result"]) {
    controls.set(key, { value: "", textContent: "", innerHTML: "", append() {}, listeners: {},
      addEventListener(name, handler) { this.listeners[name] = handler; } });
  }
  const window = {}; window.parent = window;
  const source = readFileSync(new URL("../src/app.mjs", import.meta.url), "utf8")
    .replace(/^import\s*\{[\s\S]*?\}\s*from\s*"[^"]+";\s*/, "")
    .replaceAll("import.meta.url", JSON.stringify(new URL("../src/app.mjs", import.meta.url).href));
  vm.runInNewContext(source, {
    document: { querySelector: key => controls.get(key), createElement: () => ({}) },
    window, URL, createRequirementLookup, getLicenseOptions, getStateOptions, lookupRequirement,
    fetch: async () => ({ ok: true, json: async () => cache }),
  });
  await new Promise(resolve => setImmediate(resolve));
  return (state, license) => {
    controls.get("#state").value = state;
    controls.get("#license").value = license;
    controls.get("#lookup-form").listeners.submit({ preventDefault() {} });
    return controls.get("#result").innerHTML;
  };
}

test("all 300 public results exclude internal audit and remediation fields", () => {
  const lookup = createRequirementLookup(cache.records).lookupRequirement;
  assert.equal(cache.records.length, 300);
  for (const record of cache.records) {
    assert.doesNotMatch(JSON.stringify(lookup(record.stateCode, record.licenseKey)), internalFields,
      record.stateCode + ":" + record.licenseKey);
  }
  const poisoned = { ...cache.records[0], internalNotes: "PRIVATE_SENTINEL", reviewerEmail: "PRIVATE_SENTINEL",
    courseEligibilityNotes: "PRIVATE_SENTINEL", providerAcceptance: { basis: "PRIVATE_SENTINEL" } };
  assert.doesNotMatch(JSON.stringify(createRequirementLookup([poisoned]).lookupRequirement(poisoned.stateCode, poisoned.licenseKey)), /PRIVATE_SENTINEL/);
});

test("the browser matching catalog contains only verified pairs and published courses", () => {
  assert.ok(courseEligibility.length > 0);
  assert.ok(courseEligibility.every(row => row.status === "verified"));
  assert.ok(educareCourses.every(course => course.status === "available" && course.approvalStatus === "approved"));
  assert.doesNotMatch(JSON.stringify({ courseEligibility, educareCourses }), internalFields);
  assert.ok(educareCourses.every(course => course.id !== "nbcc-counseling-theories"));
});

test("no course section or internal approval explanation appears for unmatched selections", async () => {
  const render = await startApp();
  for (const [state, license] of [["AZ", "lpc-lpcc-lmhc"], ["AZ", "lmft"], ["AZ", "lcsw-lisw"],
    ["CT", "lmft"], ["NM", "lcsw-lisw"], ["NY", "lpc-lpcc-lmhc"], ["CA", "psychologist"], ["CA", "bcba"]]) {
    const html = render(state, license);
    assert.doesNotMatch(html, /EduCare course matches|course-card|certificate lacks|pending|not yet verified|not been established|provider pathway/i, state + ":" + license);
    assert.match(html, /Required categories/);
  }
});

test("verified course cards retain learner restrictions without audit commentary", async () => {
  const render = await startApp();
  assert.equal((render("CA", "lpc-lpcc-lmhc").match(/class="course-card"/g) || []).length, 3);
  for (const [license, hours] of [["lpc-lpcc-lmhc", 12], ["lmft", 15], ["lcsw-lisw", 15]]) {
    const html = render("TX", license);
    assert.match(html, new RegExp("at most " + hours + " hours", "i"));
    assert.match(html, /combined with all other providers/i);
    assert.match(html, /not an online.course cap/i);
    assert.match(html, /CE Broker/);
    assert.match(html, /General renewal CE/i);
    assert.doesNotMatch(html, /not been verified|No mandated-category claims|provider pathway|pending|certificate lacks/i);
  }
  assert.match(render("VA", "lmft"), /signed home-study completion affidavit/i);
  assert.match(render("WA", "lmft"), /comprehension/i);
});
