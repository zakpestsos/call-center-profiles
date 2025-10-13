# Additive Bundle Pricing Format

## The Problem

Current format doesn't clearly show that component prices **add up** to the total. Agents need to see the math!

## The Solution

### NEW Pricing_Data Format (Recommended)

```json
[
  {
    "sqftMin": 0,
    "sqftMax": 21780,
    "acreage": "1/2 Acre",
    "components": [
      {
        "name": "GPC - Barrier 360",
        "shortCode": "B360",
        "firstPrice": "$69.00",
        "recurringPrice": "$69.00"
      },
      {
        "name": "Mosquito Control",
        "shortCode": "Mosq",
        "firstPrice": "$40.00",
        "recurringPrice": "$40.00"
      }
    ],
    "totalFirst": "$109.00",
    "totalRecurring": "$109.00"
  },
  {
    "sqftMin": 21781,
    "sqftMax": 43560,
    "acreage": "1 Acre",
    "components": [
      {
        "name": "GPC - Barrier 360",
        "shortCode": "B360",
        "firstPrice": "$89.00",
        "recurringPrice": "$89.00"
      },
      {
        "name": "Mosquito Control",
        "shortCode": "Mosq",
        "firstPrice": "$40.00",
        "recurringPrice": "$40.00"
      }
    ],
    "totalFirst": "$129.00",
    "totalRecurring": "$129.00"
  }
]
```

### How It Displays

```
For 1/2 Acre Property (0 - 21,780 sq ft):

GPC - Barrier 360 (B360)         First: $69.00  Recurring: $69.00
                                         +
Mosquito Control (Mosq)          First: $40.00  Recurring: $40.00
─────────────────────────────────────────────────────────────────
                                         =
Total Bundle Price               First: $109.00 Recurring: $109.00
```

## Complete Example - Basic Bundle

### Excel/Sheet Format

| Bundle | Service | Short Code | Duration | 1/2 Acre First | 1/2 Acre Rec | 1 Acre First | 1 Acre Rec |
|--------|---------|------------|----------|----------------|--------------|--------------|------------|
| Basic  | GPC - Barrier 360 | B360 | 10 min | $69 | $69 | $89 | $89 |
| Basic  | Mosquito Control | Mosq | 10 min | $40 | $40 | $40 | $40 |
| **Basic** | **TOTAL** | | | **$109** | **$109** | **$129** | **$129** |

### JSON for Pricing_Data Column

```json
[
  {
    "sqftMin": 0,
    "sqftMax": 21780,
    "acreage": "1/2 Acre",
    "components": [
      {"name": "GPC - Barrier 360", "shortCode": "B360", "firstPrice": "$69.00", "recurringPrice": "$69.00"},
      {"name": "Mosquito Control", "shortCode": "Mosq", "firstPrice": "$40.00", "recurringPrice": "$40.00"}
    ],
    "totalFirst": "$109.00",
    "totalRecurring": "$109.00"
  },
  {
    "sqftMin": 21781,
    "sqftMax": 43560,
    "acreage": "1 Acre",
    "components": [
      {"name": "GPC - Barrier 360", "shortCode": "B360", "firstPrice": "$89.00", "recurringPrice": "$89.00"},
      {"name": "Mosquito Control", "shortCode": "Mosq", "firstPrice": "$40.00", "recurringPrice": "$40.00"}
    ],
    "totalFirst": "$129.00",
    "totalRecurring": "$129.00"
  }
]
```

**Compact (single line for Google Sheets):**
```json
[{"sqftMin":0,"sqftMax":21780,"acreage":"1/2 Acre","components":[{"name":"GPC - Barrier 360","shortCode":"B360","firstPrice":"$69.00","recurringPrice":"$69.00"},{"name":"Mosquito Control","shortCode":"Mosq","firstPrice":"$40.00","recurringPrice":"$40.00"}],"totalFirst":"$109.00","totalRecurring":"$109.00"},{"sqftMin":21781,"sqftMax":43560,"acreage":"1 Acre","components":[{"name":"GPC - Barrier 360","shortCode":"B360","firstPrice":"$89.00","recurringPrice":"$89.00"},{"name":"Mosquito Control","shortCode":"Mosq","firstPrice":"$40.00","recurringPrice":"$40.00"}],"totalFirst":"$129.00","totalRecurring":"$129.00"}]
```

