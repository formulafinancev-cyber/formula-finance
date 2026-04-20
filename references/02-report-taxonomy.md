# Таксономия отчётов

## 55+ типов распознаваемых отчётов

### iiko продажи
- iiko.sales_period
- iiko.sales
- iiko.revenue
- iiko.checks
- iiko.avg_check
- iiko.sales_brand
- iiko.dishes
- iiko.unsold_dishes
- iiko.network_revenue

### iiko финансы
- finance.balance
- finance.pnl
- finance.cashflow
- finance.bdr
- finance.bdds
- finance.opiu
- finance.counterparties
- finance.turnover_balance

### iiko закупки/склад
- iiko.purchases_period
- iiko.purchases_suppliers
- iiko.purchases
- iiko.inventory
- iiko.goods_movement
- iiko.writeoffs
- iiko.cost_control

### iiko KPI/касса
- iiko.kpi
- iiko.cash_balance
- iiko.payments

Полный список в `dictionaries/iiko-report-patterns.json`

## Алгоритм распознавания

1. Нормализация имени листа
2. Exact match
3. Synonym match
4. Fuzzy (Levenshtein + token-set) ≥ 0.82
5. Content verification
6. Manual override
