// @ts-check
/**
 * kpi.gs — Formula Finance v1.0.0
 * KPI card renderer. Computes metric values from classified SheetData
 * and renders styled KPI cards onto the Dashboard sheet.
 *
 * CARD FORMAT (3 columns per card):
 * [Label] [Value] [Delta vs prev period]
 *
 * NAMESPACE: FF.KPI
 */

'use strict';

var FF = FF || {};

FF.KPI = (function() {

  // --- Colour palette ---
  var COLOURS = {
    headerBg:    '#1a1a2e',
    headerFg:    '#ffffff',
    cardBg:      '#16213e',
    labelFg:     '#a0aec0',
    valueFg:     '#ffffff',
    positive:    '#48bb78',
    negative:    '#fc8181',
    neutral:     '#a0aec0',
    sectionBg:   '#0f3460'
  };

  /**
   * Render all available KPI cards onto the dashboard sheet.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - dashboard sheet
   * @param {Array} blocks - available blocks from FF.Registry
   * @param {Array} classifiedSheets - from FF.Classifier
   * @param {Object} config
   */
  function renderAll(sheet, blocks, classifiedSheets, config) {
    var available = blocks.filter(function(b) { return b.isAvailable; });
    FF.Debug.log('INFO', 'KPI', 'Rendering ' + available.length + ' KPI blocks');

    var row = 3; // start row (rows 1-2 are used by dashboard header)
    available.forEach(function(block) {
      row = renderBlock(sheet, block, classifiedSheets, config, row);
      row += 1; // gap between blocks
    });
  }

  /**
   * Render a single KPI block (group of cards).
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   * @param {Object} block - BlockDescriptor
   * @param {Array} classifiedSheets
   * @param {Object} config
   * @param {number} startRow
   * @returns {number} next available row
   */
  function renderBlock(sheet, block, classifiedSheets, config, startRow) {
    var currency = (config && config.currency) || '₽';

    // Section header
    var headerRange = sheet.getRange(startRow, 1, 1, 6);
    headerRange.merge();
    headerRange.setValue(block.label);
    headerRange.setBackground(COLOURS.sectionBg);
    headerRange.setFontColor(COLOURS.headerFg);
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    startRow++;

    // Compute metrics
    var metrics = _computeMetrics(block, classifiedSheets);

    // Render cards in rows of 3
    var col = 1;
    var cardRow = startRow;
    metrics.forEach(function(metric, idx) {
      if (idx > 0 && idx % 3 === 0) {
        cardRow++;
        col = 1;
      }
      renderCard(sheet, cardRow, col, metric, currency);
      col += 2;
    });

    return cardRow + 1;
  }

  /**
   * Render a single KPI card (label + value + delta).
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   * @param {number} row
   * @param {number} col
   * @param {Object} metric - { label, value, delta, format }
   * @param {string} currency
   */
  function renderCard(sheet, row, col, metric, currency) {
    try {
      var labelCell = sheet.getRange(row, col);
      var valueCell = sheet.getRange(row, col + 1);

      // Label
      labelCell.setValue(metric.label);
      labelCell.setFontColor(COLOURS.labelFg);
      labelCell.setFontSize(9);
      labelCell.setBackground(COLOURS.cardBg);

      // Value
      var displayValue = _formatValue(metric.value, metric.format, currency);
      valueCell.setValue(displayValue);
      valueCell.setFontColor(COLOURS.valueFg);
      valueCell.setFontSize(14);
      valueCell.setFontWeight('bold');
      valueCell.setBackground(COLOURS.cardBg);

      // Delta colouring
      if (metric.delta !== undefined && metric.delta !== null) {
        var deltaColor = metric.delta > 0 ? COLOURS.positive
                       : metric.delta < 0 ? COLOURS.negative
                       : COLOURS.neutral;
        valueCell.setFontColor(deltaColor);
      }
    } catch(e) {
      FF.Debug.log('ERROR', 'KPI', 'renderCard failed: ' + metric.label, e.message);
    }
  }

  // --- Metric computation ---

  /**
   * Compute metrics for a block from classified sheets.
   * @param {Object} block
   * @param {Array} classifiedSheets
   * @returns {Array} Array of { label, value, delta, format }
   */
  function _computeMetrics(block, classifiedSheets) {
    var metrics = [];
    block.requiredTypes.forEach(function(rt) {
      var sheets = classifiedSheets.filter(function(sd) { return sd.reportType === rt; });
      if (sheets.length === 0) return;
      var sd = sheets[0]; // use most recent

      switch(block.id) {
        case 'revenue_daily':
          metrics.push({ label: 'Выручка',       value: _sumColumn(sd.rows, _findRevenueCol(sd.headers)), format: 'currency', delta: null });
          metrics.push({ label: 'Средний чек',    value: _avgColumn(sd.rows,  _findCheckCol(sd.headers)),   format: 'currency', delta: null });
          metrics.push({ label: 'Гостей',        value: _countRows(sd.rows),                                   format: 'number',   delta: null });
          break;
        case 'top_dishes':
          var topDishes = _topN(sd.rows, _findRevenueCol(sd.headers), _findNameCol(sd.headers), 5);
          topDishes.forEach(function(d) {
            metrics.push({ label: d.name, value: d.value, format: 'currency', delta: null });
          });
          break;
        default:
          // Generic: sum all numeric columns
          sd.headers.slice(0, 3).forEach(function(h) {
            var sum = _sumColumn(sd.rows, h);
            if (sum !== null) metrics.push({ label: h, value: sum, format: 'number', delta: null });
          });
      }
    });
    return metrics.length > 0 ? metrics : [{ label: block.label, value: 'N/A', format: 'text', delta: null }];
  }

  // --- Column finders ---
  var REVENUE_ALIASES = ['выручка', 'сумма', 'итог', 'revenue', 'total', 'цена', 'сум'];
  var CHECK_ALIASES   = ['средний', 'avg', 'average', 'чек'];
  var NAME_ALIASES    = ['название', 'блюдо', 'номенклатура', 'name', 'dish'];

  function _findRevenueCol(headers) { return _findCol(headers, REVENUE_ALIASES); }
  function _findCheckCol(headers)   { return _findCol(headers, CHECK_ALIASES); }
  function _findNameCol(headers)    { return _findCol(headers, NAME_ALIASES); }

  function _findCol(headers, aliases) {
    var lower = headers.map(function(h) { return String(h).toLowerCase(); });
    for (var i = 0; i < aliases.length; i++) {
      for (var j = 0; j < lower.length; j++) {
        if (lower[j].indexOf(aliases[i]) >= 0) return headers[j];
      }
    }
    return headers[0] || null;
  }

  // --- Aggregation helpers ---
  function _sumColumn(rows, colName) {
    if (!colName) return null;
    var sum = 0; var count = 0;
    rows.forEach(function(r) {
      var v = r[colName];
      if (typeof v === 'number') { sum += v; count++; }
    });
    return count > 0 ? sum : null;
  }

  function _avgColumn(rows, colName) {
    if (!colName) return null;
    var sum = 0; var count = 0;
    rows.forEach(function(r) {
      var v = r[colName];
      if (typeof v === 'number') { sum += v; count++; }
    });
    return count > 0 ? Math.round(sum / count) : null;
  }

  function _countRows(rows) { return rows ? rows.length : 0; }

  function _topN(rows, valueCol, nameCol, n) {
    if (!valueCol || !nameCol) return [];
    var sorted = rows.filter(function(r) { return typeof r[valueCol] === 'number'; })
      .sort(function(a, b) { return b[valueCol] - a[valueCol]; })
      .slice(0, n);
    return sorted.map(function(r) { return { name: r[nameCol] || '?', value: r[valueCol] }; });
  }

  // --- Value formatter ---
  function _formatValue(value, format, currency) {
    if (value === null || value === undefined || value === 'N/A') return '—';
    switch(format) {
      case 'currency':
        return _numberFormat(value) + ' ' + (currency || '₽');
      case 'percent':
        return (Math.round(value * 10) / 10) + '%';
      case 'number':
        return _numberFormat(value);
      default:
        return String(value);
    }
  }

  function _numberFormat(num) {
    if (typeof num !== 'number') return String(num);
    return num.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
  }

  return { renderAll, renderBlock, renderCard };

})();
