// ============================================================
// Kamal & Associates — Job Application Handler
// Google Apps Script Web App
//
// HOW TO DEPLOY:
// 1. Go to https://script.google.com and create a new project.
// 2. Replace the default Code.gs content with this entire file.
// 3. Fill in the CONFIG values below (IDs you get from Drive/Sheets).
// 4. Click Deploy > New deployment > Web app.
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the Web App URL and paste it into careers.js as APPS_SCRIPT_URL.
// ============================================================

// ------------------------------------------------------------
// CONFIG — fill these in before deploying
// ------------------------------------------------------------
const CONFIG = {
  // Secret token — must match APPS_SCRIPT_SECRET in careers.js
  SECRET_TOKEN: "7bd779df1a694b698e8b8cd09c23923444098777c1a14e1ca67daf876f15b9d6",

  // Google Spreadsheet ID (from its URL: /spreadsheets/d/SPREADSHEET_ID/edit)
  SPREADSHEET_ID: "1uDWpSgEnGA7zewv03b8iI5RSLHhzJ0rFHTmzjisazD4",

  // Google Drive folder IDs for each job type.
  // Create a root folder "Kamal & Associates — Job Applications"
  // then create 3 subfolders inside it and paste each folder ID here.
  DRIVE_FOLDERS: {
    "Computer Typist":    "1LveQ9UUjzIp5UAW8c9bg1tUpiFL43zzd",
    "Apprentice Lawyer":  "1Ay8LhnrsPlsWqDgFBe4DfLjJvUJqqSR5",
    "Junior Associate":   "1OVM-S-UmkgfD1UjW5vyV7ArlwtyQ-_F4",
    "Default":            "1Pz1vZ01uaI4GMmtlcX86Q9qQAcGg70Zy"
  },

  // Sheet names inside the spreadsheet — must match exactly.
  SHEET_NAMES: {
    "Computer Typist":   "Computer Typist",
    "Apprentice Lawyer": "Apprentice Lawyer",
    "Junior Associate":  "Junior Associate",
    "Default":           "Other Applications"
  },

  // Header row written once to each new sheet automatically.
  HEADERS: [
    "Submitted At",
    "Full Name", "Email", "Phone", "Alternate Phone",
    "Date of Birth", "Father's Name", "Mother's Name",
    "Gender", "Marital Status", "Nationality", "NID / Passport",
    "Present Address", "Permanent Address",
    "Emergency Contact Name", "Emergency Contact Phone",
    "Applied Position", "Job Location", "Job Type",
    "Current Designation", "Current Employer",
    "Total Experience", "Relevant Experience", "Notice Period",
    "Bar Enrollment", "Expected Salary",
    "Preferred Practice Area", "Language Proficiency",
    "Computer Skills", "Professional Summary",
    "SSC Degree", "SSC Institution", "SSC Year", "SSC Result",
    "HSC Degree", "HSC Institution", "HSC Year", "HSC Result",
    "LLB Institution", "LLB Result",
    "LLM Institution", "LLM Result",
    "Academic Achievements",
    "📁 Applicant Folder",
    "🖼 Photo", "✍ Signature",
    "📄 SSC Certificate", "📄 HSC Certificate",
    "📄 LLB Certificate", "📄 LLM Certificate",
    "📄 Resume", "📄 Cover Letter",
    "Application Status"
  ]
};

