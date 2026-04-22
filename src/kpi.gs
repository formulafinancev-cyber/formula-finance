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

  // State for multi-unit rendering: next available row across sequential sections
  var _nextRow = 3;

  /**
   * Render all available KPI cards onto the dashboard sheet.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - dashboard sheet
   * @param {Array} blocks - available blocks from FF.Registry
   * @param {Array} classifiedSheets - from FF.Classifier
   * @param {Object} config
   * @param {Object} [opts] - { sectionLabel: string } for per-restaurant sections
   */
  function renderAll(sheet, blocks, classifiedSheets, config, opts) {
    var available = blocks.filter(function(b) { return b.isAvailable; });
    var label     = opts && opts.sectionLabel;
    FF.Debug.log('INFO', 'KPI',
      'Rendering ' + available.length + ' KPI blocks' + (label ? ' [' + label + ']' : ''));

    // Reset row cursor on the main (consolidated) render; reuse for per-restaurant sections
    if (!label) _nextRow = 3;

    if (label) {
      var hdr = sheet.getRange(_nextRow, 1, 1, 10);
      hdr.merge();
      hdr.setValue('🏢 ' + label);
      hdr.setBackground(COLOURS.headerBg);
      hdr.setFontColor(COLOURS.headerFg);
      hdr.setFontWeight('bold');
      hdr.setFontSize(12);
      _nextRow += 1;
    }

    available.forEach(function(block) {
      _nextRow = renderBlock(sheet, block, classifiedSheets, config, _nextRow);
      _nextRow += 1; // gap between blocks
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

      switch(block.id) {
        case 'revenue_daily':
          var revenueSum = 0;
          var guestsSum  = 0;
          sheets.forEach(function(sd) {
            var r = _sumColumn(sd.rows, _findRevenueCol(sd.headers));
            var g = _sumColumn(sd.rows, _findGuestsCol(sd.headers));
            if (r !== null) revenueSum += r;
            // fallback: row count as proxy for guest/cheque count if column missing
            guestsSum += (g !== null ? g : _countRows(sd.rows));
          });
          var avgCheck = guestsSum > 0 ? Math.round(revenueSum / guestsSum) : null;
          metrics.push({ label: 'Выручка',     value: revenueSum || null, format: 'currency', delta: null });
          metrics.push({ label: 'Средний чек', value: avgCheck,            format: 'currency', delta: null });
          metrics.push({ label: 'Гостей',      value: guestsSum || null,   format: 'number',   delta: null });
          break;

        case 'forecast_revenue':
          if (!FF.Forecast) {
            metrics.push({ label: 'Прогноз', value: 'N/A', format: 'text', delta: null });
            break;
          }
          var series = FF.Forecast.extractRevenueSeries(sheets);
          if (!FF.Forecast.isEnoughData(series)) {
            metrics.push({
              label:  'Прогноз выручки',
              value:  'Нужно ≥' + FF.Forecast.MIN_POINTS + ' точек (есть ' + series.length + ')',
              format: 'text',
              delta:  null
            });
            break;
          }
          var fc = FF.Forecast.predictRevenue(series, 7);
          if (!fc) {
            metrics.push({ label: 'Прогноз выручки', value: 'Ошибка расчёта', format: 'text', delta: null });
            break;
          }
          var forecastTotal = fc.forecast.reduce(function(s, p) { return s + p.value; }, 0);
          var confidencePct = Math.round(Math.max(0, fc.r2) * 100);
          metrics.push({ label: 'Прогноз на 7 дн.',   value: forecastTotal, format: 'currency', delta: null });
          metrics.push({ label: 'Точность (R²)',      value: confidencePct, format: 'percent',  delta: null });
          return; // forecast_revenue produces exactly these two cards — skip generic fallthrough

        case 'top_dishes':
          // Aggregate top dishes across all matching sheets
          var agg = {};
          sheets.forEach(function(sd) {
            var valueCol = _findRevenueCol(sd.headers);
            var nameCol  = _findNameCol(sd.headers);
            if (!valueCol || !nameCol) return;
            sd.rows.forEach(function(row) {
              var name = row[nameCol];
              var val  = row[valueCol];
              if (!name || typeof val !== 'number') return;
              agg[name] = (agg[name] || 0) + val;
            });
          });
          Object.keys(agg).sort(function(a, b) { return agg[b] - agg[a]; }).slice(0, 5).forEach(function(name) {
            metrics.push({ label: name, value: agg[name], format: 'currency', delta: null });
          });
          break;

        default:
          // Generic: sum the first 3 headers across all sheets of this type
          var unionHeaders = _unionHeaders(sheets).slice(0, 3);
          unionHeaders.forEach(function(h) {
            var total = 0;
            var seen  = false;
            sheets.forEach(function(sd) {
              var s = _sumColumn(sd.rows, h);
              if (s !== null) { total += s; seen = true; }
            });
            if (seen) metrics.push({ label: h, value: total, format: 'number', delta: null });
          });
      }
    });
    return metrics.length > 0 ? metrics : [{ label: block.label, value: 'N/A', format: 'text', delta: null }];
  }

  function _unionHeaders(sheets) {
    var seen = {};
    var out  = [];
    sheets.forEach(function(sd) {
      (sd.headers || []).forEach(function(h) {
        if (h && !seen[h]) { seen[h] = true; out.push(h); }
      });
    });
    return out;
  }

  // --- Column finders ---
  var REVENUE_ALIASES = ['выручка', 'сумма', 'итог', 'revenue', 'total', 'цена', 'сум'];
  var CHECK_ALIASES   = ['средний', 'avg', 'average', 'чек'];
  var NAME_ALIASES    = ['название', 'блюдо', 'номенклатура', 'name', 'dish'];
  var GUESTS_ALIASES  = ['гост', 'чеки', 'посетит', 'covers', 'guests', 'customers', 'кол-во чеков'];

  function _findRevenueCol(headers) { return _findCol(headers, REVENUE_ALIASES); }
  function _findCheckCol(headers)   { return _findCol(headers, CHECK_ALIASES); }
  function _findNameCol(headers)    { return _findCol(headers, NAME_ALIASES); }
  function _findGuestsCol(headers)  { return _findColStrict(headers, GUESTS_ALIASES); }

  function _findColStrict(headers, aliases) {
    var lower = (headers || []).map(function(h) { return String(h).toLowerCase(); });
    for (var i = 0; i < aliases.length; i++) {
      for (var j = 0; j < lower.length; j++) {
        if (lower[j].indexOf(aliases[i]) >= 0) return headers[j];
      }
    }
    return null;
  }

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
