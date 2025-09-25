/**
 * Quick Setup Script - Run this once to initialize your system
 * This creates the master profile sheet and sets up the initial configuration
 */

function runQuickSetup() {
  try {
    Logger.log('Starting Quick Setup...');
    
    // Step 1: Create master profile sheet
    Logger.log('Creating master profile sheet...');
    const masterSheet = createMasterProfileSheet();
    Logger.log('Master sheet created: ' + masterSheet.getName());
    
    // Step 2: Add sample configuration
    Logger.log('Setting up initial configuration...');
    setupInitialConfig();
    
    // Step 3: Set up sync triggers
    Logger.log('Setting up sync triggers...');
    setupSyncTriggers();
    
    // Step 4: Test basic functionality
    Logger.log('Testing basic functionality...');
    testBasicFunctionality();
    
    Logger.log('Quick Setup completed successfully!');
    
    return {
      success: true,
      message: 'System setup completed successfully',
      masterSheetUrl: masterSheet.getUrl(),
      webAppUrl: getWebAppUrl()
    };
    
  } catch (error) {
    Logger.log('Quick Setup failed: ' + error.toString());
    throw error;
  }
}

function setupInitialConfig() {
  try {
    const masterSheet = getMasterProfileSheet();
    const configTab = masterSheet.getSheetByName('Wix_Config');
    
    // Add initial configuration values
    const configData = [
      ['Wix_API_Key', ''],
      ['Wix_Site_ID', ''],
      ['Wix_Collection_ID', ''],
      ['API_Rate_Limit', '100'],
      ['Sync_Frequency_Minutes', '5'],
      ['Last_Sync_Time', ''],
      ['Default_Timezone', 'EST'],
      ['System_Status', 'ACTIVE']
    ];
    
    const startRow = 2;
    for (let i = 0; i < configData.length; i++) {
      configTab.getRange(startRow + i, 1, 1, 2).setValues([configData[i]]);
    }
    
    Logger.log('Initial configuration added to Wix_Config tab');
    
  } catch (error) {
    Logger.log('Error setting up initial config: ' + error.toString());
    throw error;
  }
}

function testBasicFunctionality() {
  try {
    // Test 1: Verify master sheet structure
    const masterSheet = getMasterProfileSheet();
    const requiredTabs = ['Client_Profiles', 'Services', 'Technicians', 'Policies', 'Service_Areas', 'Sync_Log', 'Wix_Config'];
    
    for (const tabName of requiredTabs) {
      const tab = masterSheet.getSheetByName(tabName);
      if (!tab) {
        throw new Error(`Required tab missing: ${tabName}`);
      }
    }
    
    Logger.log('✓ All required tabs verified');
    
    // Test 2: Create a test profile
    const testProfileData = {
      companyName: 'Test Company',
      location: 'Test Location',
      timezone: 'EST',
      phone: '555-0123',
      email: 'test@example.com',
      website: 'https://example.com',
      address: '123 Test St, Test City, TS 12345',
      hours: 'Mon-Fri: 9AM-5PM',
      bulletin: 'Test bulletin',
      pestsNotCovered: 'Test pests',
      initialServices: 'General Pest Control\nAnt Control'
    };
    
    Logger.log('Creating test profile...');
    const result = createClientProfileFromHTML(testProfileData);
    
    if (result.success) {
      Logger.log('✓ Test profile created successfully: ' + result.profileId);
      
      // Clean up test profile
      deleteTestProfile(result.profileId);
      Logger.log('✓ Test profile cleaned up');
    } else {
      throw new Error('Test profile creation failed: ' + result.error);
    }
    
    Logger.log('✓ Basic functionality test passed');
    
  } catch (error) {
    Logger.log('Basic functionality test failed: ' + error.toString());
    throw error;
  }
}

function deleteTestProfile(profileId) {
  try {
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    const data = profilesTab.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === profileId) {
        profilesTab.deleteRow(i + 1);
        break;
      }
    }
    
    Logger.log('Test profile deleted: ' + profileId);
    
  } catch (error) {
    Logger.log('Error deleting test profile: ' + error.toString());
  }
}

function getWebAppUrl() {
  try {
    // This would typically return the deployed web app URL
    // For now, return a placeholder
    return 'https://script.google.com/macros/s/AKfycbyOf2IEegbzl2BoNF_DY3NHUcrH5l_gt99rl6BG8Gj8tjJKoQryycgtbKoXJCYI4mvAhQ/exec';
  } catch (error) {
    Logger.log('Error getting web app URL: ' + error.toString());
    return 'URL not available';
  }
}

/**
 * Manual function to run setup from Apps Script editor
 */
function manualSetup() {
  try {
    Logger.log('=== MANUAL SETUP STARTED ===');
    
    const result = runQuickSetup();
    
    Logger.log('=== SETUP RESULTS ===');
    Logger.log('Success: ' + result.success);
    Logger.log('Message: ' + result.message);
    Logger.log('Master Sheet URL: ' + result.masterSheetUrl);
    Logger.log('Web App URL: ' + result.webAppUrl);
    Logger.log('=== MANUAL SETUP COMPLETED ===');
    
    return result;
    
  } catch (error) {
    Logger.log('=== SETUP FAILED ===');
    Logger.log('Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

/**
 * Function to check system status
 */
function checkSystemStatus() {
  try {
    const status = {
      masterSheetExists: false,
      allTabsPresent: false,
      configurationValid: false,
      syncTriggersActive: false,
      lastError: null
    };
    
    // Check master sheet
    try {
      const masterSheet = getMasterProfileSheet();
      status.masterSheetExists = true;
      
      // Check tabs
      const requiredTabs = ['Client_Profiles', 'Services', 'Technicians', 'Policies', 'Service_Areas', 'Sync_Log', 'Wix_Config'];
      let tabCount = 0;
      
      for (const tabName of requiredTabs) {
        const tab = masterSheet.getSheetByName(tabName);
        if (tab) tabCount++;
      }
      
      status.allTabsPresent = (tabCount === requiredTabs.length);
      
      // Check configuration
      const configTab = masterSheet.getSheetByName('Wix_Config');
      if (configTab) {
        const configData = configTab.getDataRange().getValues();
        status.configurationValid = (configData.length > 1);
      }
      
    } catch (error) {
      status.lastError = error.toString();
    }
    
    // Check triggers
    const triggers = ScriptApp.getProjectTriggers();
    status.syncTriggersActive = triggers.some(trigger => 
      trigger.getHandlerFunction() === 'performBidirectionalSync'
    );
    
    Logger.log('System Status: ' + JSON.stringify(status, null, 2));
    
    return status;
    
  } catch (error) {
    Logger.log('Error checking system status: ' + error.toString());
    throw error;
  }
}
