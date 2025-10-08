/**
 * Bidirectional Sync System
 * Handles syncing data between Google Sheets, Client Folders, and Wix CMS
 */

/**
 * Main sync function - checks for changes and syncs across all systems
 * This function should be run on a timer trigger
 */
function performBidirectionalSync() {
  try {
    Logger.log('Starting bidirectional sync...');
    
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    const data = profilesTab.getDataRange().getValues();
    const headers = data[0];
    
    // Process each profile
    for (let i = 1; i < data.length; i++) {
      const profileRow = data[i];
      const profileId = profileRow[0];
      
      if (profileId) {
        try {
          // Check for changes in individual client sheets
          syncFromClientSheet(profileId, profileRow, headers);
          
          // Sync to Wix if needed
          syncToWix(profileId, profileRow, headers);
          
        } catch (error) {
          Logger.log(`Error syncing profile ${profileId}: ${error.toString()}`);
          logSyncAction(profileId, 'SYNC', 'AUTO_SYNC', 'ALL', 'ERROR', error.toString());
        }
      }
    }
    
    // Update last sync time
    updateLastSyncTime();
    
    Logger.log('Bidirectional sync completed');
    
  } catch (error) {
    Logger.log('Error in bidirectional sync: ' + error.toString());
    throw error;
  }
}

/**
 * Syncs changes from individual client sheets to master sheet
 */
function syncFromClientSheet(profileId, profileRow, headers) {
  try {
    const clientFolderUrl = profileRow[headers.indexOf('Client_Folder_URL')];
    if (!clientFolderUrl) return;
    
    // Get the client spreadsheet
    const clientSpreadsheet = getClientSpreadsheetFromUrl(clientFolderUrl);
    if (!clientSpreadsheet) return;
    
    // Check if client sheet has been modified since last sync
    const lastUpdated = new Date(profileRow[headers.indexOf('Last_Updated')] || 0);
    // Use DriveApp to get the last modified date
    const file = DriveApp.getFileById(clientSpreadsheet.getId());
    const clientLastModified = file.getLastUpdated();
    
    if (clientLastModified <= lastUpdated) {
      return; // No changes in client sheet
    }
    
    Logger.log(`Client sheet modified for profile ${profileId}, syncing changes...`);
    
    // Read updated data from client sheet
    const updatedClientData = readClientDataFromSheet(clientSpreadsheet);
    
    // Update master sheet
    updateProfileInMasterSheet(profileId, updatedClientData);
    
    // Mark for Wix sync
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    const profileRowIndex = findProfileRowIndex(profileId);
    
    if (profileRowIndex > 0) {
      const syncStatusIndex = headers.indexOf('Sync_Status');
      profilesTab.getRange(profileRowIndex, syncStatusIndex + 1).setValue('PENDING_WIX_SYNC');
    }
    
    logSyncAction(profileId, 'SYNC', 'CLIENT_SHEET', 'MASTER_SHEET', 'SUCCESS', 'Data synced from client sheet');
    
  } catch (error) {
    Logger.log(`Error syncing from client sheet for profile ${profileId}: ${error.toString()}`);
    throw error;
  }
}

/**
 * Syncs data to Wix CMS
 */
function syncToWix(profileId, profileRow, headers) {
  try {
    const syncStatus = profileRow[headers.indexOf('Sync_Status')];
    
    if (syncStatus !== 'PENDING_WIX_SYNC' && syncStatus !== 'SYNC_FAILED') {
      return; // No Wix sync needed
    }
    
    Logger.log(`Syncing profile ${profileId} to Wix...`);
    
    // Get complete profile data
    const profileData = getProfileFromMasterSheet(profileId);
    
    // Convert to Wix format
    const wixData = convertToWixFormat(profileData);
    
    // Sync to Wix CMS
    const wixResult = syncProfileToWix(wixData);
    
    if (wixResult.success) {
      // Update master sheet with Wix URL and status
      const masterSheet = getMasterProfileSheet();
      const profilesTab = masterSheet.getSheetByName('Client_Profiles');
      const profileRowIndex = findProfileRowIndex(profileId);
      
      if (profileRowIndex > 0) {
        const wixUrlIndex = headers.indexOf('Wix_Profile_URL');
        const syncStatusIndex = headers.indexOf('Sync_Status');
        
        profilesTab.getRange(profileRowIndex, wixUrlIndex + 1).setValue(wixResult.profileUrl);
        profilesTab.getRange(profileRowIndex, syncStatusIndex + 1).setValue('SYNCED');
      }
      
      logSyncAction(profileId, 'SYNC', 'MASTER_SHEET', 'WIX_CMS', 'SUCCESS', 'Profile synced to Wix');
    } else {
      throw new Error(wixResult.error || 'Unknown Wix sync error');
    }
    
  } catch (error) {
    Logger.log(`Error syncing to Wix for profile ${profileId}: ${error.toString()}`);
    
    // Update sync status to failed
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    const profileRowIndex = findProfileRowIndex(profileId);
    
    if (profileRowIndex > 0) {
      const syncStatusIndex = headers.indexOf('Sync_Status');
      profilesTab.getRange(profileRowIndex, syncStatusIndex + 1).setValue('SYNC_FAILED');
    }
    
    logSyncAction(profileId, 'SYNC', 'MASTER_SHEET', 'WIX_CMS', 'ERROR', error.toString());
    throw error;
  }
}

