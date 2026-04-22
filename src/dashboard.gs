// @ts-check
/**
 * dashboard.gs — Formula Finance v1.0.0
 * Orchestrates the main Dashboard sheet.
 * Clears the sheet, writes the header, then delegates KPI rendering to FF.KPI.
 *
 * NAMESPACE: FF.Dashboard
 */

'use strict';

var FF = FF || {};

FF.Dashboard = (function() {

  var BG_MAIN    = '#0d0d1a';
  var FG_TITLE   = '#ffffff';
  var FG_SUB     = '#a0aec0';
  var BG_HEADER  = '#1a1a2e';

  /**
   * Render the full dashboard.
   * Called from main.gs runAll().
   * @param {Object} config
   * @param {Array}  blocks          - from FF.Registry.buildAvailableBlocks()
   * @param {Array}  classifiedSheets - from FF.Classifier.classify()
   */
  function renderAll(config, blocks, classifiedSheets) {
    FF.Debug.log('INFO', 'Dashboard', 'renderAll started');
    var sheet = getSheet(config);

    clearDashboard(sheet);
    writeHeader(sheet, config, blocks);
    applyLayout(sheet);

    var restaurants = blocks.restaurants || [];
    if (restaurants.length > 1) {
      // Multi-unit: consolidated block first, then per-restaurant sections
      FF.KPI.renderAll(sheet, blocks, classifiedSheets, config);
      restaurants.forEach(function(r) {
        var perSheets = classifiedSheets.filter(function(sd) { return sd.restaurantId === r.id; });
        if (perSheets.length === 0) return;
        FF.KPI.renderAll(sheet, blocks, perSheets, config, { sectionLabel: r.name });
      });
    } else {
      FF.KPI.renderAll(sheet, blocks, classifiedSheets, config);
    }

    sheet.setFrozenRows(2);

    FF.Debug.log('INFO', 'Dashboard', 'renderAll complete');
    FF.Menu.toast('Дашборд обновлён');
  }

  /**
   * Get or create the Dashboard sheet.
   * @param {Object} config
   * @returns {GoogleAppsScript.Spreadsheet.Sheet}
   */
  function getSheet(config) {
    var ss        = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = (config && config.sheets && config.sheets.dashboard) || '_FF_DASHBOARD';
    if (sheetName.indexOf('_FF_') !== 0) {
      FF.Debug.log('WARN', 'Dashboard',
        'Dashboard sheet name "' + sheetName + '" does not start with _FF_ prefix (SKILL.md §Usage #7)');
    }
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName, 0); // insert as first sheet
      FF.Debug.log('INFO', 'Dashboard', 'Created sheet: ' + sheetName);
    }
    return sheet;
  }

  /**
   * Clear dashboard content (preserve the sheet itself).
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   */
  function clearDashboard(sheet) {
    sheet.clearContents();
    sheet.clearFormats();
    // Reset tab color
    sheet.setTabColor('#0f3460');
    sheet.setTabColorObject(SpreadsheetApp.newColor().setRgbColor('#0f3460').build());
  }

  /**
   * Write dashboard title row and subtitle row.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   * @param {Object} config
   * @param {Array}  blocks
   */
  function writeHeader(sheet, config, blocks) {
    var companyName = (config && config.companyName) || 'Formula Finance';
    var available   = blocks.filter(function(b) { return b.isAvailable; }).length;
    var ts          = Utilities.formatDate(new Date(), 'Europe/Moscow', 'dd.MM.yyyy HH:mm');

    // Row 1: Title
    var titleRange = sheet.getRange(1, 1, 1, 10);
    titleRange.merge();
    titleRange.setValue('📊 ' + companyName + ' — Дашборд');
    titleRange.setBackground(BG_HEADER);
    titleRange.setFontColor(FG_TITLE);
    titleRange.setFontSize(16);
    titleRange.setFontWeight('bold');
    titleRange.setVerticalAlignment('middle');
    sheet.setRowHeight(1, 40);

    // Row 2: Subtitle (last updated + blocks count)
    var subRange = sheet.getRange(2, 1, 1, 10);
    subRange.merge();
    subRange.setValue('Обновлено: ' + ts + '  | Блоков активно: ' + available);
    subRange.setBackground(BG_HEADER);
    subRange.setFontColor(FG_SUB);
    subRange.setFontSize(9);
    subRange.setVerticalAlignment('middle');
    sheet.setRowHeight(2, 22);

    // Background for all used area
    var dataRange = sheet.getRange(3, 1, 200, 10);
    dataRange.setBackground(BG_MAIN);
  }

  /**
   * Apply column widths for the standard KPI card layout.
   * Cards: label(col A, 160px) + value(col B, 140px) × 3 cards = 6 cols
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   */
  function applyLayout(sheet) {
    var widths = [160, 140, 20, 160, 140, 20, 160, 140, 20, 80];
    widths.forEach(function(w, i) {
      sheet.setColumnWidth(i + 1, w);
    });
  }

  return { renderAll, getSheet, clearDashboard, writeHeader, applyLayout };

})();
