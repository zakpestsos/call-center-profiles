/**
 * Quick Wix Status Check
 * Run this to see your current Wix integration status
 */
function quickWixStatusCheck() {
  console.log('🔍 Checking Wix Integration Status...');
  console.log('================================');
  
  try {
    // Check if credentials exist
    const properties = PropertiesService.getScriptProperties();
    const siteId = properties.getProperty('WIX_SITE_ID');
    const apiKey = properties.getProperty('WIX_API_KEY');
    const accountId = properties.getProperty('WIX_ACCOUNT_ID');
    
    console.log('📋 CREDENTIAL STATUS:');
    console.log('- Site ID: ' + (siteId ? '✅ Set (' + siteId.substring(0, 8) + '...)' : '❌ Not set'));
    console.log('- API Key: ' + (apiKey ? '✅ Set (' + apiKey.substring(0, 8) + '...)' : '❌ Not set'));
    console.log('- Account ID: ' + (accountId ? '✅ Set (' + accountId.substring(0, 8) + '...)' : '⚠️ Optional (not set)'));
    console.log('');
    
    if (siteId && apiKey) {
      console.log('🧪 TESTING CONNECTION...');
      const testResult = testWixConnection();
      
      if (testResult) {
        console.log('✅ SUCCESS: Wix API connection working!');
        console.log('🎉 Your form will sync to Wix CMS when submitted');
      } else {
        console.log('❌ FAILED: Wix API connection not working');
        console.log('💡 Your credentials may be incorrect or expired');
      }
    } else {
      console.log('⚠️ CREDENTIALS MISSING');
      console.log('📋 You need to configure Wix credentials for full functionality');
      console.log('');
      console.log('🔧 WHAT WILL WORK WITHOUT WIX:');
      console.log('✅ Form submission');
      console.log('✅ Google Sheets creation');
      console.log('✅ Master profile tracking');
      console.log('❌ Wix CMS sync');
      console.log('❌ Live profile URLs');
    }
    
    console.log('');
    console.log('📞 NEXT STEPS:');
    if (!siteId || !apiKey) {
      console.log('1. Get your Wix credentials (run showWixCredentialInstructions())');
      console.log('2. Edit and run setupMyWixCredentials()');
      console.log('3. Test with quickWixStatusCheck()');
    } else {
      console.log('1. Your Wix integration is ready!');
      console.log('2. Submit a test form to see the full workflow');
    }
    
  } catch (error) {
    console.log('❌ ERROR: ' + error.message);
    console.log('📋 Run showWixCredentialInstructions() for setup help');
  }
}
