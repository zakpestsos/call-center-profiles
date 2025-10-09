/**
 * Master Profile Sheet Management
 * Central database for all client profiles with sync capabilities
 */

/**
 * Creates a new master profile sheet (public function for setup)
 */
function createMasterProfileSheet() {
  try {
    const MASTER_SHEET_NAME = 'Master_Client_Profiles';
    
    // Check if master sheet already exists
    const files = DriveApp.getFilesByName(MASTER_SHEET_NAME);
    if (files.hasNext()) {
      const existingSpreadsheet = SpreadsheetApp.openById(files.next().getId());
      Logger.log('Master sheet already exists, ensuring structure...');
      ensureMasterSheetStructure(existingSpreadsheet);
      return existingSpreadsheet;
    }
    
    // Create new master sheet
    const masterSpreadsheet = SpreadsheetApp.create(MASTER_SHEET_NAME);
    Logger.log('Created new master sheet: ' + masterSpreadsheet.getUrl());
    
    // Set up complete structure
    setupMasterSheetStructure(masterSpreadsheet);
    
    Logger.log('Master sheet setup completed');
    return masterSpreadsheet;
    
  } catch (error) {
    Logger.log('Error creating master profile sheet: ' + error.toString());
    throw error;
  }
}

/**
 * Creates or gets the master profile sheet
 * This is the central database for all client profiles
 */
function getMasterProfileSheet() {
  const MASTER_SHEET_NAME = 'Master_Client_Profiles';
  
  try {
    // Try to find existing master sheet
    const files = DriveApp.getFilesByName(MASTER_SHEET_NAME);
    let masterSpreadsheet;
    
    if (files.hasNext()) {
      masterSpreadsheet = SpreadsheetApp.openById(files.next().getId());
      Logger.log('Found existing master sheet: ' + masterSpreadsheet.getUrl());
      
      // Ensure all required tabs exist
      ensureMasterSheetStructure(masterSpreadsheet);
    } else {
      // Create new master sheet
      masterSpreadsheet = SpreadsheetApp.create(MASTER_SHEET_NAME);
      setupMasterSheetStructure(masterSpreadsheet);
      Logger.log('Created new master sheet: ' + masterSpreadsheet.getUrl());
    }
    
    return masterSpreadsheet;
    
  } catch (error) {
    Logger.log('Error accessing master profile sheet: ' + error.toString());
    throw error;
  }
}

/**
 * Ensures all required tabs exist in the master sheet
 */
function ensureMasterSheetStructure(spreadsheet) {
  const requiredTabs = [
    'Client_Profiles',
    'Services', 
    'Technicians',
    'Policies',
    'Service_Areas',
    'Sync_Log',
    'Wix_Config'
  ];
  
  const existingTabs = spreadsheet.getSheets().map(sheet => sheet.getName());
  
  for (const tabName of requiredTabs) {
    if (!existingTabs.includes(tabName)) {
      Logger.log(`Creating missing tab: ${tabName}`);
      
      switch (tabName) {
        case 'Client_Profiles':
          createMasterProfilesTab(spreadsheet);
          break;
        case 'Services':
          createMasterServicesTab(spreadsheet);
          break;
        case 'Technicians':
          createMasterTechniciansTab(spreadsheet);
          break;
        case 'Policies':
          createMasterPoliciesTab(spreadsheet);
          break;
        case 'Service_Areas':
          createMasterServiceAreasTab(spreadsheet);
          break;
        case 'Sync_Log':
          createSyncLogTab(spreadsheet);
          break;
        case 'Wix_Config':
          createWixConfigTab(spreadsheet);
          break;
      }
    }
  }
  
  Logger.log('Master sheet structure verified and repaired if needed');
}

/**
 * Sets up the master sheet structure with all necessary tabs
 */
function setupMasterSheetStructure(spreadsheet) {
  // Delete default sheet if exists
  const defaultSheet = spreadsheet.getSheetByName('Sheet1');
  if (defaultSheet) {
    spreadsheet.deleteSheet(defaultSheet);
  }
  
  // Create master profile tabs
  createMasterProfilesTab(spreadsheet);
  createMasterServicesTab(spreadsheet);
  createMasterTechniciansTab(spreadsheet);
  createMasterPoliciesTab(spreadsheet);
  createMasterServiceAreasTab(spreadsheet);
  createSyncLogTab(spreadsheet);
  createWixConfigTab(spreadsheet);
}

