import {
  createRequirementLookup,
  getLicenseOptions,
  getStateOptions,
  lookupRequirement,
} from "./ce-finder.mjs";

const stateSelect = document.querySelector("#state");
const licenseSelect = document.querySelector("#license");
const form = document.querySelector("#lookup-form");
const resultRegion = document.querySelector("#result");
let cachedLookup = null;

function populateSelect(select, options, getLabel) {
  for (const option of options) {
    const element = document.createElement("option");
    element.value = option.code ?? option.key;
    element.textContent = getLabel(option);
    select.append(element);
  }
}

function renderCategoryList(categories) {
  if (!categories.length) {
    return "";
  }

  const items = categories
    .map((category) => {
      if (category.summary) {
        return `<li><span>${category.summary}</span></li>`;
      }

      return `
        <li>
          <strong>${category.name}</strong>
          <span>${category.hours} hours, ${category.recurrence.toLowerCase()}</span>
          <small>${category.notes}</small>
        </li>
      `;
    })
    .join("");

  return `<ul class="category-list">${items}</ul>`;
}

function renderSources(sourceUrls) {
  if (!sourceUrls.length) {
    return "";
  }

  const links = sourceUrls
    .map((url, index) => `<a href="${url}" target="_blank" rel="noreferrer">Source ${index + 1}</a>`)
    .join("");

  return `<div class="source-list">${links}</div>`;
}

function renderCourseMatches(courseMatches) {
  if (!courseMatches.length) {
    return `
      <div class="empty-match">
        <strong>No conservatively matched EduCare course yet.</strong>
        <span>EduCare can add courses here only when the approval and topic fit are supportable.</span>
      </div>
    `;
  }

  const cards = courseMatches
    .map(
      (course) => `
        <article class="course-card">
          <h4>${course.title}</h4>
          <p>${course.creditValue} ${course.creditUnit}</p>
          <small>${course.providerStatement}</small>
        </article>
      `
    )
    .join("");

  return `<div class="course-grid">${cards}</div>`;
}

function renderVerified(result) {
  return `
    <article class="result-card verified">
      <div class="status-row">
        <span class="status-pill">Verified</span>
        <span>Last reviewed ${result.lastReviewed}</span>
      </div>
      <h2>${result.stateName} ${result.licenseLabel}</h2>
      <p class="result-summary">
        <strong>${result.totalHours} ${result.unitLabel}</strong>
        <span>${result.renewalCycle}</span>
      </p>
      <section>
        <h3>Required categories</h3>
        ${renderCategoryList(result.categories)}
      </section>
      <section>
        <h3>EduCare course matches</h3>
        ${renderCourseMatches(result.courseMatches)}
      </section>
      <footer>
        <p>${result.board}</p>
        ${renderSources(result.sourceUrls)}
      </footer>
    </article>
  `;
}

function renderNeedsReview(result) {
  return `
    <article class="result-card needs-review">
      <div class="status-row">
        <span class="status-pill">Needs review</span>
        <span>Registry placeholder</span>
      </div>
      <h2>${result.stateName} ${result.licenseLabel}</h2>
      <p>${result.message}</p>
      <p class="muted">
        This tool will not display CE totals until the licensing board source has been reviewed and dated.
      </p>
    </article>
  `;
}

function renderResult(result) {
  resultRegion.innerHTML =
    result.status === "verified" ? renderVerified(result) : renderNeedsReview(result);
}

function lookupCurrentRequirement() {
  const lookup = cachedLookup?.lookupRequirement ?? lookupRequirement;
  return lookup(stateSelect.value, licenseSelect.value);
}

async function loadCachedRequirements() {
  try {
    const response = await fetch(new URL("./api/requirements", window.location.href), {
      headers: { accept: "application/json" },
    });
    if (!response.ok) return;
    const payload = await response.json();
    if (Array.isArray(payload.records)) {
      cachedLookup = createRequirementLookup(payload.records);
      renderResult(lookupCurrentRequirement());
    }
  } catch {
    // The local static fallback still works for development without the cache.
  }
}

populateSelect(stateSelect, getStateOptions(), (state) => state.name);
populateSelect(licenseSelect, getLicenseOptions(), (license) => license.label);

stateSelect.value = "CA";
licenseSelect.value = "lpc-lpcc-lmhc";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderResult(lookupCurrentRequirement());
});

renderResult(lookupRequirement("CA", "lpc-lpcc-lmhc"));
loadCachedRequirements();