// ------------------------------------------------------------
// Entry point — handles preflight CORS and POST submissions
// ------------------------------------------------------------
function doPost(e) {
  try {
    if (!e || !e.parameter || !e.postData || !e.postData.contents) {
      return jsonResponse({
        status: "error",
        message: "doPost must be called by an HTTP request. Deploy as a Web App and submit from the careers form, or run testDoPostLocally() from Apps Script editor."
      }, 400);
    }

    // Validate secret token
    const token = e.parameter.token || "";
    if (token !== CONFIG.SECRET_TOKEN) {
      return jsonResponse({ status: "error", message: "Unauthorized" }, 403);
    }

    const payload = JSON.parse(e.postData.contents);

    // Route to correct subfolder and sheet by job title
    const jobTitle = String(payload.jobTitle || "").trim();
    const folderKey = CONFIG.DRIVE_FOLDERS[jobTitle] ? jobTitle : "Default";
    const sheetKey  = CONFIG.SHEET_NAMES[jobTitle]   ? jobTitle : "Default";

    const parentFolderId = CONFIG.DRIVE_FOLDERS[folderKey];
    const sheetName      = CONFIG.SHEET_NAMES[sheetKey];

    // Create "Full Name — YYYY-MM-DD" subfolder for this applicant
    const fullName    = String(payload.fullName || "Applicant").trim();
    const today       = Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd");
    const folderName  = fullName + " — " + today;
    const parentFolder = DriveApp.getFolderById(parentFolderId);
    const applicantFolder = parentFolder.createFolder(folderName);
    const applicantFolderUrl = applicantFolder.getUrl();

    // Upload all files into the applicant subfolder
    const fileLinks = uploadFiles(payload.files || {}, applicantFolder);

    // Write one row into the correct sheet
    const row = buildRow(payload, applicantFolderUrl, fileLinks);
    appendToSheet(sheetName, row);

    // Send acknowledgement email to the applicant (non-blocking)
    const emailResult = sendApplicantAcknowledgement(payload, {
      applicantFolderUrl: applicantFolderUrl,
      submittedAt: Utilities.formatDate(new Date(), "Asia/Dhaka", "dd MMM yyyy, hh:mm a")
    });

    return jsonResponse({
      status: "ok",
      message: "Application received successfully.",
      applicantEmailSent: emailResult.sent,
      applicantEmailMessage: emailResult.message
    });

  } catch (err) {
    Logger.log("Error: " + err.message);
    return jsonResponse({ status: "error", message: "Server error. Please try again." }, 500);
  }
}

// Handle CORS preflight (OPTIONS) — Google Apps Script doesn't support it natively,
// but this makes the error graceful.
function doGet(e) {
  return jsonResponse({ status: "ok", message: "Careers endpoint is live." });
}

// ------------------------------------------------------------
// Local editor test helper (Run -> testDoPostLocally)
// Creates a sample event object so doPost can be tested manually.
// ------------------------------------------------------------
function testDoPostLocally() {
  const samplePayload = {
    fullName: "Test Applicant",
    emailAddress: "test@example.com",
    phoneNumberCountryCode: "+880",
    phoneNumber: "1712345678",
    alternatePhoneCountryCode: "+880",
    alternatePhone: "1812345678",
    emergencyContactPhoneCountryCode: "+880",
    emergencyContactPhone: "1912345678",
    jobTitle: "Junior Associate",
    jobLocation: "Dhaka, Bangladesh",
    jobType: "Full-Time",
    files: {}
  };

  const event = {
    parameter: { token: CONFIG.SECRET_TOKEN },
    postData: { contents: JSON.stringify(samplePayload) }
  };

  const result = doPost(event);
  Logger.log(result.getContent());
}

// ------------------------------------------------------------
// Upload files from Base64 payload to applicant's Drive folder
// Returns an object: { fieldName: fileUrl, ... }
// ------------------------------------------------------------
function uploadFiles(files, folder) {
  const links = {};
  const fileFieldMap = {
    applicantPhotograph:  "photo",
    applicantSignature:   "signature",
    sscCertificate:       "ssc_certificate",
    hscCertificate:       "hsc_certificate",
    llbCertificate:       "llb_certificate",
    llmCertificate:       "llm_certificate",
    applicantResume:      "resume",
    applicantCoverLetter: "cover_letter"
  };

  Object.entries(fileFieldMap).forEach(function([fieldKey, fileName]) {
    const fileData = files[fieldKey];
    if (!fileData || !fileData.base64 || !fileData.mimeType) {
      links[fieldKey] = "";
      return;
    }

    try {
      const ext       = fileData.name ? fileData.name.split(".").pop() : "bin";
      const blob      = Utilities.newBlob(
        Utilities.base64Decode(fileData.base64),
        fileData.mimeType,
        fileName + "." + ext
      );
      const driveFile = folder.createFile(blob);
      driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      links[fieldKey] = driveFile.getUrl();
    } catch (err) {
      Logger.log("File upload error for " + fieldKey + ": " + err.message);
      links[fieldKey] = "Upload failed";
    }
  });

  return links;
}

