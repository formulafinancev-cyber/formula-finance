// @ts-check
/**
 * utils.gs — Formula Finance v1.0.0
 * Shared utility functions.
 * NAMESPACE: FF.Utils
 */

'use strict';

var FF = FF || {};

FF.Utils = (function () {

  /**
   * safeNumber(val) — безопасное преобразование в число, возвращает 0 при ошибке.
   * @param {*} val
   * @returns {number}
   */
  function safeNumber(val) {
    if (val === null || val === undefined || val === '') return 0;
    var num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }

  /**
   * safeString(val) — безопасное преобразование в строку, возвращает '' при null/undefined.
   * @param {*} val
   * @returns {string}
   */
  function safeString(val) {
    if (val === null || val === undefined) return '';
    return String(val).trim();
  }

  /**
   * formatCurrency(num) — форматировать число как валюту (руб.).
   * @param {number} num
   * @returns {string}
   */
  function formatCurrency(num) {
    return num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
  }

  /**
   * formatPercent(num) — форматировать число как процент.
   * @param {number} num
   * @returns {string}
   */
  function formatPercent(num) {
    return (num * 100).toFixed(1) + '%';
  }

  /**
   * dateToString(date) — формат даты в YYYY-MM-DD.
   * @param {Date} date
   * @returns {string}
   */
  function dateToString(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    var yyyy = date.getFullYear();
    var mm = ('0' + (date.getMonth() + 1)).slice(-2);
    var dd = ('0' + date.getDate()).slice(-2);
    return yyyy + '-' + mm + '-' + dd;
  }

  /**
   * isEmpty(arr) — проверка на пустоту массива.
   * @param {Array} arr
   * @returns {boolean}
   */
  function isEmpty(arr) {
    return !arr || arr.length === 0;
  }

  /**
   * clone(obj) — глубокое клонирование объекта/массива через JSON.
   * @param {*} obj
   * @returns {*}
   */
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * getSheetSafe(ss, name) — безопасное получение листа, создаёт если не существует.
   * @param {Spreadsheet} ss
   * @param {string} name
   * @returns {Sheet}
   */
  function getSheetSafe(ss, name) {
    var sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
    }
    return sh;
  }

  /**
   * clearSheet(sh) — очистить лист, оставить пустым.
   * @param {Sheet} sh
   */
  function clearSheet(sh) {
    sh.clear();
  }

  /**
   * setHeader(sh, headers) — записать заголовки в первой строке с форматированием.
   * @param {Sheet} sh
   * @param {string[]} headers
   */
  function setHeader(sh, headers) {
    if (isEmpty(headers)) return;
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold')
      .setBackground('#d9ead3');
  }

  /**
   * getMaxRows(sh) — вернуть последнюю заполненную строку.
   * @param {Sheet} sh
   * @returns {number}
   */
  function getMaxRows(sh) {
    return sh.getLastRow();
  }

  /**
   * appendRow(sh, data) — добавить строку в конец листа.
   * @param {Sheet} sh
   * @param {Array} data
   */
  function appendRow(sh, data) {
    sh.appendRow(data);
  }

  return {
    safeNumber    : safeNumber,
    safeString    : safeString,
    formatCurrency: formatCurrency,
    formatPercent : formatPercent,
    dateToString  : dateToString,
    isEmpty       : isEmpty,
    clone         : clone,
    getSheetSafe  : getSheetSafe,
    clearSheet    : clearSheet,
    setHeader     : setHeader,
    getMaxRows    : getMaxRows,
    appendRow     : appendRow
  };

}());
