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
    
    // Use the Apps Script API endpoint to get complete profile data including policies
    const apiUrl = 'https://script.google.com/macros/s/AKfycbyF_rCxojGRXReDPGYjiIPuQx4PRrrz6kTIGwpt-mB7bkzw0DG4cXKv2KcO-In10M8sGw/exec';
    const fullApiUrl = `${apiUrl}?action=getProfile&profileId=${encodeURIComponent(profileId)}`;
    
    console.log('📊 Fetching complete profile data from Apps Script API...');
    console.log('🔗 API URL:', fullApiUrl);
    
    const response = await fetch(fullApiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ API response received:', result);
    
    if (result.success && result.data) {
      console.log('✅ Profile data loaded successfully');
      console.log('📋 Policy data:', result.data.policies);
      
      // Populate the page with the complete profile data
      populateProfileFromAPI(result.data);
    } else {
      throw new Error(result.error || 'Profile not found');
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
 * Populate profile data from API response
 */
function populateProfileFromAPI(profileData) {
  console.log('👤 Populating profile data from API...');
  console.log('👤 Profile data:', profileData);
  
  // Update basic profile information
  updateElement('companyName', profileData.companyName || '');
  updateElement('location', profileData.location || '');
  updateElement('phone', profileData.officeInfo?.phone || '');
  updateElement('email', profileData.officeInfo?.email || '');
  updateElement('website', profileData.officeInfo?.website || '');
  updateElement('address', profileData.officeInfo?.physicalAddress || '');
  updateElement('hours', profileData.officeInfo?.officeHours || '');
  updateElement('bulletin', profileData.bulletin || '');
  updateElement('pestsNotCovered', profileData.pestsNotCovered || '');
  updateElement('fieldRoutesLink', profileData.officeInfo?.fieldRoutesLink || '');
  
  // Update page title
  document.title = `${profileData.companyName || 'Profile'} - Call Center Profile`;
  
  // Display organized policy information
  displayPolicyInformationFromAPI(profileData.policies || []);
  
  // Show success
  showSuccess('Profile loaded successfully!');
  
  console.log('✅ Profile populated from API');
}

/**
 * Populate profile information on the page (legacy CSV method)
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
 * Display organized policy information from API data
 */
function displayPolicyInformationFromAPI(policies) {
  console.log('📋 Displaying policy information from API...');
  console.log('📋 Policies data:', policies);
  
  const policyContainer = document.getElementById('policyInformation');
  if (!policyContainer) {
    console.warn('⚠️ Policy container not found');
    return;
  }
  
  if (!policies || policies.length === 0) {
    policyContainer.innerHTML = '<div class="policy-section"><h4>No Policy Information</h4><p>No policy data available for this profile.</p></div>';
    return;
  }
  
  // Group policies by category
  const groupedPolicies = {};
  policies.forEach(policy => {
    const category = policy.category || 'General';
    if (!groupedPolicies[category]) {
      groupedPolicies[category] = [];
    }
    groupedPolicies[category].push(policy);
  });
  
  let policyHTML = '<div class="policy-sections">';
  
  // Display each category
  Object.entries(groupedPolicies).forEach(([category, categoryPolicies]) => {
    policyHTML += `<div class="policy-section">`;
    policyHTML += `<h4>${category}</h4>`;
    policyHTML += `<div class="policy-items">`;
    
    categoryPolicies.forEach(policy => {
      if (policy.value && policy.value.trim() !== '') {
        policyHTML += `
          <div class="policy-item">
            <strong>${policy.title}:</strong> ${policy.value}
            ${policy.description ? `<div class="policy-description">${policy.description}</div>` : ''}
          </div>
        `;
      }
    });
    
    policyHTML += `</div></div>`;
  });
  
  policyHTML += '</div>';
  
  // Add styling
  policyHTML += `
    <style>
      .policy-sections { margin-top: 20px; }
      .policy-section { margin-bottom: 25px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f8f9fa; }
      .policy-section h4 { margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
      .policy-item { margin-bottom: 12px; padding: 8px; background: white; border-radius: 4px; border-left: 3px solid #007bff; }
      .policy-item strong { color: #007bff; }
      .policy-description { font-size: 0.9em; color: #666; margin-top: 4px; font-style: italic; }
    </style>
  `;
  
  policyContainer.innerHTML = policyHTML;
  console.log('✅ Policy information displayed from API');
}

/**
 * Display organized policy information (legacy CSV method)
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
