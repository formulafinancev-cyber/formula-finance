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
  var SKIP_PREFIX   = '_FF_';
  var CACHE_TTL_SEC = 300;     // per master prompt
  var CACHE_MAX_BYTES = 95000; // CacheService per-key limit is 100 KB; leave headroom

  /**
   * Read all source workbooks defined in config.
   * Caches the parsed output in CacheService for up to CACHE_TTL_SEC seconds.
   * Cache is invalidated if any source book's lastUpdated timestamp is newer
   * than the cache entry, or if sourceBookIds changes.
   * @param {Object} config - loaded FF.Config object
   * @returns {Array} Array of SheetData objects
   */
  function readBook(config) {
    var bookIds = (config.sourceBookIds && config.sourceBookIds.length > 0)
      ? config.sourceBookIds
      : [SpreadsheetApp.getActiveSpreadsheet().getId()];

    var restaurantNames = (config.restaurantNames && config.restaurantNames.length > 0)
      ? config.restaurantNames
      : [];

    var cacheKey = _cacheKey(bookIds);
    var cache    = _tryGetCache();
    if (cache) {
      var hit = _readCache(cache, cacheKey, bookIds);
      if (hit) {
        FF.Debug.log('INFO', 'Parser', 'Cache HIT — returning ' + hit.length + ' sheets from cache');
        return hit;
      }
    }

    var result = _readBookUncached(bookIds, restaurantNames);

    if (cache) _writeCache(cache, cacheKey, result);

    FF.Debug.log('INFO', 'Parser', 'Total SheetData objects: ' + result.length);
    return result;
  }

  /**
   * Remove the parser's cache entry (all variants of bookIds keyed under
   * this script are dropped because we cannot enumerate keys — we clear
   * the whole script cache's known prefix via ScriptProperties fingerprint).
   * Safe to call from a menu item.
   */
  function resetCache() {
    var cache = _tryGetCache();
    if (!cache) return;
    var props   = PropertiesService.getScriptProperties();
    var lastKey = props.getProperty('FF_parser_lastKey');
    if (lastKey) cache.remove(lastKey);
    FF.Debug.log('INFO', 'Parser', 'Parser cache reset');
  }

  /**
   * Actual read loop (no caching). Extracted so the cache layer can wrap it.
   * @param {string[]} bookIds
   * @param {string[]} restaurantNames - parallel to bookIds, may be shorter
   * @returns {Array}
   */
  function _readBookUncached(bookIds, restaurantNames) {
    var result = [];
    bookIds.forEach(function(bookId, idx) {
      bookId = String(bookId).trim();
      if (!bookId) return;
      var restaurantName = restaurantNames[idx] || '';
      try {
        var ss       = SpreadsheetApp.openById(bookId);
        var bookName = ss.getName();
        var sheets   = ss.getSheets();
        FF.Debug.log('INFO', 'Parser', 'Reading book: ' + bookName + ' (' + sheets.length + ' sheets)');

        sheets.forEach(function(sheet) {
          var sheetData = _readSheet(sheet, bookId, bookName);
          if (sheetData) {
            sheetData.restaurantId   = bookId;
            sheetData.restaurantName = restaurantName || bookName;
            result.push(sheetData);
          }
        });
      } catch(e) {
        FF.Debug.log('ERROR', 'Parser', 'Cannot open book: ' + bookId, e.message);
      }
    });
    return result;
  }

  // --- cache helpers ---

  function _tryGetCache() {
    try { return CacheService.getScriptCache(); }
    catch (e) { return null; }
  }

  function _cacheKey(bookIds) {
    var joined = bookIds.slice().sort().join(',');
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, joined);
    return 'FF_parser_' + Utilities.base64EncodeWebSafe(digest);
  }

  function _readCache(cache, key, bookIds) {
    var raw = cache.get(key);
    if (!raw) return null;
    var entry;
    try { entry = JSON.parse(raw); }
    catch (e) { return null; }
    if (!entry || !entry.ts || !Array.isArray(entry.data)) return null;

    // Invalidate if any source book has been edited since cache write
    for (var i = 0; i < bookIds.length; i++) {
      try {
        var lastUpdated = SpreadsheetApp.openById(bookIds[i]).getLastUpdated().getTime();
        if (lastUpdated > entry.ts) {
          FF.Debug.log('INFO', 'Parser', 'Cache stale — book edited after write');
          return null;
        }
      } catch (e) {
        // If we cannot verify, prefer a fresh read
        return null;
      }
    }
    return entry.data;
  }

  function _writeCache(cache, key, data) {
    try {
      var payload = JSON.stringify({ ts: Date.now(), data: data });
      if (payload.length > CACHE_MAX_BYTES) {
        FF.Debug.log('WARN', 'Parser',
          'Skipping cache — payload ' + payload.length + 'B exceeds ' + CACHE_MAX_BYTES + 'B limit');
        return;
      }
      cache.put(key, payload, CACHE_TTL_SEC);
      PropertiesService.getScriptProperties().setProperty('FF_parser_lastKey', key);
    } catch (e) {
      FF.Debug.log('WARN', 'Parser', 'Cache write failed: ' + e.message);
    }
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

  return { readBook, resetCache };

})();
