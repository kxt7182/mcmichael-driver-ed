/**
 * McMichael Driver Education Contact List - Google Apps Script with 1-Year Auto-Unsubscribe
 * Tab 1: "Subscribers" (Columns: Date Added, Time Added, Email)
 * Tab 2: "Unsubscribed" (Columns: Date Removed, Time Removed, Email)
 */

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1249a0").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function setupWorkbook() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  getOrCreateSheet(ss, "Subscribers", ["Date Added", "Time Added", "Email"]);
  getOrCreateSheet(ss, "Unsubscribed", ["Date Removed", "Time Removed", "Email"]);
}

function findRowByEmail(sheet, email) {
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    // Email is in column C (index 2)
    if (rows[i][2] && String(rows[i][2]).trim().toLowerCase() === email) {
      return i + 1; // 1-based row index
    }
  }
  return -1;
}

function getFormattedDateTime() {
  var now = new Date();
  var tz = Session.getScriptTimeZone() || "America/New_York";
  var dateStr = Utilities.formatDate(now, tz, "MM/dd/yyyy");
  var timeStr = Utilities.formatDate(now, tz, "hh:mm a"); // e.g. "04:41 AM"
  return { date: dateStr, time: timeStr };
}

// Auto-unsubscribe subscribers who have been on the list for 1 year (365 days)
function autoPruneOneYearSubscribers(ss) {
  setupWorkbook();
  var activeSheet = ss.getSheetByName("Subscribers");
  var unsubSheet = ss.getSheetByName("Unsubscribed");
  var rows = activeSheet.getDataRange().getValues();
  var oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  var dt = getFormattedDateTime();

  // Iterate backwards from bottom to top so deleting rows does not shift row indices
  for (var i = rows.length - 1; i >= 1; i--) {
    var dateVal = rows[i][0]; // Column A: Date Added
    var email = rows[i][2];   // Column C: Email

    if (dateVal && email) {
      var dateAdded = new Date(dateVal);
      if (!isNaN(dateAdded.getTime()) && dateAdded < oneYearAgo) {
        // 1. Delete from Subscribers sheet
        activeSheet.deleteRow(i + 1);

        // 2. Move to Unsubscribed sheet if not already there
        var unsubRow = findRowByEmail(unsubSheet, email);
        if (unsubRow === -1) {
          unsubSheet.appendRow([dt.date, dt.time, email]);
        }
      }
    }
  }
}

function processAction(action, emailStr) {
  setupWorkbook();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Always auto-prune subscribers older than 1 year
  autoPruneOneYearSubscribers(ss);

  var activeSheet = ss.getSheetByName("Subscribers");
  var unsubSheet = ss.getSheetByName("Unsubscribed");
  var email = (emailStr || "").trim().toLowerCase();

  if (!email) return { success: false, message: "Email is required" };

  var dt = getFormattedDateTime();

  if (action === "SUBSCRIBE") {
    // 1. Remove from Unsubscribed tab if previously present
    var oldUnsubRow = findRowByEmail(unsubSheet, email);
    if (oldUnsubRow > -1) {
      unsubSheet.deleteRow(oldUnsubRow);
    }

    // 2. Add or update in Subscribers tab
    var activeRow = findRowByEmail(activeSheet, email);
    if (activeRow > -1) {
      activeSheet.getRange(activeRow, 1).setValue(dt.date);
      activeSheet.getRange(activeRow, 2).setValue(dt.time);
    } else {
      activeSheet.appendRow([dt.date, dt.time, email]);
    }

    return { success: true, message: "Added to Subscribers tab" };
  }
  
  else if (action === "UNSUBSCRIBE") {
    // 1. Remove row from Active Subscribers tab
    var activeRow = findRowByEmail(activeSheet, email);
    if (activeRow > -1) {
      activeSheet.deleteRow(activeRow);
    }

    // 2. Add or update in Unsubscribed tab
    var unsubRow = findRowByEmail(unsubSheet, email);
    if (unsubRow > -1) {
      unsubSheet.getRange(unsubRow, 1).setValue(dt.date);
      unsubSheet.getRange(unsubRow, 2).setValue(dt.time);
    } else {
      unsubSheet.appendRow([dt.date, dt.time, email]);
    }

    return { success: true, message: "Moved to Unsubscribed tab" };
  }

  return { success: false, message: "Unknown action" };
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var action = "";
    var email = "";

    if (e && e.postData && e.postData.contents) {
      try {
        var payload = JSON.parse(e.postData.contents);
        action = payload.action;
        email = payload.data ? payload.data.email : payload.email;
      } catch (err) {}
    }

    if (!action && e && e.parameter) {
      action = e.parameter.action;
      email = e.parameter.email;
    }

    var result = processAction(action, email);
    return createJsonResponse(result.success, result.message);
  } catch (err) {
    return createJsonResponse(false, err.toString());
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action && e.parameter.email) {
    processAction(e.parameter.action, e.parameter.email);
  } else {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    autoPruneOneYearSubscribers(ss);
  }

  setupWorkbook();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var activeSheet = ss.getSheetByName("Subscribers");
  var rows = activeSheet.getDataRange().getValues();
  var subscribers = [];

  for (var i = 1; i < rows.length; i++) {
    subscribers.push({
      dateAdded: rows[i][0],
      timeAdded: rows[i][1],
      email: rows[i][2]
    });
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, count: subscribers.length, subscribers: subscribers }))
    .setMimeType(ContentService.MimeType.JSON);
}

function createJsonResponse(success, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: success, message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}
