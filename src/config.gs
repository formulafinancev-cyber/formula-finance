// @ts-check
/**
 * config.gs — Formula Finance v1.0.0
 * Reads and writes configuration from the _FF_CONFIG sheet.
 *
 * CONFIG SHEET STRUCTURE (_FF_CONFIG):
 * Row 1: Header (Key | Value)
 * Rows 2+: key | value pairs
 *
 * Supported keys:
 * - sourceBookIds     : comma-separated Spreadsheet IDs
 * - companyName       : display name
 * - ceoEmails         : comma-separated
 * - cfoEmails         : comma-separated
 * - opsEmails         : comma-separated
 * - generalEmails     : comma-separated
 * - currency          : default ₽
 * - locale            : ru | en
 * - timezone          : e.g. Europe/Moscow
 * - triggerDaily      : true/false
 * - triggerWeekly     : true/false
 * - triggerMonthly    : true/false
 * - dashboardSheet    : sheet name for dashboard
 * - logSheet          : sheet name for log
 */

'use strict';

var FF = FF || {};

FF.Config = (function() {

  var CONFIG_SHEET_NAME = '_FF_CONFIG';

  /** Default values used when a key is absent from the config sheet */
  var DEFAULTS = {
    companyName:    'Formula Finance',
    currency:       '₽',
    locale:         'ru',
    timezone:       'Europe/Moscow',
    triggerDaily:   false,
    triggerWeekly:  false,
    triggerMonthly: false,
    dashboardSheet: 'Dashboard',
    logSheet:       'Log',
    sourceBookIds:  [],
    ceoEmails:      [],
    cfoEmails:      [],
    opsEmails:      [],
    generalEmails:  []
  };

  /**
   * Load all config values from the _FF_CONFIG sheet.
   * @returns {Object} config object
   */
  function load() {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    if (!sheet) {
      FF.Debug && FF.Debug.log('WARN', 'Config', 'Sheet "' + CONFIG_SHEET_NAME + '" not found — using defaults');
      return _buildConfig({});
    }

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return _buildConfig({});

    var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    var raw  = {};
    data.forEach(function(row) {
      var key = String(row[0]).trim();
      var val = String(row[1]).trim();
      if (key) raw[key] = val;
    });

    return _buildConfig(raw);
  }

  /**
   * Build a typed config object from raw key/value pairs.
   * @param {Object} raw
   * @returns {Object}
   */
  function _buildConfig(raw) {
    return {
      companyName:    raw.companyName    || DEFAULTS.companyName,
      currency:       raw.currency       || DEFAULTS.currency,
      locale:         raw.locale         || DEFAULTS.locale,
      timezone:       raw.timezone       || DEFAULTS.timezone,
      triggerDaily:   _bool(raw.triggerDaily,   DEFAULTS.triggerDaily),
      triggerWeekly:  _bool(raw.triggerWeekly,  DEFAULTS.triggerWeekly),
      triggerMonthly: _bool(raw.triggerMonthly, DEFAULTS.triggerMonthly),
      sheets: {
        dashboard: raw.dashboardSheet || DEFAULTS.dashboardSheet,
        log:       raw.logSheet       || DEFAULTS.logSheet
      },
      sourceBookIds:  _csvArray(raw.sourceBookIds),
      emails: {
        ceo:     _csvArray(raw.ceoEmails),
        cfo:     _csvArray(raw.cfoEmails),
        ops:     _csvArray(raw.opsEmails),
        general: _csvArray(raw.generalEmails)
      }
    };
  }

  /**
   * Save a single key/value pair to the config sheet.
   * Creates the sheet and writes a header if it doesn’t exist.
   * @param {string} key
   * @param {string} value
   */
  function save(key, value) {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG_SHEET_NAME);
      sheet.appendRow(['Key', 'Value']);
      sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
    }

    // Search for existing key
    var lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      var keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < keys.length; i++) {
        if (String(keys[i][0]).trim() === key) {
          sheet.getRange(i + 2, 2).setValue(value);
          return;
        }
      }
    }
    // Key not found — append new row
    sheet.appendRow([key, value]);
  }

  /**
   * Open (or create) the config sheet and make it active.
   */
  function openSheet() {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG_SHEET_NAME);
      _writeDefaultSheet(sheet);
    }
    ss.setActiveSheet(sheet);
  }

  /**
   * Populate the config sheet with default key/value rows.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   */
  function _writeDefaultSheet(sheet) {
    var rows = [
      ['Key', 'Value'],
      ['companyName',    'Formula Finance'],
      ['currency',       '₽'],
      ['locale',         'ru'],
      ['timezone',       'Europe/Moscow'],
      ['dashboardSheet', 'Dashboard'],
      ['logSheet',       'Log'],
      ['sourceBookIds',  ''],
      ['ceoEmails',      ''],
      ['cfoEmails',      ''],
      ['opsEmails',      ''],
      ['generalEmails',  ''],
      ['triggerDaily',   'false'],
      ['triggerWeekly',  'false'],
      ['triggerMonthly', 'false']
    ];
    sheet.clearContents();
    sheet.getRange(1, 1, rows.length, 2).setValues(rows);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
    sheet.autoResizeColumns(1, 2);
  }

  // --- helpers ---

  function _bool(val, def) {
    if (val === undefined || val === null || val === '') return def;
    return String(val).trim().toLowerCase() === 'true';
  }

  function _csvArray(val) {
    if (!val || String(val).trim() === '') return [];
    return String(val).split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  }

  return { load, save, openSheet };

})();