/**
 * Creates the main profiles tab in master sheet
 */
function createMasterProfilesTab(spreadsheet) {
  const sheet = spreadsheet.insertSheet('Client_Profiles');
  
  // Set up headers
  const headers = [
    'Profile_ID', 'Company_Name', 'Location', 'Timezone', 'Phone', 'Email', 'Website', 
    'Address', 'Hours', 'Bulletin', 'Pests_Not_Covered', 'Client_Folder_URL', 
    'Wix_Profile_URL', 'Last_Updated', 'Sync_Status', 'Edit_Form_URL',
    // New address fields
    'FieldRoutes_Link', 'Physical_Street', 'Physical_Suite', 'Physical_City', 'Physical_State', 'Physical_Zip',
    'Mailing_Street', 'Mailing_Suite', 'Mailing_City', 'Mailing_State', 'Mailing_Zip', 'Same_As_Physical',
    // New custom fields
    'Timezone_Custom', 'Holidays_Observed'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white')
    .setHorizontalAlignment('center');
  
  // Set column widths
  sheet.setColumnWidth(1, 100); // Profile_ID
  sheet.setColumnWidth(2, 200); // Company_Name
  sheet.setColumnWidth(3, 150); // Location
  sheet.setColumnWidth(12, 300); // Client_Folder_URL
  sheet.setColumnWidth(13, 300); // Wix_Profile_URL
  sheet.setColumnWidth(16, 300); // Edit_Form_URL
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  Logger.log('Master profiles tab created');
}

/**
 * Creates the services tab in master sheet
 */
function createMasterServicesTab(spreadsheet) {
  const sheet = spreadsheet.insertSheet('Services');
  
  const headers = [
    'Profile_ID', 'Service_Name', 'Service_Type', 'Frequency', 'Description', 
    'Pests_Covered', 'Contract', 'Guarantee', 'Duration', 'Product_Type',
    'Billing_Frequency', 'Agent_Note', 'Queue_Ext', 'Pricing_Data',
    // New service fields
    'Call_Ahead', 'Leave_During_Service', 'Follow_Up', 'Prep_Sheet', 'Recurring_Duration',
    'Service_Frequency_Custom', 'Billing_Frequency_Custom', 'Category_Custom', 'Type_Custom',
    'Call_Ahead_Custom', 'Leave_During_Service_Custom', 'Prep_Sheet_Custom'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#34a853')
    .setFontColor('white');
  
  sheet.setFrozenRows(1);
  Logger.log('Master services tab created');
}

/**
 * Creates the technicians tab in master sheet
 */
function createMasterTechniciansTab(spreadsheet) {
  const sheet = spreadsheet.insertSheet('Technicians');
  
  const headers = [
    'Profile_ID', 'Tech_Name', 'Company', 'Role', 'Phone', 'Schedule', 
    'Max_Stops', 'Does_Not_Service', 'Additional_Notes', 'Zip_Codes',
    // New technician fields
    'Role_Custom'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#ea4335')
    .setFontColor('white');
  
  sheet.setFrozenRows(1);
  Logger.log('Master technicians tab created');
}

/**
 * Creates the policies tab in master sheet
 */
function createMasterPoliciesTab(spreadsheet) {
  const sheet = spreadsheet.insertSheet('Policies');
  
  const headers = [
    'Profile_ID', 'Policy_Category', 'Policy_Type', 'Policy_Title', 
    'Policy_Description', 'Policy_Options', 'Default_Value', 'Sort_Order'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#fbbc04')
    .setFontColor('white');
  
  sheet.setFrozenRows(1);
  
  // Auto-resize columns for better readability
  sheet.autoResizeColumns(1, headers.length);
  
  Logger.log('Master policies tab created with comprehensive policy fields');
}

/**
 * Creates the service areas tab in master sheet
 */
function createMasterServiceAreasTab(spreadsheet) {
  const sheet = spreadsheet.insertSheet('Service_Areas');
  
  const headers = [
    'Profile_ID', 'Zip_Code', 'City', 'State', 'Branch', 'Territory', 'In_Service'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#9c27b0')
    .setFontColor('white');
  
  sheet.setFrozenRows(1);
  Logger.log('Master service areas tab created');
}

/**
 * Creates sync log tab for tracking all changes
 */
function createSyncLogTab(spreadsheet) {
  const sheet = spreadsheet.insertSheet('Sync_Log');
  
  const headers = [
    'Timestamp', 'Profile_ID', 'Action', 'Source', 'Target', 'Status', 'Details', 'Error_Message'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#607d8b')
    .setFontColor('white');
  
  sheet.setFrozenRows(1);
  Logger.log('Sync log tab created');
}

/**
 * Creates Wix configuration tab
 */
function createWixConfigTab(spreadsheet) {
  const sheet = spreadsheet.insertSheet('Wix_Config');
  
  // Configuration data
  const configData = [
    ['Setting', 'Value', 'Description'],
    ['Wix_Site_ID', '', 'Your Wix site ID'],
    ['Wix_API_Key', '', 'Your Wix API key'],
    ['Wix_Account_ID', '', 'Your Wix account ID'],
    ['Profile_Base_URL', 'https://yoursite.wix.com/profile', 'Base URL for profiles'],
    ['Auto_Sync_Enabled', 'TRUE', 'Enable automatic syncing'],
    ['Sync_Interval_Minutes', '5', 'How often to check for changes'],
    ['Last_Sync_Time', '', 'Last successful sync timestamp']
  ];
  
  sheet.getRange(1, 1, configData.length, 3).setValues(configData);
  sheet.getRange(1, 1, 1, 3)
    .setFontWeight('bold')
    .setBackground('#ff5722')
    .setFontColor('white');
  
  Logger.log('Wix config tab created');
}

/**
 * Adds a new profile to the master sheet
 */
function addProfileToMasterSheet(clientData, clientFolderUrl, profileId) {
  try {
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    
    // Check if profilesTab exists
    if (!profilesTab) {
      Logger.log('Client_Profiles tab not found, creating it...');
      createMasterProfilesTab(masterSheet);
      const newProfilesTab = masterSheet.getSheetByName('Client_Profiles');
      if (!newProfilesTab) {
        throw new Error('Failed to create Client_Profiles tab');
      }
      return addProfileToMasterSheet(clientData, clientFolderUrl, profileId); // Retry
    }
    
    // Generate profile ID if not provided
    if (!profileId) {
      profileId = generateProfileId();
    }
    
    // Create edit form URL
    const editFormUrl = createEditFormUrl(profileId);
    
    // Find next empty row
    const lastRow = profilesTab.getLastRow();
    const newRow = lastRow + 1;
    
    // Profile data row
    const profileRow = [
      profileId,
      clientData.companyName || '',
      clientData.location || '',
      clientData.timezone || 'Central',
      clientData.phone || '',
      clientData.email || '',
      clientData.website || '',
      clientData.address || '',
      clientData.hours || '',
      clientData.bulletin || '',
      clientData.pestsNotCovered || '',
      clientFolderUrl || '',
      '', // Wix profile URL (to be filled when synced)
      new Date().toISOString(),
      'PENDING_WIX_SYNC',
      editFormUrl
    ];
    
    profilesTab.getRange(newRow, 1, 1, profileRow.length).setValues([profileRow]);
    
    // Add related data to other tabs
    addServicesToMasterSheet(profileId, clientData.services || []);
    addTechniciansToMasterSheet(profileId, clientData.technicians || []);
    addPoliciesToMasterSheet(profileId, clientData.policies || {});
    addServiceAreasToMasterSheet(profileId, clientData.serviceAreas || []);
    
    // Log the action
    logSyncAction(profileId, 'CREATE', 'GOOGLE_FORM', 'MASTER_SHEET', 'SUCCESS', 'Profile created from form');
    
    Logger.log('Profile added to master sheet with ID: ' + profileId);
    return profileId;
    
  } catch (error) {
    Logger.log('Error adding profile to master sheet: ' + error.toString());
    logSyncAction(profileId || 'UNKNOWN', 'CREATE', 'GOOGLE_FORM', 'MASTER_SHEET', 'ERROR', error.toString());
    throw error;
  }
}

/**
 * Generates a unique profile ID
 */
function generateProfileId() {
  const timestamp = new Date().getTime().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PROF_${timestamp}_${random}`;
}

/**
 * Creates edit form URL for a profile
 */
function createEditFormUrl(profileId) {
  const scriptUrl = ScriptApp.getService().getUrl();
  return `${scriptUrl}?action=edit&profileId=${profileId}`;
}

/**
 * Logs sync actions for auditing
 */
function logSyncAction(profileId, action, source, target, status, details, errorMessage = '') {
  try {
    const masterSheet = getMasterProfileSheet();
    const logTab = masterSheet.getSheetByName('Sync_Log');
    
    if (!logTab) {
      Logger.log('Sync_Log tab not found, skipping log entry');
      return;
    }
    
    const lastRow = logTab.getLastRow();
    const logRow = [
      new Date().toISOString(),
      profileId,
      action,
      source,
      target,
      status,
      details,
      errorMessage
    ];
    
    logTab.getRange(lastRow + 1, 1, 1, logRow.length).setValues([logRow]);
    
  } catch (error) {
    Logger.log('Error logging sync action: ' + error.toString());
  }
}

/**
 * Gets profile data from master sheet
 */
function getProfileFromMasterSheet(profileId) {
  try {
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    
    const data = profilesTab.getDataRange().getValues();
    const headers = data[0];
    
    // Find profile row
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === profileId) {
        const profileData = {};
        headers.forEach((header, index) => {
          profileData[header] = data[i][index];
        });
        
        // Get related data
        profileData.services = getProfileServices(profileId);
        profileData.technicians = getProfileTechnicians(profileId);
        profileData.policies = getProfilePolicies(profileId);
        profileData.serviceAreas = getProfileServiceAreas(profileId);
        
        return profileData;
      }
    }
    
    throw new Error('Profile not found: ' + profileId);
    
  } catch (error) {
    Logger.log('Error getting profile from master sheet: ' + error.toString());
    throw error;
  }
}

/**
 * Updates profile in master sheet
 */
function updateProfileInMasterSheet(profileId, updatedData) {
  try {
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    
    const data = profilesTab.getDataRange().getValues();
    const headers = data[0];
    
    // Find and update profile row
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === profileId) {
        // Update each field
        Object.keys(updatedData).forEach(key => {
          const headerIndex = headers.indexOf(key);
          if (headerIndex !== -1) {
            data[i][headerIndex] = updatedData[key];
          }
        });
        
        // Update last modified time
        const lastUpdatedIndex = headers.indexOf('Last_Updated');
        if (lastUpdatedIndex !== -1) {
          data[i][lastUpdatedIndex] = new Date().toISOString();
        }
        
        // Write back to sheet
        profilesTab.getRange(i + 1, 1, 1, headers.length).setValues([data[i]]);
        
        logSyncAction(profileId, 'UPDATE', 'EDIT_FORM', 'MASTER_SHEET', 'SUCCESS', 'Profile updated');
        return true;
      }
    }
    
    throw new Error('Profile not found for update: ' + profileId);
    
  } catch (error) {
    Logger.log('Error updating profile in master sheet: ' + error.toString());
    logSyncAction(profileId, 'UPDATE', 'EDIT_FORM', 'MASTER_SHEET', 'ERROR', error.toString());
    throw error;
  }
}

// Helper functions for adding related data
function addServicesToMasterSheet(profileId, services) {
  if (!services || services.length === 0) return;
  
  const masterSheet = getMasterProfileSheet();
  const servicesTab = masterSheet.getSheetByName('Services');
  
  if (!servicesTab) {
    Logger.log('Services tab not found, skipping services data');
    return;
  }
  
  services.forEach(service => {
    const lastRow = servicesTab.getLastRow();
    const serviceRow = [
      profileId,
      service.name || '',
      service.serviceType || '',
      service.frequency || '',
      service.description || '',
      service.pests || '',
      service.contract || '',
      service.guarantee || '',
      service.duration || '',
      service.productType || '',
      service.billingFrequency || '',
      service.agentNote || '',
      service.queueExt || '',
      JSON.stringify(service.pricingTiers || []),
      // New service fields
      service.callAhead || '',
      service.leaveDuringService || '',
      service.followUp || '',
      service.prepSheet || '',
      service.recurringDuration || '',
      service.serviceFrequencyCustom || '',
      service.billingFrequencyCustom || '',
      service.categoryCustom || '',
      service.typeCustom || '',
      service.callAheadCustom || '',
      service.leaveDuringServiceCustom || '',
      service.prepSheetCustom || ''
    ];
    
    servicesTab.getRange(lastRow + 1, 1, 1, serviceRow.length).setValues([serviceRow]);
  });
}

function addTechniciansToMasterSheet(profileId, technicians) {
  if (!technicians || technicians.length === 0) return;
  
  const masterSheet = getMasterProfileSheet();
  const techTab = masterSheet.getSheetByName('Technicians');
  
  if (!techTab) {
    Logger.log('Technicians tab not found, skipping technicians data');
    return;
  }
  
  technicians.forEach(tech => {
    const lastRow = techTab.getLastRow();
    const techRow = [
      profileId,
      tech.name || '',
      tech.company || '',
      tech.role || '',
      tech.phone || '',
      tech.schedule || '',
      tech.maxStops || '',
      tech.doesNotService || '',
      tech.additionalNotes || '',
      JSON.stringify(tech.zipCodes || []),
      // New technician fields
      tech.roleCustom || ''
    ];
    
    techTab.getRange(lastRow + 1, 1, 1, techRow.length).setValues([techRow]);
  });
}

function addPoliciesToMasterSheet(profileId, policies) {
  if (!policies || Object.keys(policies).length === 0) return;
  
  const masterSheet = getMasterProfileSheet();
  const policiesTab = masterSheet.getSheetByName('Policies');
  
  if (!policiesTab) {
    Logger.log('Policies tab not found, skipping policies data');
    return;
  }
  
  Logger.log('Converting intake form policies to organized policy entries for profile:', profileId);
  
  // Convert intake form data into organized policy entries
  const policyEntries = convertIntakeDataToPolicyEntries(profileId, policies);
  
  // Add each policy entry as a separate row
  policyEntries.forEach(policyEntry => {
    const lastRow = policiesTab.getLastRow();
    const policyRow = [
      policyEntry.profileId,
      policyEntry.category,
      policyEntry.type,
      policyEntry.title,
      policyEntry.description,
      JSON.stringify(policyEntry.options || []),
      policyEntry.value,
      policyEntry.sortOrder || 1
    ];
    
    policiesTab.getRange(lastRow + 1, 1, 1, policyRow.length).setValues([policyRow]);
  });
  
  Logger.log(`Added ${policyEntries.length} organized policy entries for profile ${profileId}`);
}

/**
 * Converts intake form policy data into organized policy entries
 */
function convertIntakeDataToPolicyEntries(profileId, policies) {
  const policyEntries = [];
  let sortOrder = 1;
  
  // Service Coverage Policies
  if (policies.treatVehicles) {
    policyEntries.push({
      profileId: profileId,
      category: 'Service Coverage',
      type: 'Policy',
      title: 'Vehicle Treatment',
      description: 'Do we treat vehicles?',
      options: ['Yes', 'No'],
      value: policies.treatVehicles,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.commercialProperties) {
    policyEntries.push({
      profileId: profileId,
      category: 'Service Coverage',
      type: 'Policy',
      title: 'Commercial Properties',
      description: 'Commercial property service policy',
      options: ['Yes', 'No', 'Yes, Requires Client follow-up'],
      value: policies.commercialProperties,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.multiFamilyOffered) {
    policyEntries.push({
      profileId: profileId,
      category: 'Service Coverage',
      type: 'Policy',
      title: 'Multi-Family Properties',
      description: 'Multi-family property service policy',
      options: ['Yes', 'No', 'Yes, individual units only'],
      value: policies.multiFamilyOffered,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.trailersOffered) {
    policyEntries.push({
      profileId: profileId,
      category: 'Service Coverage',
      type: 'Policy',
      title: 'Trailers/Mobile Homes',
      description: 'Trailer and mobile home service policy',
      options: ['Yes', 'No'],
      value: policies.trailersOffered,
      sortOrder: sortOrder++
    });
  }
  
  // Scheduling & Operations Policies
  if (policies.signedContract) {
    policyEntries.push({
      profileId: profileId,
      category: 'Scheduling',
      type: 'Policy',
      title: 'Contract Required',
      description: 'Signed contract requirement policy',
      options: ['Yes', 'No', 'Yes, 12 months for recurring services'],
      value: policies.signedContract,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.appointmentConfirmations) {
    policyEntries.push({
      profileId: profileId,
      category: 'Scheduling',
      type: 'Policy',
      title: 'Appointment Confirmations',
      description: 'Appointment confirmation policy',
      options: ['Yes', 'No'],
      value: policies.appointmentConfirmations,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.sameDayServices) {
    policyEntries.push({
      profileId: profileId,
      category: 'Scheduling',
      type: 'Policy',
      title: 'Same Day Services',
      description: 'Same day service availability',
      options: ['Yes', 'No', 'Yes, refer to home office'],
      value: policies.sameDayServices,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.techSkilling) {
    policyEntries.push({
      profileId: profileId,
      category: 'Scheduling',
      type: 'Policy',
      title: 'Tech Skilling',
      description: 'Technician skill requirements',
      options: ['Yes', 'No'],
      value: policies.techSkilling,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.afterHoursEmergency) {
    policyEntries.push({
      profileId: profileId,
      category: 'Scheduling',
      type: 'Policy',
      title: 'After Hours Emergency',
      description: 'Emergency service availability',
      options: ['Yes', 'No', 'Yes, refer to home office'],
      value: policies.afterHoursEmergency,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.maxDistance) {
    policyEntries.push({
      profileId: profileId,
      category: 'Scheduling',
      type: 'Policy',
      title: 'Max Distance',
      description: 'Maximum service distance',
      options: [],
      value: policies.maxDistance,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.returningCustomers) {
    policyEntries.push({
      profileId: profileId,
      category: 'Scheduling',
      type: 'Policy',
      title: 'Returning Customers',
      description: 'Returning customer policy',
      options: [],
      value: policies.returningCustomers,
      sortOrder: sortOrder++
    });
  }
  
  // Service Operations Policies
  if (policies.reservices) {
    policyEntries.push({
      profileId: profileId,
      category: 'Service Operations',
      type: 'Policy',
      title: 'Reservices',
      description: 'Reservice policy and requirements',
      options: [],
      value: policies.reservices,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.setServiceTypeTo) {
    policyEntries.push({
      profileId: profileId,
      category: 'Service Operations',
      type: 'Policy',
      title: 'Service Type Setting',
      description: 'Default service type configuration',
      options: ['Custom', 'Standard', 'Premium'],
      value: policies.setServiceTypeTo,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.setSubscriptionTypeTo) {
    policyEntries.push({
      profileId: profileId,
      category: 'Service Operations',
      type: 'Policy',
      title: 'Subscription Type Setting',
      description: 'Default subscription type configuration',
      options: [],
      value: policies.setSubscriptionTypeTo,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.toolsToSave) {
    policyEntries.push({
      profileId: profileId,
      category: 'Service Operations',
      type: 'Policy',
      title: 'Tools to Save',
      description: 'Required tools and equipment',
      options: [],
      value: policies.toolsToSave,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.additionalNotes) {
    policyEntries.push({
      profileId: profileId,
      category: 'Service Operations',
      type: 'Policy',
      title: 'Additional Notes',
      description: 'Additional operational notes',
      options: [],
      value: policies.additionalNotes,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.branch) {
    policyEntries.push({
      profileId: profileId,
      category: 'Service Operations',
      type: 'Policy',
      title: 'Branch',
      description: 'Service branch information',
      options: [],
      value: policies.branch,
      sortOrder: sortOrder++
    });
  }
  
  // Payment & Financial Policies
  if (policies.paymentTypes) {
    policyEntries.push({
      profileId: profileId,
      category: 'Payment',
      type: 'Policy',
      title: 'Payment Types',
      description: 'Accepted payment methods',
      options: ['Cash', 'Check', 'Card', 'ACH'],
      value: policies.paymentTypes,
      sortOrder: sortOrder++
    });
  }
  
  if (policies.pastDuePeriod) {
    policyEntries.push({
      profileId: profileId,
      category: 'Payment',
      type: 'Policy',
      title: 'Past Due Period',
      description: 'Past due account handling policy',
      options: ['30 days', '60 days', '90 days'],
      value: policies.pastDuePeriod,
      sortOrder: sortOrder++
    });
  }
  
  // Handle legacy category-based policies for backward compatibility
  Object.keys(policies).forEach(category => {
    const categoryPolicies = policies[category];
    if (Array.isArray(categoryPolicies)) {
      categoryPolicies.forEach((policy, index) => {
        policyEntries.push({
          profileId: profileId,
          category: category,
          type: policy.type || 'Policy',
          title: policy.title || '',
          description: policy.description || '',
          options: policy.options || [],
          value: policy.default || '',
          sortOrder: sortOrder++
        });
      });
    }
  });
  
  return policyEntries;
}

function addServiceAreasToMasterSheet(profileId, serviceAreas) {
  if (!serviceAreas || serviceAreas.length === 0) return;
  
  const masterSheet = getMasterProfileSheet();
  const areasTab = masterSheet.getSheetByName('Service_Areas');
  
  if (!areasTab) {
    Logger.log('Service_Areas tab not found, skipping service areas data');
    return;
  }
  
  serviceAreas.forEach(area => {
    const lastRow = areasTab.getLastRow();
    const areaRow = [
      profileId,
      area.zip || '',
      area.city || '',
      area.state || '',
      area.branch || '',
      area.territory || '',
      area.inService || true
    ];
    
    areasTab.getRange(lastRow + 1, 1, 1, areaRow.length).setValues([areaRow]);
  });
}

// Helper functions to get related data
function getProfileServices(profileId) {
  const masterSheet = getMasterProfileSheet();
  const servicesTab = masterSheet.getSheetByName('Services');
  const data = servicesTab.getDataRange().getValues();
  
  const services = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === profileId) {
      services.push({
        name: data[i][1],
        serviceType: data[i][2],
        frequency: data[i][3],
        description: data[i][4],
        pests: data[i][5],
        contract: data[i][6],
        guarantee: data[i][7],
        duration: data[i][8],
        productType: data[i][9],
        billingFrequency: data[i][10],
        agentNote: data[i][11],
        queueExt: data[i][12],
        pricingTiers: JSON.parse(data[i][13] || '[]')
      });
    }
  }
  
  return services;
}

function getProfileTechnicians(profileId) {
  const masterSheet = getMasterProfileSheet();
  const techTab = masterSheet.getSheetByName('Technicians');
  const data = techTab.getDataRange().getValues();
  
  const technicians = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === profileId) {
      technicians.push({
        name: data[i][1],
        company: data[i][2],
        role: data[i][3],
        phone: data[i][4],
        schedule: data[i][5],
        maxStops: data[i][6],
        doesNotService: data[i][7],
        additionalNotes: data[i][8],
        zipCodes: JSON.parse(data[i][9] || '[]')
      });
    }
  }
  
  return technicians;
}

function getProfilePolicies(profileId) {
  const masterSheet = getMasterProfileSheet();
  const policiesTab = masterSheet.getSheetByName('Policies');
  const data = policiesTab.getDataRange().getValues();
  
  console.log('🔍 Looking for policies for profile:', profileId);
  
  const policies = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === profileId) {
      const category = data[i][1];
      if (!policies[category]) {
        policies[category] = [];
      }
      
      policies[category].push({
        type: data[i][2],
        title: data[i][3],
        description: data[i][4],
        options: JSON.parse(data[i][5] || '[]'),
        default: data[i][6],
        sortOrder: data[i][7] || 1
      });
    }
  }
  
  console.log('📋 Found organized policies:', policies);
  return policies;
}

function getProfileServiceAreas(profileId) {
  const masterSheet = getMasterProfileSheet();
  const areasTab = masterSheet.getSheetByName('Service_Areas');
  const data = areasTab.getDataRange().getValues();
  
  const serviceAreas = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === profileId) {
      serviceAreas.push({
        zip: data[i][1],
        city: data[i][2],
        state: data[i][3],
        branch: data[i][4],
        territory: data[i][5],
        inService: data[i][6]
      });
    }
  }
  
  return serviceAreas;
}
