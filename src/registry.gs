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
 */

'use strict';

var FF = FF || {};

FF.Registry = (function() {

  /**
   * Master block catalogue.
   * Each block defines which report types it needs to be rendered.
   * If ANY required type is missing, isAvailable = false.
   */
  var BLOCK_CATALOGUE = [
    {
      id: 'revenue_daily',
      label: 'Выручка за день',
      category: 'revenue',
      requiredTypes: ['SALES_SUMMARY'],
      metrics: ['total_revenue', 'avg_check', 'guests_count']
    },
    {
      id: 'revenue_by_category',
      label: 'Выручка по категориям',
      category: 'revenue',
      requiredTypes: ['SALES_BY_CATEGORY'],
      metrics: ['revenue_by_category']
    },
    {
      id: 'top_dishes',
      label: 'ТОП блюд',
      category: 'menu',
      requiredTypes: ['SALES_BY_DISH'],
      metrics: ['top_dishes_by_revenue', 'top_dishes_by_qty']
    },
    {
      id: 'hourly_traffic',
      label: 'Почасовой трафик',
      category: 'operations',
      requiredTypes: ['SALES_BY_HOUR'],
      metrics: ['peak_hours', 'revenue_by_hour']
    },
    {
      id: 'staff_performance',
      label: 'Эффективность персонала',
      category: 'staff',
      requiredTypes: ['SALES_BY_WAITER'],
      metrics: ['revenue_per_waiter', 'checks_per_waiter']
    },
    {
      id: 'writeoffs_analysis',
      label: 'Анализ списаний',
      category: 'costs',
      requiredTypes: ['WRITEOFFS'],
      metrics: ['writeoff_total', 'writeoff_by_category']
    },
    {
      id: 'cash_summary',
      label: 'Движение средств',
      category: 'finance',
      requiredTypes: ['CASH_FLOW'],
      metrics: ['cash_in', 'cash_out', 'cash_balance']
    },
    {
      id: 'inventory_balance',
      label: 'Остатки на складе',
      category: 'inventory',
      requiredTypes: ['INVENTORY'],
      metrics: ['stock_balance', 'low_stock_items']
    },
    {
      id: 'delivery_kpi',
      label: 'KPI доставки',
      category: 'delivery',
      requiredTypes: ['DELIVERY'],
      metrics: ['delivery_revenue', 'delivery_orders_count']
    },
    {
      id: 'loyalty_overview',
      label: 'Лояльность гостей',
      category: 'loyalty',
      requiredTypes: ['LOYALTY'],
      metrics: ['new_guests', 'returning_guests', 'loyalty_revenue_share']
    },
    {
      id: 'forecast_revenue',
      label: 'Прогноз выручки',
      category: 'forecast',
      requiredTypes: ['SALES_SUMMARY'],
      metrics: ['forecast_next_week', 'forecast_confidence']
    }
  ];

  /**
   * Build the list of available blocks given classified sheet data.
   * @param {Array} classifiedSheets - output from FF.Classifier.classify()
   * @returns {Array} Array of BlockDescriptor with isAvailable flag
   */
  function buildAvailableBlocks(classifiedSheets) {
    // Collect present report types — globally and per restaurant
    var presentTypes   = {};
    var perRestaurant  = {};  // restaurantId → Set<reportType>
    classifiedSheets.forEach(function(sd) {
      if (!sd.reportType || sd.reportType === 'UNKNOWN') return;
      presentTypes[sd.reportType] = true;
      var rid = sd.restaurantId || '__all__';
      if (!perRestaurant[rid]) {
        perRestaurant[rid] = { name: sd.restaurantName || rid, types: {} };
      }
      perRestaurant[rid].types[sd.reportType] = true;
    });

    var available = 0;
    var blocks = BLOCK_CATALOGUE.map(function(block) {
      var isAvailable = block.requiredTypes.every(function(rt) {
        return !!presentTypes[rt];
      });

      // Per-restaurant availability map for this block
      var perRestaurantAvailable = {};
      Object.keys(perRestaurant).forEach(function(rid) {
        var types = perRestaurant[rid].types;
        perRestaurantAvailable[rid] = block.requiredTypes.every(function(rt) {
          return !!types[rt];
        });
      });

      if (isAvailable) available++;
      return {
        id:                    block.id,
        label:                 block.label,
        category:              block.category,
        requiredTypes:         block.requiredTypes,
        metrics:               block.metrics,
        isAvailable:           isAvailable,
        perRestaurantAvailable:perRestaurantAvailable
      };
    });

    // Attach restaurants roster (id → name) for downstream consumers
    blocks.restaurants = Object.keys(perRestaurant).map(function(rid) {
      return { id: rid, name: perRestaurant[rid].name };
    });

    FF.Debug.log('INFO', 'Registry',
      'Blocks available: ' + available + '/' + blocks.length +
      ' | Restaurants: ' + blocks.restaurants.length +
      ' | Present types: ' + Object.keys(presentTypes).join(', '));

    return blocks;
  }

  /**
   * Filter to only available blocks.
   * @param {Array} blocks - output from buildAvailableBlocks()
   * @returns {Array}
   */
  function getAvailable(blocks) {
    return blocks.filter(function(b) { return b.isAvailable; });
  }

  /**
   * Get a block descriptor by ID.
   * @param {Array} blocks
   * @param {string} blockId
   * @returns {Object|null}
   */
  function getById(blocks, blockId) {
    return blocks.find(function(b) { return b.id === blockId; }) || null;
  }

  return { buildAvailableBlocks, getAvailable, getById, BLOCK_CATALOGUE };

})();
