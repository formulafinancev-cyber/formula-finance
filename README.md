# 🧮 Formula Finance

> Универсальный движок на Google Apps Script, превращающий «грязные»
> Google Sheets с выгрузками iiko и управленческими отчётами в
> роль-ориентированные дашборды, KPI-карточки, прогнозы и email-рассылки —
> без падений на неполных данных и без единого выдуманного числа.

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](#)
[![Platform](https://img.shields.io/badge/platform-Google%20Apps%20Script-green)](#)
[![Model](https://img.shields.io/badge/Claude-Opus%204.7-purple)](#)
[![License](https://img.shields.io/badge/license-Internal-gray)](#)

---

## Что это

Formula Finance — это одновременно:

1. **Claude Skill** (папка с `SKILL.md`), подключаемый к Claude Opus 4.7.
2. **Production-ready Apps Script проект** (содержимое `assets/apps-script/`),
   который заливается в редактор Google Apps Script одной книги Google Sheets.

Движок создан для HoReCa (рестораны, кафе, сети, dark kitchen), но работает
и в любой другой отрасли — достаточно заполнить JSON-профиль компании.

---

## Ключевые возможности

| Возможность | Описание |
|---|---|
| **Парсинг грязных таблиц** | 55+ типов отчётов iiko + управленческие (БДР, БДДС, ОПиУ, Баланс). Устойчив к копиям листов, датам, опечаткам, многострочным шапкам |
| **Plug-and-Play аналитика** | Блоки включаются автоматически по наличию источников. Нет отчёта — нет блока |
| **Роль-ориентированные дашборды** | CEO, CFO, Ops, General, Custom |
| **40+ KPI** | С HoReCa-бенчмарками и светофором |
| **ABC / XYZ / ABC×XYZ** | Матричный анализ меню |
| **Классические прогнозы** | Moving Average, Linear Regression, Holt-Winters, rolling 13-week cash forecast |
| **Email-рассылки** | По ролям, с HTML-шаблонами, inline-графиками, PDF/XLSX |
| **Веб-дашборд** | HtmlService + Tailwind + Alpine.js + Chart.js |
| **Триггеры** | Daily / Weekly / Monthly / On-demand + hourly watchdog |
| **Health-check** | Диагностический лист: инвентаризация, матрица доступности, карта атомов |

---

## Жёсткие инварианты

1. **Graceful Degradation** — движок не падает на неполных данных
2. **Zero Fabrication** — никаких выдуманных чисел, интерполяций, «примерно»
3. **Plug-and-Play** — блок активируется только при наличии источников
4. **Atom independence** — падение одной KPI не ломает соседние

---

## Структура репозитория

```
formula-finance/
├── SKILL.md                        # Манифест Claude Skill (YAML + инструкции)
├── CLAUDE.md                       # Контекст для Claude Code
├── README.md                       # Этот файл
├── appsscript.json                 # Манифест Apps Script (V8, scopes)
├── references/                     # Документация (progressive disclosure)
│   ├── 01-architecture.md          # Архитектура L1-L5, поток данных
│   ├── 02-report-taxonomy.md       # 55+ типов отчётов iiko + управленческие
│   ├── 03-kpi-catalog.md           # 40+ KPI с формулами и бенчмарками
│   ├── 04-horeca-metrics.md        # 12 канонических HoReCa-дашбордов
│   ├── 05-dashboard-ux.md          # UX-принципы дашбордов
│   ├── 06-fuzzy-parsing.md         # Алгоритм распознавания грязных таблиц
│   ├── 07-role-routing.md          # CEO / CFO / Ops / General / Custom
│   ├── 08-forecasting.md           # MA / LR / Holt-Winters + 13-week CF
│   ├── 09-dev-guide.md             # Онбординг нового клиента
│   ├── 10-data-integrity.md        # Контракт Zero Fabrication
│   └── 11-refresh-and-triggers.md  # Контракт обновлений и расписаний
├── assets/
│   ├── apps-script/                # Готовый .gs проект (V8)
│   ├── schemas/                    # Канонические JSON-схемы отчётов
│   ├── dictionaries/               # KPI, синонимы, бенчмарки, cron-пресеты
│   ├── profiles/                   # JSON-профили компаний
│   ├── templates/email/            # HTML-шаблоны писем
│   └── webapp/                     # Интерактивный веб-дашборд
├── scripts/                        # Утилиты валидации и инициализации
└── tests/                          # Фикстуры грязных книг + test runner
```

---

## Быстрый старт

### 1. Подключение как Claude Skill

Положи папку `formula-finance/` в список Claude Skills. Claude активирует её
автоматически по запросам про iiko, дашборды, KPI, HoReCa-аналитику,
управленческий учёт — см. `SKILL.md`, секция `when_to_use`.

### 2. Установка в Google Sheets

1. Открой целевую книгу с отчётами клиента
2. `Расширения → Apps Script` — создай файлы из `assets/apps-script/`
3. Залей `appsscript.json` (V8 runtime, OAuth scopes)
4. Запусти `FF.Setup.installAll()` — создаст меню, триггеры, служебные листы
5. Открой `🧮 Formula Finance → ⚙️ Настройки → Открыть профиль компании`
   и заполни JSON по шаблону из `assets/profiles/_template.json`

### 3. Первый прогон

```
🧮 Formula Finance → 🔄 Обновить → Обновить всё
```

Полный цикл: классификация листов → KPI → дашборды → Health-check → рассылка.
Проверь лист **`_FF_HealthCheck`** — там видно, что распознано и что не хватает.

---

## Меню Google Sheets

```
🧮 Formula Finance
├── 🔄 Обновить
│   ├── Обновить всё
│   ├── Дашборды (все / CEO / CFO / Ops / General)
│   ├── KPI-карточки (все / по роли / одна...)
│   ├── Прогнозы (все / один...)
│   ├── Точечно (выделение / активный лист)
│   └── Принудительно (игнорировать кэш)
├── 📧 Разослать отчёты (всем / CEO / CFO / Ops / General / тест)
├── ⏰ Расписание (day / week / month / триггеры / per-atom)
├── 🧪 Debug (Health-check / перераспознать / валидация / dry-run / кэш / лог)
├── 📋 Лог покрытия (_FF_Coverage)
├── ⚙️ Настройки (профиль / подписчики / язык / бренд)
└── ℹ️ О продукте
```

---

## Документация

| Файл | О чём |
|---|---|
| `references/01-architecture.md` | Архитектура движка, модули, поток данных |
| `references/02-report-taxonomy.md` | Каталог 55+ типов отчётов |
| `references/03-kpi-catalog.md` | 40+ KPI с формулами и бенчмарками |
| `references/04-horeca-metrics.md` | 12 канонических HoReCa-дашбордов |
| `references/05-dashboard-ux.md` | Принципы UX дашбордов |
| `references/06-fuzzy-parsing.md` | Распознавание грязных таблиц |
| `references/07-role-routing.md` | Маршрутизация по ролям |
| `references/08-forecasting.md` | MA / LR / Holt-Winters + 13-week CF |
| `references/09-dev-guide.md` | Онбординг нового клиента |
| `references/10-data-integrity.md` | Контракт Zero Fabrication |
| `references/11-refresh-and-triggers.md` | Контракт обновлений |

---

## Требования

- Google Workspace или личный Google-аккаунт
- Google Sheets книга с отчётами (iiko / управленческие)
- Права на запуск Apps Script
- Gmail / Drive (для рассылок и PDF-экспорта)
- Claude Opus 4.7 (для skill-режима)

---

## Технические детали

- **Runtime:** Google Apps Script V8
- **Namespace:** `FF` (FF.Core, FF.KPI, FF.Mailer, ...)
- **Служебные листы:** `_FF_Config`, `_FF_Coverage`, `_FF_HealthCheck`, `_FF_Log`
- **Язык кода:** идентификаторы EN, комментарии RU
- **Лимиты:** 6 мин/execution, 20 триггеров, Gmail 1500/день (Workspace)

---

*Formula Finance · v1.0.0 · built for Claude Opus 4.7 × Google Apps Script V8*
*Saint Petersburg, 2026*
