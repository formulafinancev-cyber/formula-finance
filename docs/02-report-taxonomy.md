# Report Taxonomy — Formula Finance v1.0.0

This document lists all recognised report types the Classifier can detect.
Fuzzy matching is used: sheet names need not match exactly.

---

## Detection strategy

1. Normalise sheet name: lowercase, remove punctuation, collapse spaces.
2. Strip common suffixes: `(копия)`, `_2024`, `_2025`, dates, etc.
3. Match against keyword groups (any 1+ keyword hit = candidate).
4. Resolve ambiguity by secondary keywords or sheet structure (header scan).
5. Return `reportType` enum or `UNKNOWN`.

---

## Financial Reports

### Group: P&L / Income
| Enum | Keywords | Notes |
|------|----------|-------|
| `BDR` | бдр, бюджет доходов расходов, p&l budget | Budget P&L |
| `PL_FACT` | пл факт, отчет прибылях, фактический пл | Actual P&L |
| `OPIУ` | опиу, отчет прибылях убытках | Income statement |
| `PL_PLAN` | план пл, плановый пл, pl plan | Budget plan P&L |

### Group: Cash Flow
| Enum | Keywords | Notes |
|------|----------|-------|
| `BDDS` | бддс, бюджет движения денежных средств | Budget CF |
| `CF_FACT` | дс факт, движение денег факт, cash flow fact | Actual CF |
| `CF_PLAN` | план дс, плановый кэш, cf plan | Plan CF |

### Group: Balance
| Enum | Keywords | Notes |
|------|----------|-------|
| `BALANCE` | баланс, балансовый отчет, balance sheet | Balance sheet |
| `BALANCE_PLAN` | плановый баланс, balance plan | Planned balance |

### Group: Debt / AR / AP
| Enum | Keywords | Notes |
|------|----------|-------|
| `DEBTS_AP` | задолженность контрагентам, кредиторская, кз, ap | Accounts payable |
| `DEBTS_AR` | дебиторская, дебиторка, дз, ar | Accounts receivable |
| `LOANS` | займы, кредиты, loan, debt schedule | Loan schedule |

---

## HoReCa Operational Reports (iiko)

### Group: Sales
| Enum | Keywords | Notes |
|------|----------|-------|
| `SALES_PERIOD` | продажи за период, отчет о продажах, выручка | Period sales |
| `AVG_CHECK` | средний чек, avg check, average check | Average bill |
| `COVERS` | количество гостей, число гостей, covers, guests | Guest count |
| `REVENUE_HOUR` | выручка по часам, revenue by hour, почасовая | Revenue by hour |
| `REVENUE_CATEGORY` | выручка по категориям, by category | Revenue by category |
| `REVENUE_WAITER` | выручка по официантам, by waiter | Revenue by waiter |
| `REVENUE_TABLE` | выручка по столам, by table | Revenue by table |

### Group: Menu
| Enum | Keywords | Notes |
|------|----------|-------|
| `MENU_ANALYSIS` | анализ меню, menu analysis, блюда | Menu performance |
| `ABC_ANALYSIS` | abc анализ, abc analysis | ABC classification |
| `STOPLIST` | стоп лист, стоплист, stop list | Stop list |

### Group: Inventory / COGS
| Enum | Keywords | Notes |
|------|----------|-------|
| `INVENTORY` | остатки на складе, складской остаток, inventory | Stock on hand |
| `WRITEOFF` | списание, write off, отходы, waste | Write-offs |
| `COGS` | себестоимость, food cost, cogs | Cost of goods |
| `PURCHASE` | закупки, поставки, purchases, procurement | Procurement |
| `INVOICE` | накладные, счета поставщиков, invoices | Supplier invoices |

### Group: Staff
| Enum | Keywords | Notes |
|------|----------|-------|
| `STAFF_HOURS` | рабочие часы, часы сотрудников, staff hours | Working hours |
| `PAYROLL` | зарплата, фот, payroll, wage | Payroll |
| `TIPS` | чаевые, tips | Tips |

### Group: iiko Specific
| Enum | Keywords | Notes |
|------|----------|-------|
| `IIKO_CONSOLIDATED` | сводный отчет iiko, consolidated iiko | iiko consolidated |
| `IIKO_CASH` | кассовый отчет, касса, iiko cash | Cash register |
| `IIKO_SHIFT` | отчет за смену, shift report | Shift report |
| `IIKO_DELIVERY` | доставка, delivery report | Delivery |
| `IIKO_DISCOUNT` | скидки, discounts, акции | Discounts/promo |
| `IIKO_LOYALTY` | лояльность, loyalty, бонусы | Loyalty program |

---

## Management / Planning Reports

| Enum | Keywords | Notes |
|------|----------|-------|
| `KPI_DASHBOARD` | kpi, ключевые показатели, дашборд | KPI overview |
| `BUDGET_VS_ACTUAL` | план факт, бюджет факт, budget vs actual | BvA |
| `FORECAST` | прогноз, forecast, план продаж | Sales forecast |
| `UNIT_ECONOMICS` | юнит экономика, unit economics | Unit economics |
| `BREAKEVEN` | точка безубыточности, breakeven, tbbu | Breakeven |
| `MANAGEMENT_REPORT` | управленческий отчет, management report | GM report |

---

## Special / Service

| Enum | Keywords | Notes |
|------|----------|-------|
| `SETTINGS_SHEET` | настройки, config, settings | FF config sheet |
| `DEBUG_SHEET` | debug, отладка, health check | FF debug sheet |
| `UNKNOWN` | — | Cannot classify |

---

## Total classified types: 55+

New types can be added in `src/classifier.gs` by extending the `REPORT_TYPES` registry
without modifying any other module (open/closed principle).