## GPT Prompt for Converting Your Bundle Data

Use this prompt with ChatGPT/GPT-5:

```
Convert the following bundle pricing data into JSON format for a pricing calculator.

FORMAT RULES:
- sqftMin/sqftMax: Square footage range (convert acres: 1/2 acre = 0-21,780 sqft, 1 acre = 21,781-43,560 sqft, 1.5 acre = 43,561-65,340 sqft, 2 acre = 65,341-87,120 sqft)
- acreage: Display label (e.g., "1/2 Acre", "1 Acre")
- components: Array of services in the bundle
  - name: Full service name
  - shortCode: Abbreviation (B360, Mosq, etc.)
  - firstPrice: Initial service price formatted as "$XX.00"
  - recurringPrice: Recurring price formatted as "$XX.00"
- totalFirst: Sum of all component first prices
- totalRecurring: Sum of all component recurring prices

INPUT DATA:
[Paste your bundle pricing table here]

OUTPUT:
Provide the JSON in both formatted (readable) and compact (single-line) versions.
The compact version should be ready to paste into a Google Sheets cell.
```

## Example Conversion Session

**INPUT:**
```
BUNDLE: Basic
SERVICES:
- GPC - Barrier 360 (B360): 1/2 Acre = $69, 1 Acre = $89
- Mosquito Control (Mosq): 1/2 Acre = $40, 1 Acre = $40

TOTALS:
- 1/2 Acre: $109
- 1 Acre: $129
```

**GPT OUTPUT:**
```json
[
  {
    "sqftMin": 0,
    "sqftMax": 21780,
    "acreage": "1/2 Acre",
    "components": [
      {"name": "GPC - Barrier 360", "shortCode": "B360", "firstPrice": "$69.00", "recurringPrice": "$69.00"},
      {"name": "Mosquito Control", "shortCode": "Mosq", "firstPrice": "$40.00", "recurringPrice": "$40.00"}
    ],
    "totalFirst": "$109.00",
    "totalRecurring": "$109.00"
  },
  {
    "sqftMin": 21781,
    "sqftMax": 43560,
    "acreage": "1 Acre",
    "components": [
      {"name": "GPC - Barrier 360", "shortCode": "B360", "firstPrice": "$89.00", "recurringPrice": "$89.00"},
      {"name": "Mosquito Control", "shortCode": "Mosq", "firstPrice": "$40.00", "recurringPrice": "$40.00"}
    ],
    "totalFirst": "$129.00",
    "totalRecurring": "$129.00"
  }
]
```

## Square Footage to Acreage Conversion

| Acreage | Square Feet Range | sqftMin | sqftMax |
|---------|-------------------|---------|---------|
| 1/2 Acre | 0 - 21,780 | 0 | 21780 |
| 1 Acre | 21,781 - 43,560 | 21781 | 43560 |
| 1.5 Acres | 43,561 - 65,340 | 43561 | 65340 |
| 2 Acres | 65,341 - 87,120 | 65341 | 87120 |
| 2.5 Acres | 87,121 - 108,900 | 87121 | 108900 |
| 3 Acres | 108,901 - 130,680 | 108901 | 130680 |

## Benefits of This Format

✅ **Clear additive display** - Shows component prices with + signs
✅ **Shows the math** - Agents see how components add up to total
✅ **Acreage labels** - "1/2 Acre" is clearer than sqft ranges
✅ **Short codes** - Quick reference (B360, Mosq)
✅ **First vs Recurring** - Shows both pricing types clearly
✅ **Clean structure** - Easy to read and maintain

## Implementation Status

- ✅ Format designed
- ⏳ Frontend display code (needs update)
- ⏳ CSS styling for additive display
- ⏳ Backward compatibility with old format

## Next Steps

1. Update `app.js` to detect and display new format
2. Add CSS for additive display (+ signs, = sign, borders)
3. Test with real bundle data
4. Update GPT-5 extraction prompt to support this format

