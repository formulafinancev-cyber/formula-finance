// @ts-check
/**
 * main.gs — Formula Finance v1.0.0
 * Entry points for all user-facing functions.
 * Wires together all modules: Parser -> Classifier -> Registry -> Dashboard/KPI -> Email
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
 * Config -> Parse -> Classify -> Registry -> Dashboard+KPI -> HealthCheck
 */
function runAll() {
  var started = Date.now();
  var cfg     = FF.Config.load();
  FF.Debug.log('INFO', 'main', 'runAll started');

  try {
    // 1. Парсинг книг
    var raw = FF.Parser.readBook(cfg);
    FF.Debug.log('INFO', 'main', 'Parser: ' + raw.length + ' sheets');

    // 2. Классификация (мутирует массив, добавляя reportType/confidence)
    var classified = FF.Classifier.classify(raw);
    FF.Debug.log('INFO', 'main', 'Classifier: ' + classified.length + ' classified');

    // 3. Реестр доступных блоков
    var blocks = FF.Registry.buildAvailableBlocks(classified);
    var availableBlocks = blocks.filter(function(b) { return b.isAvailable; }).length;
    FF.Debug.log('INFO', 'main', 'Registry: ' + availableBlocks + '/' + blocks.length + ' blocks available');

    // 4. Dashboard + KPI (renderAll сам вызывает FF.KPI.renderAll)
    FF.Dashboard.renderAll(cfg, blocks, classified);
    FF.Debug.log('INFO', 'main', 'Dashboard+KPI rendered');

    // 5. Health-check
    var durationMs = Date.now() - started;
    FF.Debug.writeHealthCheck(cfg, {
      status:          'ok',
      sheetsRead:      raw.length,
      sheetsClassified:classified.length,
      blocksAvailable: availableBlocks,
      blocksTotal:     blocks.length,
      durationMs:      durationMs
    });

    FF.Menu.toast('Formula Finance обновлён', 'OK', 4);
  } catch (e) {
    FF.Debug.log('ERROR', 'main', 'runAll FATAL: ' + e.message, { stack: e.stack });
    FF.Menu.alert('Ошибка обновления: ' + e.message);
    throw e;
  }
}

/* ─────────────────────────────────────────────
   MENU HANDLERS
───────────────────────────────────────────── */

/** Меню → «Обновить дашборд» */
function menuUpdateAll() {
  var confirmed = FF.Menu.confirm(
    'Запустить полный пересчёт данных?',
    'Обновить дашборд?'
  );
  if (confirmed) runAll();
}

/** Меню → «Разослать отчёты» */
function menuSendReports() {
  var cfg = FF.Config.load();
  try {
    // Чтобы отчёты ссылались на актуальные блоки, пересобираем их быстро
    var raw        = FF.Parser.readBook(cfg);
    var classified = FF.Classifier.classify(raw);
    var blocks     = FF.Registry.buildAvailableBlocks(classified);
    FF.Email.sendAll(cfg, blocks, classified);
    FF.Menu.toast('Отчёты отправлены', 'Email', 4);
  } catch (e) {
    FF.Debug.log('ERROR', 'main', 'menuSendReports error: ' + e.message);
    FF.Menu.alert('Ошибка рассылки: ' + e.message);
  }
}

/** Меню → «Настройки» */
function menuOpenSettings() {
  var cfg = FF.Config.load();
  var ui  = SpreadsheetApp.getUi();
  var current = (cfg.sheets && cfg.sheets.dashboard) || '_FF_DASHBOARD';
  var result = ui.prompt(
    'Настройки',
    'Имя листа дашборда (текущий: ' + current + '):',
    ui.ButtonSet.OK_CANCEL
  );
  if (result.getSelectedButton() === ui.Button.OK) {
    var newName = result.getResponseText().trim();
    if (newName) {
      FF.Config.save('dashboardSheet', newName);
      FF.Menu.toast('Настройки сохранены', 'Config', 3);
    }
  }
}

/** Меню → «Лог покрытия» */
function menuOpenCoverageLog() {
  var cfg = FF.Config.load();
  try {
    var report = FF.Debug.getCoverageReport(cfg);
    FF.Menu.alert(report, 'Лог покрытия');
  } catch (e) {
    FF.Menu.alert('Ошибка: ' + e.message);
  }
}

/** Меню → «Очистить лог» */
function menuClearLog() {
  var cfg = FF.Config.load();
  var confirmed = FF.Menu.confirm('Очистить лист лога?', 'Очистка лога');
  if (!confirmed) return;
  try {
    FF.Debug.clearLog(cfg);
    FF.Menu.toast('Лог очищен', 'Debug', 3);
  } catch (e) {
    FF.Menu.alert('Ошибка: ' + e.message);
  }
}

/** Меню → «Запустить тесты» */
function menuRunTests() {
  try {
    var result = FF.Tests.runAll();
    var title  = result.failed === 0 ? '✅ Все тесты пройдены' : '⚠️ Есть падения';
    var msg    = 'Passed: ' + result.passed + '  |  Failed: ' + result.failed +
                 '\n\nПодробности — в листе _FF_TESTS.';
    FF.Menu.alert(msg, title);
  } catch (e) {
    FF.Menu.alert('Ошибка: ' + e.message);
  }
}

/** Меню → «Сбросить кеш парсера» */
function menuResetCache() {
  try {
    FF.Parser.resetCache();
    FF.Menu.toast('Кеш парсера сброшен', 'Cache', 3);
  } catch (e) {
    FF.Menu.alert('Ошибка: ' + e.message);
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
  FF.Debug.log('INFO', 'main', 'triggerDaily fired');
  runAll();
}

/** Еженедельный триггер (понедельник) */
function triggerWeekly() {
  FF.Debug.log('INFO', 'main', 'triggerWeekly fired');
  runAll();
  menuSendReports();
}

/** Ежемесячный триггер (1-е число) */
function triggerMonthly() {
  FF.Debug.log('INFO', 'main', 'triggerMonthly fired');
  runAll();
  menuSendReports();
}
