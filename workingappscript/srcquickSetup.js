/**
 * Quick Setup Script
 * Run this once after setting up Google Apps Script to initialize the system
 */

/**
 * Main setup function - run this first
 */
function quickSetup() {
  try {
    Logger.log('Starting quick setup...');
    
    // 1. Create master profile sheet
    Logger.log('Step 1: Creating master profile sheet...');
    const masterSheet = getMasterProfileSheet();
    Logger.log('✓ Master profile sheet ready: ' + masterSheet.getUrl());
    
    // 2. Set up sync triggers
    Logger.log('Step 2: Setting up automatic sync triggers...');
    setupSyncTriggers();
    Logger.log('✓ Sync triggers configured (every 5 minutes)');
    
    // 3. Test data creation
    Logger.log('Step 3: Creating test profile...');
    const testProfileId = createTestProfile();
    Logger.log('✓ Test profile created with ID: ' + testProfileId);
    
    // 4. Generate URLs for testing
    Logger.log('Step 4: Generating test URLs...');
    const webAppUrl = ScriptApp.getService().getUrl();
    const testProfileUrl = webAppUrl + '?action=getProfile&profileId=' + testProfileId;
    const editUrl = webAppUrl + '?action=edit&profileId=' + testProfileId;
    
    // 5. Show success message with URLs
    const message = `
🎉 SETUP COMPLETE! 🎉

Master Profile Sheet: ${masterSheet.getUrl()}

Web App URL (for forms): ${webAppUrl}

Test Profile API: ${testProfileUrl}

Test Edit Form: ${editUrl}

Next Steps:
1. Copy the Web App URL to your production config.js
2. Test the profile creation form
3. Test the edit form
4. Deploy your production web app

All automatic syncing is now enabled!
    `;
    
    Logger.log(message);
    
    // Try to show UI alert if running from spreadsheet context
    try {
      SpreadsheetApp.getUi().alert('Setup Complete!', message, SpreadsheetApp.getUi().Button.OK);
    } catch (e) {
      // Not in spreadsheet context, that's fine
    }
    
    return {
      success: true,
      webAppUrl: webAppUrl,
      masterSheetUrl: masterSheet.getUrl(),
      testProfileId: testProfileId,
      testUrls: {
        api: testProfileUrl,
        edit: editUrl
      }
    };
    
  } catch (error) {
    Logger.log('❌ Setup failed: ' + error.toString());
    
    try {
      SpreadsheetApp.getUi().alert('Setup Failed', 'Error: ' + error.message, SpreadsheetApp.getUi().Button.OK);
    } catch (e) {
      // Not in spreadsheet context
    }
    
    throw error;
  }
}

/**
 * Creates a test profile for verification
 */
function createTestProfile() {
  const testData = {
    companyName: "Test Pest Control Company",
    location: "Dallas, TX",
    timezone: "Central",
    phone: "(555) 123-4567",
    email: "test@pestcontrol.com",
    website: "https://testpestcontrol.com",
    address: "123 Test Street\nDallas, TX 75201",
    hours: "Monday-Friday: 8 AM - 5 PM\nSaturday: 8 AM - 12 PM",
    bulletin: "This is a test profile created during system setup. You can edit or delete this profile.",
    pestsNotCovered: "Carpenter Ants, Bed Bugs (refer to specialist)",
    services: [
      {
        name: "General Pest Control",
        serviceType: "Quarterly GPC",
        frequency: "Quarterly",
        description: "Standard quarterly pest control service",
        pests: "Ants, Roaches, Spiders, Crickets",
        contract: "12 Months",
        guarantee: "90-day guarantee",
        duration: "45 minutes",
        productType: "General Pest Control",
        billingFrequency: "Quarterly after service",
        agentNote: "This is a test service for system verification",
        queueExt: "1234",
        pricingTiers: [
          { sqftMin: 0, sqftMax: 2500, firstPrice: "$125.00", recurringPrice: "$120.00", serviceType: "Quarterly GPC" },
          { sqftMin: 2501, sqftMax: 3000, firstPrice: "$130.00", recurringPrice: "$125.00", serviceType: "Quarterly GPC" }
        ]
      }
    ],
    technicians: [
      {
        name: "Test Technician",
        company: "Test Pest Control Company",
        role: "Technician",
        phone: "(555) 987-6543",
        schedule: "Mon-Fri 8-5",
        maxStops: "10",
        doesNotService: "",
        additionalNotes: "Test technician for system verification",
        zipCodes: ["75001", "75002", "75010"]
      }
    ],
    serviceAreas: [
      {
        zip: "75001",
        city: "Dallas",
        state: "TX",
        branch: "Dallas Branch",
        territory: "North Dallas",
        inService: true
      }
    ]
  };
  
  // Create client folder
  const clientFolderUrl = createEditableClientSheet(testData);
  
  // Add to master sheet
  const profileId = addProfileToMasterSheet(testData, clientFolderUrl);
  
  return profileId;
}

/**
 * Verifies the system is working correctly
 */
