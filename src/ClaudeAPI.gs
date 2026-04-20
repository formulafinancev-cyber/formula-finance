/**
 * Formula Finance - Claude Opus 4.7 API Module
 * Handles all interactions with Anthropic API
 */

const ClaudeAPI = {
  
  /**
   * Get API key from Script Properties
   */
  _getKey: function() {
    const key = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
    if (!key) throw new Error('CLAUDE_API_KEY not set in Script Properties');
    return key;
  },

  /**
   * Core request method
   */
  _request: function(messages, systemPrompt = '', maxTokens = 2048) {
    const cached = CacheService.getScriptCache().get('claude_' + Utilities.computeDigest(
      Utilities.DigestAlgorithm.MD5,
      JSON.stringify(messages)
    ).toString());
    if (cached) return JSON.parse(cached);

    const payload = {
      model: 'claude-opus-4-5',
      max_tokens: maxTokens,
      system: systemPrompt || 'Ты опытный финансовый аналитик Formula Finance. Давай чёткие, действенные инсайты без лишней воды. Отвечай на русском языке, если не сказано иначе.',
      messages: messages
    };
    
    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this._getKey(),
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', options);
    if (response.getResponseCode() !== 200) {
      throw new Error('Claude API error: ' + response.getContentText());
    }
    
    const result = JSON.parse(response.getContentText());
    return result.content[0].text;
  },

  /**
   * Analyze financial data and generate forecast
   */
  analyzeFinancials: function(data) {
    const messages = [{
      role: 'user',
      content: `Проанализируй финансовые данные и сгенерируй отчёт в JSON:
      - Ключевые тренды (3 пункта)
      - Топ-3 риска
      - Прогноз на следующий месяц (min/mid/max)
      - 1 рекомендация

      Данные: ${JSON.stringify(data)}
      
      Ответ строго в JSON без пояснений.`
    }];
    
    try {
      const raw = this._request(messages, '', 1024);
      return JSON.parse(raw);
    } catch(e) {
      return { error: e.message };
    }
  },

  /**
   * Detect anomalies in transactions
   */
  detectAnomalies: function(transactions) {
    const messages = [{
      role: 'user',
      content: `Определи аномалии в транзакциях. Верни JSON список аномалий с полями: id, reason, severity (low/medium/high).
      Транзакции: ${JSON.stringify(transactions)}`
    }];
    try {
      return JSON.parse(this._request(messages));
    } catch(e) {
      return [];
    }
  },

  /**
   * Get quick forecast for dashboard widget
   */
  getQuickForecast: function() {
    const cache = CacheService.getScriptCache();
    const cached = cache.get('quick_forecast');
    if (cached) return JSON.parse(cached);
    
    const data = { kpis: getKPIMetrics(), recent: getRecentTransactions(30) };
    const messages = [{
      role: 'user',
      content: `Быстрый прогноз в JSON: { summary: string, nextMonthRevenue: number, confidence: number, tip: string }. Данные: ${JSON.stringify(data)}`
    }];
    
    try {
      const result = JSON.parse(this._request(messages, '', 512));
      cache.put('quick_forecast', JSON.stringify(result), 3600);
      return result;
    } catch(e) {
      return { summary: 'Недостаточно данных', confidence: 0 };
    }
  },

  /**
   * Daily analysis for triggers
   */
  analyzeDaily: function(dashboardData) {
    const messages = [{
      role: 'user',
      content: `Ежедневный анализ дашборда. Верни JSON: { alerts: [{message, severity}], summary: string }. Данные: ${JSON.stringify(dashboardData)}`
    }];
    try {
      return JSON.parse(this._request(messages));
    } catch(e) {
      return { alerts: [], summary: 'Analysis failed' };
    }
  }
};
