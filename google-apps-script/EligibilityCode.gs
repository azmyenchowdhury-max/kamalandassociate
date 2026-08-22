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
// 5. Create a Google Drive folder to hold client-uploaded documents (e.g.
//    "Kamal & Associates — Consultation Documents"), copy its ID from the
//    URL (/drive/folders/FOLDER_ID), paste it into CONFIG.DOCUMENTS_FOLDER_ID
//    below. Every submission that includes files gets its own subfolder
//    inside it, named "Client Name — YYYY-MM-DD — Consultation ID".
// 6. In the Apps Script editor, do NOT paste a real secret token into
//    CONFIG.SECRET_TOKEN in this repo file — set the real value directly
//    in the deployed script's CONFIG constant only (this file stays a
//    template with a placeholder, since it's tracked in git).
// 7. Click Deploy > New deployment > Web app.
//    - Execute as: Me
//    - Who has access: Anyone
// 8. Copy the Web App URL and set it as ELIGIBILITY_API_URL in the
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

  // Google Drive folder ID where client-uploaded documents are stored.
  // Leave empty to skip document upload (bookings still save normally).
  DOCUMENTS_FOLDER_ID: "1GVknkyYp68DC6aNfri-gUlF0TGGNrFsd",

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
    "Is Free", "Payment Status", "Payment Method", "Payment Reference ID",
    "Documents Folder"
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

    // save_consultation manages its own, narrowly-scoped lock internally
    // (see below) — it only holds it around the slot-availability
    // check-then-append, not around the Drive document upload that follows,
    // so a large upload never blocks other customers' bookings or checks.
    if (payload.action === "save_consultation") {
      return jsonResponse(saveConsultation(email, phone, payload.consultation || {}));
    }

    // The remaining actions mutate the sheet and need to serialize through
    // the lock for their whole duration — they're all fast, no file I/O.
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      switch (payload.action) {
        case "consume_free":
          return jsonResponse(consumeFree(email, phone));
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

// Run this ONCE from the editor (select it in the function dropdown, click
// Run) after adding document upload — it's the first thing in this project
// to use Google Drive, so the script needs a one-time permission grant
// before real submissions can use it. Also doubles as a sanity check that
// CONFIG.DOCUMENTS_FOLDER_ID points at a folder this account can access —
// it only reads the folder's name, it doesn't create or upload anything.
function testDriveAccess() {
  const folder = DriveApp.getFolderById(CONFIG.DOCUMENTS_FOLDER_ID);
  Logger.log("Drive access OK — folder name: " + folder.getName());
}

// ------------------------------------------------------------
// Staff menu — manual Bangla QR payment verification
//
// The Bangla QR code is a static "scan and pay to our account" code, not a
// per-transaction gateway, so there's no automatic way to match a payment to
// a specific booking. Staff check the reference ID a client typed in (visible
// in the Additional Notes column) against their bKash/Nagad/Rocket app's own
// transaction history, then use this menu to confirm or reject — no separate
// admin site needed.
//
// This script is standalone (created at script.google.com, not from inside
// the spreadsheet), so onOpen() below is never invoked automatically the way
// it would be for a container-bound script. Run installSheetOpenTrigger()
// ONCE from this editor (select it in the function dropdown, click Run, and
// approve the permission prompt) to register it as an installable trigger —
// after that, the menu will appear every time anyone opens the spreadsheet.
// ------------------------------------------------------------
function installSheetOpenTrigger() {
  // Avoid piling up duplicate triggers if this is ever run more than once.
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === "onOpen") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("onOpen")
    .forSpreadsheet(CONFIG.SPREADSHEET_ID)
    .onOpen()
    .create();
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Kamal & Associates")
    .addItem("Confirm Payment for Selected Row", "confirmSelectedRowPayment")
    .addItem("Mark Selected Row as Payment Not Found", "rejectSelectedRowPayment")
    .addToUi();
}

