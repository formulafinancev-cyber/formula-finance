// @ts-check
/**
 * classifier.gs — Formula Finance v1.0.0
 * Fuzzy report-type classifier for iiko Google Sheets exports.
 *
 * ALGORITHM (5-step pipeline, see docs/06-fuzzy-parsing.md):
 * 1. Normalise sheet name (lowercase, strip punctuation, strip dates)
 * 2. Strip noise suffixes (копия, copy, month names, Q1-Q4)
 * 3. Match against REPORT_PATTERNS keyword groups (confidence scoring)
 * 4. Fallback: scan top-5 header rows for matching keywords
 * 5. Return { type, confidence, sheetName, norm }
 *
 * REPORT TYPES defined in REPORT_PATTERNS below.
 * Confidence: 1.0 = exact, 0.7+ = high, 0.4+ = medium, <0.4 = UNKNOWN
 */

'use strict';

var FF = FF || {};

FF.Classifier = (function() {

  var CONFIDENCE_THRESHOLD = 0.4;

  /**
   * Report type patterns.
   * Each entry: { type, keywords[], weight }
   * Keywords matched against normalised sheet name and headers.
   */
  var REPORT_PATTERNS = [
    // Revenue / Sales
    { type: 'SALES_SUMMARY',      keywords: ['выручка', 'сумма', 'итог', 'продажа', 'sales', 'revenue', 'total'] },
    { type: 'SALES_BY_DISH',      keywords: ['блюдо', 'позиция', 'номенклатура', 'dish', 'продажаблюд'] },
    { type: 'SALES_BY_CATEGORY',  keywords: ['категория', 'группа', 'раздел', 'category', 'group'] },
    { type: 'SALES_BY_WAITER',    keywords: ['официант', 'продавец', 'waiter', 'cashier', 'кассир'] },
    { type: 'SALES_BY_HOUR',      keywords: ['час', 'время', 'почас', 'hour', 'time', 'hourly'] },
    { type: 'SALES_BY_TABLE',     keywords: ['стол', 'table', 'зона'] },
    { type: 'SALES_BY_HALL',      keywords: ['зал', 'холл', 'hall', 'площадка'] },
    // OLIFW / Writeoffs
    { type: 'WRITEOFFS',          keywords: ['списание', 'списанъ', 'writeoff', 'потеря'] },
    // Cash / Finance
    { type: 'CASH_FLOW',          keywords: ['касса', 'оплата', 'поступление', 'cash', 'payment'] },
    { type: 'TRANSACTIONS',       keywords: ['транзакция', 'чек', 'transaction', 'receipt', 'проведен'] },
    // Staff
    { type: 'STAFF_HOURS',        keywords: ['персонал', 'работа', 'часы', 'staff', 'hours', 'employee'] },
    // Inventory / Stock
    { type: 'INVENTORY',          keywords: ['склад', 'остаток', 'инвентариз', 'stock', 'inventory', 'balance'] },
    { type: 'SUPPLY',             keywords: ['приход', 'поставка', 'поставщик', 'supply', 'invoice', 'purchase'] },
    // Reservations
    { type: 'RESERVATIONS',       keywords: ['бронь', 'резерв', 'reservation', 'booking'] },
    // Delivery
    { type: 'DELIVERY',           keywords: ['доставка', 'delivery', 'курьер'] },
    // Loyalty
    { type: 'LOYALTY',            keywords: ['лояльность', 'клиент', 'loyalty', 'guest', 'crm'] }
  ];

  /** Month names for stripping from sheet names */
  var MONTH_NAMES = [
    'январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август',
    'сентябр', 'октябр', 'ноябр', 'декабр',
    'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  /**
   * Classify an array of SheetData objects.
   * Attaches .reportType and .confidence to each.
   * @param {Array} sheetDataArr - output from FF.Parser.readBook()
   * @returns {Array} same array with type/confidence added
   */
  function classify(sheetDataArr) {
    FF.Debug.log('INFO', 'Classifier', 'Classifying ' + sheetDataArr.length + ' sheets');
    var unknown = 0;
    sheetDataArr.forEach(function(sd) {
      var result = classifyOne(sd.sheetName, sd.headers);
      sd.reportType  = result.type;
      sd.confidence  = result.confidence;
      sd.norm        = result.norm;
      if (result.type === 'UNKNOWN') unknown++;
    });
    FF.Debug.log('INFO', 'Classifier', 'Unknown: ' + unknown + '/' + sheetDataArr.length);
    return sheetDataArr;
  }

  /**
   * Classify a single sheet by name + headers.
   * @param {string} sheetName
   * @param {string[]} [headers]
   * @returns {{ type: string, confidence: number, norm: string }}
   */
  function classifyOne(sheetName, headers) {
    var norm = _normalise(sheetName);
    var best = { type: 'UNKNOWN', confidence: 0, norm: norm };

    REPORT_PATTERNS.forEach(function(pattern) {
      var score = _scorePattern(norm, pattern.keywords);
      // Fallback: also score against headers
      if (headers && headers.length > 0) {
        var headerNorm = headers.slice(0, 10).map(_normalise).join(' ');
        var headerScore = _scorePattern(headerNorm, pattern.keywords) * 0.6;
        score = Math.max(score, headerScore);
      }
      if (score > best.confidence) {
        best.confidence = score;
        best.type       = pattern.type;
      }
    });

    if (best.confidence < CONFIDENCE_THRESHOLD) {
      best.type = 'UNKNOWN';
    }

    return best;
  }

  // --- private helpers ---

  /**
   * Normalise a string for matching.
   * Lowercases, strips dates, strips noise words.
   * @param {string} str
   * @returns {string}
   */
  function _normalise(str) {
    if (!str) return '';
    var s = String(str).toLowerCase();
    // Strip dates: YYYY, MM.YYYY, DD.MM.YYYY
    s = s.replace(/\b\d{1,2}\.\d{1,2}\.?\d{0,4}\b/g, ' ');
    s = s.replace(/\b20\d{2}\b/g, ' ');
    // Strip quarters
    s = s.replace(/\bq[1-4]\b/g, ' ');
    // Strip month names
    MONTH_NAMES.forEach(function(m) {
      s = s.replace(new RegExp('\\b' + m + '\\w*\\b', 'g'), ' ');
    });
    // Strip noise
    s = s.replace(/\b(копия|copy|коп|врем|нов|new|old|\d+)\b/g, ' ');
    // Strip punctuation
    s = s.replace(/[^\u0430-\u044fa-z\s]/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }

  /**
   * Score how well a string matches a keyword list.
   * @param {string} norm - normalised text
   * @param {string[]} keywords
   * @returns {number} 0..1
   */
  function _scorePattern(norm, keywords) {
    if (!norm || keywords.length === 0) return 0;
    var hits = 0;
    keywords.forEach(function(kw) {
      if (norm.indexOf(kw) >= 0) hits++;
    });
    return hits / keywords.length;
  }

  return { classify, classifyOne };

})();
