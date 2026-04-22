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

var FF = FF || {};

/* ─────────────────────────────────────────────
   LIFECYCLE
───────────────────────────────────────────── */

/**
 * onOpen() — вызывается автоматически при открытии таблицы.
 * Строит пользовательское меню через FF.Menu.
 */
function onOpen() {
  try {
    FF.Menu.build();
  } catch (e) {
    Logger.log('onOpen error: ' + e.message);
  }
}

/* ─────────────────────────────────────────────
   PIPELINE
───────────────────────────────────────────── */

/**
 * runAll() — полный конвейер обновления.
 * Config -> Parse -> Classify -> Registry -> KPI -> Dashboard -> Debug
 */
function runAll() {
  var cfg = FF.Config.load();
  FF.Debug.log('runAll started', 'INFO');

  try {
    // 1. Парсинг книги
    var raw = FF.Parser.readBook(cfg);
    FF.Debug.log('Parser: ' + raw.length + ' sheets', 'INFO');

    // 2. Классификация строк
    var rows = FF.Classifier.classifyAll(raw, cfg);
    FF.Debug.log('Classifier: ' + rows.length + ' rows', 'INFO');

    // 3. Реестр операций
    FF.Registry.build(rows, cfg);
    FF.Debug.log('Registry: built', 'INFO');

    // 4. KPI
    FF.KPI.renderAll(cfg);
    FF.Debug.log('KPI: rendered', 'INFO');

    // 5. Дашборды
    FF.Dashboard.renderAll(cfg);
    FF.Debug.log('Dashboard: rendered', 'INFO');

    // 6. Health-check
    FF.Debug.writeHealthCheck(cfg);

    FF.Menu.toast('Formula Finance обновлён', 'OK', 4);
  } catch (e) {
    FF.Debug.log('runAll FATAL: ' + e.message, 'ERROR');
    FF.Menu.alert('Ошибка обновления', e.message);
    throw e;
  }
}

/* ─────────────────────────────────────────────
   MENU HANDLERS
───────────────────────────────────────────── */

/** Меню → «Обновить дашборд» */
function menuUpdateAll() {
  var confirmed = FF.Menu.confirm(
    'Обновить дашборд?',
    'Запустить полный пересчёт данных?'
  );
  if (confirmed) runAll();
}

/** Меню → «Разослать отчёты» */
function menuSendReports() {
  var cfg = FF.Config.load();
  try {
    FF.Email.sendAll(cfg);
    FF.Menu.toast('Отчёты отправлены', 'Email', 4);
  } catch (e) {
    FF.Debug.log('menuSendReports error: ' + e.message, 'ERROR');
    FF.Menu.alert('Ошибка рассылки', e.message);
  }
}

/** Меню → «Настройки» */
function menuOpenSettings() {
  var cfg = FF.Config.load();
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt(
    'Настройки',
    'Введите имя листа с данными (текущий: ' + cfg.dataSheetName + '):',
    ui.ButtonSet.OK_CANCEL
  );
  if (result.getSelectedButton() === ui.Button.OK) {
    var newSheet = result.getResponseText().trim();
    if (newSheet) {
      cfg.dataSheetName = newSheet;
      FF.Config.save(cfg);
      FF.Menu.toast('Настройки сохранены', 'Config', 3);
    }
  }
}

/** Меню → «Лог покрытия» */
function menuOpenCoverageLog() {
  var cfg = FF.Config.load();
  try {
    var report = FF.Debug.getCoverageReport(cfg);
    FF.Menu.alert('Лог покрытия', report);
  } catch (e) {
    FF.Menu.alert('Ошибка', e.message);
  }
}

/** Меню → «О продукте» */
function menuAbout() {
  FF.Menu.showAbout();
}

/* ─────────────────────────────────────────────
   TRIGGERS
───────────────────────────────────────────── */

/** Ежедневный триггер (06:00) */
function triggerDaily() {
  FF.Debug.log('triggerDaily fired', 'INFO');
  runAll();
}

/** Еженедельный триггер (понедельник) */
function triggerWeekly() {
  FF.Debug.log('triggerWeekly fired', 'INFO');
  var cfg = FF.Config.load();
  runAll();
  FF.Email.sendAll(cfg);
}

/** Ежемесячный триггер (1-е число) */
function triggerMonthly() {
  FF.Debug.log('triggerMonthly fired', 'INFO');
  var cfg = FF.Config.load();
  runAll();
  FF.Email.sendAll(cfg);
  FF.Debug.writeHealthCheck(cfg);
}
