// @ts-check
/**
 * parser.gs — Formula Finance v1.0.0
 * Raw sheet reader and data normalisation module.
 *
 * RESPONSIBILITIES:
 * - Open source workbooks by ID (SpreadsheetApp.openById)
 * - Iterate all sheets in each workbook
 * - Skip service sheets (_FF_*, Sheet1, Служебный, Темп, DEBUG)
 * - Return raw 2D arrays, normalised numbers, structured SheetData objects
 * - Handle merged cells, empty rows, comma decimal separators (Russian locale)
 * - Catch and log errors per sheet — never crash the whole pipeline
 *
 * OUTPUT STRUCTURE: Array<SheetData>
 * SheetData = { bookId, bookName, sheetName, headers, rows }
 * rows = Array<Object> keyed by header
 */

'use strict';

var FF = FF || {};

FF.Parser = (function() {

  /** Sheet names to always skip */
  var SKIP_SHEETS = [
    'Sheet1', 'Служебный', 'Темп', 'DEBUG', 'Log', 'Dashboard'
  ];
  var SKIP_PREFIX = '_FF_';

  /**
   * Read all source workbooks defined in config.
   * @param {Object} config - loaded FF.Config object
   * @returns {Array} Array of SheetData objects
   */
  function readBook(config) {
    var result = [];
    var bookIds = config.sourceBookIds || [];

    // If no external books configured, read the active spreadsheet
    if (bookIds.length === 0) {
      bookIds = [SpreadsheetApp.getActiveSpreadsheet().getId()];
    }

    bookIds.forEach(function(bookId) {
      bookId = String(bookId).trim();
      if (!bookId) return;
      try {
        var ss       = SpreadsheetApp.openById(bookId);
        var bookName = ss.getName();
        var sheets   = ss.getSheets();
        FF.Debug.log('INFO', 'Parser', 'Reading book: ' + bookName + ' (' + sheets.length + ' sheets)');

        sheets.forEach(function(sheet) {
          var sheetData = _readSheet(sheet, bookId, bookName);
          if (sheetData) result.push(sheetData);
        });
      } catch(e) {
        FF.Debug.log('ERROR', 'Parser', 'Cannot open book: ' + bookId, e.message);
      }
    });

    FF.Debug.log('INFO', 'Parser', 'Total SheetData objects: ' + result.length);
    return result;
  }

  /**
   * Read and normalise a single sheet.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   * @param {string} bookId
   * @param {string} bookName
   * @returns {Object|null} SheetData or null if sheet should be skipped
   */
  function _readSheet(sheet, bookId, bookName) {
    var sheetName = sheet.getName();

    // Skip service sheets
    if (_shouldSkip(sheetName)) {
      FF.Debug.log('INFO', 'Parser', 'Skipping sheet: ' + sheetName);
      return null;
    }

    try {
      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();

      if (lastRow < 2 || lastCol < 1) {
        FF.Debug.log('WARN', 'Parser', 'Empty sheet: ' + sheetName);
        return null;
      }

      // Read all values
      var rawValues = sheet.getRange(1, 1, lastRow, lastCol).getValues();

      // First non-empty row = headers
      var headerRowIdx = _findHeaderRow(rawValues);
      if (headerRowIdx < 0) {
        FF.Debug.log('WARN', 'Parser', 'No header row found in: ' + sheetName);
        return null;
      }

      var headers = rawValues[headerRowIdx].map(function(h) {
        return String(h).trim();
      });

      // Parse data rows
      var rows = [];
      for (var r = headerRowIdx + 1; r < rawValues.length; r++) {
        var rawRow = rawValues[r];
        // Skip completely empty rows
        if (_isEmptyRow(rawRow)) continue;

        var rowObj = {};
        headers.forEach(function(header, colIdx) {
          if (!header) return;
          rowObj[header] = _normaliseValue(rawRow[colIdx]);
        });
        rows.push(rowObj);
      }

      if (rows.length === 0) {
        FF.Debug.log('WARN', 'Parser', 'No data rows in: ' + sheetName);
        return null;
      }

      FF.Debug.log('INFO', 'Parser', sheetName + ': ' + rows.length + ' rows, ' + headers.filter(Boolean).length + ' cols');

      return {
        bookId:    bookId,
        bookName:  bookName,
        sheetName: sheetName,
        headers:   headers.filter(Boolean),
        rows:      rows
      };

    } catch(e) {
      FF.Debug.log('ERROR', 'Parser', 'Error reading sheet: ' + sheetName, e.message);
      return null;
    }
  }

  /**
   * Find the first row index that looks like a header
   * (has at least 2 non-empty string cells).
   * @param {Array[][]} values
   * @returns {number} row index or -1
   */
  function _findHeaderRow(values) {
    for (var i = 0; i < Math.min(values.length, 10); i++) {
      var row = values[i];
      var textCells = row.filter(function(cell) {
        return cell !== '' && cell !== null && isNaN(Number(cell));
      });
      if (textCells.length >= 2) return i;
    }
    return 0; // fallback: row 0
  }

  /**
   * Normalise a cell value:
   * - Dates → ISO string
   * - Strings with comma decimals → numbers
   * - Trimmed strings
   * @param {*} val
   * @returns {*}
   */
  function _normaliseValue(val) {
    if (val === null || val === undefined || val === '') return null;

    // Date objects
    if (val instanceof Date) {
      return Utilities.formatDate(val, 'Europe/Moscow', 'yyyy-MM-dd');
    }

    // Numbers
    if (typeof val === 'number') return val;

    // Strings
    var str = String(val).trim();
    if (str === '') return null;

    // Russian number format: "1 234,56" or "1234,56"
    var numStr = str.replace(/\s/g, '').replace(',', '.');
    var num = parseFloat(numStr);
    if (!isNaN(num) && numStr.match(/^-?[\d.]+$/)) return num;

    return str;
  }

  /**
   * Determine if a row is completely empty.
   * @param {Array} row
   * @returns {boolean}
   */
  function _isEmptyRow(row) {
    return row.every(function(cell) {
      return cell === null || cell === undefined || cell === '';
    });
  }

  /**
   * Determine if a sheet should be skipped.
   * @param {string} sheetName
   * @returns {boolean}
   */
  function _shouldSkip(sheetName) {
    if (sheetName.indexOf(SKIP_PREFIX) === 0) return true;
    return SKIP_SHEETS.indexOf(sheetName) >= 0;
  }

  return { readBook };

})();
