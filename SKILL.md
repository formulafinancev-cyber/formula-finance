---
name: Formula Finance
version: 1.0.0
model: claude-opus-4-7
description: |
  Universal Finance Dashboard Engine for Google Apps Script.
  Builds KPI dashboards, cards, analytical forecasts from Google Sheets data.
  Supports iiko reports, BDR, BDDS, PnL, Balance and any operational reports.
  Designed for HoReCa (restaurants, cafes, bars) and other businesses.
when_to_use: |
  Use this skill when the user needs to:
  - Build financial dashboards in Google Sheets
  - Create KPI cards (CEO/CFO/Ops/General roles)
  - Analyze iiko reports (sales, avg check, inventory, purchases, cash)
  - Parse dirty/messy Google Sheets reports automatically
  - Set up email delivery of reports by role
  - Build revenue/cost/cashflow forecasts
  - Implement ABC/XYZ dish analysis
  - Set up scheduled auto-refresh triggers
allowed-tools:
  - Read
  - Write
  - Bash
runtime: google-apps-script-v8
language: ru
---

# Formula Finance — Claude Opus 4.7 Skill

## Инварианты (нарушать запрещено)

1. **Graceful Degradation** — каждая KPI-карточка, виджет, прогноз независимы.
   Падение одного не роняет остальные.
2. **Zero Fabrication** — запрещено подставлять выдуманные числа, интерполировать
   пропуски, достраивать прогноз при нехватке истории. Только статусы:
   `OK | PARTIAL | STALE | NO_DATA | ERROR`
3. **Plug-and-Play** — блок аналитики включается только если все `requires` удовлетворены.
   Блок без данных не рендерится вовсе.
4. **Atom Independence** — каждый атом (KPI/chart/table) имеет собственный
   `requires`, `status`, `last_updated`, `data_hash`.

## Структура папки

```
formula-finance/
├── SKILL.md                          <- этот файл
├── README.md
├── references/                       <- документация (подгружается по требованию)
│   ├── 01-architecture.md
│   ├── 02-report-taxonomy.md
│   ├── 03-kpi-catalog.md
│   ├── 04-horeca-metrics.md
│   ├── 05-dashboard-ux.md
│   ├── 06-fuzzy-parsing.md
│   ├── 07-role-routing.md
│   ├── 08-forecasting.md
│   ├── 09-dev-guide.md
│   ├── 10-data-integrity.md
│   └── 11-refresh-and-triggers.md
├── assets/
│   ├── apps-script/                  <- .gs файлы проекта
│   ├── dictionaries/                 <- JSON словари
│   ├── schemas/                      <- канонические схемы отчётов
│   ├── profiles/                     <- профили компаний
│   ├── templates/email/              <- HTML шаблоны писем
│   └── webapp/                       <- интерактивный веб-дашборд
└── tests/
    └── fixtures/
```

## Namespace

Весь код использует глобальный объект `FF`:
- `FF.Config` — профиль, бренд, настройки
- `FF.Core` — оркестратор
- `FF.Scanner` — обход книги
- `FF.Classifier` — распознавание отчётов
- `FF.Fuzzy` — нечёткое сравнение
- `FF.HeaderDetector` — поиск заголовков
- `FF.Normalizer` — нормализация данных
- `FF.DataGuard` — Zero Fabrication guard
- `FF.KPICalculator` — расчёт KPI
- `FF.ForecastEngine` — MA/LR/Holt-Winters
- `FF.DashboardBuilder` — рендер дашбордов
- `FF.Mailer` — email рассылки
- `FF.Refresh` — API обновлений
- `FF.HealthCheck` — диагностика
- `FF.Logger` — логирование

## Роли

| Роль | Дашборд | Email | Триггер |
|------|---------|-------|---------|
| CEO | `_FF_Dashboard_CEO` | Еженедельно Пн 09:00 | `ff_weekly` |
| CFO | `_FF_Dashboard_CFO` | Еженедельно Пн 09:00 | `ff_weekly` |
| Ops | `_FF_Dashboard_Ops` | Ежедневно 09:00 | `ff_daily` |
| General | `_FF_Dashboard_General` | Ежемесячно 1-го | `ff_monthly` |

## Служебные листы

| Лист | Назначение |
|------|------------|
| `_FF_Config` | JSON профиль компании |
| `_FF_Coverage` | Отчёт о покрытии данных |
| `_FF_HealthCheck` | Диагностика + матрица блоков |
| `_FF_Log` | Лог выполнения |
| `_FF_AtomRegistry` | Реестр атомов с хэшами |

## Ссылки на документацию

- Архитектура: `references/01-architecture.md`
- Таксономия отчётов iiko: `references/02-report-taxonomy.md`
- Каталог KPI: `references/03-kpi-catalog.md`
- HoReCa метрики: `references/04-horeca-metrics.md`
- Контракт данных: `references/10-data-integrity.md`
- Гайд разработчика: `references/09-dev-guide.md`
