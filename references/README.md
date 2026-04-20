# 🧮 Formula Finance

> Universal Finance Dashboard Engine for Google Apps Script + Claude Opus 4.7 Skill

## Что это

**Formula Finance** — движок для автоматического построения финансовых дашбордов, KPI-карточек и аналитических прогнозов на основе данных из Google Sheets.

Работает с «грязными», хаотичными отчётами iiko и любыми управленческими отчётами (БДР, БДДС, ОПиУ, Баланс). Сам парсит, сам распознаёт, сам строит.

## Для кого

- **HoReCa** — рестораны, кафе, бары, сети общепита
- **Ритейл и другие** — любой бизнес с отчётами в Google Sheets

## Ключевые принципы

| Принцип | Суть |
|---------|------|
| **Graceful Degradation** | Нет данных для KPI — показывает статус, не падает |
| **Zero Fabrication** | Никогда не подставляет выдуманные числа |
| **Plug-and-Play** | Блок аналитики включается только если есть нужные отчёты |
| **Atom Independence** | Каждая карточка/график независимы друг от друга |

## Быстрый старт

1. Открой Google Sheets с отчётами iiko / управленческими отчётами
2. Открой Apps Script редактор (`Расширения → Apps Script`)
3. Скопируй все файлы из `assets/apps-script/` в редактор
4. Заполни профиль компании в `assets/profiles/_template.json` → сохрани в лист `_FF_Config`
5. Обнови `appsscript.json` из файла в этом репозитории
6. Перезагрузи таблицу — появится меню `🧮 Formula Finance`
7. Нажми `🧮 Formula Finance → 🧪 Debug → Health-check лист` — движок просканирует книгу
8. Нажми `🔄 Обновить → Обновить всё` — готово

## Меню в Google Sheets

```
🧮 Formula Finance
├── 🔄 Обновить
│   ├── Обновить всё
│   ├── Обновить CEO / CFO / Ops / General
│   ├── Обновить все KPI
│   ├── Обновить одну KPI...
│   ├── Пересчитать все прогнозы
│   └── Принудительно (игнорировать кэш)
├── 📧 Разослать отчёты
│   ├── Разослать всем сейчас
│   ├── Только CEO / CFO / Ops / General
│   └── Тестовая отправка на себя
├── ⏰ Расписание
│   ├── Ежедневное / Еженедельное / Ежемесячное
│   └── Посмотреть активные триггеры
├── 🧪 Debug
│   ├── Health-check лист
│   ├── Перераспознать все листы
│   ├── Dry-run рассылки
│   └── Очистить кэш
├── 📋 Лог покрытия
├── ⚙️ Настройки
└── ℹ️ О продукте
```

## Роли и дашборды

| Роль | Лист | Email | Расписание |
|------|------|-------|------------|
| CEO | `_FF_Dashboard_CEO` | Еженедельно Пн 09:00 | `ff_weekly` |
| CFO | `_FF_Dashboard_CFO` | Еженедельно Пн 09:00 | `ff_weekly` |
| Ops | `_FF_Dashboard_Ops` | Ежедневно 09:00 | `ff_daily` |
| General | `_FF_Dashboard_General` | Ежемесячно 1-го | `ff_monthly` |

## Аналитические блоки

| Блок | Требуемые отчёты | KPI |
|------|-----------------|-----|
| Продажи и гости | Продажи / Выручка / Средний чек | Revenue, Avg Check, Guests, RevPASH |
| Маржа и склад | Контроль себестоимости / Склад | Food Cost %, Prime Cost, Waste % |
| Закупки | Закупки / Накладные | Total Purchases, Price Variance |
| Финансы CFO | БДР / БДДС / Баланс / ОПиУ | EBITDA, WC, DSO, DPO, Liquidity |
| Расчёты | Поставщики / Оплаты | AP/AR, Overdue |
| KPI iiko | KPI iiko | Passthrough нативных KPI |
| Прогнозы | Любой ряд ≥ 12 точек | MA, LR, Holt-Winters |

## Структура репозитория

