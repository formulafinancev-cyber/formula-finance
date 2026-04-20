/**
 * KPICards.gs - Formula Finance
 * Расчет и управление KPI-карточками
 */

// Класс для работы с KPI
const KPICards = {
  /**
   * Получить все KPI для дашборда
   */
  getAllKPIs() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = ss.getSheetByName('Data'); // или другой лист с данными
    
    if (!dataSheet) {
      Logger.log('Data sheet not found');
      return this._getMockKPIs();
    }
    
    return [
      this.getRevenueKPI(dataSheet),
      this.getExpenseKPI(dataSheet),
      this.getProfitKPI(dataSheet),
      this.getROIKPI(dataSheet),
      this.getConversionKPI(dataSheet),
      this.getCustomerKPI(dataSheet),
      this.getCashFlowKPI(dataSheet),
      this.getMarginKPI(dataSheet)
    ];
  },
  
  /**
   * KPI: Выручка
   */
  getRevenueKPI(sheet) {
    const currentRevenue = this._calculateTotalRevenue(sheet, 'current');
    const previousRevenue = this._calculateTotalRevenue(sheet, 'previous');
    const change = ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);
    
    return {
      name: 'Выручка',
      value: currentRevenue,
      formattedValue: Utils.formatCurrency(currentRevenue),
      trend: change > 0 ? `+${change}%` : `${change}%`,
      status: this._getStatus(change, 5, -5)
    };
  },
  
  /**
   * KPI: Расходы
   */
  getExpenseKPI(sheet) {
    const currentExpense = this._calculateTotalExpense(sheet, 'current');
    const previousExpense = this._calculateTotalExpense(sheet, 'previous');
    const change = ((currentExpense - previousExpense) / previousExpense * 100).toFixed(1);
    
    return {
      name: 'Расходы',
      value: currentExpense,
      formattedValue: Utils.formatCurrency(currentExpense),
      trend: change > 0 ? `+${change}%` : `${change}%`,
      status: this._getStatus(-change, 5, -5) // инвертировано: рост расходов = плохо
    };
  },
  
  /**
   * KPI: Прибыль
   */
  getProfitKPI(sheet) {
    const revenue = this._calculateTotalRevenue(sheet, 'current');
    const expense = this._calculateTotalExpense(sheet, 'current');
    const profit = revenue - expense;
    
    const prevRevenue = this._calculateTotalRevenue(sheet, 'previous');
    const prevExpense = this._calculateTotalExpense(sheet, 'previous');
    const prevProfit = prevRevenue - prevExpense;
    
    const change = prevProfit !== 0 ? ((profit - prevProfit) / Math.abs(prevProfit) * 100).toFixed(1) : 0;
    
    return {
      name: 'Прибыль',
      value: profit,
      formattedValue: Utils.formatCurrency(profit),
      trend: change > 0 ? `+${change}%` : `${change}%`,
      status: this._getStatus(change, 10, -10)
    };
  },
  
  /**
   * KPI: ROI (возврат инвестиций)
   */
  getROIKPI(sheet) {
    const revenue = this._calculateTotalRevenue(sheet, 'current');
    const expense = this._calculateTotalExpense(sheet, 'current');
    const roi = expense !== 0 ? ((revenue - expense) / expense * 100).toFixed(1) : 0;
    
    return {
      name: 'ROI',
      value: parseFloat(roi),
      formattedValue: roi + '%',
      trend: roi > 20 ? 'Отлично' : roi > 10 ? 'Хорошо' : 'Нужна оптимизация',
      status: roi > 20 ? 'good' : roi > 10 ? 'warning' : 'bad'
    };
  },
  
  /**
   * KPI: Конверсия
   */
  getConversionKPI(sheet) {
    // Пример: конверсия лидов в клиентов
    const conversion = 15.7; // TODO: подключить реальные данные
    
    return {
      name: 'Конверсия',
      value: conversion,
      formattedValue: conversion + '%',
      trend: '+2.3% vs прошлый период',
      status: 'good'
    };
  },
  
  /**
   * KPI: Клиенты
   */
  getCustomerKPI(sheet) {
    const customers = 342; // TODO: подключить реальные данные
    
    return {
      name: 'Клиенты',
      value: customers,
      formattedValue: customers.toString(),
      trend: '+28 новых',
      status: 'good'
    };
  },
  
  /**
   * KPI: Денежный поток
   */
  getCashFlowKPI(sheet) {
    const cashFlow = 125000; // TODO: подключить реальные данные
    
    return {
      name: 'Денежный поток',
      value: cashFlow,
      formattedValue: Utils.formatCurrency(cashFlow),
      trend: '+12.5%',
      status: 'good'
    };
  },
  
  /**
   * KPI: Маржа
   */
  getMarginKPI(sheet) {
    const revenue = this._calculateTotalRevenue(sheet, 'current');
    const expense = this._calculateTotalExpense(sheet, 'current');
    const margin = revenue !== 0 ? ((revenue - expense) / revenue * 100).toFixed(1) : 0;
    
    return {
      name: 'Маржа',
      value: parseFloat(margin),
      formattedValue: margin + '%',
      trend: margin > 30 ? 'Отлично' : margin > 20 ? 'Норма' : 'Низкая',
      status: margin > 30 ? 'good' : margin > 20 ? 'warning' : 'bad'
    };
  },
  
  // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========
  
  /**
   * Расчет общей выручки
   */
  _calculateTotalRevenue(sheet, period) {
    // TODO: Реализовать логику расчета на основе данных листа
    // period: 'current' или 'previous'
    if (period === 'current') {
      return 1500000; // Моковые данные
    } else {
      return 1350000;
    }
  },
  
  /**
   * Расчет общих расходов
   */
  _calculateTotalExpense(sheet, period) {
    // TODO: Реализовать логику расчета
    if (period === 'current') {
      return 980000;
    } else {
      return 920000;
    }
  },
  
  /**
   * Определить статус по значению изменения
   */
  _getStatus(changePercent, goodThreshold, badThreshold) {
    if (changePercent >= goodThreshold) return 'good';
    if (changePercent <= badThreshold) return 'bad';
    return 'warning';
  },
  
  /**
   * Моковые KPI (для тестирования)
   */
  _getMockKPIs() {
    return [
      { name: 'Выручка', formattedValue: '1 500 000 ₽', trend: '+11.1%', status: 'good' },
      { name: 'Расходы', formattedValue: '980 000 ₽', trend: '+6.5%', status: 'warning' },
      { name: 'Прибыль', formattedValue: '520 000 ₽', trend: '+21.0%', status: 'good' },
      { name: 'ROI', formattedValue: '53.1%', trend: 'Отлично', status: 'good' },
      { name: 'Конверсия', formattedValue: '15.7%', trend: '+2.3%', status: 'good' },
      { name: 'Клиенты', formattedValue: '342', trend: '+28 новых', status: 'good' },
      { name: 'Денежный поток', formattedValue: '125 000 ₽', trend: '+12.5%', status: 'good' },
      { name: 'Маржа', formattedValue: '34.7%', trend: 'Отлично', status: 'good' }
    ];
  }
};

/**
 * Экспорт KPI в отдельный лист для анализа
 */
function exportKPIsToSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let kpiSheet = ss.getSheetByName('KPI_Export');
  
  if (!kpiSheet) {
    kpiSheet = ss.insertSheet('KPI_Export');
  }
  
  kpiSheet.clear();
  
  // Заголовки
  kpiSheet.getRange('A1:E1').setValues([[
    'Название KPI', 'Значение', 'Форматированное', 'Тренд', 'Статус'
  ]]);
  kpiSheet.getRange('A1:E1').setFontWeight('bold').setBackground('#EFEFEF');
  
  // Данные
  const kpis = KPICards.getAllKPIs();
  const data = kpis.map(kpi => [
    kpi.name,
    kpi.value || 0,
    kpi.formattedValue,
    kpi.trend,
    kpi.status
  ]);
  
  kpiSheet.getRange(2, 1, data.length, 5).setValues(data);
  
  Logger.log('KPIs exported to sheet');
  SpreadsheetApp.getUi().alert('KPI экспортированы в лист "KPI_Export"');
}
