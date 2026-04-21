# Fuzzy Parsing Algorithm — Formula Finance v1.0.0

This document describes the fuzzy sheet name and content recognition algorithm
used by `FF.Classifier` to identify report types in messy, real-world Google Sheets.

---

## The Problem

Real-world iiko and financial reports have inconsistent naming:
- `БДР 2025` vs `Бюджет доходов и расходов январь 2025`
- `План-Факт` vs `Плановый отчет (копия) 2`
- `Sales_2025_01` vs `Отчет о продажах за период_январь_2025 (копия)`
- Multi-tab books with unrelated sheets mixed in
- Service sheets: `Служебный`, `Sheet1`, `Темп`, `DEBUG`

---

## Algorithm: 5-Step Pipeline

### Step 1: Normalise

```javascript
function normalise(name) {
  return name
    .toLowerCase()           // нижний регистр
    .replace(/[\u0028\u0029_\-\/\\,.;:!?]/g, ' ')  // убрать пунктуацию
    .replace(/\d{4}/g, ' ')  // удалить 4-цифровые годы
    .replace(/\s+/g, ' ')    // collapse spaces
    .trim();
}
```

### Step 2: Strip noise suffixes

Remove common suffixes that don't affect meaning:
```
копия, copy, 2, 3, (1), jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec,
янв, фев, мар, апр, май, июн, июл, авг, сен, окт, ноя, дек,
q1, q2, q3, q4, ytd, mtd, qtd
```

### Step 3: Keyword Match

Each report type has a keyword set. Match = any token in normalised name.

```javascript
const REPORT_PATTERNS = {
  BDR:           ['бдр', 'бюджет доходов', 'p&l budget', 'доходы расходы'],
  PL_FACT:       ['пл факт', 'фактический пл', 'отчет прибылях'],
  BDDS:          ['бддс', 'движение денежных', 'cash flow budget'],
  CF_FACT:       ['дс факт', 'cash flow fact', 'движение денег факт'],
  BALANCE:       ['баланс', 'balance sheet'],
  SALES_PERIOD:  ['продажи за период', 'отчет о продажах', 'выручка'],
  AVG_CHECK:     ['средний чек', 'avg check', 'average check'],
  INVENTORY:     ['остатки склад', 'складской остаток', 'inventory'],
  // ... all 55+ types
};

function matchKeywords(normalised, patterns) {
  for (const [type, keywords] of Object.entries(patterns)) {
    if (keywords.some(kw => normalised.includes(kw))) {
      return type;
    }
  }
  return null;
}
```

### Step 4: Ambiguity Resolution

Some names match multiple types. Resolve by priority and secondary scan:

```javascript
// Priority order for ambiguous matches
const PRIORITY = [
  'BDR', 'BDDS', 'BALANCE',  // specific financial reports first
  'PL_FACT', 'CF_FACT',
  'SALES_PERIOD', 'AVG_CHECK', 'COVERS',
  'INVENTORY', 'COGS', 'WRITEOFF',
  'UNKNOWN'
];

// If name match fails, scan top 5 rows of sheet for header keywords
function scanHeaders(sheet) {
  const rows = sheet.getRange(1, 1, Math.min(5, sheet.getLastRow()), 
                               Math.min(10, sheet.getLastColumn()))
                    .getValues();
  // flatten and normalise
  const headerText = rows.flat().join(' ').toLowerCase();
  return matchKeywords(headerText, REPORT_PATTERNS);
}
```

### Step 5: Confidence Score

```javascript
function classify(sheetName, sheet) {
  const norm = normalise(sheetName);
  
  // Try name match
  let type = matchKeywords(norm, REPORT_PATTERNS);
  let confidence = type ? 0.9 : 0;
  
  // Fallback: header scan
  if (!type) {
    type = scanHeaders(sheet);
    confidence = type ? 0.6 : 0;
  }
  
  // Still unknown
  if (!type) {
    type = 'UNKNOWN';
    confidence = 0;
  }
  
  return { type, confidence, sheetName, norm };
}
```

---

## Handling Duplicate Sheets

When multiple sheets match the same report type:
1. Prefer the sheet without "(копия)" or "copy" suffix
2. If dates are present, prefer the most recent
3. Log all duplicates to Debug sheet
4. Use highest-confidence match

```javascript
function resolveDuplicates(matches) {
  // Group by reportType
  const groups = _.groupBy(matches, 'type');
  
  for (const [type, candidates] of Object.entries(groups)) {
    if (candidates.length > 1) {
      // Score: -10 if contains 'копия' or 'copy'
      //        +5 if has no date suffix (cleaner name)
      //        +3 if higher row count (more data)
      const scored = candidates.map(c => ({
        ...c,
        score: c.confidence * 10
          - (c.norm.includes('копия') || c.norm.includes('copy') ? 10 : 0)
          + (c.rowCount > 5 ? 3 : 0)
      }));
      groups[type] = [scored.sort((a,b) => b.score - a.score)[0]];
    }
  }
  return Object.values(groups).flat();
}
```

---

## Multi-Report Books

A single workbook may contain multiple different reports. All sheets are classified
independently. The Registry then maps each classified sheet to relevant analytics blocks.

---

## Parser Data Extraction

After classification, the Parser extracts structured data:

```javascript
function extractMetrics(sheet, reportType) {
  // Use type-specific extractor
  const extractor = EXTRACTORS[reportType];
  if (!extractor) return null;
  
  try {
    return extractor(sheet);
  } catch (e) {
    Logger.log('Extraction failed: ' + e);
    FF.Debug.logError(sheet.getName(), reportType, e.message);
    return null;  // Never crash, always log and continue
  }
}
```

---

## Robustness Rules

1. Never throw uncaught exceptions during parsing
2. Log all errors to Debug sheet and continue
3. Skip service sheets: `Sheet1`, `Служебный`, `Темп`, `DEBUG`, `_FF_*`
4. Handle merged cells gracefully (read value from first cell)
5. Handle comma decimal separators (Russian locale)
6. Handle empty rows as section separators, not data
7. Skip rows where all numeric cells are zero or empty
8. Detect multi-header rows (scan for data start)
