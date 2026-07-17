// Careers page logic
// Job postings: fetched via Supabase proxy (falls back to static list).
// Applications: submitted to Google Apps Script → Google Sheets + Google Drive.

// --- Google Apps Script endpoint ---
// Paste your deployed Web App URL here after deploying google-apps-script/Code.gs
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby7W3R9uInzVVhCOaz8ncODhEuyRvrFT4V33sD9vhpo_Tktc_NE4fUlft03JS62XbBIcw/exec";
// Must match CONFIG.SECRET_TOKEN in Code.gs
const APPS_SCRIPT_SECRET = "7bd779df1a694b698e8b8cd09c23923444098777c1a14e1ca67daf876f15b9d6";

// --- Supabase proxy (for job postings only) ---
const DEFAULT_SUPABASE_URL = "https://aehmnpsvaivmksypmvwm.supabase.co";
const SUPABASE_FUNCTIONS_BASE = String(
  window.__KAMAL_CHATBOT_API_BASE__ ||
    (window.__SUPABASE_URL__ || DEFAULT_SUPABASE_URL) + "/functions/v1"
).replace(/\/$/, "");
const JOB_POSTINGS_PROXY_URL = `${SUPABASE_FUNCTIONS_BASE}/api-job-postings`;
const SUPABASE_ANON_KEY =
  window.__KAMAL_CHATBOT_SUPABASE_ANON_KEY__ || window.__SUPABASE_ANON_KEY__ || "";

// --- File constraints ---
const MAX_TOTAL_UPLOAD_BYTES = 5 * 1024 * 1024;
const ACCEPTED_FILE_EXTENSIONS = {
  applicantPhotograph:  ["jpg", "jpeg", "png"],
  applicantSignature:   ["jpg", "jpeg", "png"],
  sscCertificate:       ["pdf", "jpg", "jpeg", "png"],
  hscCertificate:       ["pdf", "jpg", "jpeg", "png"],
  llbCertificate:       ["pdf", "jpg", "jpeg", "png"],
  llmCertificate:       ["pdf", "jpg", "jpeg", "png"],
  applicantResume:      ["pdf", "doc", "docx"],
  applicantCoverLetter: ["pdf", "doc", "docx"]
};
const MAX_FILE_SIZE_BY_FIELD = {
  applicantPhotograph:  1 * 1024 * 1024,
  applicantSignature:   200 * 1024,
  sscCertificate:       500 * 1024,
  hscCertificate:       500 * 1024,
  llbCertificate:       500 * 1024,
  llmCertificate:       500 * 1024,
  applicantResume:      1 * 1024 * 1024,
  applicantCoverLetter: 800 * 1024
};
const DEFAULT_JOB_OPENINGS = [
  {
    title: "Computer Typist",
    location: "Dhaka, Bangladesh",
    jobType: "Full-Time",
    description:
      "Prepare legal drafts, format case files, maintain document accuracy, and support the litigation team with fast and precise typing.",
    overview:
      "Kamal & Associates is a respected Bangladesh law firm known for disciplined legal drafting, client responsiveness, and court-ready documentation. This role is ideal for a detail-oriented typist who can support lawyers handling high-volume legal and corporate documentation.",
    responsibilities: [
      "Type pleadings, affidavits, notices, agreements, and correspondence in accurate professional English and Bangla.",
      "Format case files, petitions, and supporting schedules in line with chamber and court filing standards.",
      "Revise drafts quickly based on lawyer comments and last-minute filing instructions.",
      "Maintain digital and printed copies of legal documents with proper labeling and confidentiality."
    ],
    qualifications: [
      "Higher Secondary Certificate or equivalent; graduate candidates will be preferred.",
      "Strong typing speed in English and Bangla with proven accuracy.",
      "Practical knowledge of Microsoft Word, document formatting, and printing workflows.",
      "Prior experience in a law chamber, corporate office, or litigation support environment is an advantage."
    ],
    softSkills: [
      "High attention to detail and confidentiality.",
      "Ability to work under deadline pressure before hearings and filings.",
      "Professional communication and willingness to take structured instructions.",
      "Reliability, discipline, and strong time management."
    ],
    benefits: [
      "Competitive monthly salary based on skill and prior experience.",
      "Festival bonus and paid leave as per firm policy.",
      "Hands-on exposure to legal documentation and chamber operations.",
      "Career growth opportunity into senior administrative or litigation support roles."
    ]
  },
  {
    title: "Apprentice Lawyer",
    location: "Dhaka, Bangladesh",
    jobType: "Apprenticeship",
    description:
      "Assist senior lawyers with legal research, court preparation, client file review, and day-to-day case support while building practical experience.",
    overview:
      "Kamal & Associates offers aspiring legal professionals a rigorous learning environment rooted in practical chamber work, client management, and legal ethics. This apprenticeship is designed for candidates who want meaningful exposure to the realities of legal practice in Bangladesh.",
    responsibilities: [
      "Support senior lawyers with legal research on Bangladeshi statutes, rules, and case law.",
      "Assist in preparing briefs, chronologies, hearing notes, and case summaries.",
      "Attend chamber meetings, client conferences, and selected court-related tasks as instructed.",
      "Help organize case files, evidence bundles, and internal legal records."
    ],
    qualifications: [
      "LL.B. completed or ongoing, with strong academic standing.",
      "Basic understanding of civil, criminal, corporate, or commercial legal procedures in Bangladesh.",
      "Good drafting and research ability in English; Bangla comprehension is essential.",
      "Willingness to learn chamber discipline, client service, and court preparation."
    ],
    softSkills: [
      "Curiosity, initiative, and coachability.",
      "Strong analytical thinking and note-taking discipline.",
      "Respectful professional conduct with seniors, clients, and support staff.",
      "Ability to manage multiple assignments and meet strict deadlines."
    ],
    benefits: [
      "Structured mentorship from practicing lawyers.",
      "Monthly stipend based on qualification and engagement level.",
      "Exposure to litigation, chamber practice, and client advisory workflows.",
      "Potential pathway to long-term associate opportunities subject to performance."
    ]
  },
  {
    title: "Junior Associate",
    location: "Dhaka, Bangladesh",
    jobType: "Full-Time",
    description:
      "Work on drafting, legal analysis, client coordination, and matter support across corporate and dispute resolution assignments.",
    overview:
      "Kamal & Associates advises clients on significant legal, commercial, and dispute matters in Bangladesh. The Junior Associate role is suited to an early-career lawyer ready to take ownership of drafting, research, and client-facing support under partner and senior associate supervision.",
    responsibilities: [
      "Draft agreements, legal notices, opinions, pleadings, and internal research memoranda.",
      "Conduct legal research and case analysis across corporate, commercial, and dispute matters.",
      "Coordinate with clients, regulators, and internal team members on active files.",
      "Support hearing preparation, due diligence reviews, and transactional documentation."
    ],
    qualifications: [
      "LL.B. and LL.M. preferred from a recognized institution; Bangladesh Bar enrollment or progress toward enrollment is an advantage.",
      "0 to 2 years of relevant chamber, law firm, or in-house legal experience.",
      "Strong legal drafting, analytical writing, and document review capability.",
      "Sound command of English with working proficiency in Bangla for client and procedural contexts."
    ],
    softSkills: [
      "Commercial awareness and sound professional judgment.",
      "Clear written and verbal communication.",
      "Ability to handle confidential matters with discretion.",
      "Strong ownership mindset and willingness to work on demanding timelines."
    ],
    benefits: [
      "Competitive salary aligned with entry-level legal market standards in Dhaka.",
      "Festival bonuses, paid leave, and performance-based growth opportunities.",
      "Direct exposure to high-profile legal work and client advisory matters.",
      "Training and mentorship to support long-term professional development."
    ]
  }
];

