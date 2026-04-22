// @ts-check
/**
 * debug.gs — Formula Finance v1.0.0
 * Diagnostic and health-check utilities.
 * Writes structured log entries to the Log sheet (CONFIG.sheets.log).
 *
 * NAMESPACE: FF.Debug
 */

'use strict';

var FF = FF || {};

FF.Debug = (function() {

  var MAX_LOG_ROWS = 500; // keep last N log rows

  /**
   * Log a message with severity level.
   * Writes to Apps Script Logger AND to the Log sheet (best-effort).
   * @param {'INFO'|'WARN'|'ERROR'} level
   * @param {string} module
   * @param {string} message
   * @param {*} [data]
   */
  function log(level, module, message, data) {
    var ts    = Utilities.formatDate(new Date(), 'Europe/Moscow', 'yyyy-MM-dd HH:mm:ss');
    var entry = ts + ' [' + level + '] [' + module + '] ' + message;
    if (data !== undefined) {
      try { entry += ' | ' + JSON.stringify(data); } catch(e) { entry += ' | [unstringifiable]'; }
    }
    Logger.log(entry);
    _appendToSheet(ts, level, module, message, data);
  }

  /**
   * Write a full health-check report to the Log sheet.
   * Called at the end of every runAll() execution.
   * @param {Object} config
   * @param {Object} result - { status, rowsRead, rowsClassified, errors, durationMs }
   */
  function writeHealthCheck(config, result) {
    log('INFO', 'HealthCheck', 'runAll completed', result);
    _trimLog(config);
  }

  /**
   * Get or create the Log sheet.
   * @param {Object} [config]
   * @returns {GoogleAppsScript.Spreadsheet.Sheet}
   */
  function getLogSheet(config) {
    var ss        = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = (config && config.sheets && config.sheets.log) || 'Log';
    var sheet     = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['Timestamp', 'Level', 'Module', 'Message', 'Data']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 155);
      sheet.setColumnWidth(2, 60);
      sheet.setColumnWidth(3, 100);
      sheet.setColumnWidth(4, 320);
      sheet.setColumnWidth(5, 220);
    }
    return sheet;
  }

  /**
   * Build a compact text summary of the log sheet tail.
   * Counts rows by level across the last `maxRows` entries and lists
   * the most recent HealthCheck line if present.
   * @param {Object} [config]
   * @param {number} [maxRows=100]
   * @returns {string}
   */
  function getCoverageReport(config, maxRows) {
    var limit = maxRows || 100;
    var sheet = getLogSheet(config);
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return 'Лог пуст. Запустите «Обновить дашборд», чтобы сгенерировать записи.';

    var firstRow = Math.max(2, lastRow - limit + 1);
    var rows = sheet.getRange(firstRow, 1, lastRow - firstRow + 1, 5).getValues();

    var counts = { INFO: 0, WARN: 0, ERROR: 0 };
    var lastHealth = null;
    rows.forEach(function(r) {
      var level = String(r[1] || '').toUpperCase();
      if (counts[level] !== undefined) counts[level]++;
      if (String(r[2]) === 'HealthCheck') lastHealth = r;
    });

    var lines = [];
    lines.push('Записей в выборке: ' + rows.length + ' (последних из ' + (lastRow - 1) + ')');
    lines.push('INFO: ' + counts.INFO + '  |  WARN: ' + counts.WARN + '  |  ERROR: ' + counts.ERROR);
    if (lastHealth) {
      lines.push('');
      lines.push('Последний запуск: ' + lastHealth[0]);
      lines.push(String(lastHealth[4] || ''));
    }
    return lines.join('\n');
  }

  /**
   * Clear all log entries (keep header row).
   * @param {Object} [config]
   */
  function clearLog(config) {
    var sheet   = getLogSheet(config);
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
    log('INFO', 'Debug', 'Log cleared');
  }

  // --- private helpers ---

  /**
   * Append a single log row to the sheet (best-effort, swallows errors).
   */
  function _appendToSheet(ts, level, module, message, data) {
    try {
      var sheet   = getLogSheet();
      var dataStr = '';
      if (data !== undefined) {
        try { dataStr = JSON.stringify(data); } catch(e) { dataStr = String(data); }
      }
      sheet.appendRow([ts, level, module, message, dataStr]);
    } catch(e) {
      // swallow — logging must never crash the main flow
    }
  }

  /**
   * Trim the log sheet to MAX_LOG_ROWS data rows.
   * @param {Object} [config]
   */
  function _trimLog(config) {
    try {
      var sheet   = getLogSheet(config);
      var lastRow = sheet.getLastRow();
      var dataRows = lastRow - 1;
      if (dataRows > MAX_LOG_ROWS) {
        var toDelete = dataRows - MAX_LOG_ROWS;
        sheet.deleteRows(2, toDelete);
      }
    } catch(e) { /* swallow */ }
  }

  return { log, writeHealthCheck, getLogSheet, getCoverageReport, clearLog };

})();
