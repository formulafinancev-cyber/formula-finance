/**
 * Formula Finance - Main Controller
 * Universal Finance Dashboard Engine
 */

const CONFIG = {
  SPREADSHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  DATA_SHEET: 'Транзакции',
  KPI_SHEET: 'KPI',
  UI_TITLE: 'Formula Finance Dashboard'
};

/**
 * Web App entry point
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Dashboard')
    .evaluate()
    .setTitle(CONFIG.UI_TITLE)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Get dashboard data for the frontend
 */
function getDashboardData() {
  try {
    const kpiData = getKPIMetrics();
    const recentTransactions = getRecentTransactions(5);
    const forecast = ClaudeAPI.getQuickForecast();
    
    return {
      status: 'success',
      kpis: kpiData,
      recent: recentTransactions,
      forecast: forecast,
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    Logger.log('Error getting dashboard data: ' + e.message);
    return { status: 'error', message: e.message };
  }
}

/**
 * Fetch KPI metrics from spreadsheet
 */
function getKPIMetrics() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.KPI_SHEET);
  if (!sheet) return [];
  
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  
  return values.map(row => {
    return {
      name: row[0],
      value: row[1],
      target: row[2],
      trend: row[3], // 'up', 'down', 'stable'
      change: row[4] // percentage
    };
  });
}

/**
 * Fetch recent transactions
 */
function getRecentTransactions(limit = 10) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.DATA_SHEET);
  if (!sheet) return [];
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  const startRow = Math.max(2, lastRow - limit + 1);
  const numRows = lastRow - startRow + 1;
  
  const values = sheet.getRange(startRow, 1, numRows, 5).getValues();
  return values.reverse().map(row => ({
    date: Utilities.formatDate(new Date(row[0]), 'GMT+3', 'dd.MM.yyyy'),
    category: row[1],
    description: row[2],
    amount: row[3],
    currency: row[4]
  }));
}

/**
 * Process new transaction from UI
 */
function addTransaction(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.DATA_SHEET);
  sheet.appendRow([
    new Date(),
    data.category,
    data.description,
    data.amount,
    data.currency || 'RUB'
  ]);
  return { status: 'ok' };
}

/**
 * Trigger for daily analytics
 */
function dailyAnalyticsTrigger() {
  const data = getDashboardData();
  const analysis = ClaudeAPI.analyzeDaily(data);
  
  if (analysis.alerts.length > 0) {
    NotificationService.sendEmail(analysis.alerts);
  }
}
