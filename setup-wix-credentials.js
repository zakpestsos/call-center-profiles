/**
 * Wix API Credentials Setup Helper
 * Run this script to configure your Wix integration
 */

/**
 * STEP 1: Set up your Wix API credentials here
 * 
 * To find your Wix Site ID:
 * 1. Go to your Wix site dashboard
 * 2. Go to Settings > General
 * 3. Your Site ID is in the URL or under Site Info
 * 
 * To get your Wix API Key:
 * 1. Go to Wix Developer Console: https://dev.wix.com/
 * 2. Create a new app or use existing
 * 3. Generate OAuth access token
 * 4. Copy the access token (this is your API Key)
 */

function setupMyWixCredentials() {
  // ⚠️ REPLACE THESE WITH YOUR ACTUAL CREDENTIALS ⚠️
  const YOUR_SITE_ID = 'your-wix-site-id-here';      // e.g., 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  const YOUR_API_KEY = 'your-wix-api-key-here';      // e.g., 'your-oauth-access-token'
  const YOUR_ACCOUNT_ID = 'your-account-id-here';     // Optional
  
  try {
    // Validate credentials format
    if (YOUR_SITE_ID === 'your-wix-site-id-here' || YOUR_API_KEY === 'your-wix-api-key-here') {
      throw new Error('Please replace the placeholder credentials with your actual Wix credentials');
    }
    
    // Call the setup function
    setupWixCredentials(YOUR_SITE_ID, YOUR_API_KEY, YOUR_ACCOUNT_ID);
    
    console.log('✅ Wix credentials configured successfully!');
    
    // Test the connection
    const testResult = testWixConnection();
    if (testResult) {
      console.log('✅ Wix API connection test successful!');
      console.log('🎉 Your integration is ready to sync with Wix!');
    } else {
      console.log('❌ Wix API connection test failed. Please check your credentials.');
    }
    
  } catch (error) {
    console.log('❌ Error setting up credentials:', error.message);
    console.log('📋 Please check the instructions below and try again.');
  }
}

/**
 * Check current credential status
 */
function checkWixCredentials() {
  try {
    const config = getWixConfig();
    console.log('✅ Wix credentials are configured:');
    console.log('- Site ID: ' + (config.siteId ? config.siteId.substring(0, 8) + '...' : 'Not set'));
    console.log('- API Key: ' + (config.apiKey ? config.apiKey.substring(0, 8) + '...' : 'Not set'));
    console.log('- Account ID: ' + (config.accountId || 'Not set'));
    
    // Test connection
    const testResult = testWixConnection();
    console.log('- Connection Status: ' + (testResult ? '✅ Connected' : '❌ Failed'));
    
  } catch (error) {
    console.log('❌ Wix credentials not configured yet.');
    console.log('📋 Run setupMyWixCredentials() to configure them.');
  }
}

/**
 * Clear credentials (for testing or reset)
 */
function clearMyWixCredentials() {
  try {
    clearWixCredentials();
    console.log('✅ Wix credentials cleared successfully');
  } catch (error) {
    console.log('❌ Error clearing credentials:', error.message);
  }
}

/**
 * Test without setting up credentials (check current status)
 */
function testCurrentWixSetup() {
  console.log('🔍 Testing current Wix setup...');
  
  try {
    const testResult = testWixConnection();
    if (testResult) {
      console.log('✅ Wix integration is working!');
      console.log('🎉 Your form submissions will sync to Wix CMS');
    } else {
      console.log('❌ Wix integration not working');
      console.log('📋 Please run setupMyWixCredentials() first');
    }
  } catch (error) {
    console.log('❌ Wix integration error:', error.message);
    console.log('📋 Please configure credentials using setupMyWixCredentials()');
  }
}

/**
 * Instructions for getting Wix credentials
 */
function showWixCredentialInstructions() {
  console.log('📋 HOW TO GET YOUR WIX API CREDENTIALS:');
  console.log('');
  console.log('🎯 STEP 1: Get your Site ID');
  console.log('1. Log into your Wix account');
  console.log('2. Go to your site dashboard');
  console.log('3. Go to Settings → General');
  console.log('4. Your Site ID is shown in the site info section');
  console.log('   (Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)');
  console.log('');
  console.log('🎯 STEP 2: Get your API Key (OAuth Token)');
  console.log('1. Go to Wix Developers: https://dev.wix.com/');
  console.log('2. Create a new app or select existing app');
  console.log('3. Go to OAuth section');
  console.log('4. Generate an access token');
  console.log('5. Copy the access token (this is your API Key)');
  console.log('');
  console.log('🎯 STEP 3: Configure in this script');
  console.log('1. Edit the setupMyWixCredentials() function above');
  console.log('2. Replace YOUR_SITE_ID with your actual Site ID');
  console.log('3. Replace YOUR_API_KEY with your actual API Key');
  console.log('4. Run setupMyWixCredentials()');
  console.log('');
  console.log('📞 Need help? Check the Wix API documentation:');
  console.log('   https://dev.wix.com/api/rest/getting-started');
}
