# Northern Pest Control - Pricing Data Syntax Fix

## Issue Identified
The services weren't loading due to **invalid JSON syntax in the Pricing_Data field** for two services.

## Problem Services

### 1. Rodent Control Plan (Row 5)
**BAD** (Two separate arrays):
```json
[{"serviceType":"Rodent Control","sqftMin":0,"sqftMax":4000,"firstPrice":"$150","recurringPrice":"$150/Quarter"}][{"serviceType":"Estimate","sqftMin":4001,"sqftMax":999999,"firstPrice":"","recurringPrice":"Requires Client Follow Up"}]
```

**FIXED** (Single array with comma):
```json
[{"serviceType":"Rodent Control","sqftMin":0,"sqftMax":4000,"firstPrice":"$150","recurringPrice":"$150/Quarter"},{"serviceType":"Estimate","sqftMin":4001,"sqftMax":999999,"firstPrice":"","recurringPrice":"Requires Client Follow Up"}]
```

### 2. One-time Rodent Control (Row 6)
**BAD** (Two separate arrays):
```json
[{"serviceType":"Rodent Control","sqftMin":0,"sqftMax":4000,"firstPrice":"$150","recurringPrice":"$150/Quarter"}][{"serviceType":"Estimate","sqftMin":4001,"sqftMax":999999,"firstPrice":"","recurringPrice":"Requires Client Follow Up"}]
```

**FIXED** (Single array with comma):
```json
[{"serviceType":"Rodent Control","sqftMin":0,"sqftMax":4000,"firstPrice":"$150","recurringPrice":"$150/Quarter"},{"serviceType":"Estimate","sqftMin":4001,"sqftMax":999999,"firstPrice":"","recurringPrice":"Requires Client Follow Up"}]
```

## What Was Wrong
- The syntax `][` creates two separate arrays: `[...]` and `[...]`
- This is invalid JSON and causes `JSON.parse()` to fail
- When the Google Apps Script tries to parse this in `Code.gs` line 2990:
  ```javascript
  pricingTiers: JSON.parse(row[13] || '[]')
  ```
- It throws an error, which likely causes the entire service loading to fail

## How to Fix in Google Sheets

1. Open your Master Sheet: `1WId_kg8Fu0dbnpWSSQQVv-GJJibaeSu7p23PEaeePec`
2. Go to the **Services** tab
3. Find the rows for:
   - Rodent Control Plan
   - One-time Rodent Control
4. In the **Pricing_Data** column (column N), replace `][` with `,`
5. Save the changes
6. Test the profile URL again

## Prevention Tips

### Valid JSON Array Structure:
```json
[
  {"item": "1"},
  {"item": "2"}
]
```
✅ Notice the **comma** between objects

### Invalid JSON:
```json
[{"item": "1"}][{"item": "2"}]
```
❌ Two separate arrays - will fail to parse

### Quick Validation
To test if your JSON is valid before adding it to the sheet:
1. Copy the JSON string
2. Go to https://jsonlint.com/
3. Paste and click "Validate JSON"
4. Fix any errors it reports

## After Fixing

Once you update the Services sheet, your Northern Pest Control profile should load all 18 services correctly:

1. Home Protection Plan (Quarterly)
2. One-time General Pest Control
3. Mosquito & Tick Control (April–October)
4. Rodent Control Plan ✅ FIXED
5. One-time Rodent Control ✅ FIXED
6. Cockroach Control
7. One-time Stinging Insect Service
8. Carpenter Ant Service
9. Carpenter Bee Service
10. Termite Installation
11. Termite Contract Renewal
12. Bed Bug Treatment
13. Exterior Bait Boxes
14. Emergency Service
15. Over 15 Feet High
16. Over 25 Feet High
17. Service Call Condominium

## Code Reference

The parsing happens in `Code.gs` at the `getServicesData()` function:

```javascript:2990:2990:Code.gs
pricingTiers: JSON.parse(row[13] || '[]'), // Pricing_Data
```

If this line throws an error due to invalid JSON, it can stop the entire service array from being built correctly.



