# Источники данных

## Обзор

Система Formula Finance поддерживает интеграцию с множественными источниками операционных и финансовых данных для построения комплексных аналитических решений.

## Основные источники данных

### 1. Google Sheets

**Назначение:** Основное хранилище операционных данных

**Типы данных:**
- Финансовые транзакции
- Операционные метрики
- Бюджетные показатели
- Исторические данные

**Возможности:**
- Чтение данных через Google Apps Script API
- Запись результатов аналитики
- Динамическое обновление источников
- Поддержка формул и вычислений

**Пример конфигурации:**
```javascript
const DATA_SOURCE = {
  spreadsheetId: 'YOUR_SPREADSHEET_ID',
  sheets: {
    transactions: 'Транзакции',
    budget: 'Бюджет',
    kpi: 'КПI'
  }
};
```

### 2. Claude Opus 4.7 API

**Назначение:** Аналитический движок и генерация инсайтов

**Возможности:**
- Анализ финансовых данных
- Прогнозирование трендов
- Генерация рекомендаций
- Обработка естественного языка
- Автоматическая категоризация транзакций

**Типы запросов:**
- Анализ временных рядов
- Выявление аномалий
- Прогнозное моделирование
- Текстовая аналитика

**Пример использования:**
```javascript
const analyzeFinancialData = async (data) => {
  const response = await callClaudeAPI({
    model: 'claude-opus-4.7',
    messages: [{
      role: 'user',
      content: `Проанализируй финансовые данные: ${JSON.stringify(data)}`
    }]
  });
  return response.analysis;
};
```

### 3. Внешние API

**Поддерживаемые источники:**
- Банковские API
- CRM системы
- ERP системы
- Платежные шлюзы

**Методы интеграции:**
- REST API
- Webhooks
- Scheduled polling

## Форматы данных

### Входные данные

**CSV/Excel:**
- Стандартный формат для импорта
- Автоматическое определение структуры
- Поддержка различных кодировок

**JSON:**
```json
{
  "date": "2024-01-15",
  "category": "Операционные расходы",
  "amount": 15000,
  "description": "Закупка оборудования"
}
```

**Google Sheets Range:**
```javascript
const range = 'Транзакции!A2:E1000';
const values = sheet.getRange(range).getValues();
```

### Выходные данные

**Дашборды:**
- HTML/CSS визуализации
- Встроенные графики
- Интерактивные элементы

**Отчеты:**
- PDF генерация
- Excel экспорт
- Email рассылка

## Структура данных

### Транзакции
```javascript
{
  id: String,
  date: Date,
  category: String,
  subcategory: String,
  amount: Number,
  currency: String,
  description: String,
  tags: Array<String>,
  metadata: Object
}
```

### KPI метрики
```javascript
{
  metric_name: String,
  value: Number,
  target: Number,
  period: String,
  trend: String, // 'up', 'down', 'stable'
  change_percent: Number
}
```

### Прогнозы
```javascript
{
  metric: String,
  forecast_date: Date,
  predicted_value: Number,
  confidence_interval: {
    lower: Number,
    upper: Number
  },
  model: String
}
```

## Обновление данных

### Режимы обновления

**Real-time:**
- Триггеры Google Sheets
- Webhooks от внешних систем
- Немедленная обработка

**Scheduled:**
- Ежедневные обновления
- Еженедельные отчеты
- Месячные аналитические сводки

**On-demand:**
- Ручной запуск через меню
- API вызовы
- Кнопки в интерфейсе

### Конфигурация триггеров

```javascript
function setupTriggers() {
  // Ежедневное обновление в 9:00
  ScriptApp.newTrigger('updateDailyMetrics')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
  
  // При изменении данных
  ScriptApp.newTrigger('onDataChange')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onChange()
    .create();
}
```

## Валидация данных

### Правила валидации

**Обязательные поля:**
- Date (формат: YYYY-MM-DD)
- Amount (число)
- Category (из справочника)

**Проверки:**
```javascript
const validateTransaction = (transaction) => {
  const errors = [];
  
  if (!transaction.date || !isValidDate(transaction.date)) {
    errors.push('Некорректная дата');
  }
  
  if (!transaction.amount || isNaN(transaction.amount)) {
    errors.push('Некорректная сумма');
  }
  
  if (!transaction.category) {
    errors.push('Не указана категория');
  }
  
  return errors;
};
```

## Кэширование

### Стратегия кэширования

**CacheService:**
```javascript
const cacheData = (key, data, ttl = 3600) => {
  const cache = CacheService.getScriptCache();
  cache.put(key, JSON.stringify(data), ttl);
};

const getCachedData = (key) => {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(key);
  return cached ? JSON.parse(cached) : null;
};
```

**PropertiesService для постоянного хранения:**
```javascript
const saveConfig = (config) => {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('config', JSON.stringify(config));
};
```

## Безопасность данных

### Защита конфиденциальных данных

**API ключи:**
- Хранение в Script Properties
- Никогда не хардкодить в коде
- Ротация ключей

**Доступ к данным:**
- Проверка прав пользователя
- Логирование доступа
- Шифрование чувствительных данных

```javascript
const getAPIKey = () => {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty('CLAUDE_API_KEY');
};
```

## Мониторинг источников

### Проверка доступности

```javascript
const checkDataSources = () => {
  const status = {
    sheets: checkSheetsConnection(),
    claude: checkClaudeAPI(),
    external: checkExternalAPIs()
  };
  
  logStatus(status);
  return status;
};
```

### Обработка ошибок

```javascript
const handleDataSourceError = (error, source) => {
  Logger.log(`Ошибка источника ${source}: ${error.message}`);
  
  // Отправка уведомления
  sendErrorNotification({
    source: source,
    error: error.message,
    timestamp: new Date()
  });
  
  // Попытка использования кэша
  return getCachedData(source);
};
```

## Расширение источников

### Добавление нового источника

1. Создать класс источника
2. Реализовать интерфейс DataSource
3. Добавить конфигурацию
4. Зарегистрировать в системе

**Пример:**
```javascript
class CustomDataSource {
  constructor(config) {
    this.config = config;
  }
  
  async fetchData() {
    // Реализация получения данных
  }
  
  async validateData(data) {
    // Реализация валидации
  }
  
  async transformData(data) {
    // Реализация трансформации
  }
}
```