/**
 * Converts profile data to Wix CMS format
 */
function convertToWixFormat(profileData) {
  return {
    profileId: profileData.Profile_ID,
    companyName: profileData.Company_Name,
    location: profileData.Location,
    timezone: profileData.Timezone,
    officeInfo: {
      phone: profileData.Phone,
      email: profileData.Email,
      website: profileData.Website,
      physicalAddress: profileData.Address,
      officeHours: profileData.Hours
    },
    bulletin: profileData.Bulletin,
    pestsNotCovered: profileData.Pests_Not_Covered,
    services: profileData.services || [],
    technicians: profileData.technicians || [],
    policies: profileData.policies || {},
    serviceAreas: profileData.serviceAreas || [],
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Gets client spreadsheet from URL
 */
function getClientSpreadsheetFromUrl(url) {
  try {
    // Extract spreadsheet ID from URL
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      const spreadsheetId = match[1];
      return SpreadsheetApp.openById(spreadsheetId);
    }
    return null;
  } catch (error) {
    Logger.log('Error opening client spreadsheet: ' + error.toString());
    return null;
  }
}

/**
 * Reads client data from individual client sheet
 */
function readClientDataFromSheet(spreadsheet) {
  try {
    const basicSheet = spreadsheet.getSheetByName('Basic Info');
    if (!basicSheet) return {};
    
    const data = basicSheet.getDataRange().getValues();
    const clientData = {};
    
    // Read basic info (assuming field-value format)
    for (let i = 1; i < data.length; i++) {
      const field = data[i][0];
      const value = data[i][1];
      
      switch (field) {
        case 'Company Name':
          clientData.Company_Name = value;
          break;
        case 'Location':
          clientData.Location = value;
          break;
        case 'Business Address':
          clientData.Address = value;
          break;
        case 'Primary Phone':
          clientData.Phone = value;
          break;
        case 'Business Email':
          clientData.Email = value;
          break;
        case 'Website':
          clientData.Website = value;
          break;
        case 'Business Hours':
          clientData.Hours = value;
          break;
        case 'Company Bulletin':
          clientData.Bulletin = value;
          break;
        case 'Pests Not Covered':
          clientData.Pests_Not_Covered = value;
          break;
      }
    }
    
    return clientData;
    
  } catch (error) {
    Logger.log('Error reading client data from sheet: ' + error.toString());
    return {};
  }
}

/**
 * Finds the row index for a profile in the master sheet
 */
function findProfileRowIndex(profileId) {
  const masterSheet = getMasterProfileSheet();
  const profilesTab = masterSheet.getSheetByName('Client_Profiles');
  const data = profilesTab.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === profileId) {
      return i + 1; // Google Sheets uses 1-based indexing
    }
  }
  
  return -1;
}

/**
 * Updates the last sync time in configuration
 */
function updateLastSyncTime() {
  try {
    const masterSheet = getMasterProfileSheet();
    const configTab = masterSheet.getSheetByName('Wix_Config');
    const data = configTab.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'Last_Sync_Time') {
        configTab.getRange(i + 1, 2).setValue(new Date().toISOString());
        break;
      }
    }
  } catch (error) {
    Logger.log('Error updating last sync time: ' + error.toString());
  }
}

/**
 * Manual sync trigger for testing
 */
