# Complete System Setup Guide

## System Overview

This system provides a complete workflow for managing client profiles with automatic syncing between Google Sheets, Google Apps Script, and Wix CMS. Here's how everything works together:

### Workflow
1. **Create Profile** → Fill out Google Apps Script form
2. **Data Storage** → Saved to individual client folder + Master Profile Sheet
3. **Editing** → Edit via form or Google Sheets (both sync everywhere)
4. **Display** → Production web app displays data from master sheet
5. **Sync** → All changes automatically sync across all systems

## Step-by-Step Setup

### 1. Google Apps Script Setup

#### 1.1 Create New Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Name it "Client Profile Manager"

#### 1.2 Upload Files to Apps Script
Copy these files from your workspace to the Apps Script editor:

**Required Files:**
- `src/main.js` → Main form handling and API endpoints
- `src/masterProfileSheet.js` → Master sheet management
- `src/syncSystem.js` → Bidirectional sync system
- `src/sheetsApi.js` → Individual client sheet creation
- `src/wixApi.js` → Wix CMS integration
- `config/config.js` → Configuration management
- `ui/client-input-form.html` → Profile creation form
- `ui/edit-form.html` → Profile editing form
- `utils/utils.js` → Utility functions

#### 1.3 Configure Apps Script
1. In Apps Script editor, go to **Project Settings**
2. Check "Show 'appsscript.json' manifest file in editor"
3. Update `appsscript.json`:

```json
{
  "timeZone": "America/Chicago",
  "dependencies": {
    "enabledAdvancedServices": []
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "access": "ANYONE",
    "executeAs": "USER_DEPLOYING"
  }
}
```

#### 1.4 Deploy Web App
1. Click **Deploy** → **New Deployment**
2. Choose type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Click **Deploy**
6. **IMPORTANT**: Copy the Web App URL - you'll need this!

### 2. Google Drive Folder Structure Setup

#### 2.1 Create Main Folder
1. In Google Drive, create folder: "Client Profiles System"
2. Inside this, the system will automatically create:
   - Individual client folders (one per profile)
   - Master Profile Sheet (central database)

### 3. Production Web App Configuration

#### 3.1 Update Config File
Edit `production/config.js`:

```javascript
const CONFIG = {
    GOOGLE_SHEETS: {
        // Replace with your Apps Script Web App URL from step 1.4
        WEB_APP_URL: 'https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec',
        
        // Optional: For direct API access
        API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',
        MASTER_SHEET_ID: 'YOUR_MASTER_SHEET_ID'
    },
    
    WIX: {
        IS_WIX_ENVIRONMENT: false, // Set to true when deployed to Wix
        COLLECTIONS: {
            CLIENTS: 'clients',
            SERVICES: 'services', 
            TECHNICIANS: 'technicians',
            POLICIES: 'policies',
            SERVICE_AREAS: 'serviceAreas'
        }
    }
    // ... rest of config
};
```

### 4. Wix Integration Setup (Optional)

#### 4.1 Create Wix Collections
In your Wix site, create these collections:
- **clients** - Main profile data
- **services** - Service information
- **technicians** - Technician details
- **policies** - Company policies
- **serviceAreas** - Service coverage areas

#### 4.2 Configure Wix API
1. Get your Wix Site ID, API Key, and Account ID
2. Update the configuration in your Apps Script `config.js`

### 5. Testing the System

#### 5.1 Test Profile Creation
1. Go to your Apps Script Web App URL
2. Fill out the profile creation form
3. Submit and verify:
   - Client folder created in Google Drive
   - Data appears in Master Profile Sheet
   - Profile URL is generated

#### 5.2 Test Profile Editing
1. In Master Profile Sheet, click "Edit_Form_URL" for any profile
2. Make changes and save
3. Verify changes appear in:
   - Master Profile Sheet
   - Individual client folder sheets
   - Production web app (if running)

#### 5.3 Test Production Web App
1. Open `production/index.html` in browser
2. Add `?profileId=YOUR_PROFILE_ID` to URL
3. Verify profile data loads correctly

### 6. Setting Up Automatic Sync

#### 6.1 Enable Sync Triggers
In Apps Script editor, run this function once:
```javascript
setupSyncTriggers()
```

This sets up automatic syncing every 5 minutes.

#### 6.2 Manual Sync Testing
You can manually trigger sync by running:
```javascript
manualSync()
```

## Usage Instructions

### Creating New Profiles
1. Go to your Google Apps Script Web App URL
2. Fill out all required information
3. Submit form
4. System automatically:
   - Creates client folder with editable sheets
   - Adds to master profile database
   - Generates profile URL for web display

### Editing Existing Profiles

**Method 1: Edit Form**
1. Open Master Profile Sheet
2. Click "Edit_Form_URL" for the profile you want to edit
3. Make changes in the form
4. Changes automatically sync everywhere

**Method 2: Direct Sheet Editing**
1. Open the individual client's folder in Google Drive
2. Edit the "Basic Info" sheet directly
3. Changes automatically sync to master sheet and web app

### Viewing Profiles on Website
- Use URL: `https://yoursite.com/profile?profileId=PROFILE_ID`
- Replace `PROFILE_ID` with actual profile ID from master sheet

## Troubleshooting

### Common Issues

**Form doesn't load:**
- Check Apps Script Web App deployment settings
- Verify "Anyone" has access
- Check browser console for errors

**Profile data doesn't appear:**
- Check `CONFIG.GOOGLE_SHEETS.WEB_APP_URL` is correct
- Verify profile ID exists in Master Profile Sheet
- Check Apps Script execution logs

**Sync not working:**
- Run `setupSyncTriggers()` in Apps Script
- Check Apps Script triggers in project settings
- Review sync log in Master Profile Sheet

**Production app shows sample data:**
- Verify profile ID parameter in URL
- Check network requests in browser dev tools
- Confirm Google Apps Script API is responding

### Logs and Debugging

**Apps Script Logs:**
- In Apps Script editor: View → Logs
- Check for errors during form submission or sync

**Sync Activity:**
- Master Profile Sheet → "Sync_Log" tab
- Shows all sync operations and errors

**Browser Console:**
- F12 → Console tab
- Shows JavaScript errors and API calls

## Advanced Configuration

### Custom Fields
To add custom fields:
1. Update form HTML files
2. Modify `readClientData()` in sheetsApi.js
3. Update master sheet structure in masterProfileSheet.js
4. Update production app display logic

### Different Sync Intervals
Change sync frequency in `setupSyncTriggers()`:
```javascript
ScriptApp.newTrigger('performBidirectionalSync')
  .timeBased()
  .everyMinutes(10) // Change from 5 to 10 minutes
  .create();
```

### Multiple Environments
Create separate Apps Script projects for:
- Development/Testing
- Production
- Different companies/brands

## Security Considerations

- Google Apps Script Web App runs with your permissions
- Individual client sheets inherit your sharing settings
- Consider using service accounts for Wix API in production
- Regularly review Google Apps Script permissions

## Backup Strategy

- Master Profile Sheet is automatically backed up by Google
- Individual client folders provide redundancy
- Export important data regularly
- Consider setting up automated exports

## Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review Apps Script execution logs
3. Verify all URLs and IDs are correct
4. Test with simple profile data first

The system is designed to be robust with fallbacks, but proper configuration is essential for smooth operation.
