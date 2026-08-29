/**
 * Free shared analytics backend for the QR career page.
 * Deploy this as a Google Apps Script Web App (see root README.md for steps).
 * Stores only anonymous event counters — no names, no IPs, no identifying data.
 */

var SHEET_NAME = "Analytics";

function doGet(e) {
  var action = e.parameter.action;
  if (action === "stats") {
    return respond(getStats());
  }
  return respond({ error: "unknown action" });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
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

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