function manualSync() {
  try {
    SpreadsheetApp.getUi().alert('Starting manual sync...', 'This may take a few minutes.', SpreadsheetApp.getUi().Button.OK);
    
    performBidirectionalSync();
    
    SpreadsheetApp.getUi().alert('Sync Complete', 'All profiles have been synced successfully!', SpreadsheetApp.getUi().Button.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Sync Error', `Sync failed: ${error.message}`, SpreadsheetApp.getUi().Button.OK);
    throw error;
  }
}

/**
 * Sets up automatic sync triggers
 */
function setupSyncTriggers() {
  try {
    // Delete existing triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'performBidirectionalSync') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Create new trigger for every 5 minutes
    ScriptApp.newTrigger('performBidirectionalSync')
      .timeBased()
      .everyMinutes(5)
      .create();
    
    Logger.log('Sync triggers set up successfully');
    
  } catch (error) {
    Logger.log('Error setting up sync triggers: ' + error.toString());
    throw error;
  }
}

/**
 * Change detection for individual client sheets
 * This function should be installed as an onEdit trigger for each client sheet
 */
function onClientSheetEdit(e) {
  try {
    const spreadsheet = e.source;
    const sheet = e.range.getSheet();
    
    // Only process changes to Basic Info, Services, Technicians, etc.
    const watchedSheets = ['Basic Info', 'Services', 'Technicians', 'Service Areas', 'Policies'];
    if (!watchedSheets.includes(sheet.getName())) {
      return;
    }
    
    // Find the profile ID for this client sheet
    const profileId = findProfileIdForSpreadsheet(spreadsheet);
    if (!profileId) {
      Logger.log('Could not find profile ID for spreadsheet: ' + spreadsheet.getName());
      return;
    }
    
    Logger.log(`Change detected in client sheet for profile ${profileId}`);
    
    // Trigger immediate sync for this profile
    syncFromClientSheet(profileId);
    
  } catch (error) {
    Logger.log('Error in onClientSheetEdit: ' + error.toString());
  }
}

/**
 * Finds profile ID for a given spreadsheet
 */
function findProfileIdForSpreadsheet(spreadsheet) {
  try {
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    const data = profilesTab.getDataRange().getValues();
    const headers = data[0];
    
    const spreadsheetUrl = spreadsheet.getUrl();
    const folderUrlIndex = headers.indexOf('Client_Folder_URL');
    
    for (let i = 1; i < data.length; i++) {
      const clientFolderUrl = data[i][folderUrlIndex];
      if (clientFolderUrl && spreadsheetUrl.includes(clientFolderUrl)) {
        return data[i][0]; // Profile ID
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('Error finding profile ID for spreadsheet: ' + error.toString());
    return null;
  }
}

/**
 * Web API endpoint for real-time data retrieval
 * This handles requests from the production web app
 */
function getProfileDataAPI(profileId) {
  try {
    if (!profileId) {
      throw new Error('Profile ID is required');
    }
    
    const profileData = getProfileFromMasterSheet(profileId);
    
    // Convert to format expected by production web app
    const webAppData = {
      companyName: profileData.Company_Name,
      location: profileData.Location,
      timezone: profileData.Timezone,
      officeInfo: {
        phone: profileData.Phone,
        email: profileData.Email,
        website: profileData.Website,
        physicalAddress: profileData.Address,
        officeHours: profileData.Hours,
        fieldRoutesLink: profileData.FieldRoutes_Link || profileData.Website
      },
      // FieldRoutes button configuration
      fieldRoutesButton: {
        text: profileData.FieldRoutes_Button_Text || 'FieldRoutes',
        url: profileData.FieldRoutes_Link || profileData.Website,
        show: !!(profileData.FieldRoutes_Button_Text || profileData.FieldRoutes_Link)
      },
      bulletin: profileData.Bulletin,
      pestsNotCovered: profileData.Pests_Not_Covered,
      services: profileData.services || [],
      technicians: profileData.technicians || [],
      policies: profileData.policies || {},
      serviceAreas: profileData.serviceAreas || []
    };
    
    return {
      success: true,
      data: webAppData
    };
    
  } catch (error) {
    Logger.log('Error in getProfileDataAPI: ' + error.toString());
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Enhanced doGet to handle API requests
 */
function doGetEnhanced(e) {
  try {
    const action = e.parameter.action;
    const profileId = e.parameter.profileId;
    
    // Handle API requests
    if (action === 'getProfile' && profileId) {
      const result = getProfileDataAPI(profileId);
      
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
    }
    
    // Handle edit form requests
    if (action === 'edit' && profileId) {
      return showEditForm(profileId);
    }
    
    // Default: show create form
    return HtmlService.createHtmlOutputFromFile('ui/client-input-form')
      .setTitle('Client Profile Creator')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    Logger.log('Error in doGetEnhanced: ' + error.toString());
    return HtmlService.createHtmlOutput(`Error: ${error.message}`);
  }
}

/**
 * Shows edit form for existing profile
 */
function showEditForm(profileId) {
  try {
    const profileData = getProfileFromMasterSheet(profileId);
    
    // Create edit form HTML (you'll need to create this)
    const template = HtmlService.createTemplateFromFile('ui/edit-form');
    template.profileData = profileData;
    template.profileId = profileId;
    
    return template.evaluate()
      .setTitle(`Edit Profile: ${profileData.Company_Name}`)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    return HtmlService.createHtmlOutput(`Error loading edit form: ${error.message}`);
  }
}
