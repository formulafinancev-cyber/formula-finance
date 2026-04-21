# KPI Catalog — Formula Finance v1.0.0

This catalog defines all KPI cards available in the system, their calculation logic,
benchmarks, and required data sources.

**Principle**: A KPI card is only rendered if its required source data exists.
No card is shown with fabricated or estimated values.

---

## Financial KPIs

### Revenue & Growth

| KPI | Formula | Benchmark | Required Report |
|-----|---------|-----------|----------------|
| Total Revenue | SUM(revenue rows) | Target from plan | SALES_PERIOD or BDR |
| Revenue Growth MoM | (Rev_curr - Rev_prev) / Rev_prev | +5-10% HoReCa | SALES_PERIOD |
| Revenue Growth YoY | (Rev_curr_year - Rev_prev_year) / Rev_prev_year | +10-20% | SALES_PERIOD |
| Revenue vs Plan | Rev_fact / Rev_plan - 1 | >= 0% | BDR + SALES_PERIOD |
| Revenue per Location | Total_Rev / Locations | Benchmark varies | SALES_PERIOD |

### Profitability

| KPI | Formula | Benchmark | Required Report |
|-----|---------|-----------|----------------|
| Gross Profit | Revenue - COGS | > 60% HoReCa | BDR or PL_FACT |
| Gross Margin % | Gross_Profit / Revenue | 60-70% restaurant | BDR or PL_FACT |
| EBITDA | GP - OpEx (excl. D&A) | 15-25% HoReCa | PL_FACT |
| EBITDA Margin % | EBITDA / Revenue | 15-25% | PL_FACT |
| Net Profit | Revenue - All_Costs | > 10% | PL_FACT or OPIU |
| Net Margin % | Net_Profit / Revenue | 8-15% restaurant | PL_FACT or OPIU |

### Costs

| KPI | Formula | Benchmark | Required Report |
|-----|---------|-----------|----------------|
| Food Cost % | COGS / Revenue | 25-35% restaurant | COGS + SALES_PERIOD |
| Labor Cost % | Payroll / Revenue | 25-35% restaurant | PAYROLL + SALES_PERIOD |
| Prime Cost % | (COGS + Labor) / Revenue | < 65% restaurant | COGS + PAYROLL |
| Rent % of Revenue | Rent / Revenue | < 10% | BDR + SALES_PERIOD |
| Total OpEx % | Total_OpEx / Revenue | < 30% | BDR or PL_FACT |

### Cash Flow

| KPI | Formula | Benchmark | Required Report |
|-----|---------|-----------|----------------|
| Operating Cash Flow | Cash_In - Cash_Out (operations) | Positive | CF_FACT or BDDS |
| Cash Balance | Closing_balance | > 2 months OpEx | BDDS or BALANCE |
| Cash Burn Rate | Monthly_OpEx_Cash | Monitored | CF_FACT |
| Days Cash on Hand | Cash_Balance / Daily_OpEx | > 30 days | BALANCE + BDR |

### Balance Sheet

| KPI | Formula | Benchmark | Required Report |
|-----|---------|-----------|----------------|
| Current Ratio | Current_Assets / Current_Liabilities | > 1.5 | BALANCE |
| Quick Ratio | (Cash + AR) / Current_Liabilities | > 1.0 | BALANCE |
| Debt/Equity Ratio | Total_Debt / Equity | < 2.0 | BALANCE |
| AR Days | AR / (Revenue/365) | < 30 days | BALANCE + SALES_PERIOD |
| AP Days | AP / (COGS/365) | 30-60 days | BALANCE + COGS |

---

## HoReCa Operational KPIs

### Sales Performance

| KPI | Formula | Benchmark | Required Report |
|-----|---------|-----------|----------------|
| Average Check | Revenue / Covers | Depends on segment | AVG_CHECK or COVERS+SALES |
| Covers (guests) | COUNT(guests) | Trend analysis | COVERS |
| Revenue per Cover | Revenue / Covers | Depends on segment | SALES_PERIOD + COVERS |
| Revenue per Seat Hour | Revenue / (Seats * Hours) | Maximize | REVENUE_HOUR |
| Table Turnover Rate | Covers / Seats | 2-4x lunch, 1-2x dinner | COVERS + config |

### Menu Performance

| KPI | Formula | Benchmark | Required Report |
|-----|---------|-----------|----------------|
| Top-10 Items by Revenue | Ranked by item revenue | - | MENU_ANALYSIS |
| Menu Item Margin | (Price - Cost) / Price | > 60% | MENU_ANALYSIS + COGS |
| ABC Class A% | Share of items = 80% revenue | 20% items | ABC_ANALYSIS |
| Stop List Rate | Stoplist_items / Total_menu | < 5% | STOPLIST |

### Inventory & COGS

| KPI | Formula | Benchmark | Required Report |
|-----|---------|-----------|----------------|
| Inventory Turnover | COGS / Avg_Inventory | > 15x restaurant | INVENTORY + COGS |
| Days Inventory | 365 / Inventory_Turnover | < 25 days | INVENTORY + COGS |
| Waste % | Writeoffs / Revenue | < 2-3% | WRITEOFF + SALES |
| Procurement Efficiency | Actual_COGS / Budget_COGS | <= 1.0 | PURCHASE + BDR |

### Staff Productivity

| KPI | Formula | Benchmark | Required Report |
|-----|---------|-----------|----------------|
| Revenue per Labor Hour | Revenue / Total_Staff_Hours | Maximize | STAFF_HOURS + SALES |
| Labor Productivity | Covers / Staff_Hours | Benchmark by type | COVERS + STAFF_HOURS |
| Overtime % | Overtime_Hours / Regular_Hours | < 10% | STAFF_HOURS |

---

## Forecast KPIs (require 3+ months history)

| KPI | Method | Required Report |
|-----|--------|----------------|
| Revenue Forecast (next month) | Linear regression or moving avg | SALES_PERIOD (3+ months) |
| Food Cost Forecast | Trend of food cost % | COGS (3+ months) |
| Cash Flow Forecast | Based on CF trend | CF_FACT (3+ months) |
| Breakeven Revenue | Fixed_Costs / Gross_Margin% | BDR + PL_FACT |

---

## KPI Card States

| State | Display | Condition |
|-------|---------|----------|
| `ACTIVE` | Value + trend + delta | All required data present |
| `NO_DATA` | `[DATA UNAVAILABLE]` | Required report missing |
| `PARTIAL` | Value only, no trend | Some periods missing |
| `FORECAST_ONLY` | Forecast indicator | < 3 months history |

---

## Benchmark Sources

- SimpleKPI Financial KPIs Framework (simplekpi.com)
- National Restaurant Association benchmarks
- HoReCa industry standards (Russia/CIS market)
- iiko Analytics benchmarks
- Internal company targets (from SETTINGS_SHEET)
