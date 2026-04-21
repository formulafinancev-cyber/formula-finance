# Architecture — Formula Finance v1.0.0

## Overview

Formula Finance is a Google Apps Script (V8) engine that runs inside Google Sheets.
It reads source data from one or more Google Sheets workbooks ("iiko books"), classifies
sheets using fuzzy matching, extracts financial and operational metrics, and renders
dashboards + KPI cards. Reports can be delivered via Gmail to role-based recipients
(CEO / CFO / Ops / General / Custom).

---

## Top-level namespace: `FF`

All modules live under the global `FF` object to avoid name collisions inside Apps Script.

```
FF
├── Config         – runtime settings (spreadsheet IDs, email lists, triggers)
├── Menu           – Google Sheets custom menu builder
├── Parser         – raw sheet reader + data normalisation
├── Classifier     – fuzzy report-type detector (55+ types)
├── Registry       – plug-and-play metadata: which blocks are available
├── KPI            – KPI card builders (financial + HoReCa)
├── Dashboard      – sheet renderers for each role
├── Email          – HTML email composer + GmailApp sender
├── Triggers       – installable trigger manager (daily / weekly / monthly)
├── Debug          – health-check sheet writer
└── Utils          – shared helpers (dates, numbers, strings, logging)
```

---

## Data flow

```
[Source Google Sheets (iiko / manual)]
        │
        ▼
 FF.Parser.readBook(ssId)
        │  returns: { sheetName, rawData[][], meta }
        ▼
 FF.Classifier.classify(sheetMeta)
        │  returns: reportType (enum) | UNKNOWN
        ▼
 FF.Registry.buildAvailableBlocks(classifiedSheets[])
        │  returns: BlockDescriptor[] (only blocks with enough data)
        ▼
 FF.KPI / FF.Dashboard.render(blockDescriptors)
        │  writes to dedicated sheets: CEO_DASH, CFO_DASH, OPS_DASH, GENERAL_DASH
        ▼
 FF.Email.send(role, reportData)
        │  GmailApp → role recipients
        ▼
 FF.Debug.writeHealthCheck()
```

---

## Graceful Degradation principle

- Every block checks `BlockDescriptor.isAvailable` before rendering.
- If a required report type is missing → block is **hidden**, not fabricated.
- Zero invented numbers: all metrics come from real parsed cells.
- Partial data → partial dashboard, clearly labelled `[DATA UNAVAILABLE]`.

---

## Source file map

| File | Responsibility |
|------|----------------|
| `src/main.gs` | Entry points, wiring |
| `src/parser.gs` | Sheet reading, cleaning |
| `src/classifier.gs` | Fuzzy type detection |
| `src/registry.gs` | Block availability logic |
| `src/kpi.gs` | KPI card computation + render |
| `src/dashboard.gs` | Dashboard layout + formatting |
| `src/email.gs` | Email composition + delivery |
| `src/menu.gs` | Custom menu (🧮 Formula Finance) |
| `src/triggers.gs` | Installable trigger management |
| `src/debug.gs` | Health-check + coverage log |
| `src/utils.gs` | Shared utilities |
| `src/config.gs` | Settings sheet read/write |

---

## Role-based report targets

| Role | Audience | Key blocks |
|------|----------|------------|
| CEO | Executive | P&L summary, Revenue trend, Forecast, Top KPIs |
| CFO | Finance | Cash flow, Budget vs Actual, Debt, Balance |
| Ops | Operations | Avg check, Covers, Waste, Staff hours, iiko ops |
| General | All | Combined KPI overview |
| Custom | Configurable | Any subset |

---

## Trigger schedule

| Frequency | Default time | Function |
|-----------|-------------|----------|
| Daily | 07:00 | `FF.Triggers.runDaily()` |
| Weekly | Mon 08:00 | `FF.Triggers.runWeekly()` |
| Monthly | 1st 08:00 | `FF.Triggers.runMonthly()` |
| On demand | Manual | `FF.Menu.updateAll()` |

---

## Apps Script constraints respected

- Execution limit: 6 min (script split into batches if needed)
- No external HTTP calls without `UrlFetchApp` whitelisting
- All UI via `SpreadsheetApp` / `HtmlService`
- Runtime: V8 (`// @ts-check` compatible)
