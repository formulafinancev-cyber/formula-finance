// @ts-check
/**
 * registry.gs — Formula Finance v1.0.0
 * Block availability registry — plug-and-play metadata system.
 *
 * RESPONSIBILITIES:
 * - Given a list of classified sheets, determine which analytics blocks are available
 * - A block is AVAILABLE only if ALL its required report types are present
 * - Returns BlockDescriptor[] with isAvailable flag
 * - Used by Dashboard, KPI, and Email modules to decide what to render
 *
 * INVARIANT: Never show a block if required data is missing (Zero Fabrication)
 *
 * BLOCK DEFINITIONS:
 * Each block has:
 *   - id: unique identifier
 *   - name: display name
 *   - role: which dashboards use it (CEO, CFO, OPS, GENERAL, CUSTOM)
 *   - requiredTypes: array of REPORT_TYPE enums needed
 *   - description: what metrics this block shows
 *   - isAvailable: computed at runtime
 *   - missingTypes: list of missing report types (for debug)
 */

'use strict';

var FF = FF || {};

FF.Registry = (function() {

  /**
   * Master list of all analytics blocks.
   * TODO: expand with all blocks from docs/03-kpi-catalog.md
   *
   * @type {Array<BlockDefinition>}
   * @typedef {Object} BlockDefinition
   * @property {string} id
   * @property {string} name
   * @property {string[]} roles - ['CEO','CFO','OPS','GENERAL','CUSTOM']
   * @property {string[]} requiredTypes - REPORT_TYPE values
   * @property {string} description
   */
  const BLOCK_DEFINITIONS = [
    {
      id: 'revenue_overview',
      name: 'Обзор выручки',
      roles: ['CEO', 'GENERAL'],
      requiredTypes: ['SALES_PERIOD'],
      description: 'Total revenue, MoM growth, vs plan'
    },
    {
      id: 'pl_summary',
      name: 'P&L сводка',
      roles: ['CEO', 'CFO'],
      requiredTypes: ['BDR', 'PL_FACT'],
      description: 'Revenue, COGS, Gross Profit, EBITDA, Net Profit vs budget'
    },
    {
      id: 'cashflow_summary',
      name: 'Движение денежных средств',
      roles: ['CFO'],
      requiredTypes: ['BDDS'],
      description: 'Cash in/out waterfall, closing balance'
    },
    {
      id: 'balance_snapshot',
      name: 'Баланс',
      roles: ['CFO'],
      requiredTypes: ['BALANCE'],
      description: 'Assets, liabilities, equity snapshot'
    },
    {
      id: 'avg_check_kpi',
      name: 'Средний чек',
      roles: ['OPS', 'CEO'],
      requiredTypes: ['AVG_CHECK'],
      description: 'Average bill with trend and benchmark'
    },
    {
      id: 'food_cost_kpi',
      name: 'Food Cost %',
      roles: ['OPS', 'CFO'],
      requiredTypes: ['COGS', 'SALES_PERIOD'],
      description: 'Food cost as % of revenue with alert threshold'
    },
    {
      id: 'labor_cost_kpi',
      name: 'Labor Cost %',
      roles: ['OPS', 'CFO'],
      requiredTypes: ['PAYROLL', 'SALES_PERIOD'],
      description: 'Labor cost as % of revenue'
    },
    {
      id: 'inventory_turnover',
      name: 'Оборачиваемость запасов',
      roles: ['OPS'],
      requiredTypes: ['INVENTORY', 'COGS'],
      description: 'Inventory turnover rate and days'
    },
    {
      id: 'revenue_forecast',
      name: 'Прогноз выручки',
      roles: ['CEO', 'CFO'],
      requiredTypes: ['SALES_PERIOD'],  // requires 3+ months of data
      description: 'Revenue forecast for next 30/90 days (requires 3+ months history)'
    },
    // TODO: add remaining blocks per docs/03-kpi-catalog.md
  ];

  /**
   * Build the list of available blocks based on classified sheets.
   * @param {Array<{type: string, sheetName: string}>} classifiedSheets
   * @returns {Array<BlockDescriptor>}
   *
   * @typedef {Object} BlockDescriptor
   * @property {string} id
   * @property {string} name
   * @property {string[]} roles
   * @property {boolean} isAvailable
   * @property {string[]} missingTypes
   * @property {string} description
   */
  function buildAvailableBlocks(classifiedSheets) {
    // TODO: implement
    // 1. Extract set of available report types from classifiedSheets
    // 2. For each block in BLOCK_DEFINITIONS:
    //    - Check if all requiredTypes are in available types
    //    - Set isAvailable = true/false
    //    - Set missingTypes = types that are absent
    // 3. Return array of BlockDescriptor
    return BLOCK_DEFINITIONS.map(b => ({
      ...b,
      isAvailable: false,
      missingTypes: b.requiredTypes
    }));
  }

  /**
   * Get blocks available for a specific role.
   * @param {Array<BlockDescriptor>} blocks
   * @param {string} role - 'CEO' | 'CFO' | 'OPS' | 'GENERAL' | 'CUSTOM'
   * @returns {Array<BlockDescriptor>} only available blocks for this role
   */
  function getBlocksForRole(blocks, role) {
    // TODO: implement
    return blocks.filter(b => b.isAvailable && b.roles.includes(role));
  }

  return { buildAvailableBlocks, getBlocksForRole, BLOCK_DEFINITIONS };

})();
