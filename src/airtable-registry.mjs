import { licenseFamilies, states } from "./data.mjs";

export const AIRTABLE_FIELDS = {
  recordKey: "fldKjbQXLHSWYhSKQ",
  state: "fldJ9nqBIqOnBPI9n",
  stateCode: "fldxQKAXTObQBwnwV",
  licenseFamily: "fldfh8pX7tDb2eWU5",
  board: "fldVGrMdoob2kazkK",
  renewalCycle: "fldWoLMfWM69r8ax3",
  totalHours: "fldypy1p2okplBTOS",
  unitLabel: "fldLu2j7GD1vA6sGh",
  requiredCategories: "fldXI0e97PXmESfsP",
  sourceUrls: "fldOp5WCrJaXkJC7d",
  lastReviewed: "fldmBIGYhHoist64g",
  verificationStatus: "fldP8UuJoSpUPCVkn",
};

function fieldName(value) {
  return typeof value === "object" && value !== null && "name" in value
    ? value.name
    : value;
}

function getFields(record) {
  return record.fields ?? record.cellValuesByFieldId ?? {};
}

function splitRequirementKey(recordKey, fallbackStateCode, fallbackLicenseKey) {
  const match = String(recordKey ?? "").match(/^([A-Z]{2})-(.+)$/);
  return {
    stateCode: match?.[1] ?? String(fallbackStateCode ?? "").toUpperCase(),
    licenseKey: match?.[2] ?? normalizeLicenseKey(fallbackLicenseKey),
  };
}

function normalizeLicenseKey(value) {
  const normalized = String(fieldName(value) ?? "")
    .trim()
    .toLowerCase()
    .replaceAll(" / ", "/")
    .replaceAll(" ", "");

  if (normalized.includes("bcaba")) return "bcaba";
  if (normalized.includes("bcba")) return "bcba";
  if (normalized.includes("lmft")) return "lmft";
  if (normalized.includes("lcsw") || normalized.includes("lisw")) return "lcsw-lisw";
  if (normalized.includes("psychologist")) return "psychologist";
  if (normalized.includes("lpc") || normalized.includes("lpcc") || normalized.includes("lmhc")) {
    return "lpc-lpcc-lmhc";
  }
  return normalized;
}

function splitLines(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseSourceUrls(value) {
  const text = String(value ?? "").trim();
  if (!text) return [];

  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((url) => String(url).trim()).filter(Boolean);
      }
    } catch {
      // Fall back to line parsing when Airtable stores malformed pasted JSON.
    }
  }

  return splitLines(text)
    .map((line) => line.replace(/^["'\[]+|[",'\]]+$/g, "").trim())
    .filter((line) => /^https?:\/\//i.test(line));
}

function buildCategories(summaryLines) {
  return summaryLines.map((summary) => ({ summary }));
}

export function normalizeAirtableRequirementRecord(record) {
  const fields = getFields(record);
  const status = fieldName(fields[AIRTABLE_FIELDS.verificationStatus]);
  if (status !== "Verified") return null;

  const recordKey = fields[AIRTABLE_FIELDS.recordKey];
  const { stateCode, licenseKey } = splitRequirementKey(
    recordKey,
    fields[AIRTABLE_FIELDS.stateCode],
    fields[AIRTABLE_FIELDS.licenseFamily]
  );
  const state = states.find((item) => item.code === stateCode);
  const license = licenseFamilies.find((item) => item.key === licenseKey);
  const requirementSummary = splitLines(fields[AIRTABLE_FIELDS.requiredCategories]);

  return {
    id: String(recordKey),
    status: "verified",
    stateCode,
    stateName: String(fieldName(fields[AIRTABLE_FIELDS.state]) ?? state?.name ?? stateCode),
    licenseKey,
    licenseLabel: license?.label ?? String(fieldName(fields[AIRTABLE_FIELDS.licenseFamily]) ?? licenseKey),
    board: String(fields[AIRTABLE_FIELDS.board] ?? ""),
    renewalCycle: String(fields[AIRTABLE_FIELDS.renewalCycle] ?? ""),
    totalHours: fields[AIRTABLE_FIELDS.totalHours] ?? null,
    unitLabel: String(fieldName(fields[AIRTABLE_FIELDS.unitLabel]) ?? ""),
    requirementSummary,
    categories: buildCategories(requirementSummary),
    sourceUrls: parseSourceUrls(fields[AIRTABLE_FIELDS.sourceUrls]),
    lastReviewed: fields[AIRTABLE_FIELDS.lastReviewed] ?? null,
    courseMatches: [],
  };
}

export function buildRegistryCache(records, generatedAt = new Date().toISOString()) {
  return {
    generatedAt,
    records: records
      .map(normalizeAirtableRequirementRecord)
      .filter(Boolean)
      .sort((a, b) => a.id.localeCompare(b.id)),
  };
}
