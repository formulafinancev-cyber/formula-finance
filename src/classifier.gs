// @ts-check
/**
 * classifier.gs — Formula Finance v1.0.0
 * Fuzzy report-type classifier for Google Sheets.
 *
 * ALGORITHM (5-step pipeline, see docs/06-fuzzy-parsing.md):
 * 1. Normalise sheet name (lowercase, strip punctuation, strip dates)
 * 2. Strip noise suffixes (копия, copy, month names, Q1-Q4, etc.)
 * 3. Match against REPORT_PATTERNS keyword groups
 * 4. Fallback: scan top-5 header rows for keywords
 * 5. Return { type, confidence, sheetName, norm }
 *
 * REPORT TYPES: see docs/02-report-taxonomy.md
 * All 55+ types defined in REPORT_PATTERNS below.
 *
 * INVARIANTS:
 * - Never throws; returns UNKNOWN on failure
 * - Deduplication: prefer sheets without 'копия'/'copy' suffix
 * - Logs duplicates to FF.Debug
 */

'use strict';

var FF = FF || {};

FF.Classifier = (function() {

  /**
   * All recognised report types.
   * @enum {string}
   */
  const REPORT_TYPE = {
    // Financial
    BDR: 'BDR',
    PL_FACT: 'PL_FACT',
    PL_PLAN: 'PL_PLAN',
    OPIU: 'OPIU',
    BDDS: 'BDDS',
    CF_FACT: 'CF_FACT',
    CF_PLAN: 'CF_PLAN',
    BALANCE: 'BALANCE',
    BALANCE_PLAN: 'BALANCE_PLAN',
    DEBTS_AP: 'DEBTS_AP',
    DEBTS_AR: 'DEBTS_AR',
    LOANS: 'LOANS',
    // HoReCa Sales
    SALES_PERIOD: 'SALES_PERIOD',
    AVG_CHECK: 'AVG_CHECK',
    COVERS: 'COVERS',
    REVENUE_HOUR: 'REVENUE_HOUR',
    REVENUE_CATEGORY: 'REVENUE_CATEGORY',
    REVENUE_WAITER: 'REVENUE_WAITER',
    REVENUE_TABLE: 'REVENUE_TABLE',
    // Menu
    MENU_ANALYSIS: 'MENU_ANALYSIS',
    ABC_ANALYSIS: 'ABC_ANALYSIS',
    STOPLIST: 'STOPLIST',
    // Inventory
    INVENTORY: 'INVENTORY',
    WRITEOFF: 'WRITEOFF',
    COGS: 'COGS',
    PURCHASE: 'PURCHASE',
    INVOICE: 'INVOICE',
    // Staff
    STAFF_HOURS: 'STAFF_HOURS',
    PAYROLL: 'PAYROLL',
    TIPS: 'TIPS',
    // iiko specific
    IIKO_CONSOLIDATED: 'IIKO_CONSOLIDATED',
    IIKO_CASH: 'IIKO_CASH',
    IIKO_SHIFT: 'IIKO_SHIFT',
    IIKO_DELIVERY: 'IIKO_DELIVERY',
    IIKO_DISCOUNT: 'IIKO_DISCOUNT',
    IIKO_LOYALTY: 'IIKO_LOYALTY',
    // Management
    KPI_DASHBOARD: 'KPI_DASHBOARD',
    BUDGET_VS_ACTUAL: 'BUDGET_VS_ACTUAL',
    FORECAST: 'FORECAST',
    UNIT_ECONOMICS: 'UNIT_ECONOMICS',
    BREAKEVEN: 'BREAKEVEN',
    MANAGEMENT_REPORT: 'MANAGEMENT_REPORT',
    // Service
    SETTINGS_SHEET: 'SETTINGS_SHEET',
    DEBUG_SHEET: 'DEBUG_SHEET',
    UNKNOWN: 'UNKNOWN'
  };

  /**
   * Keyword patterns for each report type.
   * Add new types here ONLY (open/closed principle).
   * TODO: fill in all keyword arrays per docs/02-report-taxonomy.md
   */
  const REPORT_PATTERNS = {
    [REPORT_TYPE.BDR]:           ['бдр', 'бюджет доходов', 'p&l budget', 'доходы расходы'],
    [REPORT_TYPE.BDDS]:          ['бддс', 'движение денежных', 'cash flow budget'],
    [REPORT_TYPE.BALANCE]:       ['баланс', 'balance sheet'],
    [REPORT_TYPE.SALES_PERIOD]:  ['продажи за период', 'отчет о продажах'],
    [REPORT_TYPE.AVG_CHECK]:     ['средний чек', 'avg check'],
    [REPORT_TYPE.INVENTORY]:     ['остатки склад', 'inventory'],
    // TODO: add all remaining types
  };

  /**
   * Classify a sheet by its name and optionally by header content.
   * @param {SheetData} sheetData
   * @returns {{ type: string, confidence: number, sheetName: string, norm: string }}
   */
  function classify(sheetData) {
    // TODO: implement 5-step pipeline
    // See docs/06-fuzzy-parsing.md
    return { type: REPORT_TYPE.UNKNOWN, confidence: 0, sheetName: sheetData.sheetName, norm: '' };
  }

  /**
   * Normalise a sheet name for matching.
   * @param {string} name
   * @returns {string}
   */
  function normalise(name) {
    // TODO: implement per docs/06-fuzzy-parsing.md Step 1+2
    return name.toLowerCase().trim();
  }

  /**
   * Match normalised name against all REPORT_PATTERNS.
   * @param {string} norm
   * @returns {string|null} report type or null
   */
  function matchKeywords(norm) {
    // TODO: implement
    return null;
  }

  /**
   * Scan top 5 header rows for keywords.
   * @param {Array<Array<*>>} rawData
   * @returns {string|null}
   */
  function scanHeaders(rawData) {
    // TODO: implement
    return null;
  }

  /**
   * Resolve duplicates when multiple sheets have the same type.
   * Prefer sheets without 'копия'/'copy' in name.
   * @param {Array<ClassifiedSheet>} sheets
   * @returns {Array<ClassifiedSheet>}
   */
  function resolveDuplicates(sheets) {
    // TODO: implement
    return sheets;
  }

  return { classify, normalise, matchKeywords, scanHeaders, resolveDuplicates, REPORT_TYPE };

})();
