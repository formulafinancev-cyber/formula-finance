---
name: formula-finance
version: 1.0.0
description: >
  Universal financial analytics engine for Google Sheets.
  Parses messy iiko / manual reports, classifies sheet types via fuzzy matching,
  builds role-based dashboards (CEO / CFO / Ops / General / Custom),
  renders KPI cards, generates forecasts, and delivers HTML email reports.
author: formulafinancev-cyber
license: MIT
platform: Google Apps Script (V8)
sheet_url: null
target_industries:
  - HoReCa (restaurants, bars, cafes)
  - Retail
  - Multi-unit F&B
---

# SKILL — Formula Finance

## What this skill does

`formula-finance` is a Google Apps Script skill that connects to one or more
Google Sheets workbooks (typically iiko exports and manual financial reports),
automatically classifies all sheets, extracts metrics, and produces:

- Interactive dashboards per role (CEO / CFO / Ops / General)
- KPI cards with traffic-light status, trend arrows, and benchmark comparison
- Analytical forecasts (where 3+ months of data exist)
- HTML email reports delivered via GmailApp to role-specific recipients
- A Debug/health-check sheet showing coverage and data quality

## Invariants

1. **Zero Fabrication** — no invented numbers. Missing data → `[DATA UNAVAILABLE]`
2. **Graceful Degradation** — partial data → partial dashboard; script never crashes
3. **Fuzzy Parsing** — sheet names can be messy, have dates, copies, typos
4. **Plug-and-play** — works with whatever reports exist; adapts automatically

## Usage instructions for Claude

When implementing code for this skill:

1. All functions live under the `FF` global namespace
2. Follow the module boundaries in `src/01-architecture.md`
3. Every function must have try/catch with `FF.Debug.logError()` in catch
4. Check `BlockDescriptor.isAvailable` before any rendering
5. Use `FF.Utils.safeNumber()` for all cell value reads
6. Report types are defined in `src/classifier.gs` — add new types there only
7. Dashboard sheets are prefixed `_FF_` to identify system sheets
8. Config is read from the `_FF_CONFIG` sheet

## Project structure

```
formula-finance/
├── README.md              – Project overview
├── SKILL.md               – This file (skill metadata)
├── docs/
│   ├── 01-architecture.md
│   ├── 02-report-taxonomy.md
│   ├── 03-kpi-catalog.md
│   ├── 04-horeca-metrics.md
│   ├── 05-dashboard-ux.md
│   └── 06-fuzzy-parsing.md
└── src/
    ├── main.gs            – Entry points
    ├── config.gs          – Settings
    ├── parser.gs          – Sheet reader
    ├── classifier.gs      – Fuzzy classifier
    ├── registry.gs        – Block availability
    ├── kpi.gs             – KPI cards
    ├── dashboard.gs       – Dashboard renderer
    ├── email.gs           – Email delivery
    ├── menu.gs            – Custom menu
    ├── triggers.gs        – Trigger manager
    ├── debug.gs           – Health check
    └── utils.gs           – Helpers
```

## Key references

- iiko Help: https://ru.iiko.help/home/ru-ru/
- SimpleKPI Financial KPIs: https://www.simplekpi.com/KPI-Templates/Financial-KPIs
- Xenia Restaurant Dashboards: https://www.xenia.team/articles/restaurant-dashboards
- Smartsheet Dashboards: https://www.smartsheet.com/platform/features#dashboards
- AgentSkills GAS: https://agentskills.so/skills/jezweb-claude-skills-google-apps-script
