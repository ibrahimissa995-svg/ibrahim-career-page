/**
 * Free shared backend for the QR career page: analytics + editable site content.
 * Deploy this as a Google Apps Script Web App (see root README.md for steps).
 * Analytics stores only anonymous event counters \u2014 no names, no IPs, no identifying data.
 * Content is the bilingual (EN/AR) page text, edited via admin.html.
 */

var SHEET_NAME = "Analytics";
var CONTENT_SHEET_NAME = "Content";
var HISTORY_SHEET_NAME = "ContentHistory";

// Seeded into the Content sheet the first time it's read, if empty.
// Keep this in sync with the DEFAULT_CONTENT constants in index.html / admin.html.
var DEFAULT_CONTENT = {
  greeting: {
    en_title: "Hello! I am currently looking for a new job opportunity \ud83d\ude80",
    ar_title: "\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0643! \u0623\u0646\u0627 \u0623\u0628\u062d\u062b \u062d\u0627\u0644\u064a\u0627\u064b \u0639\u0646 \u0641\u0631\u0635\u0629 \u0639\u0645\u0644 \u062c\u062f\u064a\u062f\u0629 \ud83d\ude80",
    en_subtitle: "Do you have an open role or vacancy in your company?",
    ar_subtitle: "\u0647\u0644 \u0644\u062f\u064a\u0643 \u0648\u0638\u064a\u0641\u0629 \u0623\u0648 \u0634\u0627\u063a\u0631 \u0645\u062a\u0627\u062d \u0641\u064a \u0634\u0631\u0643\u062a\u0643/\u0645\u0624\u0633\u0633\u062a\u0643\u061f",
    en_yes: "Yes, we do",
    ar_yes: "\u0646\u0639\u0645\u060c \u0644\u062f\u064a\u0646\u0627 \u0634\u0627\u063a\u0631",
    en_no: "No, not right now",
    ar_no: "\u0644\u0627\u060c \u0644\u064a\u0633 \u0644\u062f\u064a\u0646\u0627 \u0627\u0644\u0622\u0646"
  },
  noScreen: {
    en_message: "Thank you for your time and interest! \u2764\ufe0f If you know someone looking for talents like me, I'd really appreciate it if you could share this link with them.",
    ar_message: "\u0634\u0643\u0631\u0627\u064b \u0644\u0627\u0647\u062a\u0645\u0627\u0645\u0643 \u0648\u0648\u0642\u062a\u0643! \u2764\ufe0f \u0625\u0630\u0627 \u0643\u0646\u062a \u062a\u0639\u0631\u0641 \u0623\u062d\u062f\u0627\u064b \u064a\u0628\u062d\u062b \u0639\u0646 \u0643\u0641\u0627\u0621\u0627\u062a \u0645\u062b\u0644\u064a\u060c \u0623\u0643\u0648\u0646 \u0645\u0645\u062a\u0646\u0627\u064b \u062c\u062f\u0627\u064b \u0644\u0648 \u0634\u0627\u0631\u0643\u062a \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0645\u0639\u0647."
  },
  profile: {
    name: "Ibrahim Abu Shameh",
    en_title: "Sales & Business Development Professional",
    ar_title: "",
    en_subtitle: "Customer Success \u00b7 Sales Enablement \u00b7 Sales Operations",
    ar_subtitle: "",
    en_badge: "Open to opportunities",
    ar_badge: "",
    en_about: "I am a Sales & Business Development Professional with a strong interest in driving growth, building lasting client relationships, and supporting sales operations. Coming from a Computer Information Systems (CIS) background with technical training (CCNA), I enjoy connecting technology with practical business needs \u2014 quickly adapting to new products, understanding client pain points, and communicating solutions effectively across industries.",
    ar_about: "\u0623\u0646\u0627 \u0645\u062d\u062a\u0631\u0641 \u0645\u0628\u064a\u0639\u0627\u062a \u0648\u062a\u0637\u0648\u064a\u0631 \u0623\u0639\u0645\u0627\u0644\u060c \u0648\u0644\u062f\u064a \u0627\u0647\u062a\u0645\u0627\u0645 \u0643\u0628\u064a\u0631 \u0628\u062a\u062d\u0642\u064a\u0642 \u0627\u0644\u0646\u0645\u0648 \u0648\u0628\u0646\u0627\u0621 \u0639\u0644\u0627\u0642\u0627\u062a \u0637\u0648\u064a\u0644\u0629 \u0627\u0644\u0623\u0645\u062f \u0645\u0639 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u062f\u0639\u0645 \u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a. \u0623\u062a\u0645\u062a\u0639 \u0628\u062e\u0644\u0641\u064a\u0629 \u0641\u064a \u0646\u0638\u0645 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u062d\u0627\u0633\u0648\u0628\u064a\u0629 (CIS) \u0648\u062a\u062f\u0631\u064a\u0628 \u062a\u0642\u0646\u064a (CCNA)\u060c \u0648\u0623\u0633\u062a\u0645\u062a\u0639 \u0628\u0631\u0628\u0637 \u0627\u0644\u062a\u0643\u0646\u0648\u0644\u0648\u062c\u064a\u0627 \u0628\u0627\u0644\u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u064a\u0629 \u0644\u0644\u0623\u0639\u0645\u0627\u0644\u060c \u0645\u0646 \u062e\u0644\u0627\u0644 \u0627\u0644\u062a\u0643\u064a\u0641 \u0627\u0644\u0633\u0631\u064a\u0639 \u0645\u0639 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u062c\u062f\u064a\u062f\u0629 \u0648\u0641\u0647\u0645 \u062a\u062d\u062f\u064a\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u062a\u0648\u0635\u064a\u0644 \u0627\u0644\u062d\u0644\u0648\u0644 \u0628\u0641\u0639\u0627\u0644\u064a\u0629 \u0639\u0628\u0631 \u0645\u062e\u062a\u0644\u0641 \u0627\u0644\u0642\u0637\u0627\u0639\u0627\u062a."
  },
  focusAreas: [
    { icon: "\ud83c\udfaf", en_title: "Sales & Biz Dev", ar_title: "\u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u0648\u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0623\u0639\u0645\u0627\u0644", en_desc: "Prospecting, client engagement & account support", ar_desc: "\u0627\u0633\u062a\u0642\u0637\u0627\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062d\u062a\u0645\u0644\u064a\u0646 \u0648\u0627\u0644\u062a\u0641\u0627\u0639\u0644 \u0645\u0639\u0647\u0645 \u0648\u062f\u0639\u0645 \u0627\u0644\u062d\u0633\u0627\u0628\u0627\u062a" },
    { icon: "\ud83e\udd1d", en_title: "Customer Success", ar_title: "\u0646\u062c\u0627\u062d \u0627\u0644\u0639\u0645\u0644\u0627\u0621", en_desc: "Relationship management & onboarding", ar_desc: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u0644\u0627\u0642\u0627\u062a \u0648\u062a\u0647\u064a\u0626\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u062c\u062f\u062f" },
    { icon: "\u2699\ufe0f", en_title: "Sales Enablement", ar_title: "\u062a\u0645\u0643\u064a\u0646 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a", en_desc: "Process optimization & CRM usage", ar_desc: "\u062a\u062d\u0633\u064a\u0646 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a \u0648\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0623\u0646\u0638\u0645\u0629 \u0625\u062f\u0627\u0631\u0629 \u0639\u0644\u0627\u0642\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0627\u0621" },
    { icon: "\ud83d\udcbb", en_title: "Technical Aptitude", ar_title: "\u0627\u0644\u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u062a\u0642\u0646\u064a\u0629", en_desc: "CIS background, fast adaptation to tools", ar_desc: "\u062e\u0644\u0641\u064a\u0629 \u0641\u064a \u0646\u0638\u0645 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u062d\u0627\u0633\u0648\u0628\u064a\u0629 \u0648\u0633\u0631\u0639\u0629 \u0627\u0644\u062a\u0643\u064a\u0641 \u0645\u0639 \u0627\u0644\u0623\u062f\u0648\u0627\u062a" }
  ],
  skills: [
    { en: "Business Development", ar: "\u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0623\u0639\u0645\u0627\u0644" },
    { en: "Sales Operations", ar: "\u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a" },
    { en: "Customer Success", ar: "\u0646\u062c\u0627\u062d \u0627\u0644\u0639\u0645\u0644\u0627\u0621" },
    { en: "Account Management", ar: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u062d\u0633\u0627\u0628\u0627\u062a" },
    { en: "Technical Product Sales", ar: "\u0645\u0628\u064a\u0639\u0627\u062a \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u062a\u0642\u0646\u064a\u0629" },
    { en: "CRM Usage", ar: "\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0623\u0646\u0638\u0645\u0629 CRM" },
    { en: "Client Engagement", ar: "\u0627\u0644\u062a\u0641\u0627\u0639\u0644 \u0645\u0639 \u0627\u0644\u0639\u0645\u0644\u0627\u0621" }
  ],
  education: {
    en_text: "Bachelor's Degree, Computer Information Systems \u2014 [Add university & year]",
    ar_text: "\u0628\u0643\u0627\u0644\u0648\u0631\u064a\u0648\u0633 \u0641\u064a \u0646\u0638\u0645 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u062d\u0627\u0633\u0648\u0628\u064a\u0629 \u2014 [\u0623\u0636\u0641 \u0627\u0633\u0645 \u0627\u0644\u062c\u0627\u0645\u0639\u0629 \u0648\u0627\u0644\u0633\u0646\u0629]"
  },
  roleOptions: [
    { value: "marketing", icon: "\ud83d\udcc8", en_title: "Marketing", ar_title: "\u0627\u0644\u062a\u0633\u0648\u064a\u0642", en_desc: "Brand, campaigns & growth-focused roles", ar_desc: "\u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0648\u0627\u0644\u062d\u0645\u0644\u0627\u062a \u0648\u0627\u0644\u0623\u062f\u0648\u0627\u0631 \u0627\u0644\u062a\u064a \u062a\u0631\u0643\u0632 \u0639\u0644\u0649 \u0627\u0644\u0646\u0645\u0648" },
    { value: "sales", icon: "\ud83e\udd1d", en_title: "Sales Support / Sales Enablement", ar_title: "\u062f\u0639\u0645 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a / \u062a\u0645\u0643\u064a\u0646 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a", en_desc: "CRM, process & sales operations roles", ar_desc: "\u0623\u062f\u0648\u0627\u0631 \u0625\u062f\u0627\u0631\u0629 \u0639\u0644\u0627\u0642\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a \u0648\u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a" },
    { value: "events", icon: "\ud83c\udf89", en_title: "Events Management", ar_title: "\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a", en_desc: "Planning, coordination & on-site roles", ar_desc: "\u0627\u0644\u062a\u062e\u0637\u064a\u0637 \u0648\u0627\u0644\u062a\u0646\u0633\u064a\u0642 \u0648\u0627\u0644\u0623\u062f\u0648\u0627\u0631 \u0627\u0644\u0645\u064a\u062f\u0627\u0646\u064a\u0629" }
  ]
};

function doGet(e) {
  var action = e.parameter.action;
  if (action === "stats") {
    return respond(getStats());
  }
  if (action === "content") {
    return respond(getContent());
  }
  return respond({ error: "unknown action" });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.action === "updateContent") {
      return respond(updateContent(data));
    }

    var event = data.event;
    var allowed = ["visits", "yes", "no", "resume_marketing", "resume_sales", "resume_events"];
    if (allowed.indexOf(event) === -1) {
      return respond({ ok: false, error: "invalid event" });
    }
    incrementCounter(event);
    return respond({ ok: true });
  } catch (err) {
    return respond({ ok: false, error: String(err) });
  }
}

