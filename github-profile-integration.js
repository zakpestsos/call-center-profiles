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
  updateElement('location', profile['Location'] || '');
  updateElement('phone', profile['Phone'] || '');
  updateElement('email', profile['Email'] || '');
  updateElement('website', profile['Website'] || '');
  updateElement('address', profile['Address'] || '');
  updateElement('hours', profile['Hours'] || '');
  updateElement('bulletin', profile['Bulletin'] || '');
  updateElement('pestsNotCovered', profile['Pests_Not_Covered'] || '');
  
  // New address fields
  updateElement('fieldRoutesLink', profile['FieldRoutes_Link'] || '');
  updateElement('physicalStreet', profile['Physical_Street'] || '');
  updateElement('physicalSuite', profile['Physical_Suite'] || '');
  updateElement('physicalCity', profile['Physical_City'] || '');
  updateElement('physicalState', profile['Physical_State'] || '');
  updateElement('physicalZip', profile['Physical_Zip'] || '');
  updateElement('mailingStreet', profile['Mailing_Street'] || '');
  updateElement('mailingSuite', profile['Mailing_Suite'] || '');
  updateElement('mailingCity', profile['Mailing_City'] || '');
  updateElement('mailingState', profile['Mailing_State'] || '');
  updateElement('mailingZip', profile['Mailing_Zip'] || '');
  updateElement('sameAsPhysical', profile['Same_As_Physical'] || '');
  updateElement('timezoneCustom', profile['Timezone_Custom'] || '');
  updateElement('holidaysObserved', profile['Holidays_Observed'] || '');
  
  // Update page title
  document.title = `${profile['Company_Name'] || 'Profile'} - Call Center Profile`;
  
  // Display organized policy information
  displayPolicyInformation(profile);
  
  // Show success
  showSuccess('Profile loaded successfully!');
  
  console.log('✅ Profile populated');
}

/**
 * Display organized policy information
 */
function displayPolicyInformation(profile) {
  // Create organized policy display
  const policyContainer = document.getElementById('policyInformation');
  if (!policyContainer) {
    console.warn('⚠️ Policy container not found');
    return;
  }
  
  let policyHTML = '<div class="policy-sections">';
  
  // Service Coverage Policies
  policyHTML += '<div class="policy-section">';
  policyHTML += '<h4>Service Coverage</h4>';
  policyHTML += '<div class="policy-items">';
  
  const serviceCoverage = [
    { key: 'Treat_Vehicles', label: 'Vehicle Treatment', description: 'Do we treat vehicles?' },
    { key: 'Commercial_Properties', label: 'Commercial Properties', description: 'Commercial property service policy' },
    { key: 'Multi_Family_Offered', label: 'Multi-Family Properties', description: 'Multi-family property service policy' },
    { key: 'Trailers_Offered', label: 'Trailers/Mobile Homes', description: 'Trailer and mobile home service policy' }
  ];
  
  serviceCoverage.forEach(item => {
    const value = profile[item.key];
    if (value) {
      policyHTML += `
        <div class="policy-item">
          <strong>${item.label}:</strong> ${value}
          <div class="policy-description">${item.description}</div>
        </div>
      `;
    }
  });
  
  policyHTML += '</div></div>';
  
  // Scheduling Policies
  policyHTML += '<div class="policy-section">';
  policyHTML += '<h4>Scheduling & Operations</h4>';
  policyHTML += '<div class="policy-items">';
  
  const scheduling = [
    { key: 'Signed_Contract', label: 'Contract Required', description: 'Signed contract requirement policy' },
    { key: 'Appointment_Confirmations', label: 'Appointment Confirmations', description: 'Appointment confirmation policy' },
    { key: 'Same_Day_Services', label: 'Same Day Services', description: 'Same day service availability' },
    { key: 'After_Hours_Emergency', label: 'After Hours Emergency', description: 'Emergency service availability' }
  ];
  
  scheduling.forEach(item => {
    const value = profile[item.key];
    if (value) {
      policyHTML += `
        <div class="policy-item">
          <strong>${item.label}:</strong> ${value}
          <div class="policy-description">${item.description}</div>
        </div>
      `;
    }
  });
  
  policyHTML += '</div></div>';
  
  // Service Operations
  policyHTML += '<div class="policy-section">';
  policyHTML += '<h4>Service Operations</h4>';
  policyHTML += '<div class="policy-items">';
  
  const operations = [
    { key: 'Reservices', label: 'Reservices', description: 'Reservice policy and requirements' },
    { key: 'Set_Service_Type_To', label: 'Service Type Setting', description: 'Default service type configuration' },
    { key: 'Tools_To_Save', label: 'Tools to Save', description: 'Required tools and equipment' }
  ];
  
  operations.forEach(item => {
    const value = profile[item.key];
    if (value) {
      policyHTML += `
        <div class="policy-item">
          <strong>${item.label}:</strong> ${value}
          <div class="policy-description">${item.description}</div>
        </div>
      `;
    }
  });
  
  policyHTML += '</div></div>';
  
  // Payment Policies
  policyHTML += '<div class="policy-section">';
  policyHTML += '<h4>Payment & Financial</h4>';
  policyHTML += '<div class="policy-items">';
  
  const payment = [
    { key: 'Payment_Types', label: 'Payment Types', description: 'Accepted payment methods' },
    { key: 'Past_Due_Period', label: 'Past Due Period', description: 'Past due account handling policy' }
  ];
  
  payment.forEach(item => {
    const value = profile[item.key];
    if (value) {
      policyHTML += `
        <div class="policy-item">
          <strong>${item.label}:</strong> ${value}
          <div class="policy-description">${item.description}</div>
        </div>
      `;
    }
  });
  
  policyHTML += '</div></div>';
  policyHTML += '</div>';
  
  // Add some basic styling
  policyHTML += `
    <style>
      .policy-sections { margin-top: 20px; }
      .policy-section { margin-bottom: 25px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
      .policy-section h4 { margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
      .policy-item { margin-bottom: 12px; padding: 8px; background: #f8f9fa; border-radius: 4px; }
      .policy-item strong { color: #007bff; }
      .policy-description { font-size: 0.9em; color: #666; margin-top: 4px; font-style: italic; }
    </style>
  `;
  
  policyContainer.innerHTML = policyHTML;
  console.log('✅ Policy information displayed');
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
