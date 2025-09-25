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
    const clientLastModified = new Date(clientSpreadsheet.getLastUpdated());
    
    if (clientLastModified <= lastUpdated) {
      return; // No changes in client sheet
    }
    
    Logger.log(`Client sheet modified for profile ${profileId}, syncing changes...`);
    
    // Read updated data from client sheet
    const updatedClientData = readClientDataFromSheet(clientSpreadsheet);
    
    // Convert to master sheet format
    const masterSheetData = {
      Company_Name: updatedClientData.companyName,
      Location: updatedClientData.location,
      Phone: updatedClientData.phone,
      Email: updatedClientData.email,
      Website: updatedClientData.website,
      Address: updatedClientData.address,
      Hours: updatedClientData.hours,
      Bulletin: updatedClientData.bulletin,
      Pests_Not_Covered: updatedClientData.pestsNotCovered
    };
    
    // Update master sheet
    updateProfileInMasterSheet(profileId, masterSheetData);
    
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
    
    // Sync to Wix CMS (placeholder - implement when Wix credentials available)
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
  }
}

/**
 * Placeholder Wix sync function - implement when Wix credentials are available
 */
function syncProfileToWix(wixData) {
  // This is a placeholder that simulates Wix syncing
  // In production, this would use the Wix REST API
  
  try {
    Logger.log('Simulating Wix sync for profile: ' + wixData.profileId);
    
    // For now, just return success with a simulated URL
    const profileUrl = `https://yoursite.wix.com/profile?profileId=${wixData.profileId}`;
    
    return {
      success: true,
      profileUrl: profileUrl
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
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
    Logger.log('Starting manual sync...');
    
    performBidirectionalSync();
    
    Logger.log('Manual sync completed successfully!');
    
  } catch (error) {
    Logger.log('Manual sync failed: ' + error.message);
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
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    const data = profilesTab.getDataRange().getValues();
    const headers = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === profileId) {
        syncFromClientSheet(profileId, data[i], headers);
        break;
      }
    }
    
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
