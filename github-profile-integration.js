/**
 * GitHub Profile Integration Code
 * Updated with live Google Sheets CSV URL
 * Place this in your GitHub repository
 */

// Your Google Sheets CSV URL from Apps Script
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1WId_kg8Fu0dbnpWSSQQVv-GJJibaeSu7p23PEaeePec/export?format=csv&gid=0';

/**
 * Load profile data from Google Sheets when page loads
 */
async function loadProfileData() {
  try {
    console.log('🔍 Loading profile data from Google Sheets...');
    
    // Get profile ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('profileId');
    
    if (!profileId) {
      console.error('❌ No profileId found in URL');
      showError('No profile ID specified in URL');
      return;
    }
    
    console.log(`🔍 Looking for profile ID: ${profileId}`);
    
    // Show loading state
    showLoading(true);
    
    // Fetch CSV data from Google Sheets
    console.log('📊 Fetching data from Google Sheets...');
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('✅ CSV data received');
    
    // Parse CSV data
    const rows = csvText.split('\n').filter(row => row.trim());
    if (rows.length < 2) {
      throw new Error('No profile data found in sheet');
    }
    
    const headers = parseCSVRow(rows[0]);
    console.log('📋 Headers:', headers);
    
    // Find matching profile
    let profileFound = false;
    for (let i = 1; i < rows.length; i++) {
      const data = parseCSVRow(rows[i]);
      
      // Check if this row matches our profile ID (first column)
      if (data[0] && data[0].toString().trim() === profileId.toString().trim()) {
        console.log('✅ Profile found!');
        populateProfile(headers, data);
        profileFound = true;
        break;
      }
    }
    
    if (!profileFound) {
      showError(`Profile ID "${profileId}" not found`);
    }
    
  } catch (error) {
    console.error('❌ Error loading profile:', error);
    showError(`Failed to load profile: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

/**
 * Parse a CSV row handling quoted values
 */
function parseCSVRow(row) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Populate profile information on the page
 */
function populateProfile(headers, data) {
  console.log('📝 Populating profile data...');
  
  // Create mapping of header names to data
  const profile = {};
  headers.forEach((header, index) => {
    profile[header] = data[index] || '';
  });
  
  console.log('👤 Profile data:', profile);
  
  // Update page elements (adjust IDs based on your HTML)
  updateElement('profileId', profile['Profile_ID'] || '');
  updateElement('companyName', profile['Company_Name'] || '');
  updateElement('location', profile['Company_Location'] || '');
  updateElement('phone', profile['Phone_Number'] || '');
  updateElement('contactPerson', profile['Contact_Person'] || '');
  updateElement('industry', profile['Industry'] || '');
  updateElement('websiteUrl', profile['Website_URL'] || '');
  updateElement('bulletin', profile['Morning_Bulletin'] || '');
  updateElement('notes', profile['Internal_Notes'] || '');
  
  // Update page title
  document.title = `${profile['Company_Name'] || 'Profile'} - Call Center Profile`;
  
  // Show success
  showSuccess('Profile loaded successfully!');
  
  console.log('✅ Profile populated');
}

/**
 * Update element content safely
 */
function updateElement(elementId, content) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = content;
    console.log(`✅ Updated ${elementId}: ${content}`);
  } else {
    console.warn(`⚠️ Element not found: ${elementId}`);
  }
}

/**
 * Show loading state
 */
function showLoading(isLoading) {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = isLoading ? 'block' : 'none';
  }
  
  if (isLoading) {
    console.log('⏳ Loading...');
  }
}

/**
 * Show error message
 */
function showError(message) {
  console.error('❌ Error:', message);
  
  const errorElement = document.getElementById('error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  
  // Hide other states
  showLoading(false);
  hideSuccess();
}

/**
 * Show success message
 */
function showSuccess(message) {
  const successElement = document.getElementById('success');
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = 'block';
  }
  
  // Hide error
  const errorElement = document.getElementById('error');
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}

/**
 * Hide success message
 */
function hideSuccess() {
  const successElement = document.getElementById('success');
  if (successElement) {
    successElement.style.display = 'none';
  }
}

/**
 * Initialize when page loads
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 GitHub Profile Integration initialized');
  console.log('📊 Data source:', GOOGLE_SHEETS_CSV_URL);
  
  // Load profile data
  loadProfileData();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadProfileData,
    parseCSVRow,
    populateProfile
  };
}
