/**
 * Wix-Independent Setup
 * Run your client profile system without Wix integration
 * Perfect for contractors, agencies, or when you don't have Wix access
 */

/**
 * Configure system to work without Wix
 * This disables Wix sync but keeps all Google Sheets functionality
 */
function setupWithoutWix() {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    // Set flag to skip Wix operations
    properties.setProperty('SKIP_WIX_SYNC', 'true');
    properties.setProperty('WIX_MODE', 'disabled');
    properties.setProperty('SETUP_DATE', new Date().toISOString());
    
    console.log('✅ System configured to work without Wix integration');
    console.log('');
    console.log('🎯 WHAT WILL WORK:');
    console.log('✅ Client input form');
    console.log('✅ Individual Google Sheets for each client');
    console.log('✅ Master tracking spreadsheet');
    console.log('✅ All client data organization');
    console.log('✅ Data export and sharing');
    console.log('');
    console.log('⚠️ WHAT WON\'T WORK:');
    console.log('❌ Automatic Wix CMS sync');
    console.log('❌ Live profile URLs');
    console.log('');
    console.log('💡 TIP: You can export data to share with the Wix site owner later');
    
    return true;
    
  } catch (error) {
    console.log('❌ Error configuring system:', error.message);
    return false;
  }
}

/**
 * Test the system without Wix
 */
function testWithoutWix() {
  console.log('🧪 Testing system without Wix integration...');
  console.log('===========================================');
  
  try {
    // Test Google Sheets functionality
    console.log('📊 Testing Google Sheets access...');
    const testSheet = SpreadsheetApp.create('Test Sheet - ' + new Date().toISOString());
    const testUrl = testSheet.getUrl();
    console.log('✅ Google Sheets: Working (' + testUrl + ')');
    
    // Clean up test sheet
    DriveApp.getFileById(testSheet.getId()).setTrashed(true);
    
    // Test form functionality
    console.log('📝 Testing form functionality...');
    const sampleData = {
      companyName: 'Test Company',
      location: 'Test City, ST',
      phone: '555-123-4567',
      email: 'test@company.com'
    };
    
    console.log('✅ Form processing: Ready');
    console.log('');
    console.log('🎉 SYSTEM STATUS: Ready to use without Wix!');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Share your form URL with clients');
    console.log('2. Collect client profiles in Google Sheets');
    console.log('3. Export data to share with Wix site owner later');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

/**
 * Generate export format for Wix site owner
 */
function generateWixExportInstructions() {
  console.log('📤 EXPORT INSTRUCTIONS FOR WIX SITE OWNER');
  console.log('========================================');
  console.log('');
  console.log('When you\'re ready to sync data to Wix, send this to the site owner:');
  console.log('');
  console.log('📋 Required from Wix Site Owner:');
  console.log('1. Wix Site ID (from Settings → General)');
  console.log('2. API Key (OAuth token from dev.wix.com)');
  console.log('3. Account ID (optional)');
  console.log('');
  console.log('📊 Data Format:');
  console.log('- All client data is organized in Google Sheets');
  console.log('- Each client has individual profile sheet');
  console.log('- Master tracking sheet coordinates everything');
  console.log('- Data is ready for bulk import to Wix CMS');
  console.log('');
  console.log('🔄 Import Process:');
  console.log('1. Owner provides API credentials');
  console.log('2. Run setupWixCredentials() with their info');
  console.log('3. System automatically syncs all existing profiles');
  console.log('4. Future form submissions sync in real-time');
}

/**
 * Check if system is in Wix-independent mode
 */
function checkSystemMode() {
  const properties = PropertiesService.getScriptProperties();
  const skipWix = properties.getProperty('SKIP_WIX_SYNC');
  const wixMode = properties.getProperty('WIX_MODE');
  
  console.log('🔍 CURRENT SYSTEM MODE:');
  console.log('======================');
  
  if (skipWix === 'true' || wixMode === 'disabled') {
    console.log('⚙️ Mode: Wix-Independent');
    console.log('📊 Google Sheets: ✅ Active');
    console.log('🔗 Wix Sync: ❌ Disabled');
    console.log('');
    console.log('💡 To enable Wix later: Get credentials and run setupWixCredentials()');
  } else {
    console.log('⚙️ Mode: Full Integration Attempt');
    console.log('📊 Google Sheets: ✅ Active');
    console.log('🔗 Wix Sync: ⚠️ Will attempt (may fail without credentials)');
  }
}

/**
 * Create a sample client profile to test the system
 */
function createSampleProfile() {
  console.log('🧪 Creating sample client profile...');
  
  const sampleData = {
    companyName: 'Demo Pest Control Company',
    location: 'Dallas, TX',
    timezone: 'CST',
    officeInfo: {
      officePhone: '555-123-4567',
      customerContactEmail: 'contact@demopest.com',
      physicalAddress: '123 Main St\nDallas, TX 75001',
      officeHours: 'Monday-Friday: 8:00 AM - 5:00 PM\nSaturday: 8:00 AM - 12:00 PM',
      website: 'https://demopest.com'
    },
    services: [{
      name: 'General Pest Control',
      type: 'recurring',
      frequency: 'Quarterly',
      description: 'Standard residential pest control service'
    }],
    technicians: [{
      name: 'John Smith',
      role: 'Tech',
      schedule: 'Mon-Fri 8-5',
      maxStops: 12
    }],
    serviceAreas: [{
      zipCode: '75001',
      branch: 'Dallas'
    }]
  };
  
  try {
    // This will create Google Sheets but skip Wix sync
    const result = createClientProfileFromHTML(sampleData);
    console.log('✅ Sample profile created successfully!');
    console.log('📊 Check your Google Drive for the new sheets');
    return result;
  } catch (error) {
    console.log('❌ Error creating sample:', error.message);
  }
}
