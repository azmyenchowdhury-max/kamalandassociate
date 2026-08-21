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
  SPREADSHEET_ID: "1uI5LLTqdP3NkILCmCKE29aOnvYnE3isl-qCgMxqlJjk",

  ELIGIBILITY_SHEET: "Eligibility",
  CONSULTATIONS_SHEET: "Consultations",

  DEFAULT_FEE: 3000,

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

    // get_booked_slots is a public, read-only availability lookup — no
    // customer identity needed, and (like check_eligibility below) it must
    // never sit behind the write lock: it's a UX convenience check, not the
    // authoritative one (that happens inside save_consultation, under the
    // lock, at submit time). Making reads wait on writes was the main cause
    // of slow/variable response times.
    if (payload.action === "get_booked_slots") {
      return jsonResponse(getBookedSlots(String(payload.date || "").trim()));
    }

    const email = String(payload.email || "").trim().toLowerCase();
    const phone = String(payload.phone || "").trim();
    if (!email || !phone) {
      return jsonResponse({ success: false, error: "Email and phone are required." });
    }

    if (payload.action === "check_eligibility") {
      return jsonResponse(checkEligibility(email, phone));
    }

    // Only actions that mutate the sheet (or do a check-then-write, like the
    // slot-availability check inside save_consultation) need to serialize
    // through the lock.
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      switch (payload.action) {
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

// Reuse the same open Spreadsheet handle across every sheet lookup within a
// single request instead of re-opening it (a network round trip) each time —
// several actions here touch more than one sheet per invocation.
let _spreadsheet = null;
function getSpreadsheet() {
  if (!_spreadsheet) {
    _spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  return _spreadsheet;
}

function getOrCreateSheet(name, headers, plainTextColumns) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0a2342");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);

    // Force these columns to stay plain text — otherwise Sheets auto-converts
    // strings like "2026-08-17" or "4:00 PM" into real Date/Time values, which
    // silently breaks string comparisons used for slot-availability checks.
    // This only needs to run once, right when the sheet (and its 1000-row
    // formatted range) is created — the format persists for every row
    // appended afterward. Re-applying it on every single request (as this
    // used to do) reformatted 2 columns x 1000 rows on every booking-related
    // call and was the single biggest cause of slow responses.
    if (plainTextColumns && plainTextColumns.length) {
      plainTextColumns.forEach(function(col) {
        sheet.getRange(2, col, 1000, 1).setNumberFormat("@");
      });
    }
  }

  return sheet;
}

// Reads a cell value back as plain text regardless of whether Sheets stored
// it as a string or auto-converted it to a Date/Time value.
function cellToText(value, timeOnly) {
  if (value instanceof Date) {
    return timeOnly
      ? Utilities.formatDate(value, "Asia/Dhaka", "h:mm a")
      : Utilities.formatDate(value, "Asia/Dhaka", "yyyy-MM-dd");
  }
  return String(value || "").trim();
}

// Leading apostrophe forces Sheets to store the value as literal text
// instead of auto-detecting it as a Date/Time — setNumberFormat("@") alone
// is not reliably honored by appendRow(). The apostrophe itself never ends
// up in the stored/displayed value.
function forceText(value) {
  return "'" + String(value || "");
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
    // One batched write (cols 4-7: Free Consultation Used, Confirmed Count,
    // First Seen (kept as-is), Last Consultation) instead of three separate
    // round trips.
    sheet.getRange(existing.rowIndex, 4, 1, 4).setValues([[true, 1, existing.row[5], now]]);
  } else {
    sheet.appendRow([key, email, phone, true, 1, now, now]);
  }

  return { success: true, freeGranted: true };
}

// A booking holds its slot unless it was explicitly marked failed/cancelled.
// (No such status is set anywhere yet — abandoned "pending" payments still
// hold the slot. That's a known limitation, not a bug: revisit if abandoned
// pending bookings start blocking real customers.)
const BLOCKING_PAYMENT_STATUSES = ["not_required_free", "pending", "paid"];

function getBookedSlotsFromSheet(sheet, date) {
  const data = sheet.getDataRange().getValues();
  const booked = [];

  for (let i = 1; i < data.length; i++) {
    const rowDate = cellToText(data[i][11], false);   // Preferred Date
    const rowTime = cellToText(data[i][12], true);    // Preferred Time
    const rowStatus = cellToText(data[i][17], false); // Payment Status
    if (rowDate === date && BLOCKING_PAYMENT_STATUSES.indexOf(rowStatus) !== -1) {
      booked.push(rowTime);
    }
  }

  return booked;
}

function getBookedSlots(date) {
  if (!date) {
    return { success: false, error: "Missing date." };
  }

  const sheet = getOrCreateSheet(CONFIG.CONSULTATIONS_SHEET, CONFIG.CONSULTATION_HEADERS, [12, 13]);
  return { success: true, bookedSlots: getBookedSlotsFromSheet(sheet, date) };
}

function saveConsultation(email, phone, consultation) {
  const preferredDate = consultation.preferredDate || "";
  const preferredTime = consultation.preferredTime || "";

  // Opened once and reused for both the availability check and the append
  // below, instead of opening the sheet and re-reading all its rows twice.
  const sheet = getOrCreateSheet(CONFIG.CONSULTATIONS_SHEET, CONFIG.CONSULTATION_HEADERS, [12, 13]);

  if (preferredDate && preferredTime) {
    const booked = getBookedSlotsFromSheet(sheet, preferredDate);
    if (booked.indexOf(preferredTime) !== -1) {
      return {
        success: false,
        slotTaken: true,
        error: "That time slot was just booked by someone else. Please choose a different time."
      };
    }
  }

  const consultationId = "KC-" + Utilities.getUuid().split("-")[0].toUpperCase();

  sheet.appendRow([
    consultationId,
    consultation.submittedAt || new Date().toISOString(),
    "",
    email, phone,
    consultation.firstName || "", consultation.lastName || "",
    consultation.practiceArea || "", consultation.urgency || "",
    consultation.caseDescription || "", consultation.additionalNotes || "",
    forceText(consultation.preferredDate || ""), forceText(consultation.preferredTime || ""),
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
  let alreadyConfirmed = false;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === consultationId) {
      found = true;
      // Idempotent: both the browser-redirect flow and the payment IPN can
      // call this for the same successful payment — only apply/count once.
      if (data[i][2]) {
        alreadyConfirmed = true;
        break;
      }
      sheet.getRange(i + 1, 3).setValue(new Date());              // Confirmed At
      sheet.getRange(i + 1, 18).setValue(paymentStatus || "paid"); // Payment Status
      break;
    }
  }

  if (!found) {
    return { success: false, error: "Consultation record not found." };
  }

  if (alreadyConfirmed) {
    return { success: true, alreadyConfirmed: true };
  }

  // A confirmed paid consultation counts toward the returning-client count.
  const eligSheet = getOrCreateSheet(CONFIG.ELIGIBILITY_SHEET, CONFIG.ELIGIBILITY_HEADERS);
  const key = makeKey(email, phone);
  const existing = findEligibilityRow(eligSheet, key);
  const now = new Date();

  if (existing) {
    const newCount = (Number(existing.row[4]) || 0) + 1;
    // One batched write (cols 5-7: Confirmed Count, First Seen (kept as-is),
    // Last Consultation) instead of two separate round trips.
    eligSheet.getRange(existing.rowIndex, 5, 1, 3).setValues([[newCount, existing.row[5], now]]);
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
