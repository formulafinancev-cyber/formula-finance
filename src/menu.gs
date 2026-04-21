// @ts-check
/**
 * menu.gs — Formula Finance v1.0.0
 * Custom Google Sheets menu builder.
 * Registers all user-facing menu items in the spreadsheet UI.
 *
 * NAMESPACE: FF.Menu
 */

'use strict';

var FF = FF || {};

FF.Menu = (function() {

  /** Menu item labels */
  var LABELS = {
    ROOT:         '📊 Formula Finance',
    UPDATE_ALL:   '🔄 Обновить дашборд',
    SEND_REPORTS: '✉️ Разослать отчёты',
    SETTINGS:     '⚙️ Настройки',
    COVERAGE_LOG: '📝 Лог покрытия',
    CLEAR_LOG:    '🗑️ Очистить лог',
    ABOUT:        'ℹ️ О продукте'
  };

  /**
   * Build and register the custom menu in the spreadsheet.
   * Called from onOpen() in main.gs.
   */
  function build() {
    // TODO: implement
    var ui = SpreadsheetApp.getUi();
    ui.createMenu(LABELS.ROOT)
      .addItem(LABELS.UPDATE_ALL,   'menuUpdateAll')
      .addItem(LABELS.SEND_REPORTS, 'menuSendReports')
      .addSeparator()
      .addItem(LABELS.SETTINGS,     'menuOpenSettings')
      .addItem(LABELS.COVERAGE_LOG, 'menuOpenCoverageLog')
      .addItem(LABELS.CLEAR_LOG,    'menuClearLog')
      .addSeparator()
      .addItem(LABELS.ABOUT,        'menuAbout')
      .addToUi();
  }

  /**
   * Show a toast notification in the spreadsheet.
   * @param {string} message
   * @param {string} [title]
   * @param {number} [timeout] - seconds (default 3)
   */
  function toast(message, title, timeout) {
    SpreadsheetApp.getActiveSpreadsheet()
      .toast(message, title || LABELS.ROOT, timeout || 3);
  }

  /**
   * Show a modal alert dialog.
   * @param {string} message
   * @param {string} [title]
   */
  function alert(message, title) {
    SpreadsheetApp.getUi().alert(title || LABELS.ROOT, message,
      SpreadsheetApp.getUi().ButtonSet.OK);
  }

  return { build, toast, alert, LABELS };

})();