// ------------------------------------------------------------
// Build the spreadsheet row array in HEADERS order
// ------------------------------------------------------------
function buildRow(p, folderUrl, files) {
  const primaryPhone = formatPhone(p.phoneNumberCountryCode, p.phoneNumber);
  const alternatePhone = formatPhone(p.alternatePhoneCountryCode, p.alternatePhone);
  const emergencyPhone = formatPhone(p.emergencyContactPhoneCountryCode, p.emergencyContactPhone);

  return [
    Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss"),
    p.fullName || "", p.emailAddress || "", primaryPhone, alternatePhone,
    p.dateOfBirth || "", p.fatherName || "", p.motherName || "",
    p.gender || "", p.maritalStatus || "", p.nationality || "", p.nidPassport || "",
    p.presentAddress || "", p.permanentAddress || "",
    p.emergencyContactName || "", emergencyPhone,
    p.jobTitle || "", p.jobLocation || "", p.jobType || "",
    p.currentDesignation || "", p.currentEmployer || "",
    p.totalExperience || "", p.relevantExperience || "", p.noticePeriod || "",
    p.barEnrollment || "", p.expectedSalary || "",
    p.preferredPracticeArea || "", p.languageProficiency || "",
    p.computerSkills || "", p.professionalSummary || "",
    p.sscEquivalentDegree || "", p.sscInstitution || "", p.sscPassingYear || "", p.sscResult || "",
    p.hscEquivalentDegree || "", p.hscInstitution || "", p.hscPassingYear || "", p.hscResult || "",
    p.llbInstitution || "", p.llbResult || "",
    p.llmInstitution || "", p.llmResult || "",
    p.academicAchievements || "",
    folderUrl,
    files.applicantPhotograph  || "",
    files.applicantSignature   || "",
    files.sscCertificate       || "",
    files.hscCertificate       || "",
    files.llbCertificate       || "",
    files.llmCertificate       || "",
    files.applicantResume      || "",
    files.applicantCoverLetter || "",
    "New"
  ];
}

// ------------------------------------------------------------
// Join country code and number cleanly for storage/output
// ------------------------------------------------------------
function formatPhone(code, number) {
  const c = String(code || "").trim();
  const n = String(number || "").trim();
  return [c, n].filter(Boolean).join(" ");
}

// ------------------------------------------------------------
// Send applicant acknowledgement email after successful submission
// ------------------------------------------------------------
function sendApplicantAcknowledgement(payload, meta) {
  try {
    const recipient = String(payload.emailAddress || "").trim();
    if (!recipient) {
      return { sent: false, message: "No applicant email provided." };
    }

    const applicantName = String(payload.fullName || "Applicant").trim();
    const jobTitle = String(payload.jobTitle || "the selected position").trim();
    const jobLocation = String(payload.jobLocation || "Dhaka, Bangladesh").trim();
    const submittedAt = (meta && meta.submittedAt) || Utilities.formatDate(new Date(), "Asia/Dhaka", "dd MMM yyyy, hh:mm a");

    const subject = `Application Received | Kamal & Associates | ${jobTitle}`;
    const htmlBody = `
      <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:680px;margin:0 auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <div style="background:#0a2342;color:#ffffff;padding:18px 22px;">
          <div style="font-size:20px;font-weight:700;">Kamal &amp; Associates</div>
          <div style="font-size:12px;opacity:0.88;letter-spacing:0.4px;">Excellence in Advocacy. Integrity in Counsel.</div>
        </div>
        <div style="padding:20px 22px;">
          <p style="margin:0 0 10px;"><strong>Dear ${escapeEmailHtml(applicantName)},</strong></p>
          <p style="margin:0 0 10px;">Thank you for your interest in joining Kamal &amp; Associates. We have successfully received your application for the role of <strong>${escapeEmailHtml(jobTitle)}</strong>.</p>
          <p style="margin:0 0 10px;">Submission details:</p>
          <ul style="margin:0 0 14px;padding-left:18px;">
            <li><strong>Position:</strong> ${escapeEmailHtml(jobTitle)}</li>
            <li><strong>Location:</strong> ${escapeEmailHtml(jobLocation)}</li>
            <li><strong>Submitted:</strong> ${escapeEmailHtml(submittedAt)}</li>
          </ul>
          <p style="margin:0 0 10px;">Our recruitment team will now review your profile carefully. If shortlisted, you will be contacted regarding the next stage of assessment.</p>
          <p style="margin:0;">With regards,<br><strong>Recruitment Team</strong><br>Kamal &amp; Associates</p>
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: htmlBody,
      name: "Kamal & Associates"
    });

    return { sent: true, message: "Acknowledgement email sent." };
  } catch (err) {
    Logger.log("Applicant acknowledgement email error: " + err.message);
    return { sent: false, message: "Acknowledgement email failed." };
  }
}

function escapeEmailHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ------------------------------------------------------------
// Append row to the named sheet; create sheet + header if new
// ------------------------------------------------------------
function appendToSheet(sheetName, row) {
  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let   sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(CONFIG.HEADERS);
    // Style header row
    const headerRange = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0a2342");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow(row);
}

// ------------------------------------------------------------
// JSON response helper
// ------------------------------------------------------------
function jsonResponse(data, statusCode) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
