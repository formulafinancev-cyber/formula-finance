// @ts-check
/**
 * kpi.gs — Formula Finance v1.0.0
 * KPI card computation and rendering module.
 *
 * RESPONSIBILITIES:
 * - Compute KPI values from extracted metrics
 * - Render KPI cards onto dashboard sheets
 * - Apply traffic-light formatting (Green/Amber/Red)
 * - Show trend arrows (▲/▼)
 * - Show [DATA UNAVAILABLE] for missing data
 *
 * CARD STRUCTURE (per cell group):
 *   Row 1: Metric name (bold, dark bg)
 *   Row 2: Value + direction arrow + vs-plan delta
 *   Row 3: Trend sparkline (period-over-period)
 *   Row 4: vs prev period delta + benchmark note
 *
 * INVARIANT: Never render a KPI card with fabricated data.
 *   If isAvailable=false -> render grey NO_DATA card.
 *
 * COLOUR CODES:
 *   Green:  #34a853 (on target)
 *   Red:    #ea4335 (below threshold)
 *   Amber:  #fbbc04 (warning)
 *   Grey:   #9aa0a6 (no data)
 */

'use strict';

var FF = FF || {};

FF.KPI = (function() {

  /** KPI card states */
  const STATE = {
    ACTIVE:   'ACTIVE',    // all data available, show full card
    PARTIAL:  'PARTIAL',   // value available, no trend
    NO_DATA:  'NO_DATA',   // required data missing
    FORECAST: 'FORECAST'   // forecast only, no actuals
  };

  /**
   * Render all KPI cards for available blocks.
   * @param {Array<BlockDescriptor>} blocks
   * @param {string} targetSheetPrefix - sheet name prefix e.g. '_FF_CEO_DASH'
   */
  function renderAll(blocks, targetSheetPrefix) {
    // TODO: implement
    // For each block where isAvailable=true:
    //   compute metrics
    //   renderCard(sheet, row, col, metrics)
    // For unavailable blocks:
    //   renderNoDataCard(sheet, row, col, block.missingTypes)
  }

  /**
   * Render a single KPI card at the given position.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   * @param {number} row - 1-based start row
   * @param {number} col - 1-based start column
   * @param {KPIMetrics} metrics
   */
  function renderCard(sheet, row, col, metrics) {
    // TODO: implement
    // 1. Write metric name
    // 2. Write value with arrow and delta
    // 3. Apply colour based on status (green/amber/red)
    // 4. Write trend row
  }

  /**
   * Render a NO_DATA placeholder card.
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   * @param {number} row
   * @param {number} col
   * @param {string[]} missingTypes
   */
  function renderNoDataCard(sheet, row, col, missingTypes) {
    // TODO: implement
    // Show grey card with [DATA UNAVAILABLE]
    // Show list of missing report types
  }

  /**
   * Determine card state based on data availability.
   * @param {BlockDescriptor} block
   * @param {Object} metrics
   * @returns {string} STATE enum value
   */
  function getState(block, metrics) {
    // TODO: implement
    if (!block.isAvailable) return STATE.NO_DATA;
    return STATE.ACTIVE;
  }

  /**
   * Format a number for display.
   * @param {number} value
   * @param {string} format - 'currency' | 'percent' | 'number' | 'large'
   * @returns {string}
   */
  function formatValue(value, format) {
    // TODO: implement
    // currency: 1 234 567 ₽
    // percent: 12.3%
    // large: 1.2M ₽
    return String(value);
  }

  return { renderAll, renderCard, renderNoDataCard, getState, formatValue, STATE };

})();