function createJobKey(job) {
  return [job.title, job.location, job.jobType]
    .map((value) => String(value || "").trim().toLowerCase())
    .join("|");
}

function mergeJobs(staticJobs, dynamicJobs) {
  const seen = new Set(staticJobs.map(createJobKey));
  const uniqueDynamicJobs = dynamicJobs.filter((job) => {
    const key = createJobKey(job);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  return [...staticJobs, ...uniqueDynamicJobs];
}

function buildGenericJobDetails(job) {
  return {
    ...job,
    overview:
      job.overview ||
      `Kamal & Associates is seeking a capable professional for the ${job.title} role to support legal service delivery, client work, and chamber operations in Bangladesh. The position offers hands-on experience in a high-accountability law firm environment.`,
    responsibilities:
      job.responsibilities || [
        `Support the team in handling responsibilities relevant to the ${job.title} position.`,
        "Maintain professionalism, confidentiality, and accuracy in all assigned work.",
        "Coordinate with internal teams and contribute to client service delivery.",
        "Complete time-sensitive assignments in line with chamber priorities."
      ],
    qualifications:
      job.qualifications || [
        "Relevant academic background and interest in professional legal or administrative work.",
        "Ability to communicate clearly in English and Bangla as required by the role.",
        "Comfort working with documents, deadlines, and structured instructions.",
        "Prior relevant experience is preferred but not mandatory unless stated otherwise."
      ],
    softSkills:
      job.softSkills || [
        "Professional integrity and confidentiality.",
        "Strong attention to detail.",
        "Dependability and time management.",
        "Positive attitude and willingness to learn."
      ],
    benefits:
      job.benefits || [
        "Compensation package based on experience and suitability.",
        "Professional development within an active legal practice.",
        "Exposure to real client matters and internal mentoring.",
        "Paid leave and other benefits as per firm policy."
      ]
  };
}

function renderList(elementId, items) {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  element.innerHTML = (items || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
}

function populateJobModal(job) {
  const details = buildGenericJobDetails(job);
  const titleElement = document.getElementById("jobDetailTitle");
  const locationElement = document.getElementById("jobDetailLocation");
  const typeElement = document.getElementById("jobDetailType");
  const overviewElement = document.getElementById("jobDetailOverview");

  if (titleElement) {
    titleElement.textContent = details.title || "Position Title";
  }
  if (locationElement) {
    locationElement.textContent = details.location || "Location not specified";
  }
  if (typeElement) {
    typeElement.textContent = details.jobType || "Type not specified";
  }
  if (overviewElement) {
    overviewElement.textContent = details.overview || "";
  }

  renderList("jobDetailResponsibilities", details.responsibilities);
  renderList("jobDetailQualifications", details.qualifications);
  renderList("jobDetailSoftSkills", details.softSkills);
  renderList("jobDetailBenefits", details.benefits);
}

function renderJobs(jobs) {
  const jobBoard = document.getElementById("job-board");

  if (!jobBoard) {
    return;
  }

  if (!Array.isArray(jobs) || jobs.length === 0) {
    jobBoard.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info" role="alert">
          There are currently no open positions, but we are always looking for top talent.
        </div>
      </div>
    `;
    return;
  }

  jobBoard.innerHTML = "";

  jobs.forEach((job) => {
    const jobTitle = job.title || "Untitled Position";
    const location = job.location || "Location not specified";
    const jobType = job.jobType || "Type not specified";
    const description = job.description || "No description available.";

    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";
    const jobPayload = encodeURIComponent(JSON.stringify(job));

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body d-flex flex-column">
          <h3 class="h5 card-title mb-3">${escapeHtml(jobTitle)}</h3>
          <p class="mb-1"><strong>Location:</strong> ${escapeHtml(location)}</p>
          <p class="mb-3"><strong>Job Type:</strong> ${escapeHtml(jobType)}</p>
          <p class="card-text text-muted flex-grow-1">${escapeHtml(description)}</p>
          <button
            type="button"
            class="btn btn-primary btn-apply mt-3"
            data-job-title="${escapeHtml(jobTitle)}"
            data-job-location="${escapeHtml(location)}"
            data-job-type="${escapeHtml(jobType)}"
            data-job-payload="${jobPayload}"
            data-bs-toggle="modal"
            data-bs-target="#applyModal"
          >
            Apply Now
          </button>
        </div>
      </div>
    `;

    jobBoard.appendChild(col);
  });
}

async function fetchJobs() {
  const jobBoard = document.getElementById("job-board");

  if (!jobBoard) {
    return;
  }

  jobBoard.innerHTML = `
    <div class="col-12">
      <div class="alert alert-light border" role="status">Loading open positions...</div>
    </div>
  `;

  try {
    const headers = {
      "Content-Type": "application/json"
    };

    if (SUPABASE_ANON_KEY) {
      headers.apikey = SUPABASE_ANON_KEY;
      headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
    }

    const response = await fetch(JOB_POSTINGS_PROXY_URL, {
      method: "GET",
      headers
    });

    // 404 means the Edge Function is not deployed yet — show a friendly notice
    // and fall back to the static job openings so the page stays usable.
    if (response.status === 404) {
      console.warn(
        "Job postings proxy not deployed yet. Showing static openings. " +
        "Deploy supabase/functions/api-job-postings to enable live Airtable data."
      );
      renderJobsWithProxyNotice(DEFAULT_JOB_OPENINGS);
      return;
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const records = Array.isArray(data.records) ? data.records : [];
    const jobs = records.map((record) => {
      const fields = record.fields || {};

      return {
        title: fields["Job Title"] || "Untitled Position",
        location: fields["Location"] || "Location not specified",
        jobType: fields["Job Type"] || "Type not specified",
        description: fields["Description"] || "No description available.",
        overview: fields["Firm Overview"] || "",
        responsibilities: fields["Key Responsibilities"] || null,
        qualifications: fields["Qualifications & Requirements"] || null,
        softSkills: fields["Soft Skills & Competencies"] || null,
        benefits: fields["Salary & Benefits"] || null
      };
    });

    renderJobs(mergeJobs(DEFAULT_JOB_OPENINGS, jobs));
  } catch (error) {
    console.error("Failed to fetch job postings:", error);
    renderJobs(DEFAULT_JOB_OPENINGS);
  }
}

function renderJobsWithProxyNotice(jobs) {
  const jobBoard = document.getElementById("job-board");
  if (!jobBoard) return;

  // Render the static jobs first so the page looks fully functional
  renderJobs(jobs);

  // Prepend a soft admin-only notice inside the section container (not visible to regular visitors)
  // It appears only in the browser console; no UI banner that would confuse applicants.
  // If you want a visible banner during setup, uncomment the block below.
  /*
  const notice = document.createElement("div");
  notice.className = "col-12 mb-3";
  notice.innerHTML = `
    <div class="alert alert-warning small py-2" role="alert">
      <strong>Setup notice:</strong> Live job postings from Airtable are not active yet.
      Showing default positions. Deploy <code>api-job-postings</code> to enable live data.
    </div>
  `;
  jobBoard.prepend(notice);
  */
}





// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------
function getFileExtension(fileName) {
  const segments = String(fileName || "").toLowerCase().split(".");
  return segments.length > 1 ? segments.pop() : "";
}

function getFileInputLabel(fileInput) {
  if (!fileInput || !fileInput.id) return "This file";
  const label = document.querySelector(`label[for="${fileInput.id}"]`);
  return label ? label.textContent.replace("*", "").trim() : "This file";
}

function validateFileType(fileInput) {
  if (!fileInput || fileInput.type !== "file") return true;
  const files = Array.from(fileInput.files || []);
  const allowed = ACCEPTED_FILE_EXTENSIONS[fileInput.id] || [];
  if (!files.length || !allowed.length) { fileInput.setCustomValidity(""); return true; }
  const bad = files.find(f => !allowed.includes(getFileExtension(f.name)));
  if (bad) {
    fileInput.setCustomValidity(`${getFileInputLabel(fileInput)} accepts: ${allowed.map(e => e.toUpperCase()).join(", ")}.`);
    return false;
  }
  fileInput.setCustomValidity(""); return true;
}

function formatFileSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024*1024)).toFixed(0)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function validateFileSizeLimit(fileInput) {
  if (!fileInput || fileInput.type !== "file") return true;
  const files = Array.from(fileInput.files || []);
  const max = MAX_FILE_SIZE_BY_FIELD[fileInput.id];
  if (!max || !files.length) { fileInput.setCustomValidity(""); return true; }
  const big = files.find(f => f.size > max);
  if (big) { fileInput.setCustomValidity(`${getFileInputLabel(fileInput)} exceeds ${formatFileSize(max)}.`); return false; }
  fileInput.setCustomValidity(""); return true;
}

function validateTotalUploadSize(fileInputs) {
  const total = Array.from(fileInputs).reduce((acc, inp) =>
    acc + Array.from(inp.files || []).reduce((s, f) => s + f.size, 0), 0);
  if (total > MAX_TOTAL_UPLOAD_BYTES) {
    showApplicationStatus(`Total upload size is ${(total/(1024*1024)).toFixed(2)} MB. Maximum is 5 MB.`, "warning");
    return false;
  }
  return true;
}

function isLegalRole(jobTitle) {
  return /lawyer|associate/i.test(String(jobTitle || ""));
}

function applyJobBasedRequirements(jobTitle) {
  const legal = isLegalRole(jobTitle);
  document.querySelectorAll(".llb-field-group, .llm-field-group").forEach(g => {
    g.style.display = legal ? "" : "none";
  });
  ["llbInstitution", "llbResult", "llbCertificate"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.required = legal;
    el.setCustomValidity("");
    if (!legal) el.value = "";
  });
  markRequiredFields();
}

