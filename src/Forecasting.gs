/**
 * Forecasting.gs - Formula Finance
 * Аналитические прогнозы на основе операционных данных
 */

const Forecasting = {
  /**
   * Сгенерировать прогноз выручки на следующий месяц
   */
  predictNextMonthRevenue() {
    const historicalData = DataProcessor.getMonthlyRevenueData();
    if (historicalData.length < 3) {
      return { 
        forecast: 0, 
        confidence: 0, 
        reason: 'Недостаточно данных для прогноза (нужно минимум 3 месяца)' 
      };
    }
    
    // Простая линейная регрессия или экспоненциальное сглаживание
    const revenues = historicalData.map(d => d.revenue);
    const forecast = this._calculateLinearForecast(revenues);
    
    return {
      forecast: forecast,
      formattedForecast: Utils.formatCurrency(forecast),
      confidence: this._calculateConfidence(revenues),
      growthRate: (((forecast - revenues[revenues.length-1]) / revenues[revenues.length-1]) * 100).toFixed(1)
    };
  },
  
  /**
   * Прогноз кассового разрыва
   */
  checkCashGapRisk() {
    const currentCash = 125000; // Mock
    const expectedRevenue = this.predictNextMonthRevenue().forecast;
    const expectedExpenses = DataProcessor.getAverageExpenses() * 1.1; // +10% запас
    
    const endOfMonthBalance = currentCash + expectedRevenue - expectedExpenses;
    const riskLevel = endOfMonthBalance < 0 ? 'HIGH' : endOfMonthBalance < currentCash * 0.2 ? 'MEDIUM' : 'LOW';
    
    return {
      riskLevel: riskLevel,
      projectedBalance: endOfMonthBalance,
      formattedBalance: Utils.formatCurrency(endOfMonthBalance),
      recommendation: this._getRiskRecommendation(riskLevel)
    };
  },
  
  /**
   * Продвинутый прогноз через Claude API
   */
  async getAIForecast() {
    const dataSummary = DataProcessor.getFinancialSummary();
    const prompt = `На основе следующих финансовых данных: ${JSON.stringify(dataSummary)}, 
    сделай подробный прогноз на следующий квартал. Учти сезонность и текущие тренды. 
    Верни результат в формате JSON с полями: optimistic, pessimistic, realistic, key_risks.`;
    
    try {
      const aiResponse = ClaudeAPI.analyzeDaily(dataSummary);
      // ClaudeAPI.analyzeDaily возвращает объект с полем summary
      // В реальном сценарии мы бы распарсили структурированный ответ
      return aiResponse;
    } catch (e) {
      Logger.log('AI Forecast error: ' + e.message);
      return null;
    }
  },
  
  // ========== ВНУТРЕННИЕ МЕТОДЫ ==========
  
  /**
   * Линейный прогноз (метод наименьших квадратов упрощенно)
   */
  _calculateLinearForecast(data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumXX += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return slope * n + intercept; // Прогноз для следующей точки (n)
  },
  
  /**
   * Расчет доверительного интервала (упрощенно)
   */
  _calculateConfidence(data) {
    // Чем меньше вариация, тем выше уверенность
    const mean = data.reduce((a, b) => a + b) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean; // Коэффициент вариации
    
    if (cv < 0.1) return 0.95;
    if (cv < 0.2) return 0.85;
    if (cv < 0.3) return 0.70;
    return 0.50;
  },
  
  /**
   * Рекомендации по рискам
   */
  _getRiskRecommendation(riskLevel) {
    const recs = {
      'HIGH': 'Критический риск! Срочно сократите необязательные расходы и проверьте дебиторскую задолженность.',
      'MEDIUM': 'Внимание. Рекомендуется создать резервный фонд или пересмотреть сроки оплат поставщикам.',
      'LOW': 'Риски минимальны. Стабильное состояние.'
    };
    return recs[riskLevel] || 'Данных недостаточно.';
  }
};

/**
 * Тест прогнозирования
 */
function testForecasting() {
  const revForecast = Forecasting.predictNextMonthRevenue();
  const cashRisk = Forecasting.checkCashGapRisk();
  
  Logger.log('Прогноз выручки: ' + revForecast.formattedForecast + ' (Рост: ' + revForecast.growthRate + '%)');
  Logger.log('Риск кассового разрыва: ' + cashRisk.riskLevel + ' (Баланс: ' + cashRisk.formattedBalance + ')');
}
