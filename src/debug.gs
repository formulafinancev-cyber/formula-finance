// @ts-check
/**
 * debug.gs — Formula Finance v1.0.0
 * Diagnostic and health-check utilities.
 * Writes a structured log to the Log sheet for troubleshooting.
 *
 * NAMESPACE: FF.Debug
 * SHEET: CONFIG.SHEETS.LOG
 */

'use strict';

var FF = FF || {};

FF.Debug = (function() {

  /**
   * Write a full health-check report to the Log sheet.
   * Called at the end of every runAll() execution.
   * @param {Object} config
   * @param {Object} result - execution result summary
   */
  function writeHealthCheck(config, result) {
    // TODO: implement
    // 1. Get or create Log sheet
    // 2. Append timestamp, status, error count, coverage %
    // 3. Trim log to last N rows
    Logger.log('[FF.Debug] health check: ' + JSON.stringify(result));
  }

  /**
   * Log a single message with severity level.
   * @param {'INFO'|'WARN'|'ERROR'} level
   * @param {string} module - source module name
   * @param {string} message
   * @param {*} [data] - optional extra data
   */
  function log(level, module, message, data) {
    // TODO: implement sheet logging
    var entry = Utilities.formatDate(new Date(), 'Europe/Moscow', 'yyyy-MM-dd HH:mm:ss')
      + ' [' + level + '] [' + module + '] ' + message;
    if (data !== undefined) entry += ' | ' + JSON.stringify(data);
    Logger.log(entry);
  }

  /**
   * Get or create the Log sheet.
   * @param {Object} config
   * @returns {GoogleAppsScript.Spreadsheet.Sheet}
   */
  function getLogSheet(config) {
    // TODO: implement
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = (config && config.sheets && config.sheets.log) || 'Log';
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['Timestamp', 'Level', 'Module', 'Message']);
    }
    return sheet;
  }

  /**
   * Clear all log entries (keep header row).
   * @param {Object} config
   */
  function clearLog(config) {
    // TODO: implement
    var sheet = getLogSheet(config);
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
  }

  return { writeHealthCheck, log, getLogSheet, clearLog };

})();
