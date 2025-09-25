/**
 * MASTER SHEET TO GITHUB INTEGRATION
 * Functions to ensure your master sheet works with GitHub profile pages
 */

/**
 * Make master sheet publicly accessible and get the shareable URL
 * Run this to get the URL GitHub needs to fetch data
 */
function setupMasterSheetForGitHub() {
  console.log('🔗 SETTING UP MASTER SHEET FOR GITHUB INTEGRATION');
  console.log('===============================================');
  
  try {
    // Get or create master sheet
    let masterSheet = getMasterProfileSheet();
    if (!masterSheet) {
      console.log('📊 Creating master profile sheet...');
      masterSheet = createMasterProfileSheet();
    }
    
    // Make sheet publicly viewable
    const file = DriveApp.getFileById(masterSheet.getId());
    
    // Set sharing permissions
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const sheetUrl = masterSheet.getUrl();
    console.log('✅ Master sheet configured for public access');
    console.log('🔗 Sheet URL: ' + sheetUrl);
    
    // Generate the CSV export URL that GitHub can use
    const csvUrl = generatePublicCSVUrl(masterSheet.getId());
    console.log('📊 CSV Data URL for GitHub: ' + csvUrl);
    
    // Update the GitHub repository with this URL
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Copy the CSV URL above');
    console.log('2. Update your GitHub repository config');
    console.log('3. Test a profile URL');
    
    return {
      sheetUrl: sheetUrl,
      csvUrl: csvUrl,
      sheetId: masterSheet.getId()
    };
    
  } catch (error) {
    console.log('❌ Error setting up master sheet:', error.message);
    throw error;
  }
}

/**
 * Generate public CSV URL that GitHub can fetch from
 */
function generatePublicCSVUrl(sheetId) {
  // This creates a URL that returns CSV data without authentication
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
  
  console.log('📊 Generated CSV URL: ' + csvUrl);
  return csvUrl;
}

/**
 * Test the GitHub integration with a sample profile
 */
function testGitHubIntegration() {
  console.log('🧪 TESTING GITHUB INTEGRATION');
  console.log('=============================');
  
  try {
    // Create test profile data
    const testProfile = {
      companyName: 'Test Pest Control Co',
      location: 'Dallas, TX',
      profileId: 'TEST001',
      officeInfo: {
        officePhone: '214-555-0123',
        customerContactEmail: 'test@pestcontrol.com',
        website: 'https://testpest.com'
      },
      bulletin: 'Test bulletin for GitHub integration'
    };
    
    // Add to master sheet
    const result = createClientProfileFromHTML(testProfile);
    console.log('✅ Test profile created: ' + result.profileId);
    
    // Generate GitHub URL
    const githubUrl = buildGitHubUrl(testProfile);
    console.log('🔗 GitHub URL: ' + githubUrl);
    
    // Show what the URL should look like
    console.log('');
    console.log('📋 URL STRUCTURE:');
    console.log('Base: https://zakpestsos.github.io/call-center-profiles/');
    console.log('Parameters: ?profileId=TEST001&companyName=Test%20Pest%20Control%20Co...');
    console.log('');
    console.log('💡 The GitHub page should:');
    console.log('1. Read the profileId from URL');
    console.log('2. Fetch data from Google Sheets CSV');
    console.log('3. Find matching profile');
    console.log('4. Display the profile data');
    
    return githubUrl;
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    throw error;
  }
}

/**
 * Verify master sheet has correct structure for GitHub
 */
function verifyMasterSheetStructure() {
  console.log('🔍 VERIFYING MASTER SHEET STRUCTURE');
  console.log('===================================');
  
  try {
    const masterSheet = getMasterProfileSheet();
    if (!masterSheet) {
      console.log('❌ No master sheet found');
      return false;
    }
    
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    if (!profilesTab) {
      console.log('❌ No Client_Profiles tab found');
      return false;
    }
    
    // Check headers
    const headers = profilesTab.getRange(1, 1, 1, profilesTab.getLastColumn()).getValues()[0];
    console.log('📊 Current headers:');
    headers.forEach((header, index) => {
      console.log(`${index + 1}. ${header}`);
    });
    
    // Required headers for GitHub integration
    const requiredHeaders = [
      'Profile_ID', 'Company_Name', 'Location', 'Phone', 'Email', 
      'Website', 'Bulletin', 'Pests_Not_Covered', 'Client_Folder_URL'
    ];
    
    console.log('');
    console.log('✅ Required headers for GitHub:');
    requiredHeaders.forEach((header, index) => {
      const exists = headers.includes(header);
      console.log(`${index + 1}. ${header} ${exists ? '✅' : '❌'}`);
    });
    
    // Check if we have data
    const dataRows = profilesTab.getLastRow() - 1;
    console.log('');
    console.log(`📈 Data rows: ${dataRows}`);
    
    if (dataRows > 0) {
      console.log('✅ Master sheet structure is ready for GitHub');
      return true;
    } else {
      console.log('⚠️ No profile data found. Create some profiles first.');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Verification failed:', error.message);
    return false;
  }
}

/**
 * Generate the JavaScript code for GitHub repository
 */
function generateGitHubDataFetcher() {
  console.log('💻 GENERATING GITHUB DATA FETCHER CODE');
  console.log('======================================');
  
  try {
    const masterSheet = getMasterProfileSheet();
    if (!masterSheet) {
      console.log('❌ No master sheet found');
      return;
    }
    
    const csvUrl = generatePublicCSVUrl(masterSheet.getId());
    
    const jsCode = `
// Data fetcher for GitHub Pages
// Add this to your GitHub repository's profile page

const GOOGLE_SHEETS_CSV_URL = '${csvUrl}';

async function fetchProfileData(profileId) {
  try {
    console.log('Fetching profile data for:', profileId);
    
    // Fetch CSV data from Google Sheets
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);
    const csvText = await response.text();
    
    // Parse CSV
    const rows = csvText.split('\\n').map(row => row.split(','));
    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    // Find profile by ID
    const profileRow = dataRows.find(row => row[0] === profileId);
    
    if (!profileRow) {
      console.error('Profile not found:', profileId);
      return null;
    }
    
    // Convert to object
    const profileData = {};
    headers.forEach((header, index) => {
      profileData[header] = profileRow[index] || '';
    });
    
    console.log('Profile data loaded:', profileData);
    return profileData;
    
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return null;
  }
}

// Usage example:
// const profileId = new URLSearchParams(window.location.search).get('profileId');
// const profileData = await fetchProfileData(profileId);
`;
    
    console.log('✅ JavaScript code generated:');
    console.log('');
    console.log(jsCode);
    console.log('');
    console.log('📋 INSTRUCTIONS:');
    console.log('1. Copy the JavaScript code above');
    console.log('2. Add it to your GitHub repository');
    console.log('3. Update your profile page HTML to use fetchProfileData()');
    console.log('4. Test with a profile URL');
    
    return jsCode;
    
  } catch (error) {
    console.log('❌ Code generation failed:', error.message);
    throw error;
  }
}
