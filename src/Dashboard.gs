/**
 * Dashboard.gs - Formula Finance
 * Управление дашбордами: построение, обновление, форматирование
 */

// ===== КОНСТАНТЫ ДАШБОРДА =====
const DASHBOARD_CONFIG = {
  SHEET_NAME: 'Dashboard',
  REFRESH_INTERVAL_MINUTES: 60,
  CHART_COLORS: {
    PRIMARY: '#1565C0',
    SUCCESS: '#2E7D32',
    WARNING: '#F57F17',
    DANGER: '#C62828',
    NEUTRAL: '#546E7A'
  },
  SECTIONS: {
    KPI_START_ROW: 2,
    KPI_END_ROW: 8,
    CHARTS_START_ROW: 10,
    ANALYSIS_START_ROW: 30
  }
};

/**
 * Инициализация/обновление главного дашборда
 */
function buildMainDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashSheet = ss.getSheetByName(DASHBOARD_CONFIG.SHEET_NAME);
  
  if (!dashSheet) {
    dashSheet = ss.insertSheet(DASHBOARD_CONFIG.SHEET_NAME, 0);
  }
  
  dashSheet.clearContents();
  dashSheet.clearFormats();
  
  // Заголовок
  _renderDashboardHeader(dashSheet);
  
  // KPI секция
  _renderKPISection(dashSheet);
  
  // Графики
  _renderChartsSection(dashSheet, ss);
  
  // Аналитика Claude
  _renderAnalyticsSection(dashSheet);
  
  // Форматирование
  _applyDashboardFormatting(dashSheet);
  
  SpreadsheetApp.flush();
  Logger.log('Dashboard built successfully');
  return dashSheet;
}

/**
 * Рендер заголовка дашборда
 */
function _renderDashboardHeader(sheet) {
  const titleRange = sheet.getRange('A1:L1');
  titleRange.merge();
  titleRange.setValue('FORMULA FINANCE — ОПЕРАЦИОННЫЙ ДАШБОРД');
  titleRange.setBackground('#0D47A1');
  titleRange.setFontColor('#FFFFFF');
  titleRange.setFontSize(16);
  titleRange.setFontWeight('bold');
  titleRange.setHorizontalAlignment('center');
  titleRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 50);
  
  // Дата обновления
  const dateCell = sheet.getRange('M1');
  dateCell.setValue('Обновлено: ' + Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm'
  ));
  dateCell.setFontSize(9);
  dateCell.setFontColor('#FFFFFF');
  dateCell.setBackground('#0D47A1');
  dateCell.setHorizontalAlignment('right');
}

/**
 * Рендер секции KPI
 */
function _renderKPISection(sheet) {
  const kpiData = KPICards.getAllKPIs();
  const startRow = DASHBOARD_CONFIG.SECTIONS.KPI_START_ROW;
  
  // Заголовок секции
  const sectionHeader = sheet.getRange(startRow, 1, 1, 13);
  sectionHeader.merge();
  sectionHeader.setValue('КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ ЭФФЕКТИВНОСТИ (KPI)');
  sectionHeader.setBackground('#1565C0');
  sectionHeader.setFontColor('#FFFFFF');
  sectionHeader.setFontWeight('bold');
  sectionHeader.setFontSize(12);
  sheet.setRowHeight(startRow, 35);
  
  // KPI карточки — по 4 в ряд
  let col = 1;
  let row = startRow + 1;
  
  kpiData.forEach((kpi, index) => {
    if (col > 13) {
      col = 1;
      row += 3;
    }
    _renderSingleKPICard(sheet, row, col, kpi);
    col += 3;
  });
}

/**
 * Отрисовка одной KPI карточки
 */
function _renderSingleKPICard(sheet, row, col, kpi) {
  // Название
  const nameRange = sheet.getRange(row, col, 1, 3);
  nameRange.merge();
  nameRange.setValue(kpi.name);
  nameRange.setBackground('#E3F2FD');
  nameRange.setFontWeight('bold');
  nameRange.setFontSize(9);
  nameRange.setHorizontalAlignment('center');
  
  // Значение
  const valueRange = sheet.getRange(row + 1, col, 1, 3);
  valueRange.merge();
  valueRange.setValue(kpi.formattedValue);
  
  const statusColor = _getStatusColor(kpi.status);
  valueRange.setBackground(statusColor.bg);
  valueRange.setFontColor(statusColor.text);
  valueRange.setFontSize(14);
  valueRange.setFontWeight('bold');
  valueRange.setHorizontalAlignment('center');
  
  // Тренд
  const trendRange = sheet.getRange(row + 2, col, 1, 3);
  trendRange.merge();
  trendRange.setValue(kpi.trend + ' vs прошлый период');
  trendRange.setFontSize(8);
  trendRange.setHorizontalAlignment('center');
  trendRange.setFontColor('#546E7A');
  
  // Высота строк
  sheet.setRowHeight(row, 20);
  sheet.setRowHeight(row + 1, 35);
  sheet.setRowHeight(row + 2, 18);
}

/**
 * Получить цвет статуса KPI
 */
function _getStatusColor(status) {
  const colors = {
    'good':    { bg: '#E8F5E9', text: '#1B5E20' },
    'warning': { bg: '#FFF8E1', text: '#E65100' },
    'bad':     { bg: '#FFEBEE', text: '#B71C1C' },
    'neutral': { bg: '#ECEFF1', text: '#37474F' }
  };
  return colors[status] || colors['neutral'];
}

/**
 * Секция графиков
 */