// ---------- analytics ----------

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["event", "count"]);
  }
  return sheet;
}

function incrementCounter(event) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === event) {
      sheet.getRange(i + 1, 2).setValue(data[i][1] + 1);
      return;
    }
  }
  sheet.appendRow([event, 1]);
}

function getStats() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var stats = {};
  for (var i = 1; i < data.length; i++) {
    stats[data[i][0]] = data[i][1];
  }
  return stats;
}

// ---------- content (admin-editable) ----------

function getContentSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONTENT_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONTENT_SHEET_NAME);
    sheet.getRange("A1").setValue(JSON.stringify(DEFAULT_CONTENT));
    sheet.getRange("A2").setValue(new Date());
    sheet.getRange("C1").setValue("\u26a0\ufe0f Edit content only via admin.html \u2014 this cell holds raw JSON, don't hand-edit it.");
  }
  return sheet;
}

function getHistorySheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HISTORY_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(HISTORY_SHEET_NAME);
    sheet.appendRow(["timestamp", "previous_content_json"]);
  }
  return sheet;
}

function getContent() {
  var sheet = getContentSheet();
  var raw = sheet.getRange("A1").getValue();
  if (!raw) {
    raw = JSON.stringify(DEFAULT_CONTENT);
    sheet.getRange("A1").setValue(raw);
    sheet.getRange("A2").setValue(new Date());
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_CONTENT;
  }
}

function updateContent(data) {
  var secret = PropertiesService.getScriptProperties().getProperty("ADMIN_SECRET");
  if (!secret) {
    return { ok: false, error: "Server has no ADMIN_SECRET configured yet \u2014 set it in Project Settings > Script Properties." };
  }
  if (data.secret !== secret) {
    return { ok: false, error: "unauthorized" };
  }
  if (!data.content) {
    return { ok: false, error: "missing content" };
  }

  var sheet = getContentSheet();
  var prev = sheet.getRange("A1").getValue();
  if (prev) {
    getHistorySheet().appendRow([new Date(), prev]);
  }

  sheet.getRange("A1").setValue(JSON.stringify(data.content));
  sheet.getRange("A2").setValue(new Date());
  return { ok: true };
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
