// ============================================================
// Kamal & Associates — Consultation Eligibility & Booking Handler
// Google Apps Script Web App
//
// This is a SEPARATE Apps Script project from the job-applications one
// (Code.gs). It tracks, per email+phone: whether the free first
// consultation has been used, and stores every consultation submission.
//
// HOW TO DEPLOY:
// 1. Go to https://script.google.com and create a new project.
// 2. Replace the default Code.gs content with this entire file.
// 3. Fill in CONFIG.SPREADSHEET_ID below (see step 4).
// 4. Create a new Google Sheet, copy its ID from the URL
//    (/spreadsheets/d/SPREADSHEET_ID/edit), paste it into CONFIG below.
//    Two tabs will be created automatically on first use — you don't
//    need to create them by hand.
// 5. In the Apps Script editor, do NOT paste a real secret token into
//    CONFIG.SECRET_TOKEN in this repo file — set the real value directly
//    in the deployed script's CONFIG constant only (this file stays a
//    template with a placeholder, since it's tracked in git).
// 6. Click Deploy > New deployment > Web app.
//    - Execute as: Me
//    - Who has access: Anyone
// 7. Copy the Web App URL and set it as ELIGIBILITY_API_URL in the
//    Supabase Edge Function env:
//    supabase secrets set ELIGIBILITY_API_URL=... ELIGIBILITY_CLIENT_KEY=...
//    (the browser never talks to this URL directly — it goes through the
//    api-eligibility-check proxy function)
// ============================================================

const CONFIG = {
  // Set the REAL value only in the deployed Apps Script editor, never here.
  SECRET_TOKEN: "REPLACE_WITH_YOUR_SECRET_TOKEN_IN_THE_APPS_SCRIPT_EDITOR_ONLY",

  // Google Spreadsheet ID (from its URL: /spreadsheets/d/SPREADSHEET_ID/edit)
  SPREADSHEET_ID: "REPLACE_WITH_YOUR_SPREADSHEET_ID",

  ELIGIBILITY_SHEET: "Eligibility",
  CONSULTATIONS_SHEET: "Consultations",

  DEFAULT_FEE: 2000,

  ELIGIBILITY_HEADERS: [
    "Key", "Email", "Phone", "Free Consultation Used",
    "Confirmed Consultation Count", "First Seen", "Last Consultation"
  ],

  CONSULTATION_HEADERS: [
    "Consultation ID", "Submitted At", "Confirmed At",
    "Email", "Phone", "First Name", "Last Name",
    "Practice Area", "Urgency", "Case Description", "Additional Notes",
    "Preferred Date", "Preferred Time", "Consultation Type",
    "Documents Count", "Document Names",
    "Is Free", "Payment Status", "Payment Method"
  ]
};

// ------------------------------------------------------------
// Entry point
// ------------------------------------------------------------
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: "error", message: "doPost must be called by an HTTP request." });
    }

    const payload = JSON.parse(e.postData.contents);

    if (payload.clientKey !== CONFIG.SECRET_TOKEN) {
      return jsonResponse({ status: "error", error: "Unauthorized" });
    }

    const email = String(payload.email || "").trim().toLowerCase();
    const phone = String(payload.phone || "").trim();
    if (!email || !phone) {
      return jsonResponse({ success: false, error: "Email and phone are required." });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      switch (payload.action) {
        case "check_eligibility":
          return jsonResponse(checkEligibility(email, phone));
        case "consume_free":
          return jsonResponse(consumeFree(email, phone));
        case "save_consultation":
          return jsonResponse(saveConsultation(email, phone, payload.consultation || {}));
        case "confirm_consultation":
          return jsonResponse(confirmConsultation(email, phone, payload.consultationId, payload.paymentStatus));
        default:
          return jsonResponse({ success: false, error: "Unknown action." });
      }
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    Logger.log("Error: " + err.message);
    return jsonResponse({ success: false, error: "Server error. Please try again." });
  }
}

function doGet(e) {
  return jsonResponse({ status: "ok", message: "Eligibility endpoint is live." });
}

// ------------------------------------------------------------
// Key helper — one row per unique email+phone pair
// ------------------------------------------------------------
function makeKey(email, phone) {
  return email + "|" + phone;
}