function verifySetup() {
  try {
    Logger.log('Verifying system setup...');
    
    // 1. Check master sheet exists and has data
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    const data = profilesTab.getDataRange().getValues();
    
    if (data.length < 2) {
      throw new Error('Master sheet has no profile data. Run quickSetup() first.');
    }
    
    Logger.log('✓ Master sheet has ' + (data.length - 1) + ' profiles');
    
    // 2. Check triggers are set up
    const triggers = ScriptApp.getProjectTriggers();
    const syncTrigger = triggers.find(t => t.getHandlerFunction() === 'performBidirectionalSync');
    
    if (!syncTrigger) {
      throw new Error('Sync triggers not found. Run setupSyncTriggers().');
    }
    
    Logger.log('✓ Sync triggers are active');
    
    // 3. Test API functionality
    const testProfileId = data[1][0]; // First profile
    const apiResult = getProfileDataAPI(testProfileId);
    
    if (!apiResult.success) {
      throw new Error('API test failed: ' + apiResult.error);
    }
    
    Logger.log('✓ API functionality working');
    
    // 4. Test sync functionality
    Logger.log('✓ Testing sync system...');
    performBidirectionalSync();
    Logger.log('✓ Sync system working');
    
    const verification = {
      success: true,
      profileCount: data.length - 1,
      masterSheetUrl: masterSheet.getUrl(),
      webAppUrl: ScriptApp.getService().getUrl(),
      lastVerified: new Date().toISOString()
    };
    
    Logger.log('🎉 System verification PASSED! Everything is working correctly.');
    
    try {
      SpreadsheetApp.getUi().alert(
        'Verification Passed!', 
        `System is working correctly!\n\nProfiles: ${verification.profileCount}\nWebApp: ${verification.webAppUrl}`, 
        SpreadsheetApp.getUi().Button.OK
      );
    } catch (e) {
      // Not in spreadsheet context
    }
    
    return verification;
    
  } catch (error) {
    Logger.log('❌ System verification FAILED: ' + error.toString());
    
    try {
      SpreadsheetApp.getUi().alert('Verification Failed', 'Error: ' + error.message, SpreadsheetApp.getUi().Button.OK);
    } catch (e) {
      // Not in spreadsheet context
    }
    
    throw error;
  }
}

/**
 * Cleans up test data (optional)
 */
function cleanupTestData() {
  try {
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    const data = profilesTab.getDataRange().getValues();
    
    let deletedCount = 0;
    
    // Find and delete test profiles (working backwards to maintain row indices)
    for (let i = data.length - 1; i >= 1; i--) {
      const companyName = data[i][1]; // Company_Name column
      if (companyName && companyName.includes('Test')) {
        // Delete this row
        profilesTab.deleteRow(i + 1);
        deletedCount++;
      }
    }
    
    Logger.log(`Cleaned up ${deletedCount} test profiles`);
    
    try {
      SpreadsheetApp.getUi().alert('Cleanup Complete', `Removed ${deletedCount} test profiles`, SpreadsheetApp.getUi().Button.OK);
    } catch (e) {
      // Not in spreadsheet context
    }
    
    return { success: true, deletedCount: deletedCount };
    
  } catch (error) {
    Logger.log('Error during cleanup: ' + error.toString());
    throw error;
  }
}

/**
 * Shows current system status
 */
function getSystemStatus() {
  try {
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    const data = profilesTab.getDataRange().getValues();
    
    const triggers = ScriptApp.getProjectTriggers();
    const syncTrigger = triggers.find(t => t.getHandlerFunction() === 'performBidirectionalSync');
    
    const status = {
      profileCount: data.length - 1,
      masterSheetUrl: masterSheet.getUrl(),
      webAppUrl: ScriptApp.getService().getUrl(),
      syncEnabled: !!syncTrigger,
      lastChecked: new Date().toISOString()
    };
    
    Logger.log('System Status:', JSON.stringify(status, null, 2));
    
    return status;
    
  } catch (error) {
    Logger.log('Error getting system status: ' + error.toString());
    throw error;
  }
}

/**
 * Emergency reset function - use with caution!
 */
function emergencyReset() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'EMERGENCY RESET', 
    'This will delete ALL profile data and reset the system. Are you sure?', 
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    const confirmResponse = ui.alert(
      'FINAL CONFIRMATION', 
      'This action CANNOT be undone. All profiles will be deleted. Continue?', 
      ui.ButtonSet.YES_NO
    );
    
    if (confirmResponse === ui.Button.YES) {
      try {
        // Delete all triggers
        const triggers = ScriptApp.getProjectTriggers();
        triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
        
        // Reset master sheet
        const masterSheet = getMasterProfileSheet();
        const sheets = masterSheet.getSheets();
        sheets.forEach(sheet => {
          if (sheet.getName() !== 'Client_Profiles') {
            masterSheet.deleteSheet(sheet);
          }
        });
        
        // Clear profiles tab
        const profilesTab = masterSheet.getSheetByName('Client_Profiles');
        profilesTab.clear();
        
        ui.alert('Reset Complete', 'System has been reset. Run quickSetup() to reinitialize.', ui.Button.OK);
        
      } catch (error) {
        ui.alert('Reset Failed', 'Error: ' + error.message, ui.Button.OK);
        throw error;
      }
    }
  }
}