function markRequiredFields() {
  document.querySelectorAll("#jobApplicationForm .required-indicator").forEach(s => s.remove());
  document.querySelectorAll("#jobApplicationForm [required]").forEach(field => {
    if (!field.id) return;
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (!label || label.querySelector(".required-indicator")) return;
    const g = field.closest("[class*='col-']");
    if (g && g.style.display === "none") return;
    const span = document.createElement("span");
    span.className = "required-indicator text-danger ms-1";
    span.setAttribute("aria-hidden", "true");
    span.textContent = "*";
    label.appendChild(span);
  });
}

function showApplicationStatus(message, type) {
  const statusElement = document.getElementById("applicationFormStatus");
  if (!statusElement) return;

  statusElement.className = `alert alert-${type} mb-3`;
  statusElement.textContent = message;
  statusElement.classList.remove("d-none");
}

function clearApplicationStatus() {
  const statusElement = document.getElementById("applicationFormStatus");
  if (!statusElement) return;

  statusElement.className = "d-none mb-3";
  statusElement.textContent = "";
}

// ---------------------------------------------------------------------------
// Read a File object as Base64 string
// ---------------------------------------------------------------------------
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Failed to read file: " + file.name));
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
// Collect all uploaded files as { fieldId: { name, mimeType, base64 } }
// ---------------------------------------------------------------------------
async function collectFilePayloads(fileInputs) {
  const result = {};
  for (const input of Array.from(fileInputs)) {
    if (!input.files || !input.files[0]) { result[input.id] = null; continue; }
    const file = input.files[0];
    result[input.id] = {
      name:     file.name,
      mimeType: file.type || "application/octet-stream",
      base64:   await fileToBase64(file)
    };
  }
  return result;
}