function getSelectedConsultationRow() {
  const activeSheet = SpreadsheetApp.getActiveSheet();
  if (activeSheet.getName() !== CONFIG.CONSULTATIONS_SHEET) {
    throw new Error('Select a row on the "' + CONFIG.CONSULTATIONS_SHEET + '" sheet first.');
  }
  const row = activeSheet.getActiveCell().getRow();
  if (row === 1) {
    throw new Error("That's the header row — select a data row instead.");
  }
  const values = activeSheet.getRange(row, 1, 1, CONFIG.CONSULTATION_HEADERS.length).getValues()[0];
  return { sheet: activeSheet, row: row, values: values };
}

function confirmSelectedRowPayment() {
  const ui = SpreadsheetApp.getUi();
  try {
    const selected = getSelectedConsultationRow();
    const consultationId = selected.values[0];
    const email = selected.values[3];
    const phone = selected.values[4];
    const currentStatus = selected.values[17];
    const referenceId = selected.values[19] || "(none entered)";

    if (currentStatus === "paid") {
      ui.alert("That booking is already marked paid.");
      return;
    }

    const response = ui.alert(
      "Confirm payment?",
      "Booking " + consultationId + " (" + email + ")\n" +
        "Reference ID entered by client: " + referenceId + "\n\n" +
        "Only click Yes after you've checked your bKash/Nagad/Rocket app and found a matching " +
        "BDT 3,000 payment with this reference ID.",
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;

    const result = confirmConsultation(email, phone, consultationId, "paid");
    if (result.success) {
      ui.alert(result.alreadyConfirmed ? "That booking was already confirmed." : "Confirmed — the client has been emailed.");
    } else {
      ui.alert("Could not confirm: " + (result.error || "unknown error"));
    }
  } catch (err) {
    ui.alert(err.message);
  }
}

function rejectSelectedRowPayment() {
  const ui = SpreadsheetApp.getUi();
  try {
    const selected = getSelectedConsultationRow();
    const currentStatus = selected.values[17];

    if (currentStatus === "paid") {
      ui.alert("That booking is already marked paid — this action is only for unpaid/unmatched bookings.");
      return;
    }

    const response = ui.alert(
      "Mark as payment not found?",
      "This releases the time slot so someone else can book it. The client will NOT be emailed automatically — contact them directly if needed.",
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;

    selected.sheet.getRange(selected.row, 18).setValue("payment_not_confirmed");
    ui.alert("Marked. That time slot is now available again.");
  } catch (err) {
    ui.alert(err.message);
  }
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

// A booking holds its slot unless it was explicitly marked failed/cancelled/
// not-found. "pending_verification" (the Bangla QR manual-review flow) must
// hold the slot too — otherwise two customers could both pay for the same
// time before staff get to either one. Abandoned "pending" bookings still
// hold the slot too; that's a known limitation, not a bug: revisit if
// abandoned pending bookings start blocking real customers.
const BLOCKING_PAYMENT_STATUSES = ["not_required_free", "pending", "pending_verification", "paid"];

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

  // Locked only around the check-then-append — this is the part that must
  // be serialized to prevent two customers double-booking the same slot.
  // The Drive upload below runs after the lock is released, since it has no
  // shared state to protect and can take several seconds for larger files;
  // holding the lock for that long would queue up every other customer's
  // eligibility check and booking behind it.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let consultationId;
  let rowIndex;
  try {
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

    consultationId = "KC-" + Utilities.getUuid().split("-")[0].toUpperCase();

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
      consultation.selectedPaymentMethod || "",
      consultation.paymentReferenceId || "",
      "" // Documents Folder — filled in below, after the lock is released.
    ]);
    rowIndex = sheet.getLastRow();
  } finally {
    lock.releaseLock();
  }

  const folderUrl = uploadConsultationDocuments(
    consultationId,
    consultation.firstName,
    consultation.lastName,
    consultation.files
  );
  if (folderUrl) {
    sheet.getRange(rowIndex, CONFIG.CONSULTATION_HEADERS.length).setValue(folderUrl);
  }

  return { success: true, consultationId: consultationId };
}