function _renderChartsSection(sheet, ss) {
  const startRow = DASHBOARD_CONFIG.SECTIONS.CHARTS_START_ROW;
  
  const sectionHeader = sheet.getRange(startRow, 1, 1, 13);
  sectionHeader.merge();
  sectionHeader.setValue('ДИНАМИКА ПОКАЗАТЕЛЕЙ');
  sectionHeader.setBackground('#1565C0');
  sectionHeader.setFontColor('#FFFFFF');
  sectionHeader.setFontWeight('bold');
  sectionHeader.setFontSize(12);
  sheet.setRowHeight(startRow, 35);
  
  // Данные для графика — выручка по месяцам
  const chartData = DataProcessor.getMonthlyRevenueData();
  if (!chartData || chartData.length === 0) return;
  
  const dataStartRow = startRow + 1;
  sheet.getRange(dataStartRow, 1).setValue('Месяц');
  sheet.getRange(dataStartRow, 2).setValue('Выручка');
  sheet.getRange(dataStartRow, 3).setValue('Расходы');
  sheet.getRange(dataStartRow, 4).setValue('Прибыль');
  
  chartData.forEach((row, i) => {
    sheet.getRange(dataStartRow + 1 + i, 1).setValue(row.month);
    sheet.getRange(dataStartRow + 1 + i, 2).setValue(row.revenue);
    sheet.getRange(dataStartRow + 1 + i, 3).setValue(row.expenses);
    sheet.getRange(dataStartRow + 1 + i, 4).setValue(row.profit);
  });
  
  // Построить график
  _buildRevenueChart(sheet, dataStartRow, chartData.length + 1);
}

/**
 * Построить график выручки
 */
function _buildRevenueChart(sheet, dataStartRow, dataRows) {
  // Удалить старые графики
  sheet.getCharts().forEach(chart => sheet.removeChart(chart));
  
  const dataRange = sheet.getRange(dataStartRow, 1, dataRows, 4);
  
  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.LINE)
    .addRange(dataRange)
    .setPosition(DASHBOARD_CONFIG.SECTIONS.CHARTS_START_ROW + 2, 6, 0, 0)
    .setOption('title', 'Динамика финансовых показателей')
    .setOption('titleTextStyle', { fontSize: 14, bold: true })
    .setOption('width', 600)
    .setOption('height', 300)
    .setOption('legend', { position: 'bottom' })
    .setOption('series', {
      0: { color: DASHBOARD_CONFIG.CHART_COLORS.PRIMARY },
      1: { color: DASHBOARD_CONFIG.CHART_COLORS.DANGER },
      2: { color: DASHBOARD_CONFIG.CHART_COLORS.SUCCESS }
    })
    .build();
  
  sheet.insertChart(chart);
}

/**
 * Секция аналитики (Claude AI)
 */
function _renderAnalyticsSection(sheet) {
  const startRow = DASHBOARD_CONFIG.SECTIONS.ANALYSIS_START_ROW;
  
  const sectionHeader = sheet.getRange(startRow, 1, 1, 13);
  sectionHeader.merge();
  sectionHeader.setValue('AI-АНАЛИТИКА (Claude Opus)');
  sectionHeader.setBackground('#4A148C');
  sectionHeader.setFontColor('#FFFFFF');
  sectionHeader.setFontWeight('bold');
  sectionHeader.setFontSize(12);
  sheet.setRowHeight(startRow, 35);
  
  // Получить последний анализ из кэша
  const analysis = CacheService.getScriptCache().get('last_daily_analysis');
  
  if (analysis) {
    const parsed = JSON.parse(analysis);
    const textRange = sheet.getRange(startRow + 1, 1, 8, 13);
    textRange.merge();
    textRange.setValue(parsed.summary || 'Анализ недоступен');
    textRange.setWrap(true);
    textRange.setVerticalAlignment('top');
    textRange.setFontSize(10);
    textRange.setBackground('#F3E5F5');
    sheet.setRowHeight(startRow + 1, 150);
  } else {
    const noDataRange = sheet.getRange(startRow + 1, 1, 2, 13);
    noDataRange.merge();
    noDataRange.setValue('Аналитика не загружена. Запустите analyzeDaily() для получения AI-анализа.');
    noDataRange.setFontColor('#9E9E9E');
    noDataRange.setHorizontalAlignment('center');
    noDataRange.setFontStyle('italic');
  }
}

/**
 * Применить общее форматирование дашборда
 */
function _applyDashboardFormatting(sheet) {
  // Ширина колонок
  for (let i = 1; i <= 13; i++) {
    sheet.setColumnWidth(i, 90);
  }
  sheet.setColumnWidth(1, 120);
  
  // Заморозить первую строку
  sheet.setFrozenRows(1);
  
  // Убрать линии сетки
  SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(DASHBOARD_CONFIG.SHEET_NAME);
}

/**
 * Автообновление дашборда по триггеру
 */
function autoRefreshDashboard() {
  try {
    Logger.log('Auto-refresh dashboard started...');
    buildMainDashboard();
    Logger.log('Dashboard auto-refresh complete');
  } catch (e) {
    Logger.log('Dashboard refresh error: ' + e.message);
    NotificationService.sendErrorAlert('Dashboard refresh failed: ' + e.message);
  }
}

/**
 * Создать временной триггер для автообновления
 */
function setupDashboardTrigger() {
  // Удалить существующие триггеры autoRefreshDashboard
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getHandlerFunction() === 'autoRefreshDashboard') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Создать новый триггер
  ScriptApp.newTrigger('autoRefreshDashboard')
    .timeBased()
    .everyHours(DASHBOARD_CONFIG.REFRESH_INTERVAL_MINUTES / 60)
    .create();
  
  Logger.log('Dashboard trigger created: every ' + 
    DASHBOARD_CONFIG.REFRESH_INTERVAL_MINUTES + ' minutes');
}
