// @ts-check
/**
 * main.gs — Formula Finance v1.0.0
 * Entry points for all user-facing functions.
 * Wires together all modules: Parser -> Classifier -> Registry -> KPI/Dashboard -> Email
 *
 * NAMESPACE: FF (all modules attached to this global object)
 * RUNTIME: Apps Script V8
 *
 * Functions in this file are the only ones called directly by:
 *   - Custom menu items (FF.Menu)
 *   - Installable triggers (FF.Triggers)
 *   - Manual runs from Apps Script editor
 */

'use strict';

// Global namespace
var FF = FF || {};

/**
 * onOpen trigger — called when spreadsheet is opened.
 * Builds the custom 🧮 Formula Finance menu.
 */
function onOpen() {
  // TODO: implement
  // FF.Menu.build();
}

/**
 * Main orchestrator — runs the full pipeline:
 * 1. Read config from _FF_CONFIG sheet
 * 2. Parse all source workbooks
 * 3. Classify all sheets
 * 4. Build block registry
 * 5. Render all dashboards
 * 6. Refresh KPI cards
 * 7. Write Debug/health-check sheet
 */
function runAll() {
  // TODO: implement full pipeline
  // const config = FF.Config.load();
  // const parsedBooks = config.sourceIds.map(id => FF.Parser.readBook(id));
  // const classified = parsedBooks.flatMap(b => b.sheets.map(s => FF.Classifier.classify(s)));
  // const blocks = FF.Registry.buildAvailableBlocks(classified);
  // FF.Dashboard.renderAll(blocks);
  // FF.KPI.renderAll(blocks);
  // FF.Debug.writeHealthCheck(classified, blocks);
}

/**
 * Entry point for menu item "Обновить дашборд"
 */
function menuUpdateAll() {
  // TODO: implement
  // runAll();
}

/**
 * Entry point for menu item "Разослать отчёты"
 */
function menuSendReports() {
  // TODO: implement
  // FF.Email.sendAll(FF.Config.load());
}

/**
 * Entry point for menu item "Настройки"
 */
function menuOpenSettings() {
  // TODO: implement
  // FF.Config.openSettingsUI();
}

/**
 * Entry point for menu item "Лог покрытия"
 */
function menuOpenCoverageLog() {
  // TODO: implement
  // FF.Debug.openCoverageLog();
}

/**
 * Entry point for menu item "О продукте"
 */
function menuAbout() {
  // TODO: implement
  // FF.Menu.showAbout();
}

/**
 * Entry point for daily trigger
 */
function triggerDaily() {
  // TODO: implement
  // runAll();
  // FF.Email.sendRole('CEO', ...);
  // FF.Email.sendRole('CFO', ...);
}

/**
 * Entry point for weekly trigger
 */
function triggerWeekly() {
  // TODO: implement
}

/**
 * Entry point for monthly trigger
 */
function triggerMonthly() {
  // TODO: implement
}
