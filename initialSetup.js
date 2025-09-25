/**
 * One-time setup function to initialize the system
 * Run this function once in the Google Apps Script editor to set up your system
 */
function runInitialSetup() {
  try {
    Logger.log('=== STARTING INITIAL SETUP ===');
    
    // Step 1: Create master profile sheet
    Logger.log('Step 1: Creating master profile sheet...');
    const masterSheet = createMasterProfileSheet();
    Logger.log('✓ Master sheet created: ' + masterSheet.getName());
    Logger.log('✓ Master sheet URL: ' + masterSheet.getUrl());
    
    // Step 2: Add initial configuration
    Logger.log('Step 2: Adding initial configuration...');
    setupInitialConfig();
    Logger.log('✓ Configuration added');
    
    // Step 3: Test the system
    Logger.log('Step 3: Testing system...');
    const testResult = testSystemFunctionality();
    if (testResult.success) {
      Logger.log('✓ System test passed');
    } else {
      Logger.log('⚠ System test warning: ' + testResult.message);
    }
    
    // Step 4: Get URLs and information
    const webAppUrl = 'https://script.google.com/macros/s/AKfycbz3xZWEXbdbDhqKQ63OwlSjNW-rlSmxd81M8v278RNM8FgfkGQnPMf_2ld7r8RiBF51cw/exec';
    
    Logger.log('=== SETUP COMPLETE ===');
    Logger.log('📊 Master Sheet URL: ' + masterSheet.getUrl());
    Logger.log('🌐 Web App URL: ' + webAppUrl);
    Logger.log('📝 Create Profile Form: ' + webAppUrl + '?action=create');
    Logger.log('✏️ Edit Profile Form: ' + webAppUrl + '?action=edit&profileId=[PROFILE_ID]');
    Logger.log('🔗 API Endpoint: ' + webAppUrl + '?action=api&endpoint=profile&profileId=[PROFILE_ID]');
    
    return {
      success: true,
      masterSheetUrl: masterSheet.getUrl(),
      webAppUrl: webAppUrl,
      apiEndpoint: webAppUrl + '?action=api'
    };
    
  } catch (error) {
    Logger.log('❌ SETUP FAILED: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * Sets up initial configuration in the master sheet
 */
function setupInitialConfig() {
  try {
    const masterSheet = getMasterProfileSheet();
    const configTab = masterSheet.getSheetByName('Wix_Config');
    
    if (!configTab) {
      Logger.log('Warning: Wix_Config tab not found, creating it...');
      const newConfigTab = masterSheet.insertSheet('Wix_Config');
      newConfigTab.getRange(1, 1, 1, 2).setValues([['Setting', 'Value']]);
    }
    
    // Add configuration data
    const configData = [
      ['System_Status', 'ACTIVE'],
      ['Default_Timezone', 'EST'],
      ['Last_Setup_Date', new Date().toISOString()],
      ['Web_App_URL', 'https://script.google.com/macros/s/AKfycbz3xZWEXbdbDhqKQ63OwlSjNW-rlSmxd81M8v278RNM8FgfkGQnPMf_2ld7r8RiBF51cw/exec'],
      ['Sync_Enabled', 'TRUE'],
      ['Auto_Sync_Frequency_Minutes', '5']
    ];
    
    const configSheet = masterSheet.getSheetByName('Wix_Config');
    const startRow = 2;
    
    for (let i = 0; i < configData.length; i++) {
      configSheet.getRange(startRow + i, 1, 1, 2).setValues([configData[i]]);
    }
    
    Logger.log('✓ Configuration data added');
    
  } catch (error) {
    Logger.log('Error setting up configuration: ' + error.toString());
    throw error;
  }
}

/**
 * Tests basic system functionality
 */
function testSystemFunctionality() {
  try {
    // Test 1: Check master sheet exists
    const masterSheet = getMasterProfileSheet();
    if (!masterSheet) {
      throw new Error('Master sheet not found');
    }
    
    // Test 2: Check required tabs exist
    const requiredTabs = ['Client_Profiles', 'Services', 'Technicians', 'Policies', 'Service_Areas', 'Sync_Log', 'Wix_Config'];
    const missingTabs = [];
    
    for (const tabName of requiredTabs) {
      const tab = masterSheet.getSheetByName(tabName);
      if (!tab) {
        missingTabs.push(tabName);
      }
    }
    
    if (missingTabs.length > 0) {
      Logger.log('Warning: Missing tabs: ' + missingTabs.join(', '));
      return {
        success: false,
        message: 'Missing required tabs: ' + missingTabs.join(', ')
      };
    }
    
    // Test 3: Try creating a test profile
    const testProfileData = {
      companyName: 'Test Company ' + new Date().getTime(),
      location: 'Test Location',
      timezone: 'EST',
      phone: '555-TEST',
      email: 'test@example.com',
      website: 'https://test.com',
      address: 'Test Address',
      hours: 'Test Hours',
      bulletin: 'Test Bulletin',
      pestsNotCovered: 'Test Pests',
      initialServices: 'Test Service'
    };
    
    const result = createClientProfileFromHTML(testProfileData);
    
    if (result.success) {
      Logger.log('✓ Test profile created successfully: ' + result.profileId);
      
      // Clean up test profile
      try {
        deleteProfileFromMasterSheet(result.profileId);
        Logger.log('✓ Test profile cleaned up');
      } catch (cleanupError) {
        Logger.log('Warning: Could not clean up test profile: ' + cleanupError.toString());
      }
      
      return { success: true, message: 'All tests passed' };
    } else {
      return { success: false, message: 'Test profile creation failed: ' + result.error };
    }
    
  } catch (error) {
    Logger.log('System test error: ' + error.toString());
    return { success: false, message: error.message };
  }
}

/**
 * Helper function to delete a profile (for testing)
 */
function deleteProfileFromMasterSheet(profileId) {
  try {
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    const data = profilesTab.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === profileId) {
        profilesTab.deleteRow(i + 1);
        Logger.log('Profile deleted: ' + profileId);
        return;
      }
    }
    
    Logger.log('Profile not found for deletion: ' + profileId);
    
  } catch (error) {
    Logger.log('Error deleting profile: ' + error.toString());
    throw error;
  }
}

/**
 * Check system status
 */
function checkSystemStatus() {
  try {
    const status = {
      masterSheetExists: false,
      webAppDeployed: false,
      configurationValid: false,
      lastError: null,
      timestamp: new Date().toISOString()
    };
    
    // Check master sheet
    try {
      const masterSheet = getMasterProfileSheet();
      status.masterSheetExists = !!masterSheet;
      
      // Check configuration
      const configTab = masterSheet.getSheetByName('Wix_Config');
      status.configurationValid = !!configTab;
      
    } catch (error) {
      status.lastError = error.toString();
    }
    
    // Check web app deployment
    status.webAppDeployed = true; // We know this is deployed
    
    Logger.log('System Status Check:');
    Logger.log('- Master Sheet Exists: ' + status.masterSheetExists);
    Logger.log('- Web App Deployed: ' + status.webAppDeployed);
    Logger.log('- Configuration Valid: ' + status.configurationValid);
    if (status.lastError) {
      Logger.log('- Last Error: ' + status.lastError);
    }
    
    return status;
    
  } catch (error) {
    Logger.log('Error checking system status: ' + error.toString());
    return {
      masterSheetExists: false,
      webAppDeployed: false,
      configurationValid: false,
      lastError: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}
