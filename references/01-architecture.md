# Архитектура Formula Finance

## 5-слойная архитектура

```
1. Parsing Layer    — Scanner → Fuzzy Matcher → Classifier → Content Verifier
2. Guard Layer      — Data Guard (Zero Fabrication), Header Detector
3. Analytics Layer  — KPI Calculator, Forecast Engine, ABC/XYZ, Aging, Variance
4. Render Layer     — Dashboard Builder, Role Router, Chart Factory, KPI Cards
5. Delivery Layer   — Mailer, Web Dashboard, Triggers, Schedule Router
```

## Инварианты

1. **Graceful Degradation** — падение одного атома не роняет остальные
2. **Zero Fabrication** — никогда не подставлять выдуманные числа
3. **Plug-and-Play** — блок включается только если есть `requires`
4. **Atom Independence** — каждый атом независим

## Поток данных

1. `FF.Core.runAll()` — запуск полного цикла
2. Scanner — обход всех листов
3. Classifier — распознавание канонов
4. Normalizer — приведение к dataContext
5. Data Guard — проверка перед расчётами
6. KPI Calculator + Forecast Engine
7. Dashboard Builder — рендер
8. HealthCheck + Coverage — логи

## Namespace `FF`

Все модули висят на `FF.*` — `FF.Config`, `FF.Scanner`, `FF.Fuzzy`, `FF.KPICalculator`, `FF.Mailer` и т.д.

## Runtime V8

Google Apps Script V8: `let`, `const`, arrow functions, classes.
