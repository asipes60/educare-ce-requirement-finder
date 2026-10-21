import { courseEligibility } from "./course-eligibility.mjs?v=20261021-1";
import {
  educareCourses,
  licenseFamilies,
  states,
  verifiedRequirements,
} from "./data.mjs?v=20261021-1";

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
  const {
    reviewerNotes,
    courseMatchIds,
    ...publicRequirement
  } = requirement;

  return {
    ...publicRequirement,
    categories: requirement.categories.map((category) => ({ ...category })),
    courseMatches: buildCourseMatches(requirement),
    courseEligibilityStatus: courseEligibility.find(row => row.stateCode === requirement.stateCode && row.licenseKey === requirement.licenseKey)?.status ?? "unresolved",
    courseEligibilityNotes: courseEligibility.find(row => row.stateCode === requirement.stateCode && row.licenseKey === requirement.licenseKey)?.notes ?? "Course eligibility has not been verified for this credential.",
    sourceUrls: [...requirement.sourceUrls],
  };
}

function buildCourseMatches(requirement) {
  if (requirement.status !== "verified") return [];
  const eligibility = courseEligibility.find(row => row.stateCode === requirement.stateCode && row.licenseKey === requirement.licenseKey);
  if (eligibility?.status !== "verified") return [];
  return educareCourses
    .filter(course => course.approvalStatus === "approved" && course.status === "available"
      && eligibility.courseIds.includes(course.id))
    .map(({ eligibleStates, eligibleLicenses, approvalStatus, status, ...course }) => ({...course, eligibilitySources: [...eligibility.sources], eligibilityNotes: eligibility.notes, eligibilityReviewedAt: eligibility.reviewedAt}));
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
      "This state and license combination is in the registry queue but has not been verified yet.",
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
