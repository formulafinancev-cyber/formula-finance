# HoReCa Metrics Guide — Formula Finance v1.0.0

Industry-specific metrics, benchmarks and formulas for restaurant, bar, cafe
and hospitality operations. Based on iiko analytics, industry standards and
best practices from leading HoReCa analytics platforms.

---

## Core HoReCa Financial Benchmarks

### Revenue Structure (typical restaurant)

| Stream | Share of Revenue | Notes |
|--------|-----------------|-------|
| Food | 60-70% | Main revenue |
| Beverages (non-alcohol) | 15-20% | - |
| Alcohol | 10-15% | License dependent |
| Delivery | 5-15% | Growing segment |
| Other | 1-5% | Catering, events |

### Cost Structure (full-service restaurant)

| Cost Category | % of Revenue | Alert Threshold |
|--------------|-------------|----------------|
| Food cost | 25-35% | > 38% |
| Beverage cost | 18-25% | > 28% |
| Labor cost | 25-35% | > 38% |
| Prime cost (food+labor) | 55-65% | > 68% |
| Occupancy (rent+utilities) | 8-12% | > 15% |
| Marketing | 2-5% | - |
| Other OpEx | 3-7% | - |
| **EBITDA target** | **15-25%** | < 12% = alert |

---

## Sales & Traffic Metrics

### Average Check (Средний чек)

```
Avg Check = Total Revenue / Number of Covers

Segment Benchmarks:
- Fast food: 300-600 ₽
- Casual dining: 800-1500 ₽  
- Fine dining: 2500-5000+ ₽
- Coffee shop: 350-600 ₽
- Bar: 600-1200 ₽
```

### Table Turnover Rate

```
Turnover = Covers / Available Seats

Benchmarks:
- Lunch peak: 2.0-4.0x
- Dinner: 1.5-2.5x
- All day: 1.5-3.0x
- Target: maximize without rushing guests
```

### Revenue per Available Seat Hour (RevPASH)

```
RevPASH = Total Revenue / (Seats * Operating Hours)

KPI for space efficiency - higher = better
Benchmark: compare against own historical data
```

### Revenue per Waiter

```
Rev/Waiter = Total Revenue / Number of Waiters

Measures staff efficiency
Monitor trends vs. seasonality
```

---

## Kitchen & Menu Metrics

### Food Cost %

```
Food Cost % = Ingredient Cost / Food Revenue * 100

Target: 25-35%
Alert: > 38%
Tracked per: dish, category, period
```

### Menu Item Performance (Menu Engineering Matrix)

```
Quadrants by Popularity x Profitability:

STARS:    High popularity + High margin  → Promote, protect recipe
PLOWHORSES: High popularity + Low margin  → Reprice or reformulate
PUZZLES:  Low popularity + High margin   → Reposition, promote
DOGS:     Low popularity + Low margin    → Remove from menu
```

### Waste & Write-offs

```
Waste % = Write-offs Value / Revenue * 100

Target: < 2%
Alert: > 3%
Categories: spoilage, overproduction, errors
```

### Inventory Turnover

```
Inventory Turnover = COGS / Average Inventory Value

Restaurant target: > 15x per year (turnover every ~24 days)
Alert: < 10x (inventory sitting too long)
```

---

## Staff Metrics

### Labor Cost %

```
Labor % = Total Labor Cost / Revenue * 100

Full service: 30-35%
Fast casual: 25-30%
Alert: > 38%
```

### Revenue per Labor Hour

```
Rev/Labor Hour = Revenue / Total Staff Hours Worked

Measures overall staff productivity
Track by shift, day type (weekday/weekend)
```

### Staff-to-Cover Ratio

```
Covers per Waiter = Covers / Number of Waiters

Full service target: 15-25 covers per waiter
Fast casual: 40-60 covers per staff
```

---

## Delivery & Omnichannel Metrics

| Metric | Formula | Benchmark |
|--------|---------|----------|
| Delivery Revenue % | Delivery_Rev / Total_Rev | 10-25% |
| Avg Delivery Check | Delivery_Rev / Delivery_Orders | 1.2-1.5x dine-in avg check |
| Delivery Order Time | Avg minutes to delivery | < 45 min |
| Cancellation Rate | Cancelled / Total_Orders | < 5% |

---

## iiko-Specific Data Points

### Reports available from iiko

| iiko Report | Key Metrics Extracted |
|-------------|----------------------|
| Sales by period | Revenue, covers, avg check by day/shift |
| Shift report | Revenue, transactions, cash/card split |
| Menu analysis | Sales quantity, revenue, margin per dish |
| ABC analysis | ABC classification of menu items |
| Write-offs | Waste by ingredient, reason |
| Staff hours | Hours worked by employee, role |
| Cash register | Cash in/out, Z-report |
| Inventory | Stock levels, reorder alerts |
| Procurement | Purchase orders, delivery status |
| Discounts | Promotions applied, discount amounts |

### iiko Report Quality Notes

- Reports may contain service rows (totals, subtotals, headers)
- Column orders can vary between iiko versions
- Date formats may differ (DD.MM.YYYY, YYYY-MM-DD)
- Numeric values may use comma as decimal separator
- Empty rows between sections are common
- Parser must handle all these cases gracefully

---

## Seasonal Adjustments

```
For Russian/CIS HoReCa market:
- Peak season: May-August (summer, terraces)
- Holiday spikes: Dec 25 - Jan 14 (NY/Christmas)
- Low season: Feb-March, August (vacation)
- Weekly: Fri-Sat = 1.3-1.8x weekday revenue
- Ramadan: affects regions with Muslim population
```

---

## Profitability Improvement Levers

1. **Average Check** - upsell, add-on items, premium options
2. **Covers** - faster turnover, extended hours, reservations
3. **Food Cost** - menu engineering, supplier negotiations, portion control
4. **Labor Efficiency** - scheduling optimization, cross-training
5. **Waste Reduction** - better forecasting, FIFO, prep optimization
6. **Menu Mix** - shift customers toward higher-margin items
