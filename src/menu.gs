// @ts-check
/**
 * menu.gs — Formula Finance v1.0.0
 * Custom Google Sheets menu builder.
 * Registers all user-facing menu items in the spreadsheet UI.
 *
 * NAMESPACE: FF.Menu
 * CALLED BY: onOpen() in main.gs
 */

'use strict';

var FF = FF || {};

FF.Menu = (function() {

  /** Menu item labels (centralised for easy i18n) */
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
    SpreadsheetApp.getUi()
      .createMenu(LABELS.ROOT)
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
   * @param {number} [timeout] - seconds (default 4)
   */
  function toast(message, title, timeout) {
    try {
      SpreadsheetApp.getActiveSpreadsheet()
        .toast(message, title || LABELS.ROOT, timeout || 4);
    } catch(e) {
      // Swallow: toast can fail in trigger context
    }
  }

  /**
   * Show a modal alert dialog.
   * @param {string} message
   * @param {string} [title]
   */
  function alert(message, title) {
    SpreadsheetApp.getUi().alert(
      title || LABELS.ROOT,
      message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }

  /**
   * Show a yes/no confirm dialog.
   * @param {string} message
   * @param {string} [title]
   * @returns {boolean}
   */
  function confirm(message, title) {
    var ui      = SpreadsheetApp.getUi();
    var result  = ui.alert(
      title || LABELS.ROOT,
      message,
      ui.ButtonSet.YES_NO
    );
    return result === ui.Button.YES;
  }

  /**
   * Show the "About" dialog with version info.
   */
  function showAbout() {
    alert(
      'Formula Finance v1.0.0 ' +
      'Система аналитики и KPI-дашбордов для HoReCa. ' +
      '📊 Дашборд | 📈 KPI | 📧 Рассылка | 🔍 Аналитика ' +
      '© Formula Finance 2024–' + new Date().getFullYear(),
      'О продукте'
    );
  }

  return { build, toast, alert, confirm, showAbout, LABELS };

})();
