export const states = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export const licenseFamilies = [
  {
    key: "lpc-lpcc-lmhc",
    label: "LPC / LPCC / LMHC",
    publicLabel: "Counselor",
  },
  {
    key: "lmft",
    label: "LMFT",
    publicLabel: "Marriage and Family Therapist",
  },
  {
    key: "lcsw-lisw",
    label: "LCSW / LISW",
    publicLabel: "Clinical Social Worker",
  },
  {
    key: "psychologist",
    label: "Psychologist",
    publicLabel: "Psychologist",
  },
  {
    key: "bcba",
    label: "BCBA / BCBA-D",
    publicLabel: "Behavior Analyst",
  },
  {
    key: "bcaba",
    label: "BCaBA",
    publicLabel: "Assistant Behavior Analyst",
  },
];

const californiaBbsCategories = [
  {
    name: "Law and Ethics",
    hours: 6,
    recurrence: "Every renewal",
    countsTowardTotal: true,
    notes: "Must be completed during each renewal period.",
  },
  {
    name: "Suicide Risk Assessment and Intervention",
    hours: 6,
    recurrence: "One time",
    countsTowardTotal: true,
    notes:
      "Required for licensees who renew or reactivate after January 1, 2021, unless previously satisfied.",
  },
  {
    name: "Telehealth",
    hours: 3,
    recurrence: "One time",
    countsTowardTotal: true,
    notes:
      "Required for licensees who renew or reactivate after July 1, 2023, unless previously satisfied.",
  },
  {
    name: "HIV/AIDS",
    hours: 7,
    recurrence: "First renewal only",
    countsTowardTotal: true,
    notes:
      "Required for LMFT, LCSW, and LPCC licensees at first renewal when not previously satisfied.",
  },
];

const californiaBbsBase = {
  status: "verified",
  stateCode: "CA",
  board: "California Board of Behavioral Sciences",
  renewalCycle: "Every 2 years",
  totalHours: 36,
  unitLabel: "CE hours",
  categories: californiaBbsCategories,
  sourceUrls: [
    "https://www.bbs.ca.gov/licensees/cont_ed.html",
    "https://www.bbs.ca.gov/pdf/forms/cechart.pdf",
  ],
  lastReviewed: "2026-06-14",
  reviewerNotes:
    "Seed record verified from California BBS continuing education page and CE summary chart. Keep BBS source links live for periodic review.",
  courseMatchIds: [],
};

export const verifiedRequirements = [
  {
    ...californiaBbsBase,
    id: "CA-lpc-lpcc-lmhc",
    licenseKey: "lpc-lpcc-lmhc",
    licenseLabel: "LPCC / LPC / LMHC",
  },
  {
    ...californiaBbsBase,
    id: "CA-lmft",
    licenseKey: "lmft",
    licenseLabel: "LMFT",
  },
  {
    ...californiaBbsBase,
    id: "CA-lcsw-lisw",
    licenseKey: "lcsw-lisw",
    licenseLabel: "LCSW / LISW",
  },
];

export const educareCourses = [
  {
    id: "nbcc-hipaa-ferpa-school-based",
    title: "Navigating HIPAA and FERPA for School-Based Support Providers",
    track: "NBCC",
    status: "In Production",
    creditValue: 3,
    creditUnit: "clock hours",
    approvalStatus: "pending",
  },
  {
    id: "nbcc-suicide-self-harm-school-settings",
    title: "Suicidal Ideation and Self-Harm in School Settings",
    track: "NBCC",
    status: "In Production",
    creditValue: 3,
    creditUnit: "clock hours",
    approvalStatus: "pending",
  },
  {
    id: "bacb-ethical-decision-making-school-bcbas",
    title: "Ethical Decision Making for School-Based BCBAs",
    track: "BACB",
    status: "Content Complete",
    creditValue: 3,
    creditUnit: "CEUs",
    approvalStatus: "approved",
    providerStatement: "EduCare LLC is an approved BACB ACE provider: OP-26-12340.",
  },
];
