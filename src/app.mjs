import {
  createRequirementLookup,
  getLicenseOptions,
  getStateOptions,
  lookupRequirement,
} from "./ce-finder.mjs?v=20261020-3";

const stateSelect = document.querySelector("#state");
const loadStatus = document.querySelector("#load-status");
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

function renderCourseMatches(courseMatches, eligibilityNotes) {
  if (!courseMatches.length) {
    return `
      <div class="empty-match">
        <strong>No conservatively matched EduCare course yet.</strong>
        <span>Course eligibility has not been established for this selection. Confirm accepted providers and course formats with your board.</span>
        <p>${eligibilityNotes ?? ""}</p>
      </div>
    `;
  }

  const cards = courseMatches
    .map(
      (course) => `
        <article class="course-card">
          <h4>${course.title}</h4>
          <p>${course.creditValue} ${course.creditUnit}</p>
          <small>${course.providerStatement}</small><p>General renewal CE. Required-category credit has not been verified.</p><p>${course.eligibilityNotes}</p><p>Course eligibility reviewed ${course.eligibilityReviewedAt}</p>${renderSources(course.eligibilitySources)}<a href="${course.url}" target="_blank" rel="noopener noreferrer">View course</a>
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
        ${renderCourseMatches(result.courseMatches, result.courseEligibilityNotes)}
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
    const response = await fetch(new URL("../public/requirements.json", import.meta.url), {
      headers: { accept: "application/json" },
    });
    if (!response.ok) throw new Error("Registry unavailable");
    const payload = await response.json();
    if (Array.isArray(payload.records)) {
      cachedLookup = createRequirementLookup(payload.records);
      renderResult(lookupCurrentRequirement());
      loadStatus.textContent = "Registry loaded. Check each result’s review date.";
    } else { throw new Error("Invalid registry"); }
  } catch {
    loadStatus.textContent = "Full registry unavailable. Only limited California results are available. Retry by reloading, or consult your board directly.";
  }
}

populateSelect(stateSelect, getStateOptions(), (state) => state.name);
populateSelect(licenseSelect, getLicenseOptions(), (license) => license.label);

stateSelect.value = "CA";
licenseSelect.value = "lpc-lpcc-lmhc";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = lookupCurrentRequirement();
  renderResult(result);
  reportInteraction({event:"ce_finder_results_viewed",status:result.status,match_count:result.courseMatches.length});
});

function reportInteraction(properties) {
  if (window.parent !== window) window.parent.postMessage({type:"educare-ce-finder:analytics",...properties},"https://educarecomplete.com");
}
resultRegion.addEventListener("click", (event) => {
  const link=event.target.closest(".course-card a");
  if (!link) return;
  const url=new URL(link.href);
  if (url.origin === "https://educarecomplete.com" && url.pathname.startsWith("/course/")) reportInteraction({event:"ce_finder_course_clicked",course_path:url.pathname});
});

renderResult(lookupRequirement("CA", "lpc-lpcc-lmhc"));
loadCachedRequirements();

// Let the host page use one page scrollbar as results change or reflow on mobile.
if (window.parent !== window) {
  const shell = document.querySelector(".shell");
  let pendingFrame = false;
  const reportHeight = () => {
    if (pendingFrame) return;
    pendingFrame = true;
    requestAnimationFrame(() => {
      pendingFrame = false;
      window.parent.postMessage({
        type: "educare-ce-finder:resize",
        height: Math.ceil(shell.getBoundingClientRect().height),
      }, "https://educarecomplete.com");
    });
  };
  new ResizeObserver(reportHeight).observe(shell);
  reportHeight();
}
