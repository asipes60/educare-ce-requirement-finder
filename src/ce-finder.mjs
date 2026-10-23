import { courseEligibility } from "./course-eligibility.mjs?v=20261023-1";
import {
  educareCourses,
  licenseFamilies,
  states,
  verifiedRequirements,
} from "./data.mjs?v=20261023-1";

const stateCodes = new Set(states.map((state) => state.code));
const licenseKeys = new Set(licenseFamilies.map((license) => license.key));
function buildVerifiedIndex(requirements) {
  return new Map(requirements.map((requirement) => [
    buildRequirementKey(requirement.stateCode, requirement.licenseKey),
    requirement,
  ]));
}

const verifiedByKey = buildVerifiedIndex(verifiedRequirements);

function buildRequirementKey(stateCode, licenseKey) {
  return `${String(stateCode).toUpperCase()}::${String(licenseKey).toLowerCase()}`;
}

function clonePublicRequirement(requirement) {
  // Explicit public fields prevent future private audit fields entering the response.
  const { id, status, stateCode, stateName, licenseKey, licenseLabel, board,
    renewalCycle, totalHours, unitLabel, lastReviewed } = requirement;
  return {
    id, status, stateCode, stateName, licenseKey, licenseLabel, board,
    renewalCycle, totalHours, unitLabel, lastReviewed,
    ...(requirement.requirementSummary ? { requirementSummary: [...requirement.requirementSummary] } : {}),
    categories: requirement.categories.map(({ summary, name, hours, recurrence, countsTowardTotal, notes }) =>
      summary ? { summary } : { name, hours, recurrence, countsTowardTotal, notes }),
    courseMatches: buildCourseMatches(requirement),
    sourceUrls: [...requirement.sourceUrls],
  };
}

function buildCourseMatches(requirement) {
  if (requirement.status !== "verified") return [];
  const eligibility = courseEligibility.find(row => row.stateCode === requirement.stateCode && row.licenseKey === requirement.licenseKey);
  if (eligibility?.status !== "verified" || !eligibility.reviewedAt || !eligibility.sources.length) return [];
  return educareCourses
    .filter(course => course.approvalStatus === "approved" && course.status === "available"
      && eligibility.courseIds.includes(course.id))
    .map(({ id, title, creditValue, creditUnit, providerStatement, url, matchType, categoryCredit }) => ({
      id, title, creditValue, creditUnit, providerStatement, url, matchType, categoryCredit,
      learnerConditions: [...eligibility.learnerConditions],
      eligibilitySources: [...eligibility.sources],
      eligibilityReviewedAt: eligibility.reviewedAt,
    }));
}

function buildPlaceholderRequirement(stateCode, licenseKey) {
  const state = states.find((item) => item.code === stateCode);
  const license = licenseFamilies.find((item) => item.key === licenseKey);

  return {
    id: `${stateCode}-${licenseKey}`,
    status: "needs_review",
    stateCode,
    stateName: state?.name ?? stateCode,
    licenseKey,
    licenseLabel: license?.label ?? licenseKey,
    board: null,
    renewalCycle: null,
    totalHours: null,
    unitLabel: null,
    categories: [],
    sourceUrls: [],
    lastReviewed: null,
    courseMatches: [],
    message:
      "Requirements for this selection are not available. Consult your licensing board or certification body.",
  };
}

export function getStateOptions() {
  return states.map((state) => ({ ...state }));
}

export function getLicenseOptions() {
  return licenseFamilies.map((license) => ({ ...license }));
}

export function lookupRequirement(stateCode, licenseKey) {
  return lookupRequirementFromIndex(verifiedByKey, stateCode, licenseKey);
}

function lookupRequirementFromIndex(index, stateCode, licenseKey) {
  const normalizedStateCode = String(stateCode).toUpperCase();
  const normalizedLicenseKey = String(licenseKey).toLowerCase();

  if (!stateCodes.has(normalizedStateCode)) {
    throw new Error(`Unsupported state code: ${stateCode}`);
  }

  if (!licenseKeys.has(normalizedLicenseKey)) {
    throw new Error(`Unsupported license key: ${licenseKey}`);
  }

  const verifiedRequirement = index.get(
    buildRequirementKey(normalizedStateCode, normalizedLicenseKey)
  );

  if (verifiedRequirement) {
    const publicRequirement = clonePublicRequirement(verifiedRequirement);
    const state = states.find((item) => item.code === normalizedStateCode);
    return {
      ...publicRequirement,
      stateName: state.name,
    };
  }

  return buildPlaceholderRequirement(normalizedStateCode, normalizedLicenseKey);
}

export function getPublicRequirements() {
  return states.flatMap((state) =>
    licenseFamilies.map((license) =>
      lookupRequirement(state.code, license.key)
    )
  );
}

export function createRequirementLookup(requirements) {
  const index = buildVerifiedIndex(requirements);

  return {
    lookupRequirement(stateCode, licenseKey) {
      return lookupRequirementFromIndex(index, stateCode, licenseKey);
    },
  };
}