```
formula-finance/
├── SKILL.md                        ← манифест Claude Opus 4.7
├── README.md                       ← этот файл
├── appsscript.json                 ← манифест Apps Script (V8)
├── references/                     ← документация
│   ├── 01-architecture.md
│   ├── 02-report-taxonomy.md       ← 55+ типов отчётов iiko
│   ├── 03-kpi-catalog.md           ← 52 KPI с формулами
│   ├── 04-horeca-metrics.md        ← 12 HoReCa дашбордов
│   ├── 05-dashboard-ux.md
│   ├── 06-fuzzy-parsing.md         ← алгоритм распознавания
│   ├── 07-role-routing.md
│   ├── 08-forecasting.md           ← MA / LR / Holt-Winters
│   ├── 09-dev-guide.md             ← как подключить нового клиента
│   ├── 10-data-integrity.md        ← Zero Fabrication контракт
│   └── 11-refresh-and-triggers.md
├── assets/
│   ├── apps-script/                ← .gs файлы (копировать в Apps Script)
│   │   ├── 00_Config.gs
│   │   ├── 01_Brand.gs
│   │   ├── 10_Core_Engine.gs
│   │   ├── 20_Sheet_Scanner.gs
│   │   ├── 21_Fuzzy_Matcher.gs
│   │   ├── 22_Header_Detector.gs
│   │   ├── 23_Report_Classifier.gs
│   │   ├── 24_Content_Verifier.gs
│   │   ├── 25_Data_Guard.gs
│   │   ├── 26_Availability_Matrix.gs
│   │   ├── 27_Availability_Resolver.gs
│   │   ├── 28_HealthCheck.gs
│   │   ├── 30_Normalizer.gs
│   │   ├── 31_Period_Parser.gs
│   │   ├── 40_KPI_Calculator.gs
│   │   ├── 41_Forecast_Engine.gs
│   │   ├── 42_ABC_XYZ.gs
│   │   ├── 43_Recipe_Explosion.gs
│   │   ├── 44_AR_AP_Aging.gs
│   │   ├── 45_Network_Compare.gs
│   │   ├── 46_Variance_Analysis.gs
│   │   ├── 47_Concentration.gs
│   │   ├── 50_Dashboard_Builder.gs
│   │   ├── 51_KPI_Cards.gs
│   │   ├── 52_Role_Router.gs
│   │   ├── 53_Charts_Sales.gs
│   │   ├── 54_Charts_Finance.gs
│   │   ├── 55_Charts_Ops.gs
│   │   ├── 56_Mailer.gs
│   │   ├── 57_WebDashboard.gs
│   │   ├── 58_Cron.gs
│   │   ├── 59_PDF_Exporter.gs
│   │   ├── 70_Cache_Layer.gs
│   │   ├── 80_Logger.gs
│   │   ├── 90_Triggers.gs
│   │   ├── 91_Schedule_Router.gs
│   │   ├── 92_OnEdit.gs
│   │   ├── 99_Menu.gs
│   │   ├── A0_Debug.gs
│   │   └── A1_ScheduleUI.gs
│   ├── dictionaries/
│   │   ├── kpi-catalog.json
│   │   ├── iiko-report-patterns.json
│   │   ├── analytical-blocks.json
│   │   ├── benchmarks-horeca.json
│   │   ├── synonyms-ru.json
│   │   ├── synonyms-horeca.json
│   │   ├── schedule-presets.json
│   │   └── seasonality-profiles.json
│   ├── schemas/
│   │   ├── canonical-bdr.json
│   │   ├── canonical-bdds.json
│   │   ├── canonical-pnl.json
│   │   ├── canonical-balance.json
│   │   ├── iiko-olap-sales.json
│   │   ├── iiko-avg-check.json
│   │   ├── iiko-inventory.json
│   │   ├── iiko-purchases.json
│   │   ├── iiko-cash.json
│   │   └── iiko-counterparties.json
│   ├── profiles/
│   │   ├── _template.json
│   │   └── example-restaurant.json
│   ├── templates/
│   │   └── email/
│   │       ├── ceo.html
│   │       ├── cfo.html
│   │       ├── ops.html
│   │       ├── general.html
│   │       └── custom.html
│   └── webapp/
│       ├── index.html
│       ├── app.js
│       └── styles.css
└── tests/
    └── fixtures/
        └── README.md
```

## Технологии

- **Runtime:** Google Apps Script V8
- **Frontend:** Tailwind CSS + Alpine.js + Chart.js (HtmlService Web App)
- **Язык кода:** JavaScript (идентификаторы EN, комментарии RU)
- **Прогнозы:** Moving Average, Linear Regression, Holt-Winters
- **Порог распознавания:** ≥ 0.82 авто / 0.65–0.82 частично

## Лицензия

MIT — используй свободно, ссылка на авторство приветствуется.
