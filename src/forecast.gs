// @ts-check
/**
 * forecast.gs — Formula Finance v1.0.0
 * Lightweight time-series forecasting for revenue projections.
 *
 * ALGORITHMS:
 * - linearRegression(points)    — ordinary least squares on (x, y) pairs
 * - predictRevenue(series, N)   — extrapolates N future points via OLS
 * - seasonalAdjust(series, P)   — optional: subtract P-period moving-average
 *
 * PRECONDITION:
 * - Series must have ≥ MIN_POINTS usable numeric points
 * - Undefined/NaN points are skipped
 *
 * NAMESPACE: FF.Forecast
 */

'use strict';

var FF = FF || {};

FF.Forecast = (function() {

  var MIN_POINTS       = 12;  // ≥ ~3 months of weekly data (or 12 daily points)
  var MIN_POINTS_SHORT = 3;   // absolute floor (3 monthly points)

  /**
   * Ordinary least-squares linear regression.
   * @param {Array<{x:number, y:number}>} points
   * @returns {{slope:number, intercept:number, r2:number}|null}
   */
  function linearRegression(points) {
    var clean = (points || []).filter(function(p) {
      return p && typeof p.x === 'number' && typeof p.y === 'number' && !isNaN(p.y);
    });
    if (clean.length < MIN_POINTS_SHORT) return null;

    var n    = clean.length;
    var sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
    clean.forEach(function(p) {
      sumX  += p.x;
      sumY  += p.y;
      sumXY += p.x * p.y;
      sumXX += p.x * p.x;
      sumYY += p.y * p.y;
    });

    var denom = n * sumXX - sumX * sumX;
    if (denom === 0) return null;

    var slope     = (n * sumXY - sumX * sumY) / denom;
    var intercept = (sumY - slope * sumX) / n;

    // Coefficient of determination
    var ssTot = sumYY - (sumY * sumY) / n;
    var ssRes = 0;
    clean.forEach(function(p) {
      var pred = slope * p.x + intercept;
      ssRes += (p.y - pred) * (p.y - pred);
    });
    var r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    return { slope: slope, intercept: intercept, r2: r2 };
  }

  /**
   * Extrapolate a revenue time series by `periods` future points.
   * Input: array of {date: 'YYYY-MM-DD', value: number}
   * Output: same shape, extended by predictions. Returns null if not enough data.
   * @param {Array<{date:string, value:number}>} series
   * @param {number} periods
   * @returns {{history:Array, forecast:Array, r2:number}|null}
   */
  function predictRevenue(series, periods) {
    if (!Array.isArray(series) || series.length < MIN_POINTS_SHORT) return null;

    var sorted = series.slice().filter(function(p) {
      return p && p.date && typeof p.value === 'number' && !isNaN(p.value);
    }).sort(function(a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

    if (sorted.length < MIN_POINTS_SHORT) return null;

    // Convert dates to day-indices for regression
    var origin = new Date(sorted[0].date).getTime();
    var DAY    = 86400000;
    var points = sorted.map(function(p) {
      return { x: (new Date(p.date).getTime() - origin) / DAY, y: p.value };
    });

    var fit = linearRegression(points);
    if (!fit) return null;

    // Generate N future points 1 day apart from the last observation
    var lastX    = points[points.length - 1].x;
    var lastDate = new Date(sorted[sorted.length - 1].date).getTime();
    var forecast = [];
    for (var i = 1; i <= periods; i++) {
      var x      = lastX + i;
      var y      = Math.max(0, fit.slope * x + fit.intercept);
      var date   = new Date(lastDate + i * DAY);
      forecast.push({
        date:  Utilities.formatDate(date, 'Europe/Moscow', 'yyyy-MM-dd'),
        value: Math.round(y)
      });
    }

    return { history: sorted, forecast: forecast, r2: fit.r2 };
  }

  /**
   * Subtract a simple period-P moving average from a series to remove
   * weekly/monthly seasonality before fitting. Optional preprocessor.
   * @param {Array<{date:string, value:number}>} series
   * @param {number} [period=7]
   * @returns {Array<{date:string, value:number}>}
   */
  function seasonalAdjust(series, period) {
    var P = period || 7;
    if (!Array.isArray(series) || series.length < P) return series;

    return series.map(function(pt, idx) {
      var start = Math.max(0, idx - P + 1);
      var slice = series.slice(start, idx + 1);
      var avg   = slice.reduce(function(s, p) { return s + (p.value || 0); }, 0) / slice.length;
      return { date: pt.date, value: pt.value - avg };
    });
  }

  /**
   * Extract a {date, value} revenue series from classified SALES_SUMMARY sheets.
   * Aggregates across multiple sheets by summing values per date.
   * @param {Array} classifiedSheets
   * @returns {Array<{date:string, value:number}>}
   */
  function extractRevenueSeries(classifiedSheets) {
    var byDate = {};
    classifiedSheets.forEach(function(sd) {
      if (sd.reportType !== 'SALES_SUMMARY') return;
      var dateCol = _findDateCol(sd.headers);
      var revCol  = _findRevenueCol(sd.headers);
      if (!dateCol || !revCol) return;
      sd.rows.forEach(function(row) {
        var d = row[dateCol];
        var v = row[revCol];
        if (!d || typeof v !== 'number') return;
        var key = String(d).slice(0, 10);
        byDate[key] = (byDate[key] || 0) + v;
      });
    });
    return Object.keys(byDate).sort().map(function(k) {
      return { date: k, value: byDate[k] };
    });
  }

  /**
   * Returns true if the dataset meets the ≥ MIN_POINTS threshold.
   * @param {Array<{date:string, value:number}>} series
   * @returns {boolean}
   */
  function isEnoughData(series) {
    return Array.isArray(series) && series.length >= MIN_POINTS;
  }

  // ─── private ──────────────────────────────────────────────────────

  var DATE_ALIASES    = ['дата', 'date', 'день', 'day'];
  var REVENUE_ALIASES = ['выручка', 'сумма', 'итог', 'revenue', 'total'];

  function _findDateCol(headers)    { return _findCol(headers, DATE_ALIASES); }
  function _findRevenueCol(headers) { return _findCol(headers, REVENUE_ALIASES); }

  function _findCol(headers, aliases) {
    var lower = (headers || []).map(function(h) { return String(h).toLowerCase(); });
    for (var i = 0; i < aliases.length; i++) {
      for (var j = 0; j < lower.length; j++) {
        if (lower[j].indexOf(aliases[i]) >= 0) return headers[j];
      }
    }
    return null;
  }

  return {
    linearRegression:     linearRegression,
    predictRevenue:       predictRevenue,
    seasonalAdjust:       seasonalAdjust,
    extractRevenueSeries: extractRevenueSeries,
    isEnoughData:         isEnoughData,
    MIN_POINTS:           MIN_POINTS
  };

})();
