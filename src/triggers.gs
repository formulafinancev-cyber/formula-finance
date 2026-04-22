// @ts-check
/**
 * triggers.gs — Formula Finance v1.0.0
 * Installable trigger manager.
 * Provides FF.Triggers namespace for creating, deleting and listing
 * time-based triggers that fire main.gs entry points.
 *
 * NAMESPACE: FF.Triggers
 * Called from: menuOpenSettings, manual setup
 */

'use strict';

var FF = FF || {};

FF.Triggers = (function () {

  /* ─────────────────────────────────────────────
     PRIVATE HELPERS
  ───────────────────────────────────────────── */

  /**
   * Удалить все существующие триггеры для функции с указанным именем.
   * @param {string} fnName
   */
  function _deleteByName(fnName) {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === fnName) {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }
  }

  /* ─────────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────────── */

  /**
   * setupAll() — устанавливает все три триггера сразу (с заменой старых).
   * Вызывается вручную из редактора Apps Script при первом развёртывании.
   */
  function setupAll() {
    setupDaily();
    setupWeekly();
    setupMonthly();
    Logger.log('FF.Triggers: all triggers installed');
  }

  /**
   * setupDaily() — ежедневный запуск в 06:00.
   */
  function setupDaily() {
    _deleteByName('triggerDaily');
    ScriptApp.newTrigger('triggerDaily')
      .timeBased()
      .everyDays(1)
      .atHour(6)
      .create();
    Logger.log('FF.Triggers: daily trigger set at 06:00');
  }

  /**
   * setupWeekly() — еженедельный запуск в понедельник в 07:00.
   */
  function setupWeekly() {
    _deleteByName('triggerWeekly');
    ScriptApp.newTrigger('triggerWeekly')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.MONDAY)
      .atHour(7)
      .create();
    Logger.log('FF.Triggers: weekly trigger set (Monday 07:00)');
  }

  /**
   * setupMonthly() — ежемесячный запуск 1-го числа в 08:00 (через 28-дневный таймер).
   * Apps Script не поддерживает нативный ежемесячный триггер;
   * замена — проверка даты внутри triggerDaily().
   */
  function setupMonthly() {
    _deleteByName('triggerMonthly');
    // Apps Script monthly workaround: fire every 28 days
    ScriptApp.newTrigger('triggerMonthly')
      .timeBased()
      .everyDays(28)
      .atHour(8)
      .create();
    Logger.log('FF.Triggers: monthly trigger set (every 28 days at 08:00)');
  }

  /**
   * deleteAll() — удаляет все триггеры Formula Finance.
   */
  function deleteAll() {
    _deleteByName('triggerDaily');
    _deleteByName('triggerWeekly');
    _deleteByName('triggerMonthly');
    Logger.log('FF.Triggers: all triggers deleted');
  }

  /**
   * list() — возвращает массив строк с действующими триггерами FF.
   * @returns {string[]}
   */
  function list() {
    var names = ['triggerDaily', 'triggerWeekly', 'triggerMonthly'];
    var triggers = ScriptApp.getProjectTriggers();
    var result = [];
    for (var i = 0; i < triggers.length; i++) {
      var fn = triggers[i].getHandlerFunction();
      if (names.indexOf(fn) !== -1) {
        result.push(
          fn + ' | ' +
          triggers[i].getEventType() + ' | id:' +
          triggers[i].getUniqueId()
        );
      }
    }
    return result;
  }

  /**
   * getStatus() — формирует читаемый статус для showAbout / debug-листа.
   * @returns {string}
   */
  function getStatus() {
    var items = list();
    if (items.length === 0) return '⚠️ Триггеры не установлены';
    return '✅ Установлено: ' + items.length + ' триггера\n' + items.join('\n');
  }

  return {
    setupAll    : setupAll,
    setupDaily  : setupDaily,
    setupWeekly : setupWeekly,
    setupMonthly: setupMonthly,
    deleteAll   : deleteAll,
    list        : list,
    getStatus   : getStatus
  };

}());
