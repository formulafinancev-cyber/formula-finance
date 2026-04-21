// @ts-check
/**
 * config.gs — Formula Finance v1.0.0
 * Reads and writes configuration from the _FF_CONFIG sheet.
 *
 * CONFIG SHEET STRUCTURE (_FF_CONFIG):
 * Row 1: Header
 * Rows 2+: Key | Value pairs
 *
 * Key config values:
 * - sourceBookIds: comma-separated Spreadsheet IDs to read data from
 * - companyName: name to display in dashboards and email headers
 * - ceoEmails: comma-separated email addresses for CEO reports
 * - cfoEmails: comma-separated email addresses for CFO reports
 * - opsEmails: comma-separated email addresses for Ops reports
 * - generalEmails: comma-separated email addresses for General reports
 * - customEmails: comma-separated email addresses for Custom reports
 * - triggerDaily: true/false — enable daily trigger
 * - triggerWeekly: true/false — enable weekly trigger
 * - triggerMonthly: true/false — enable monthly trigger
 * - currency: currency symbol (default: ₽)
 * - locale: ru/en
 * - timezone: timezone string (e.g., Europe/Moscow)
 */

'use strict';

var FF = FF || {};

FF.Config = (function() {

  const CONFIG_SHEET_NAME = '_FF_CONFIG';

  /**
   * Load all config values from the _FF_CONFIG sheet.
   * Returns a config object with defaults for missing values.
   * @returns {Object}
   */
  function load() {
    // TODO: implement
    // 1. Get or create _FF_CONFIG sheet
    // 2. Read Key-Value pairs
    // 3. Parse sourceBookIds into array
    // 4. Parse email lists into arrays
    // 5. Return config object with defaults
    return {};
  }

  /**
   * Save a single config value to the _FF_CONFIG sheet.
   * @param {string} key
   * @param {string} value
   */
  function set(key, value) {
    // TODO: implement
  }

  /**
   * Get or create the _FF_CONFIG sheet.
   * If it doesn't exist, create it with default structure.
   * @returns {GoogleAppsScript.Spreadsheet.Sheet}
   */
  function getOrCreateSheet() {
    // TODO: implement
    // - Check if _FF_CONFIG exists
    // - If not, create with headers and default values
  }

  /**
   * Open the settings UI (sidebar or dialog).
   * Shows current config in editable form.
   */
  function openSettingsUI() {
    // TODO: implement using HtmlService
  }

  return { load, set, getOrCreateSheet, openSettingsUI };

})();