// Uploads each client-submitted file (sent as base64 JSON — the same
// approach the job-applications script uses) into its own subfolder under
// CONFIG.DOCUMENTS_FOLDER_ID, and returns that subfolder's URL. Returns ""
// if there are no files or no folder is configured, so a booking never fails
// just because a document failed to upload.
function uploadConsultationDocuments(consultationId, firstName, lastName, files) {
  if (!files || !files.length || !CONFIG.DOCUMENTS_FOLDER_ID) {
    return "";
  }

  try {
    const parentFolder = DriveApp.getFolderById(CONFIG.DOCUMENTS_FOLDER_ID);
    const clientName = (String(firstName || "").trim() + " " + String(lastName || "").trim()).trim() || "Client";
    const today = Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd");
    const folder = parentFolder.createFolder(clientName + " — " + today + " — " + consultationId);

    files.forEach(function(fileData) {
      if (!fileData || !fileData.base64) return;
      try {
        const mimeType = fileData.mimeType || "application/octet-stream";
        const name = fileData.name || "document";
        const blob = Utilities.newBlob(Utilities.base64Decode(fileData.base64), mimeType, name);
        const driveFile = folder.createFile(blob);
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (fileErr) {
        Logger.log("Failed to upload document \"" + (fileData && fileData.name) + "\" for " + consultationId + ": " + fileErr.message);
      }
    });

    return folder.getUrl();
  } catch (err) {
    Logger.log("Document upload failed for " + consultationId + ": " + err.message);
    return "";
  }
}

function confirmConsultation(email, phone, consultationId, paymentStatus) {
  if (!consultationId) {
    return { success: false, error: "Missing consultation ID." };
  }

  const sheet = getOrCreateSheet(CONFIG.CONSULTATIONS_SHEET, CONFIG.CONSULTATION_HEADERS);
  const data = sheet.getDataRange().getValues();
  let found = false;
  let alreadyConfirmed = false;
  let confirmedRow = null;

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
      confirmedRow = data[i];
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

  const emailResult = sendConsultationConfirmationEmail(consultationId, confirmedRow);

  return { success: true, emailSent: emailResult.sent };
}

// Notifies the client once their booking is confirmed — either automatically
// (the SSLCommerz gateway flow) or manually, when staff verify a Bangla QR
// payment from the sheet's custom menu below.
function sendConsultationConfirmationEmail(consultationId, row) {
  try {
    const email = String(row[3] || "").trim();
    if (!email) {
      return { sent: false, message: "No client email on this booking." };
    }

    const firstName = String(row[5] || "Client").trim();
    const practiceArea = String(row[7] || "your matter").trim();
    const preferredDate = cellToText(row[11], false);
    const preferredTime = cellToText(row[12], true);
    const consultationType = String(row[13] || "").trim();

    const subject = `Consultation Confirmed | Kamal & Associates | ${consultationId}`;
    const htmlBody = `
      <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:680px;margin:0 auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <div style="background:#0a2342;color:#ffffff;padding:18px 22px;">
          <div style="font-size:20px;font-weight:700;">Kamal &amp; Associates</div>
          <div style="font-size:12px;opacity:0.88;letter-spacing:0.4px;">Defender Of Justice</div>
        </div>
        <div style="padding:20px 22px;">
          <p style="margin:0 0 10px;"><strong>Dear ${escapeEmailHtml(firstName)},</strong></p>
          <p style="margin:0 0 10px;">Your payment has been verified and your consultation is now <strong>confirmed</strong>.</p>
          <ul style="margin:0 0 14px;padding-left:18px;">
            <li><strong>Reference Number:</strong> ${escapeEmailHtml(consultationId)}</li>
            <li><strong>Practice Area:</strong> ${escapeEmailHtml(practiceArea)}</li>
            <li><strong>Date:</strong> ${escapeEmailHtml(preferredDate)}</li>
            <li><strong>Time:</strong> ${escapeEmailHtml(preferredTime)}</li>
            <li><strong>Type:</strong> ${escapeEmailHtml(consultationType)}</li>
          </ul>
          <p style="margin:0 0 10px;">We look forward to speaking with you. If you need to reschedule, please contact our office.</p>
          <p style="margin:0;">With regards,<br><strong>Kamal &amp; Associates</strong></p>
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody,
      name: "Kamal & Associates"
    });

    return { sent: true, message: "Confirmation email sent." };
  } catch (err) {
    Logger.log("Consultation confirmation email error: " + err.message);
    return { sent: false, message: "Confirmation email failed." };
  }
}

function escapeEmailHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ------------------------------------------------------------
// JSON response helper
// ------------------------------------------------------------
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