function findEligibilityRow(sheet, key) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      return { rowIndex: i + 1, row: data[i] };
    }
  }
  return null;
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0a2342");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ------------------------------------------------------------
// Actions
// ------------------------------------------------------------
function checkEligibility(email, phone) {
  const sheet = getOrCreateSheet(CONFIG.ELIGIBILITY_SHEET, CONFIG.ELIGIBILITY_HEADERS);
  const key = makeKey(email, phone);
  const existing = findEligibilityRow(sheet, key);

  if (!existing) {
    return { hasUsedFreeConsultation: false, consultationFee: CONFIG.DEFAULT_FEE, consultationCount: 0 };
  }

  return {
    hasUsedFreeConsultation: Boolean(existing.row[3]),
    consultationFee: CONFIG.DEFAULT_FEE,
    consultationCount: Number(existing.row[4]) || 0
  };
}

function consumeFree(email, phone) {
  const sheet = getOrCreateSheet(CONFIG.ELIGIBILITY_SHEET, CONFIG.ELIGIBILITY_HEADERS);
  const key = makeKey(email, phone);
  const now = new Date();
  const existing = findEligibilityRow(sheet, key);

  if (existing && existing.row[3]) {
    return { success: true, freeGranted: false, error: "Free consultation already used for this account." };
  }

  if (existing) {
    sheet.getRange(existing.rowIndex, 4).setValue(true);   // Free Consultation Used
    sheet.getRange(existing.rowIndex, 5).setValue(1);       // Confirmed Consultation Count
    sheet.getRange(existing.rowIndex, 7).setValue(now);     // Last Consultation
  } else {
    sheet.appendRow([key, email, phone, true, 1, now, now]);
  }

  return { success: true, freeGranted: true };
}

function saveConsultation(email, phone, consultation) {
  const sheet = getOrCreateSheet(CONFIG.CONSULTATIONS_SHEET, CONFIG.CONSULTATION_HEADERS);
  const consultationId = "KC-" + Utilities.getUuid().split("-")[0].toUpperCase();

  sheet.appendRow([
    consultationId,
    consultation.submittedAt || new Date().toISOString(),
    "",
    email, phone,
    consultation.firstName || "", consultation.lastName || "",
    consultation.practiceArea || "", consultation.urgency || "",
    consultation.caseDescription || "", consultation.additionalNotes || "",
    consultation.preferredDate || "", consultation.preferredTime || "",
    consultation.consultationType || "",
    consultation.documentsCount || 0,
    (consultation.documentNames || []).join(", "),
    Boolean(consultation.isFree),
    consultation.paymentStatus || "",
    consultation.selectedPaymentMethod || ""
  ]);

  return { success: true, consultationId: consultationId };
}

function confirmConsultation(email, phone, consultationId, paymentStatus) {
  if (!consultationId) {
    return { success: false, error: "Missing consultation ID." };
  }

  const sheet = getOrCreateSheet(CONFIG.CONSULTATIONS_SHEET, CONFIG.CONSULTATION_HEADERS);
  const data = sheet.getDataRange().getValues();
  let found = false;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === consultationId) {
      sheet.getRange(i + 1, 3).setValue(new Date());              // Confirmed At
      sheet.getRange(i + 1, 18).setValue(paymentStatus || "paid"); // Payment Status
      found = true;
      break;
    }
  }

  if (!found) {
    return { success: false, error: "Consultation record not found." };
  }

  // A confirmed paid consultation counts toward the returning-client count.
  const eligSheet = getOrCreateSheet(CONFIG.ELIGIBILITY_SHEET, CONFIG.ELIGIBILITY_HEADERS);
  const key = makeKey(email, phone);
  const existing = findEligibilityRow(eligSheet, key);
  const now = new Date();

  if (existing) {
    const newCount = (Number(existing.row[4]) || 0) + 1;
    eligSheet.getRange(existing.rowIndex, 5).setValue(newCount);
    eligSheet.getRange(existing.rowIndex, 7).setValue(now);
  } else {
    eligSheet.appendRow([key, email, phone, false, 1, now, now]);
  }

  return { success: true };
}

// ------------------------------------------------------------
// JSON response helper
// ------------------------------------------------------------
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
