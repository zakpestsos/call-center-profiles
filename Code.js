/**
 * Main Google Apps Script Entry Point
 * Clean implementation without external library dependencies
 */

/**
 * Web App Entry Point - handles GET requests
 */
function doGet(e) {
  try {
    Logger.log('doGet called with parameters: ' + JSON.stringify(e.parameter));
    
    const action = e.parameter.action || 'create';
    const profileId = e.parameter.profileId;
    
    // Handle API requests (for production app integration)
    if (action === 'api') {
      return handleAPIRequest(e);
    }
    
    // Handle direct profile data requests
    if (action === 'getProfile' && profileId) {
      return handleGetProfileRequest(profileId);
    }
    
    // Handle edit form
    if (action === 'edit' && profileId) {
      return HtmlService.createHtmlOutputFromFile('edit-form')
        .setTitle('Edit Client Profile')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    // Default: show creation form
    return HtmlService.createHtmlOutputFromFile('client-form')
      .setTitle('Create Client Profile')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    
    return HtmlService.createHtmlOutput(`
      <h1>System Error</h1>
      <p>Error: ${error.message}</p>
      <p>Please contact support if this persists.</p>
    `).setTitle('Error');
  }
}

/**
 * Web App Entry Point - handles POST requests
 */
function doPost(e) {
  try {
    Logger.log('doPost called with parameters: ' + JSON.stringify(e.parameter));
    
    const action = e.parameter.action || 'create';
    
    switch (action) {
      case 'createProfile':
        return createClientProfileFromForm(e.parameter);
        
      case 'updateProfile':
        return updateClientProfileFromForm(e.parameter);
        
      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid action: ' + action
        })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Create client profile from HTML form data
 */
function createClientProfileFromHTML(formData) {
  try {
    Logger.log('Creating client profile from HTML form data...');
    
    // Generate unique profile ID
    const profileId = 'CLI_' + Utilities.getUuid().substring(0, 8).toUpperCase();
    
    // Get or create master sheet
    const masterSheet = getMasterProfileSheet();
    
    // Prepare profile data
    const profileData = {
      profileId: profileId,
      companyName: formData.companyName,
      location: formData.location,
      timezone: formData.timezone,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      address: formData.address,
      hours: formData.hours,
      bulletin: formData.bulletin,
      pestsNotCovered: formData.pestsNotCovered,
      initialServices: formData.initialServices
    };
    
    // Add to master sheet
    const masterResult = addProfileToMasterSheet(profileData);
    if (!masterResult.success) {
      throw new Error('Failed to add to master sheet: ' + masterResult.error);
    }
    
    // Create client folder and sheets
    const clientFolderResult = createEditableClientSheet(profileData);
    if (!clientFolderResult.success) {
      Logger.log('Warning: Client folder creation failed: ' + clientFolderResult.error);
    }
    
    // Update master sheet with client folder URL
    if (clientFolderResult.success && clientFolderResult.clientFolderUrl) {
      updateProfileInMasterSheet(profileId, {
        Client_Folder_URL: clientFolderResult.clientFolderUrl
      });
    }
    
    // Generate edit form URL
    const webAppUrl = getWebAppUrl();
    const editFormUrl = webAppUrl + '?action=edit&profileId=' + profileId;
    
    Logger.log('Profile created successfully: ' + profileId);
    
    return {
      success: true,
      profileId: profileId,
      masterSheetUrl: masterSheet.getUrl(),
      clientFolderUrl: clientFolderResult.clientFolderUrl || 'Not created',
      editFormUrl: editFormUrl
    };
    
  } catch (error) {
    Logger.log('Error creating client profile: ' + error.toString());
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle API requests for production app integration
 */
function handleAPIRequest(e) {
  try {
    const endpoint = e.parameter.endpoint;
    const profileId = e.parameter.profileId;
    
    let result = {};
    
    switch (endpoint) {
      case 'profiles':
        result = getAllProfiles();
        break;
        
      case 'profile':
        if (!profileId) {
          throw new Error('Profile ID required');
        }
        result = getSingleProfile(profileId);
        break;
        
      default:
        throw new Error('Invalid endpoint: ' + endpoint);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    Logger.log('Error in handleAPIRequest: ' + error.toString());
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle direct profile data requests
 */
function handleGetProfileRequest(profileId) {
  try {
    const profileData = getSingleProfile(profileId);
    
    return ContentService.createTextOutput(JSON.stringify(profileData))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    Logger.log('Error in handleGetProfileRequest: ' + error.toString());
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get web app URL for forming edit links
 */
function getWebAppUrl() {
  try {
    // Updated with the actual deployment URL
    return 'https://script.google.com/macros/s/AKfycbz3xZWEXbdbDhqKQ63OwlSjNW-rlSmxd81M8v278RNM8FgfkGQnPMf_2ld7r8RiBF51cw/exec';
  } catch (error) {
    Logger.log('Error getting web app URL: ' + error.toString());
    return 'URL_NOT_AVAILABLE';
  }
}

/**
 * Get all profiles for API
 */
function getAllProfiles() {
  try {
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    
    if (!profilesTab) {
      return { success: false, error: 'Master sheet not found' };
    }
    
    const data = profilesTab.getDataRange().getValues();
    const headers = data[0];
    const profiles = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // Has Profile ID
        const profile = {};
        headers.forEach(function(header, index) {
          profile[header] = row[index];
        });
        profiles.push(profile);
      }
    }
    
    return {
      success: true,
      data: profiles
    };
    
  } catch (error) {
    Logger.log('Error getting all profiles: ' + error.toString());
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get single profile for API
 */
function getSingleProfile(profileId) {
  try {
    const profile = getProfileFromMasterSheet(profileId);
    
    if (!profile) {
      return {
        success: false,
        error: 'Profile not found: ' + profileId
      };
    }
    
    return {
      success: true,
      data: profile
    };
    
  } catch (error) {
    Logger.log('Error getting single profile: ' + error.toString());
    return {
      success: false,
      error: error.message
    };
  }
}