// ---------------------------------------------------------------------------
// Collect all text field values from the form into a plain object
// ---------------------------------------------------------------------------
function collectFormData(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string") data[key] = value;
  });
  // Remap hidden job fields to expected keys
  data.jobTitle    = data.jobTitle    || document.getElementById("applicationJobTitle")?.value    || "";
  data.jobLocation = data.jobLocation || document.getElementById("applicationJobLocation")?.value || "";
  data.jobType     = data.jobType     || document.getElementById("applicationJobType")?.value     || "";
  return data;
}

// ---------------------------------------------------------------------------
// Submit to Google Apps Script
// ---------------------------------------------------------------------------
async function submitToGoogleSheets(formData, filePayloads) {
  const payload = { ...formData, files: filePayloads };
  const url = `${APPS_SCRIPT_URL}?token=${encodeURIComponent(APPS_SCRIPT_SECRET)}`;
  const body = JSON.stringify(payload);

  // Primary request path: expect JSON response from Apps Script.
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    return await response.json();
  } catch (primaryError) {
    // Fallback path for browser/CORS redirect quirks with Apps Script web apps.
    // This request is fire-and-forget (opaque response), but usually reaches Apps Script.
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body
    });

    return {
      status: "ok-opaque",
      message: "Submitted via fallback request."
    };
  }
}

