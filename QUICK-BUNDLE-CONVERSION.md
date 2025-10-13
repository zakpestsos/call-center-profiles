# Quick Bundle Conversion Reference

## 🚀 Fast GPT Prompt (Copy & Paste)

```
Convert this bundle pricing to JSON for Google Sheets.

FORMAT:
- Acreage to sqft: 1/2 acre=0-21780, 1 acre=21781-43560, 1.5 acre=43561-65340, 2 acre=65341-87120
- Output: {"sqftMin":X, "sqftMax":X, "acreage":"X Acre", "components":[{"name":"X","shortCode":"XX","firstPrice":"$XX.00","recurringPrice":"$XX.00"}], "totalFirst":"$XX.00", "totalRecurring":"$XX.00"}
- Sum component prices for totals
- Format all prices as "$XX.00"
- Provide single-line JSON

MY DATA:
[paste your bundle data here]
```

## 📊 Acreage Quick Reference

| Label | sqftMin | sqftMax |
|-------|---------|---------|
| 1/4 Acre | 0 | 10890 |
| 1/2 Acre | 0 | 21780 |
| 3/4 Acre | 10891 | 32670 |
| 1 Acre | 21781 | 43560 |
| 1.5 Acres | 43561 | 65340 |
| 2 Acres | 65341 | 87120 |
| 2.5 Acres | 87121 | 108900 |
| 3 Acres | 108901 | 130680 |
| Any Size | 0 | 999999 |

## 💡 Common Short Codes

- **B360** = Barrier 360 / GPC
- **Mosq** = Mosquito Control
- **Term** = Termite
- **Flea** = Flea Control
- **Tick** = Tick Control
- **Rodent** = Rodent Control
- **Spider** = Spider Control
- **Fire** = Fire Ant
- **Bed** = Bed Bug

## 📝 Example Conversion

**INPUT:**
```
Basic Bundle
- 1/2 Acre: Barrier360 $69, Mosquito $40 = $109
- 1 Acre: Barrier360 $89, Mosquito $40 = $129
```

**GPT OUTPUT (single line for Google Sheets):**
```json
[{"sqftMin":0,"sqftMax":21780,"acreage":"1/2 Acre","components":[{"name":"GPC - Barrier 360","shortCode":"B360","firstPrice":"$69.00","recurringPrice":"$69.00"},{"name":"Mosquito Control","shortCode":"Mosq","firstPrice":"$40.00","recurringPrice":"$40.00"}],"totalFirst":"$109.00","totalRecurring":"$109.00"},{"sqftMin":21781,"sqftMax":43560,"acreage":"1 Acre","components":[{"name":"GPC - Barrier 360","shortCode":"B360","firstPrice":"$89.00","recurringPrice":"$89.00"},{"name":"Mosquito Control","shortCode":"Mosq","firstPrice":"$40.00","recurringPrice":"$40.00"}],"totalFirst":"$129.00","totalRecurring":"$129.00"}]
```

## 🎯 Quick Workflow

1. Copy bundle data from Excel/notes
2. Open ChatGPT
3. Paste quick prompt + your data
4. Copy GPT's single-line JSON output
5. Paste into Google Sheets `Pricing_Data` column
6. Refresh profile page
7. Test calculator with different sqft values

## ⚠️ Common Mistakes to Avoid

❌ **Wrong:** `"firstPrice": "69"` → Missing $ and .00
✅ **Right:** `"firstPrice": "$69.00"`

❌ **Wrong:** Overlapping ranges (1 Acre: 21780-43560 and 1.5 Acre: 43560-65340)
✅ **Right:** Adjacent ranges (1 Acre: 21781-43560 and 1.5 Acre: 43561-65340)

❌ **Wrong:** Total doesn't match sum ($69 + $40 = $109 but total shows $110)
✅ **Right:** Total matches sum exactly

❌ **Wrong:** Multiple lines in JSON (breaks Google Sheets cell)
✅ **Right:** Single line with no line breaks

## 🔧 Troubleshooting

**Bundle not showing?**
- Check console log (F12) - should say "✨ Using NEW additive bundle format"
- Verify JSON is valid (paste in jsonlint.com)
- Ensure sqft range includes your test value

**Prices not adding up?**
- Verify totalFirst = sum of all component firstPrice
- Verify totalRecurring = sum of all component recurringPrice
- Check for missing $ or .00 in prices

**Wrong acreage tier showing?**
- Verify sqftMin/sqftMax ranges don't overlap
- Check boundaries: 1/2 acre ends at 21780, 1 acre starts at 21781

---

**Need the full detailed prompt?** See `GPT-BUNDLE-PRICING-CONVERTER-PROMPT.md`

