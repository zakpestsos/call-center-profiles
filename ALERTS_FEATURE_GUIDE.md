# 🚨 Alerts Feature Guide

## Overview
The **Alerts** feature adds a scrolling news banner at the top of client profiles to display critical, time-sensitive information that agents need to see immediately.

## Visual Design
- **Red gradient banner** with pulsing warning icon (⚠️)
- **Scrolling text** that moves from right to left like a news ticker
- **Positioned** below the sticky header, above the main content
- **Pauses on hover** so agents can read without distraction

## Location in Master Sheet

### Column Details
- **Column**: L (Letter L)
- **Column Name**: `Alerts`
- **Position**: Between `Pests_Not_Covered` (K) and `Client_Folder_URL` (M)
- **Sheet Tab**: `Client_Profiles`

## How to Add Alerts

### Step 1: Open Your Master Sheet
1. Open the Google Sheet: `1WId_kg8Fu0dbnpWSSQQVv-GJJibaeSu7p23PEaeePec`
2. Go to the **Client_Profiles** tab
3. Find column **L** (labeled `Alerts`)

### Step 2: Add Alert Text
Simply type or paste your alert message into column L for the client profile.

**Example Alert Messages:**
```
⚠️ URGENT: Client has 2 dogs - MUST call ahead before service!
🔴 BILLING HOLD - DO NOT SCHEDULE until finance clears account
⚡ VIP CLIENT - Priority scheduling required
🚫 TEMPORARILY SUSPENDED - Collections issue pending
✅ NEW CLIENT - Extra care with scheduling and communication
⏰ SEASONAL ONLY - April-October mosquito program ONLY
🎯 UPSELL OPPORTUNITY - Interested in rodent program
```

### Step 3: Save & Test
1. Save the Google Sheet
2. Load the client profile in your browser
3. The alert banner will appear at the top if text exists
4. Leave the field empty or blank to hide the alert

## Display Behavior

### When Alerts Are Present
- Banner appears **immediately** at the top of the profile
- Text scrolls continuously from right to left
- Warning icon **pulses** to draw attention
- **Red color scheme** indicates urgency

### When Alerts Are Empty
- Banner is **completely hidden**
- No visual disruption to the normal profile view

### Interactive Features
- **Hover to pause**: Mouse over the banner to stop scrolling and read
- **Mobile responsive**: Adjusts speed and size for mobile devices
- **Always visible**: Stays at top even when scrolling down the page

## Best Practices

### ✅ Good Alert Examples
- **Time-sensitive information**: "URGENT: Must schedule by end of week"
- **Safety concerns**: "Dogs on property - call ahead required"
- **Account issues**: "BILLING HOLD - Collections pending"
- **Special instructions**: "VIP CLIENT - Owner prefers AM appointments"
- **Seasonal reminders**: "Program ends October 31st - confirm renewal"

### ❌ Avoid These Alert Types
- ~~Long paragraphs~~ (keep it brief!)
- ~~Permanent information~~ (use bulletin or policies instead)
- ~~Non-urgent details~~ (doesn't need banner attention)
- ~~Service descriptions~~ (belongs in services section)

### Writing Tips
1. **Keep it brief**: 10-20 words is ideal
2. **Start with icon**: Use emoji for quick visual identification
3. **ALL CAPS for key words**: "URGENT", "DO NOT", "MUST"
4. **Be specific**: "Call ahead" not "special requirements"
5. **Actionable**: Tell agents what to do

## Technical Details

### Column Mapping
The system uses **dynamic column mapping**, so adding the `Alerts` column won't break existing functionality. The code reads columns by header name, not by position.

### Code Changes Made
1. **Code.gs**: Added `alerts` field to profile data retrieval
2. **index.html**: Added alert banner HTML structure
3. **styles.css**: Added scrolling animation and red theme styling
4. **app.js**: Added `showAlertBanner()` function

### Animation Settings
- **Scroll speed**: 20 seconds (desktop), 15 seconds (mobile)
- **Icon animation**: 2-second pulse cycle
- **Pause on hover**: Enabled by default

## Column Order Reference

After adding Alerts, the Client_Profiles columns are:

| Letter | Column Name | Description |
|--------|-------------|-------------|
| A | Profile_ID | Unique identifier |
| B | Company_Name | Business name |
| C | Location | City, State |
| D | Timezone | Time zone |
| E | Phone | Primary phone |
| F | Email | Primary email |
| G | Website | Company website |
| H | Address | Physical address |
| I | Hours | Office hours |
| J | Bulletin | General notes |
| K | Pests_Not_Covered | Wildlife/exclusions |
| **L** | **Alerts** | **⚠️ URGENT BANNER TEXT** |
| M | Client_Folder_URL | Google Drive link |
| N | Wix_Profile_URL | Wix page link |
| O | Last_Updated | Update timestamp |
| P | Sync_Status | Active/Draft status |
| Q | Edit_Form_URL | Edit form link |
| ... | ... | Additional fields... |

## Testing Checklist

After adding an alert, verify:
- [ ] Alert banner appears at top of profile
- [ ] Text scrolls from right to left
- [ ] Warning icon pulses
- [ ] Scrolling pauses on hover
- [ ] Banner is hidden when alerts field is empty
- [ ] Works on mobile devices
- [ ] Doesn't break existing functionality

## Troubleshooting

### Alert Not Showing
1. **Check the column**: Verify you're editing column L (`Alerts`)
2. **Check spelling**: Column header must be exactly `Alerts`
3. **Check for text**: Make sure the field isn't empty or just spaces
4. **Refresh browser**: Hard refresh (Ctrl+Shift+R) to clear cache
5. **Check console**: Open browser console for error messages

### Banner Showing When It Shouldn't
1. **Check for hidden text**: There might be spaces or invisible characters
2. **Clear the cell**: Delete content and save again
3. **Check Apps Script**: Ensure latest version is deployed

### Scrolling Too Fast/Slow
Edit the CSS animation timing in `styles.css`:
```css
animation: scroll-left 20s linear infinite;  /* Change 20s to adjust speed */
```

## Future Enhancements

Possible future additions:
- Multiple alert levels (warning, info, success)
- Expiration dates for auto-removal
- Alert categories with color coding
- Sound notification option
- Agent acknowledgment tracking

## Questions?

If you encounter issues or need help:
1. Check the browser console for errors
2. Verify the Google Sheet has the `Alerts` column
3. Confirm the Apps Script is deployed (latest version)
4. Test with a simple alert like "TEST ALERT"

---

**Last Updated**: 2025-01-26  
**Feature Version**: 1.0  
**Compatible With**: All profile versions using dynamic column mapping