// ---------------------------------------------------------------------------
// Application form setup (validation + submit)
// ---------------------------------------------------------------------------
function setupApplicationForm() {
  const form = document.getElementById("jobApplicationForm");
  const wrapper = document.getElementById("applicationFormWrapper");
  const successPanel = document.getElementById("applicationSuccessPanel");
  const successHeadline = document.getElementById("successPanelHeadline");
  const successApplicantName = document.getElementById("successApplicantName");
  const successApplicantPosition = document.getElementById("successApplicantPosition");
  const successEmailNotice = document.getElementById("successEmailNotice");
  const startNewApplicationBtn = document.getElementById("startNewApplicationBtn");
  const scrollBtn = document.getElementById("openApplicationFormBtn");
  const fileInputs = document.querySelectorAll('#jobApplicationForm input[type="file"]');
  const reviewBtn = document.getElementById("reviewApplicationBtn");
  const submitBtn = document.getElementById("submitApplicationBtn");
  const spinnerEl = document.getElementById("submitBtnSpinner");
  const btnText = document.getElementById("submitBtnText");
  const previewBox = document.getElementById("applicationPreviewBox");
  const previewList = document.getElementById("applicationPreviewList");

  if (!form) return;

  let reviewed = false;

  const resetReviewState = () => {
    reviewed = false;
    if (submitBtn) {
      submitBtn.classList.add("d-none");
      submitBtn.disabled = false;
    }
    if (previewBox) previewBox.classList.add("d-none");
    if (previewList) previewList.innerHTML = "";
  };

  const resetSuccessState = () => {
    if (successPanel) successPanel.classList.add("d-none");
    if (form) form.classList.remove("d-none");
  };

  const runValidation = () => {
    clearApplicationStatus();

    const badType = Array.from(fileInputs).find((i) => !validateFileType(i));
    if (badType) {
      form.classList.add("was-validated");
      showApplicationStatus(badType.validationMessage || "Unsupported file type.", "warning");
      return false;
    }

    const badSize = Array.from(fileInputs).find((i) => !validateFileSizeLimit(i));
    if (badSize) {
      form.classList.add("was-validated");
      showApplicationStatus(badSize.validationMessage || "File too large.", "warning");
      return false;
    }

    if (!validateTotalUploadSize(fileInputs)) {
      form.classList.add("was-validated");
      return false;
    }

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showApplicationStatus("Please complete all required fields before submitting.", "warning");
      return false;
    }

    return true;
  };

  applyJobBasedRequirements("");
  markRequiredFields();
  resetReviewState();

  // Same as Present Address
  const sameAddrChk     = document.getElementById("sameAsPresentAddress");
  const presentAddrEl   = document.getElementById("presentAddress");
  const permanentAddrEl = document.getElementById("permanentAddress");
  if (sameAddrChk && presentAddrEl && permanentAddrEl) {
    sameAddrChk.addEventListener("change", function () {
      if (this.checked) {
        permanentAddrEl.value    = presentAddrEl.value;
        permanentAddrEl.readOnly = true;
      } else {
        permanentAddrEl.readOnly = false;
      }
    });
    presentAddrEl.addEventListener("input", () => {
      if (sameAddrChk.checked) permanentAddrEl.value = presentAddrEl.value;
    });
  }

  if (scrollBtn && wrapper) {
    scrollBtn.addEventListener("click", () => {
      resetSuccessState();
      wrapper.classList.remove("d-none");
      wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (startNewApplicationBtn && form) {
    startNewApplicationBtn.addEventListener("click", () => {
      resetSuccessState();
      form.reset();
      form.classList.remove("was-validated");
      resetReviewState();
      clearApplicationStatus();
      applyJobBasedRequirements("");
      if (wrapper) wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  fileInputs.forEach(input => {
    input.addEventListener("change", () => {
      const typeOk = validateFileType(input);
      const sizeOk = typeOk ? validateFileSizeLimit(input) : false;
      if (!typeOk || !sizeOk) showApplicationStatus(input.validationMessage, "warning");
      else { clearApplicationStatus(); validateTotalUploadSize(fileInputs); }
      resetReviewState();
    });
  });

  form.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input", resetReviewState);
    el.addEventListener("change", resetReviewState);
  });

  if (reviewBtn) {
    reviewBtn.addEventListener("click", () => {
      if (!runValidation()) return;

      const formData   = collectFormData(form);
      const photoInput = document.getElementById("applicantPhotograph");
      const sigInput   = document.getElementById("applicantSignature");
      const photoURL   = (photoInput && photoInput.files && photoInput.files[0]) ? URL.createObjectURL(photoInput.files[0]) : null;
      const sigURL     = (sigInput   && sigInput.files   && sigInput.files[0])   ? URL.createObjectURL(sigInput.files[0])   : null;

      const attachedFileLines = Array.from(fileInputs)
        .filter(i => i.files && i.files[0])
        .map(i => `<span class="me-3"><i class="bi bi-paperclip text-muted"></i> ${escapeHtml(getFileInputLabel(i))}: <em>${escapeHtml(i.files[0].name)}</em></span>`)
        .join("");

      const mobile       = [formData.phoneNumberCountryCode, formData.phoneNumber].filter(Boolean).join(" ");
      const altPhone     = [formData.alternatePhoneCountryCode, formData.alternatePhone].filter(Boolean).join(" ");
      const emergPhone   = [formData.emergencyContactPhoneCountryCode, formData.emergencyContactPhone].filter(Boolean).join(" ");
      const reviewDate   = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

      const llbRow = formData.llbInstitution
        ? `<div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">LL.B. Institution</span><strong>${escapeHtml(formData.llbInstitution)}</strong></div>
           <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">LL.B. Result</span><strong>${escapeHtml(formData.llbResult || "\u2014")}</strong></div>` : "";
      const llmRow = formData.llmInstitution
        ? `<div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">LL.M. Institution</span><strong>${escapeHtml(formData.llmInstitution)}</strong></div>
           <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">LL.M. Result</span><strong>${escapeHtml(formData.llmResult || "\u2014")}</strong></div>` : "";
      const achievRow = formData.academicAchievements
        ? `<div class="col-12 rv-cell"><span class="rv-lbl">Academic Achievements</span><strong>${escapeHtml(formData.academicAchievements)}</strong></div>` : "";

      const previewHTML = `
        <div class="rv-header">
          <div class="d-flex justify-content-between align-items-start gap-3">
            <div>
              <div class="d-flex align-items-center gap-2 mb-2">
                <img src="images/logo.png" alt="Kamal and Associates logo" class="rv-logo" />
                <div>
                  <p class="mb-0 fw-bold rv-firm-name">Kamal &amp; Associates</p>
                  <p class="mb-0 rv-firm-slogan">Excellence in Advocacy. Integrity in Counsel.</p>
                </div>
              </div>
              <p class="mb-1 rv-subtitle">Application to</p>
              <p class="mb-2 rv-subtext">Chamber of Mohamed Kamal, Senior Advocate, Supreme Court of Bangladesh</p>
              <div class="d-flex flex-wrap gap-2">
                <span class="rv-tag rv-tag-primary">${escapeHtml(formData.jobTitle || "Position")}</span>
                <span class="rv-tag rv-tag-neutral">${escapeHtml(formData.jobType || "Full-Time")}</span>
                <span class="rv-tag rv-tag-neutral">${escapeHtml(formData.jobLocation || "Dhaka")}</span>
              </div>
            </div>
            ${photoURL
              ? `<img src="${photoURL}" alt="Applicant Photo" class="rv-photo" />`
              : `<div class="rv-photo-placeholder"><small class="rv-photo-placeholder-text">No<br>Photo</small></div>`
            }
          </div>
        </div>

        <div class="rv-body">

          <div class="mb-3">
            <p class="rv-section-title">Personal Information</p>
            <div class="row g-0">
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Full Name</span><strong>${escapeHtml(formData.fullName || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Date of Birth</span><strong>${escapeHtml(formData.dateOfBirth || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Gender</span><strong>${escapeHtml(formData.gender || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Marital Status</span><strong>${escapeHtml(formData.maritalStatus || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Nationality</span><strong>${escapeHtml(formData.nationality || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">NID / Passport</span><strong>${escapeHtml(formData.nidPassport || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Father\u2019s Name</span><strong>${escapeHtml(formData.fatherName || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Mother\u2019s Name</span><strong>${escapeHtml(formData.motherName || "\u2014")}</strong></div>
              <div class="col-12 col-md-4 rv-cell"><span class="rv-lbl">Email</span><strong>${escapeHtml(formData.emailAddress || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Mobile</span><strong>${escapeHtml(mobile || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Alternate Phone</span><strong>${escapeHtml(altPhone || "\u2014")}</strong></div>
              <div class="col-12 col-md-4 rv-cell"><span class="rv-lbl">Emergency Contact</span><strong>${escapeHtml(formData.emergencyContactName || "\u2014")}${emergPhone ? " \u2014 " + escapeHtml(emergPhone) : ""}</strong></div>
              <div class="col-md-6 rv-cell"><span class="rv-lbl">Present Address</span><strong>${escapeHtml(formData.presentAddress || "\u2014")}</strong></div>
              <div class="col-md-6 rv-cell"><span class="rv-lbl">Permanent Address</span><strong>${escapeHtml(formData.permanentAddress || "\u2014")}</strong></div>
            </div>
          </div>

          <div class="mb-3">
            <p class="rv-section-title">Professional Information</p>
            <div class="row g-0">
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Current Designation</span><strong>${escapeHtml(formData.currentDesignation || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Current Employer / Chamber</span><strong>${escapeHtml(formData.currentEmployer || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Total Experience</span><strong>${escapeHtml(formData.totalExperience || "\u2014")} yrs</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Relevant Experience</span><strong>${escapeHtml(formData.relevantExperience || "\u2014")} yrs</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Notice Period</span><strong>${escapeHtml(formData.noticePeriod || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Bar Enrollment</span><strong>${escapeHtml(formData.barEnrollment || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Expected Monthly Salary (BDT)</span><strong>${escapeHtml(formData.expectedSalary || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Preferred Practice Area</span><strong>${escapeHtml(formData.preferredPracticeArea || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Language Proficiency</span><strong>${escapeHtml(formData.languageProficiency || "\u2014")}</strong></div>
              <div class="col-6 col-md-4 rv-cell"><span class="rv-lbl">Computer Skills</span><strong>${escapeHtml(formData.computerSkills || "\u2014")}</strong></div>
              <div class="col-12 rv-cell"><span class="rv-lbl">Professional Summary</span><strong>${escapeHtml(formData.professionalSummary || "\u2014")}</strong></div>
            </div>
          </div>

          <div class="mb-3">
            <p class="rv-section-title">Academic Information</p>
            <div class="row g-0">
              ${llbRow}
              ${llmRow}
              <div class="col-6 col-md-3 rv-cell"><span class="rv-lbl">HSC / Equivalent</span><strong>${escapeHtml(formData.hscEquivalentDegree || "\u2014")}</strong></div>
              <div class="col-6 col-md-3 rv-cell"><span class="rv-lbl">HSC Institution</span><strong>${escapeHtml(formData.hscInstitution || "\u2014")}</strong></div>
              <div class="col-6 col-md-3 rv-cell"><span class="rv-lbl">HSC Year</span><strong>${escapeHtml(formData.hscPassingYear || "\u2014")}</strong></div>
              <div class="col-6 col-md-3 rv-cell"><span class="rv-lbl">HSC Result</span><strong>${escapeHtml(formData.hscResult || "\u2014")}</strong></div>
              <div class="col-6 col-md-3 rv-cell"><span class="rv-lbl">SSC / Equivalent</span><strong>${escapeHtml(formData.sscEquivalentDegree || "\u2014")}</strong></div>
              <div class="col-6 col-md-3 rv-cell"><span class="rv-lbl">SSC Institution</span><strong>${escapeHtml(formData.sscInstitution || "\u2014")}</strong></div>
              <div class="col-6 col-md-3 rv-cell"><span class="rv-lbl">SSC Year</span><strong>${escapeHtml(formData.sscPassingYear || "\u2014")}</strong></div>
              <div class="col-6 col-md-3 rv-cell"><span class="rv-lbl">SSC Result</span><strong>${escapeHtml(formData.sscResult || "\u2014")}</strong></div>
              ${achievRow}
            </div>
          </div>

          ${attachedFileLines ? `<div class="mb-4">
            <p class="rv-section-title">Attached Documents</p>
            <div class="small text-muted d-flex flex-wrap gap-2">${attachedFileLines}</div>
          </div>` : ""}

          <div class="d-flex justify-content-between align-items-end pt-3 rv-declaration">
            <div class="small text-muted rv-declaration-text">
              <p class="mb-1">I hereby declare that all information provided in this application is true, complete, and accurate to the best of my knowledge. I understand that any false or misleading information may result in disqualification or termination.</p>
              <p class="mb-0">Date: <strong>${reviewDate}</strong></p>
            </div>
            <div class="text-center">
              ${sigURL
                ? `<img src="${sigURL}" alt="Applicant Signature" class="rv-signature" />`
                : `<div class="rv-signature-line"></div>`
              }
              <p class="mt-1 mb-0 rv-signature-label">Signature of Applicant</p>
            </div>
          </div>

        </div>
      `;

      if (previewBox) {
        previewBox.innerHTML = previewHTML;
        previewBox.classList.remove("d-none");
        setTimeout(() => previewBox.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
      if (submitBtn) submitBtn.classList.remove("d-none");
      reviewed = true;
      showApplicationStatus("Review completed. Click Submit to send your application.", "info");
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!reviewed) {
      showApplicationStatus("Please click Review Application before submitting.", "warning");
      return;
    }

    if (!runValidation()) return;

    // Check endpoint is configured
    if (APPS_SCRIPT_URL.startsWith("REPLACE")) {
      showApplicationStatus(
        "The application endpoint is not configured yet. Please contact the site administrator.",
        "warning"
      );
      return;
    }

    // --- submit ---
    if (submitBtn) submitBtn.disabled = true;
    if (spinnerEl) spinnerEl.classList.remove("d-none");
    if (btnText)   btnText.textContent = "Submitting…";
    showApplicationStatus("Uploading your application, please wait…", "info");

    try {
      const formData     = collectFormData(form);
      const filePayloads = await collectFilePayloads(fileInputs);
      const result       = await submitToGoogleSheets(formData, filePayloads);

      if (result.status === "ok" || result.status === "ok-opaque") {
        const applicantName = formData.fullName || "Applicant";
        const applicantRole = formData.jobTitle || "Selected Position";
        const emailSent = result.status === "ok" ? Boolean(result.applicantEmailSent) : true;

        form.reset();
        form.classList.remove("was-validated");
        applyJobBasedRequirements(formData.jobTitle);
        resetReviewState();
        clearApplicationStatus();
        form.classList.add("d-none");

        if (successApplicantName) successApplicantName.textContent = applicantName;
        if (successApplicantPosition) successApplicantPosition.textContent = applicantRole;
        if (successHeadline) {
          successHeadline.textContent = `Dear ${applicantName}, we have formally received your application for ${applicantRole}.`;
        }
        if (successEmailNotice) {
          successEmailNotice.textContent = emailSent
            ? "A confirmation email has been sent to your inbox with your application acknowledgement."
            : "Your application is recorded. Email acknowledgement could not be confirmed at this moment.";
        }
        if (successPanel) {
          successPanel.classList.remove("d-none");
          setTimeout(() => successPanel.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
        }

        showApplicationStatus(
          result.status === "ok"
            ? "Your application has been submitted successfully. We will be in touch if you are shortlisted."
            : "Your application was sent. Please check your Google Sheet in 10-20 seconds to confirm entry.",
          "success"
        );
      } else {
        throw new Error(result.message || "Submission failed.");
      }
    } catch (err) {
      console.error("Application submission error:", err);
      showApplicationStatus(
        "Submission failed: " + (err.message || "Unknown error") + ". Please try again or email us directly.",
        "danger"
      );
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (spinnerEl) spinnerEl.classList.add("d-none");
      if (btnText)   btnText.textContent = "Submit";
    }
  });
}

// ---------------------------------------------------------------------------
// Apply Now button → populate job details panel + form hidden fields
// ---------------------------------------------------------------------------
function setupApplicationPrefill() {
  const applyModalLabel = document.getElementById("applyModalLabel");
  const applicationFormWrapper = document.getElementById("applicationFormWrapper");
  const defaultModalTitle = "Submit Your Application";
  if (!applyModalLabel) return;

  document.addEventListener("click", (event) => {
    const applyButton = event.target.closest(".btn-apply");
    if (!applyButton) return;

    const selectedJobTitle = applyButton.getAttribute("data-job-title") || "";
    const selectedLocation = applyButton.getAttribute("data-job-location") || "Dhaka, Bangladesh";
    const selectedJobType  = applyButton.getAttribute("data-job-type") || "Full-Time";
    const selectedJobPayload = applyButton.getAttribute("data-job-payload");

    if (selectedJobPayload) {
      try { populateJobModal(JSON.parse(decodeURIComponent(selectedJobPayload))); }
      catch { populateJobModal({ title: selectedJobTitle, location: selectedLocation, jobType: selectedJobType }); }
    } else {
      populateJobModal({ title: selectedJobTitle, location: selectedLocation, jobType: selectedJobType });
    }

    // Pre-fill hidden form fields
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    set("applicationJobTitle",    selectedJobTitle);
    set("applicationJobLocation", selectedLocation);
    set("applicationJobType",     selectedJobType);

    // Pre-fill visible Professional Information fields
    set("selectedPosition", selectedJobTitle);
    set("selectedLocation", selectedLocation);
    set("selectedJobType", selectedJobType);

    applyJobBasedRequirements(selectedJobTitle);
    clearApplicationStatus();

    // Keep form hidden until user explicitly clicks "Apply Now"
    if (applicationFormWrapper) {
      applicationFormWrapper.classList.add("d-none");
    }

    applyModalLabel.textContent = selectedJobTitle
      ? `${defaultModalTitle} - ${selectedJobTitle}`
      : defaultModalTitle;
  });

  document.addEventListener("hidden.bs.modal", (event) => {
    if (event.target && event.target.id !== "applyModal") return;
    applyModalLabel.textContent = defaultModalTitle;
    const form = document.getElementById("jobApplicationForm");
    if (form) { form.reset(); form.classList.remove("was-validated"); }
    const permAddrField = document.getElementById("permanentAddress");
    if (permAddrField) permAddrField.readOnly = false;
    const successPanel = document.getElementById("applicationSuccessPanel");
    if (successPanel) successPanel.classList.add("d-none");
    if (form) form.classList.remove("d-none");
    const submitBtn = document.getElementById("submitApplicationBtn");
    if (submitBtn) {
      submitBtn.classList.add("d-none");
      submitBtn.disabled = false;
    }
    const previewBox = document.getElementById("applicationPreviewBox");
    if (previewBox) previewBox.classList.add("d-none");
    const previewList = document.getElementById("applicationPreviewList");
    if (previewList) previewList.innerHTML = "";
    if (applicationFormWrapper) applicationFormWrapper.classList.add("d-none");
    applyJobBasedRequirements("");
    clearApplicationStatus();
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

document.addEventListener("DOMContentLoaded", () => {
  setupApplicationForm();
  setupApplicationPrefill();
  fetchJobs();
});
