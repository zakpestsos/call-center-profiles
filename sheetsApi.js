/**
 * Google Sheets Integration Module  
 * Handles reading and writing data to Google Sheets with full edit capability
 */

/**
 * Creates a client profile sheet that mirrors the HTML form structure
 * This allows for easy editing via Google Sheets
 * @param {Object} clientData - The client data from HTML form
 * @returns {string} The spreadsheet URL
 */
function createEditableClientSheet(clientData) {
  try {
    Logger.log('Creating editable client sheet for: ' + clientData.companyName);
    
    // Create or find the client's specific spreadsheet
    const sheetName = `${clientData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Profile`;
    let spreadsheet;
    
    const files = DriveApp.getFilesByName(sheetName);
    if (files.hasNext()) {
      spreadsheet = SpreadsheetApp.openById(files.next().getId());
    } else {
      spreadsheet = SpreadsheetApp.create(sheetName);
    }
    
    // Clear existing sheets and create new structure
    setupClientProfileSheets(spreadsheet, clientData);
    
    // Add to master client tracking
    updateMasterClientList(clientData, spreadsheet.getUrl());
    
    Logger.log('Client sheet created: ' + spreadsheet.getUrl());
    return spreadsheet.getUrl();
    
  } catch (error) {
    Logger.log('Error creating client sheet: ' + error.toString());
    throw error;
  }
}

/**
 * Sets up comprehensive client profile sheets
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The spreadsheet
 * @param {Object} clientData - The client data
 */
function setupClientProfileSheets(spreadsheet, clientData) {
  // 1. Basic Info Sheet
  setupBasicInfoSheet(spreadsheet, clientData);
  
  // 2. Services Sheet  
  setupServicesSheet(spreadsheet, clientData);
  
  // 3. Technicians Sheet
  setupTechniciansSheet(spreadsheet, clientData);
  
  // 4. Service Areas Sheet
  setupServiceAreasSheet(spreadsheet, clientData);
  
  // 5. Policies Sheet
  setupPoliciesSheet(spreadsheet, clientData);
  
  // 6. Sync Status Sheet
  setupSyncStatusSheet(spreadsheet, clientData);
}

/**
 * Sets up the basic information sheet
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The spreadsheet
 * @param {Object} clientData - The client data
 */
function setupBasicInfoSheet(spreadsheet, clientData) {
  let sheet = spreadsheet.getSheetByName('Basic Info');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Basic Info');
  } else {
    sheet.clear();
  }
  
  // Headers and styling
  sheet.getRange('A1').setValue('BASIC INFORMATION').setFontWeight('bold').setFontSize(14).setBackground('#4285f4').setFontColor('white');
  sheet.getRange('A1:C1').merge();
  
  const basicData = [
    ['Field', 'Value', 'Instructions'],
    ['Company Name', clientData.companyName || '', 'Edit company name here'],
    ['Location', clientData.location || '', 'City, State format'],
    ['Business Address', clientData.address || '', 'Full street address'],
    ['Primary Phone', clientData.phone || '', 'Main business phone'],
    ['Business Email', clientData.email || '', 'Main business email'],
    ['Website', clientData.website || '', 'Company website URL'],
    ['Business Hours', clientData.hours || '', 'Operating hours'],
    ['Company Bulletin', clientData.bulletin || '', 'Brief company description'],
    ['Pests Not Covered', clientData.pestsNotCovered || '', 'List non-covered pests and referrals']
  ];
  
  sheet.getRange(2, 1, basicData.length, 3).setValues(basicData);
  
  // Format headers
  sheet.getRange(2, 1, 1, 3).setFontWeight('bold').setBackground('#e3f2fd');
  
  // Format data area for editing
  sheet.getRange(3, 2, basicData.length - 1, 1).setBackground('#f8f9fa');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 3);
  
  // Instructions
  sheet.getRange('A15').setValue('EDITING INSTRUCTIONS:').setFontWeight('bold');
  sheet.getRange('A16').setValue('• Edit values in column B');
  sheet.getRange('A17').setValue('• Changes will sync to Wix when you run syncUpdatesToWix()');
  sheet.getRange('A18').setValue('• Do not modify column A (field names)');
}

/**
 * Sets up the services sheet with detailed service structure
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The spreadsheet
 * @param {Object} clientData - The client data
 */
function setupServicesSheet(spreadsheet, clientData) {
  let sheet = spreadsheet.getSheetByName('Services');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Services');
  } else {
    sheet.clear();
  }
  
  // Headers
  sheet.getRange('A1').setValue('SERVICES CATALOG').setFontWeight('bold').setFontSize(14).setBackground('#28a745').setFontColor('white');
  sheet.getRange('A1:P1').merge();
  
  const serviceHeaders = [
    'Service Name', 'Category', 'Type', 'Description', 'Pests Covered', 'Frequency',
    'Contract', 'Guarantee', 'Call Ahead', 'Initial Duration', 'Recurring Duration',
    'Leave During Service', 'Follow Up', 'Prep Sheet', 'Price', 'Onboarding Notes'
  ];
  
  sheet.getRange(2, 1, 1, serviceHeaders.length).setValues([serviceHeaders]);
  sheet.getRange(2, 1, 1, serviceHeaders.length).setFontWeight('bold').setBackground('#d4edda');
  
  // Add service data
  if (clientData.services && clientData.services.length > 0) {
    const serviceData = clientData.services.map(service => [
      service.name || '',
      service.category || '',
      service.type || '',
      service.description || '',
      service.pests || '',
      service.frequency || '',
      service.contract || '',
      service.guarantee || '',
      service.callAhead || '',
      service.initialDuration || '',
      service.recurringDuration || '',
      service.leaveDuringService || '',
      service.followUp || '',
      service.prepSheet || '',
      service.price || '',
      service.onboardingNotes || ''
    ]);
    
    sheet.getRange(3, 1, serviceData.length, serviceHeaders.length).setValues(serviceData);
  }
  
  // Add template rows for new services
  for (let i = 0; i < 5; i++) {
    const rowNum = (clientData.services ? clientData.services.length : 0) + 3 + i;
    sheet.getRange(rowNum, 1, 1, serviceHeaders.length).setBackground('#f8f9fa');
  }
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, serviceHeaders.length);
  
  // Instructions
  const instructionRow = Math.max(15, (clientData.services ? clientData.services.length : 0) + 10);
  sheet.getRange(instructionRow, 1).setValue('EDITING INSTRUCTIONS:').setFontWeight('bold');
  sheet.getRange(instructionRow + 1, 1).setValue('• Add/edit services in the rows above');
  sheet.getRange(instructionRow + 2, 1).setValue('• Service categories: Standard, Specialty, Termite, Inspection');
  sheet.getRange(instructionRow + 3, 1).setValue('• For inspections use: "Set up and schedule Free Inspection" or "Set up and Schedule Paid Inspection"');
  sheet.getRange(instructionRow + 4, 1).setValue('• Changes sync to Wix when you run syncUpdatesToWix()');
}

/**
 * Sets up the technicians sheet
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The spreadsheet
 * @param {Object} clientData - The client data
 */
function setupTechniciansSheet(spreadsheet, clientData) {
  let sheet = spreadsheet.getSheetByName('Technicians');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Technicians');
  } else {
    sheet.clear();
  }
  
  // Headers
  sheet.getRange('A1').setValue('TECHNICIANS ROSTER').setFontWeight('bold').setFontSize(14).setBackground('#ffc107').setFontColor('black');
  sheet.getRange('A1:H1').merge();
  
  const techHeaders = [
    'Name', 'Role', 'Phone', 'Email', 'Schedule', 'Max Stops/Day', 'Zip Codes Served', 'Services NOT Provided'
  ];
  
  sheet.getRange(2, 1, 1, techHeaders.length).setValues([techHeaders]);
  sheet.getRange(2, 1, 1, techHeaders.length).setFontWeight('bold').setBackground('#fff3cd');
  
  // Add technician data
  if (clientData.technicians && clientData.technicians.length > 0) {
    const techData = clientData.technicians.map(tech => [
      tech.name || '',
      tech.role || '',
      tech.phone || '',
      tech.email || '',
      tech.schedule || '',
      tech.maxStops || '',
      tech.zipCodes || '',
      tech.doesNotService || ''
    ]);
    
    sheet.getRange(3, 1, techData.length, techHeaders.length).setValues(techData);
  }
  
  // Add template rows
  for (let i = 0; i < 5; i++) {
    const rowNum = (clientData.technicians ? clientData.technicians.length : 0) + 3 + i;
    sheet.getRange(rowNum, 1, 1, techHeaders.length).setBackground('#f8f9fa');
  }
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, techHeaders.length);
  
  // Instructions
  const instructionRow = Math.max(15, (clientData.technicians ? clientData.technicians.length : 0) + 10);
  sheet.getRange(instructionRow, 1).setValue('EDITING INSTRUCTIONS:').setFontWeight('bold');
  sheet.getRange(instructionRow + 1, 1).setValue('• Add/edit technician information in rows above');
  sheet.getRange(instructionRow + 2, 1).setValue('• Role options: Technician, Inspector, Both');
  sheet.getRange(instructionRow + 3, 1).setValue('• Zip codes: comma-separated list');
  sheet.getRange(instructionRow + 4, 1).setValue('• Changes sync to Wix when you run syncUpdatesToWix()');
}

/**
 * Sets up the service areas sheet
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The spreadsheet
 * @param {Object} clientData - The client data
 */
function setupServiceAreasSheet(spreadsheet, clientData) {
  let sheet = spreadsheet.getSheetByName('Service Areas');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Service Areas');
  } else {
    sheet.clear();
  }
  
  // Headers
  sheet.getRange('A1').setValue('SERVICE AREAS & COVERAGE').setFontWeight('bold').setFontSize(14).setBackground('#17a2b8').setFontColor('white');
  sheet.getRange('A1:E1').merge();
  
  const areaHeaders = [
    'City/Region', 'State', 'Zip Codes', 'Service Radius (miles)', 'Additional Fees'
  ];
  
  sheet.getRange(2, 1, 1, areaHeaders.length).setValues([areaHeaders]);
  sheet.getRange(2, 1, 1, areaHeaders.length).setFontWeight('bold').setBackground('#d1ecf1');
  
  // Add service area data
  if (clientData.serviceAreas && clientData.serviceAreas.length > 0) {
    const areaData = clientData.serviceAreas.map(area => [
      area.city || '',
      area.state || '',
      area.zipCodes || '',
      area.radius || '',
      area.fees || ''
    ]);
    
    sheet.getRange(3, 1, areaData.length, areaHeaders.length).setValues(areaData);
  }
  
  // Add template rows
  for (let i = 0; i < 10; i++) {
    const rowNum = (clientData.serviceAreas ? clientData.serviceAreas.length : 0) + 3 + i;
    sheet.getRange(rowNum, 1, 1, areaHeaders.length).setBackground('#f8f9fa');
  }
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, areaHeaders.length);
  
  // Instructions
  const instructionRow = Math.max(20, (clientData.serviceAreas ? clientData.serviceAreas.length : 0) + 15);
  sheet.getRange(instructionRow, 1).setValue('EDITING INSTRUCTIONS:').setFontWeight('bold');
  sheet.getRange(instructionRow + 1, 1).setValue('• Add/edit service areas in rows above');
  sheet.getRange(instructionRow + 2, 1).setValue('• Zip codes: comma-separated list');
  sheet.getRange(instructionRow + 3, 1).setValue('• Additional fees: specify any extra charges');
  sheet.getRange(instructionRow + 4, 1).setValue('• Changes sync to Wix when you run syncUpdatesToWix()');
}

/**
 * Sets up the policies sheet to match Wix CMS Policies structure
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The spreadsheet
 * @param {Object} clientData - The client data
 */
function setupPoliciesSheet(spreadsheet, clientData) {
  let sheet = spreadsheet.getSheetByName('Policies');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Policies');
  } else {
    sheet.clear();
  }
  
  // Headers
  sheet.getRange('A1').setValue('WIX CMS POLICIES CONFIGURATION').setFontWeight('bold').setFontSize(14).setBackground('#6f42c1').setFontColor('white');
  sheet.getRange('A1:C1').merge();
  
  // Create comprehensive policy structure matching Wix CMS
  const policyData = [
    ['Policy Field', 'Value', 'Instructions'],
    
    // Service Coverage Policies
    ['Do we treat vehicles?', clientData.treatVehicles || 'No', 'Yes/No - specify vehicle treatment policy'],
    ['Commercial Properties', clientData.commercialProperties || 'No', 'Yes/No/Special conditions'],
    ['Multi-Family Offered', clientData.multiFamilyOffered || 'No', 'Yes/No/Special conditions for apartments/condos'],
    ['Trailers/Mobile Homes', clientData.trailersOffered || 'Yes', 'Yes/No/Special conditions'],
    
    // Scheduling & Operations
    ['Signed Contract', clientData.signedContract || 'No', 'Yes/No - contract requirement'],
    ['Returning Customers', clientData.returningCustomers || 'None', 'Special policies for returning customers'],
    ['Appointment Confirmations', clientData.appointmentConfirmations || 'Yes', 'Yes/No/Special instructions'],
    ['Call Ahead', clientData.callAhead || 'Yes', 'Yes/No/Special timing requirements'],
    ['Max Distance', clientData.maxDistance || '10 miles', 'Maximum service distance'],
    ['Scheduling Policy Times', clientData.schedulingPolicyTimes || 'AM/PM', 'Time window policies'],
    ['Same Day Services', clientData.sameDayServices || 'No', 'Same day service availability'],
    ['Tech Skilling', clientData.techSkilling || 'Not standard', 'Special technician requirements'],
    ['After Hours Emergency', clientData.afterHoursEmergency || 'No', 'Emergency service availability'],
    
    // Service Policies
    ['Reservices', clientData.reservices || 'Customers must allow 10-14 days', 'Reservice policy and timing'],
    ['Set Service Type To', clientData.setServiceTypeTo || 'Reservice', 'Default service type for callbacks'],
    ['Set Subscription Type To', clientData.setSubscriptionTypeTo || 'Stand-Alone Service or Reservice', 'Default subscription handling'],
    
    // Payment & Financial
    ['Payment Plans', clientData.paymentPlans || 'No', 'Payment plan availability'],
    ['Payment Types', clientData.paymentTypes || 'Cash, Check, Card, ACH', 'Accepted payment methods'],
    ['Past Due Period', clientData.pastDuePeriod || '30 days', 'Past due policy'],
    ['Tools To Save', clientData.toolsToSave || 'Free reservice, manager visit', 'Customer retention tools'],
    ['Cancellation Policy', clientData.cancellationPolicy || 'No cancellation fee', 'Cancellation terms and fees'],
    
    // Additional Information
    ['Additional Notes', clientData.additionalNotes || '', 'Special instructions or notes'],
    ['Branch', clientData.branch || '', 'Branch/location identifier']
  ];
  
  sheet.getRange(2, 1, policyData.length, 3).setValues(policyData);
  
  // Format headers
  sheet.getRange(2, 1, 1, 3).setFontWeight('bold').setBackground('#e3f2fd');
  
  // Format sections with different colors
  sheet.getRange(3, 1, 5, 3).setBackground('#fff3cd'); // Service Coverage - yellow
  sheet.getRange(8, 1, 8, 3).setBackground('#d1ecf1'); // Scheduling - blue
  sheet.getRange(16, 1, 3, 3).setBackground('#d4edda'); // Service Policies - green
  sheet.getRange(19, 1, 6, 3).setBackground('#f8d7da'); // Payment - red
  sheet.getRange(25, 1, 2, 3).setBackground('#e2e3e5'); // Additional - gray
  
  // Format value column for editing
  sheet.getRange(3, 2, policyData.length - 1, 1).setBackground('#f8f9fa').setWrap(true);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 3);
  sheet.setColumnWidth(2, 300); // Make value column wider
  sheet.setColumnWidth(3, 250); // Instructions column
  
  // Add section headers
  const currentRow = policyData.length + 4;
  sheet.getRange(currentRow, 1).setValue('POLICY SECTIONS:').setFontWeight('bold');
  sheet.getRange(currentRow + 1, 1).setValue('• Service Coverage (Yellow) - What services are offered');
  sheet.getRange(currentRow + 2, 1).setValue('• Scheduling & Operations (Blue) - How appointments work');
  sheet.getRange(currentRow + 3, 1).setValue('• Service Policies (Green) - Reservice and service handling');
  sheet.getRange(currentRow + 4, 1).setValue('• Payment & Financial (Red) - Payment and cancellation policies');
  sheet.getRange(currentRow + 5, 1).setValue('• Additional (Gray) - Extra notes and branch info');
  
  // Instructions
  sheet.getRange(currentRow + 7, 1).setValue('EDITING INSTRUCTIONS:').setFontWeight('bold');
  sheet.getRange(currentRow + 8, 1).setValue('• Edit values in column B to match your company policies');
  sheet.getRange(currentRow + 9, 1).setValue('• These fields appear on both Technician and Policies pages in Wix');
  sheet.getRange(currentRow + 10, 1).setValue('• Use exact language from your current Wix profiles when possible');
  sheet.getRange(currentRow + 11, 1).setValue('• Changes sync to Wix when you run syncUpdatesToWix()');
}

/**
 * Sets up the sync status tracking sheet
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The spreadsheet
 * @param {Object} clientData - The client data
 */
function setupSyncStatusSheet(spreadsheet, clientData) {
  let sheet = spreadsheet.getSheetByName('Sync Status');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Sync Status');
  } else {
    sheet.clear();
  }
  
  // Headers
  sheet.getRange('A1').setValue('WIX SYNCHRONIZATION STATUS').setFontWeight('bold').setFontSize(14).setBackground('#dc3545').setFontColor('white');
  sheet.getRange('A1:E1').merge();
  
  const statusData = [
    ['Field', 'Last Updated', 'Sync Status', 'Wix Profile ID', 'Notes'],
    ['Profile Created', new Date(), 'Synced', '', 'Initial profile creation'],
    ['Basic Info', new Date(), 'Synced', '', 'Company details'],
    ['Services', new Date(), 'Synced', '', 'Service catalog'],
    ['Technicians', new Date(), 'Synced', '', 'Staff information'],
    ['Service Areas', new Date(), 'Synced', '', 'Coverage areas'],
    ['Policies', new Date(), 'Synced', '', 'Company policies']
  ];
  
  sheet.getRange(2, 1, statusData.length, 5).setValues(statusData);
  
  // Format headers
  sheet.getRange(2, 1, 1, 5).setFontWeight('bold').setBackground('#f8d7da');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 5);
  
  // Instructions and functions
  sheet.getRange('A15').setValue('SYNCHRONIZATION FUNCTIONS:').setFontWeight('bold');
  sheet.getRange('A16').setValue('• To sync changes to Wix, run: syncUpdatesToWix()');
  sheet.getRange('A17').setValue('• To check sync status, run: checkSyncStatus()');
  sheet.getRange('A18').setValue('• Last sync: ' + new Date());
  
  // Remove default sheet if it exists
  const defaultSheet = spreadsheet.getSheetByName('Sheet1');
  if (defaultSheet && spreadsheet.getSheets().length > 1) {
    spreadsheet.deleteSheet(defaultSheet);
  }
}

/**
 * Updates the master client list
 * @param {Object} clientData - The client data
 * @param {string} sheetUrl - The client's sheet URL
 */
function updateMasterClientList(clientData, sheetUrl) {
  try {
    // Find or create master list
    const masterListName = 'SOS_Master_Client_List';
    let masterSpreadsheet;
    
    const files = DriveApp.getFilesByName(masterListName);
    if (files.hasNext()) {
      masterSpreadsheet = SpreadsheetApp.openById(files.next().getId());
    } else {
      masterSpreadsheet = SpreadsheetApp.create(masterListName);
      setupMasterClientList(masterSpreadsheet);
    }
    
    const sheet = masterSpreadsheet.getSheetByName('Client Directory');
    const lastRow = sheet.getLastRow();
    
    // Generate client ID
    const clientId = 'CLIENT-' + String(lastRow).padStart(3, '0');
    
    // Add new client row
    const newRow = [
      clientId,
      clientData.companyName,
      clientData.location,
      'Active',
      '', // Wix Profile URL (will be updated after creation)
      new Date(),
      new Date(),
      '', // Wix Profile ID (will be updated after creation)
      clientData.email,
      clientData.phone,
      sheetUrl
    ];
    
    sheet.getRange(lastRow + 1, 1, 1, newRow.length).setValues([newRow]);
    
    Logger.log('Added client to master list: ' + clientId);
    return clientId;
    
  } catch (error) {
    Logger.log('Error updating master client list: ' + error.toString());
    // Don't throw error as this is supplementary functionality
  }
}

/**
 * Sets up the master client list structure
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The master spreadsheet
 */
function setupMasterClientList(spreadsheet) {
  let sheet = spreadsheet.getSheetByName('Client Directory');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Client Directory');
  }
  
  const headers = [
    'Client ID', 'Company Name', 'Location', 'Status', 'Wix Profile URL',
    'Created Date', 'Last Updated', 'Wix Profile ID', 'Contact Email', 
    'Contact Phone', 'Google Sheet URL'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');
  
  sheet.autoResizeColumns(1, headers.length);
  
  // Remove default sheet
  const defaultSheet = spreadsheet.getSheetByName('Sheet1');
  if (defaultSheet && spreadsheet.getSheets().length > 1) {
    spreadsheet.deleteSheet(defaultSheet);
  }
}

/**
 * Syncs updates from Google Sheets back to Wix
 * Run this function after making edits in Google Sheets
 * @param {string} clientSheetUrl - URL of the client's Google Sheet
 */
async function syncUpdatesToWix(clientSheetUrl) {
  try {
    Logger.log('Starting sync to Wix from sheet: ' + clientSheetUrl);
    
    // Extract spreadsheet ID from URL
    const sheetId = clientSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    
    // Read updated data from all sheets
    const updatedData = readUpdatedDataFromSheets(spreadsheet);
    
    // Get Wix profile ID from sync status sheet
    const syncSheet = spreadsheet.getSheetByName('Sync Status');
    const wixProfileId = syncSheet.getRange('D3').getValue(); // Adjust as needed
    
    if (!wixProfileId) {
      throw new Error('No Wix Profile ID found. Please check sync status sheet.');
    }
    
    // Update Wix profile
    const wixApi = require('./wixApi');
    await wixApi.updateWixProfile(wixProfileId, updatedData);
    
    // Update sync timestamps
    updateSyncTimestamps(spreadsheet);
    
    Logger.log('Successfully synced updates to Wix');
    return { success: true, message: 'Profile updated successfully' };
    
  } catch (error) {
    Logger.log('Error syncing to Wix: ' + error.toString());
    throw error;
  }
}

/**
 * Reads updated data from all sheets in the client spreadsheet
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The client spreadsheet
 * @returns {Object} Updated client data
 */
function readUpdatedDataFromSheets(spreadsheet) {
  const clientData = {};
  
  // Read basic info
  const basicSheet = spreadsheet.getSheetByName('Basic Info');
  if (basicSheet) {
    const basicData = basicSheet.getRange('A3:B12').getValues();
    basicData.forEach(row => {
      const field = row[0];
      const value = row[1];
      
      switch (field) {
        case 'Company Name': clientData.companyName = value; break;
        case 'Location': clientData.location = value; break;
        case 'Business Address': clientData.address = value; break;
        case 'Primary Phone': clientData.phone = value; break;
        case 'Business Email': clientData.email = value; break;
        case 'Website': clientData.website = value; break;
        case 'Business Hours': clientData.hours = value; break;
        case 'Company Bulletin': clientData.bulletin = value; break;
        case 'Pests Not Covered': clientData.pestsNotCovered = value; break;
      }
    });
  }
  
  // Read services
  const servicesSheet = spreadsheet.getSheetByName('Services');
  if (servicesSheet) {
    const servicesData = servicesSheet.getRange('A3:P' + servicesSheet.getLastRow()).getValues();
    clientData.services = servicesData
      .filter(row => row[0]) // Only rows with service names
      .map(row => ({
        name: row[0],
        category: row[1],
        type: row[2],
        description: row[3],
        pests: row[4],
        frequency: row[5],
        contract: row[6],
        guarantee: row[7],
        callAhead: row[8],
        initialDuration: row[9],
        recurringDuration: row[10],
        leaveDuringService: row[11],
        followUp: row[12],
        prepSheet: row[13],
        price: row[14],
        onboardingNotes: row[15]
      }));
  }
  
  // Read technicians
  const techSheet = spreadsheet.getSheetByName('Technicians');
  if (techSheet) {
    const techData = techSheet.getRange('A3:H' + techSheet.getLastRow()).getValues();
    clientData.technicians = techData
      .filter(row => row[0]) // Only rows with names
      .map(row => ({
        name: row[0],
        role: row[1],
        phone: row[2],
        email: row[3],
        schedule: row[4],
        maxStops: row[5],
        zipCodes: row[6],
        doesNotService: row[7]
      }));
  }
  
  // Read service areas
  const areasSheet = spreadsheet.getSheetByName('Service Areas');
  if (areasSheet) {
    const areasData = areasSheet.getRange('A3:E' + areasSheet.getLastRow()).getValues();
    clientData.serviceAreas = areasData
      .filter(row => row[0]) // Only rows with city/region
      .map(row => ({
        city: row[0],
        state: row[1],
        zipCodes: row[2],
        radius: row[3],
        fees: row[4]
      }));
  }
  
  // Read policies
  const policiesSheet = spreadsheet.getSheetByName('Policies');
  if (policiesSheet) {
    const policiesData = policiesSheet.getRange('A3:B27').getValues(); // Updated range for new policy structure
    policiesData.forEach(row => {
      const policyType = row[0];
      const content = row[1];
      
      switch (policyType) {
        case 'Do we treat vehicles?': clientData.treatVehicles = content; break;
        case 'Commercial Properties': clientData.commercialProperties = content; break;
        case 'Multi-Family Offered': clientData.multiFamilyOffered = content; break;
        case 'Trailers/Mobile Homes': clientData.trailersOffered = content; break;
        case 'Signed Contract': clientData.signedContract = content; break;
        case 'Returning Customers': clientData.returningCustomers = content; break;
        case 'Appointment Confirmations': clientData.appointmentConfirmations = content; break;
        case 'Call Ahead': clientData.callAhead = content; break;
        case 'Max Distance': clientData.maxDistance = content; break;
        case 'Scheduling Policy Times': clientData.schedulingPolicyTimes = content; break;
        case 'Same Day Services': clientData.sameDayServices = content; break;
        case 'Tech Skilling': clientData.techSkilling = content; break;
        case 'After Hours Emergency': clientData.afterHoursEmergency = content; break;
        case 'Reservices': clientData.reservices = content; break;
        case 'Set Service Type To': clientData.setServiceTypeTo = content; break;
        case 'Set Subscription Type To': clientData.setSubscriptionTypeTo = content; break;
        case 'Payment Plans': clientData.paymentPlans = content; break;
        case 'Payment Types': clientData.paymentTypes = content; break;
        case 'Past Due Period': clientData.pastDuePeriod = content; break;
        case 'Tools To Save': clientData.toolsToSave = content; break;
        case 'Cancellation Policy': clientData.cancellationPolicy = content; break;
        case 'Additional Notes': clientData.additionalNotes = content; break;
        case 'Branch': clientData.branch = content; break;
        
        // Keep legacy policy support
        case 'Guarantee Policy': clientData.guaranteePolicy = content; break;
        case 'Payment Terms': clientData.paymentTerms = content; break;
        case 'Emergency Services': clientData.emergencyServices = content; break;
        case 'Insurance Information': clientData.insuranceInfo = content; break;
      }
    });
  }
  
  return clientData;
}

/**
 * Updates sync timestamps in the sync status sheet
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The client spreadsheet
 */
function updateSyncTimestamps(spreadsheet) {
  const syncSheet = spreadsheet.getSheetByName('Sync Status');
  if (syncSheet) {
    const now = new Date();
    // Update all "Last Updated" timestamps
    syncSheet.getRange('B3:B8').setValue(now);
    // Update instruction timestamp
    syncSheet.getRange('A18').setValue('• Last sync: ' + now);
  }
}

/**
 * Reads office information from the sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 * @returns {Object} Office information
 */
function readOfficeInformation(sheet) {
  // This will be customized based on your actual sheet structure
  return {
    address: sheet.getRange('B8').getValue() || '',
    phone: sheet.getRange('B9').getValue() || '',
    email: sheet.getRange('B10').getValue() || '',
    hours: sheet.getRange('B11').getValue() || '',
    website: sheet.getRange('B12').getValue() || ''
  };
}

/**
 * Reads services data from the sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 * @returns {Array} Services array
 */
function readServicesData(sheet) {
  const services = [];
  
  // Find the services section (you'll need to adjust based on your sheet layout)
  const servicesStartRow = findSectionStart(sheet, 'Services');
  
  if (servicesStartRow > 0) {
    let currentRow = servicesStartRow + 1;
    
    // Read until we hit an empty row or another section
    while (currentRow <= sheet.getLastRow()) {
      const serviceName = sheet.getRange(currentRow, 1).getValue();
      
      if (!serviceName || serviceName.toString().trim() === '') {
        break;
      }
      
      const service = {
        name: serviceName,
        description: sheet.getRange(currentRow, 2).getValue() || '',
        pricing: sheet.getRange(currentRow, 3).getValue() || '',
        contract: sheet.getRange(currentRow, 4).getValue() || '',
        guarantee: sheet.getRange(currentRow, 5).getValue() || '',
        duration: sheet.getRange(currentRow, 6).getValue() || ''
      };
      
      services.push(service);
      currentRow++;
    }
  }
  
  return services;
}

/**
 * Reads technicians data from the sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 * @returns {Array} Technicians array
 */
function readTechniciansData(sheet) {
  const technicians = [];
  
  const techStartRow = findSectionStart(sheet, 'Technicians');
  
  if (techStartRow > 0) {
    let currentRow = techStartRow + 1;
    
    while (currentRow <= sheet.getLastRow()) {
      const techName = sheet.getRange(currentRow, 1).getValue();
      
      if (!techName || techName.toString().trim() === '') {
        break;
      }
      
      const technician = {
        name: techName,
        phone: sheet.getRange(currentRow, 2).getValue() || '',
        email: sheet.getRange(currentRow, 3).getValue() || '',
        serviceAreas: (sheet.getRange(currentRow, 4).getValue() || '').toString().split(',').map(s => s.trim()),
        schedule: sheet.getRange(currentRow, 5).getValue() || ''
      };
      
      technicians.push(technician);
      currentRow++;
    }
  }
  
  return technicians;
}

/**
 * Reads service areas and zip codes from the sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 * @returns {Array} Service areas array
 */
function readServiceAreasData(sheet) {
  const serviceAreas = [];
  
  const areasStartRow = findSectionStart(sheet, 'Service Areas');
  
  if (areasStartRow > 0) {
    let currentRow = areasStartRow + 1;
    
    while (currentRow <= sheet.getLastRow()) {
      const zipCode = sheet.getRange(currentRow, 1).getValue();
      
      if (!zipCode || zipCode.toString().trim() === '') {
        break;
      }
      
      const area = {
        zipCode: zipCode.toString(),
        city: sheet.getRange(currentRow, 2).getValue() || '',
        state: sheet.getRange(currentRow, 3).getValue() || '',
        region: sheet.getRange(currentRow, 4).getValue() || ''
      };
      
      serviceAreas.push(area);
      currentRow++;
    }
  }
  
  return serviceAreas;
}

/**
 * Reads policies data from the sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 * @returns {Array} Policies array
 */
function readPoliciesData(sheet) {
  const policies = [];
  
  const policiesStartRow = findSectionStart(sheet, 'Policies');
  
  if (policiesStartRow > 0) {
    let currentRow = policiesStartRow + 1;
    
    while (currentRow <= sheet.getLastRow()) {
      const policyTitle = sheet.getRange(currentRow, 1).getValue();
      
      if (!policyTitle || policyTitle.toString().trim() === '') {
        break;
      }
      
      const policy = {
        title: policyTitle,
        content: sheet.getRange(currentRow, 2).getValue() || '',
        category: sheet.getRange(currentRow, 3).getValue() || 'general'
      };
      
      policies.push(policy);
      currentRow++;
    }
  }
  
  return policies;
}

/**
 * Finds the starting row of a section in the sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to search
 * @param {string} sectionName - The section name to find
 * @returns {number} The row number where the section starts (0 if not found)
 */
function findSectionStart(sheet, sectionName) {
  const data = sheet.getDataRange().getValues();
  
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (data[i][j].toString().toLowerCase().includes(sectionName.toLowerCase())) {
        return i + 1; // Convert to 1-based indexing
      }
    }
  }
  
  return 0; // Section not found
}

/**
 * Creates a comprehensive multi-client input sheet system
 * Run this function to set up your centralized client management system
 */
function createMultiClientSystem() {
  try {
    // Look for existing spreadsheet by name first
    let spreadsheet;
    const files = DriveApp.getFilesByName('Client Profile Input');
    
    if (files.hasNext()) {
      // Found existing spreadsheet
      const file = files.next();
      spreadsheet = SpreadsheetApp.openById(file.getId());
      Logger.log('Found existing spreadsheet: ' + file.getName());
    } else {
      // Create new spreadsheet
      spreadsheet = SpreadsheetApp.create('Client Profile Input');
      Logger.log('Created new spreadsheet');
    }
    
    // Create the multi-client structure
    setupMultiClientSheets(spreadsheet);
    
    const spreadsheetUrl = spreadsheet.getUrl();
    Logger.log('Multi-client system ready at: ' + spreadsheetUrl);
    
    // Show success message
    if (typeof SpreadsheetApp.getUi === 'function') {
      SpreadsheetApp.getUi().alert(
        'Success!', 
        `Multi-client system created!\n\nSpreadsheet URL: ${spreadsheetUrl}\n\nSheets created:\n- Client List (master list)\n- Input Template (for new clients)\n- Profile Tracker (status tracking)`, 
        SpreadsheetApp.getUi().Button.OK
      );
    }
    
    return spreadsheetUrl;
    
  } catch (error) {
    Logger.log('Error creating multi-client system: ' + error.toString());
    throw error;
  }
}

/**
 * Sets up multiple sheets for client management
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The spreadsheet to set up
 */
function setupMultiClientSheets(spreadsheet) {
  // 1. Client List Sheet (Master Directory)
  let clientListSheet = spreadsheet.getSheetByName('Client List');
  if (!clientListSheet) {
    clientListSheet = spreadsheet.insertSheet('Client List');
  } else {
    clientListSheet.clear();
  }
  setupClientListSheet(clientListSheet);
  
  // 2. Input Template Sheet
  let inputTemplate = spreadsheet.getSheetByName('Input Template');
  if (!inputTemplate) {
    inputTemplate = spreadsheet.insertSheet('Input Template');
  } else {
    inputTemplate.clear();
  }
  setupInputTemplate(inputTemplate);
  
  // 3. Profile Tracker Sheet
  let trackerSheet = spreadsheet.getSheetByName('Profile Tracker');
  if (!trackerSheet) {
    trackerSheet = spreadsheet.insertSheet('Profile Tracker');
  } else {
    trackerSheet.clear();
  }
  setupProfileTracker(trackerSheet);
  
  // Remove default sheet if it exists and is empty
  const defaultSheet = spreadsheet.getSheetByName('Sheet1');
  if (defaultSheet && spreadsheet.getSheets().length > 1) {
    spreadsheet.deleteSheet(defaultSheet);
  }
}

/**
 * Sets up the Client List sheet (master directory)
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The client list sheet
 */
function setupClientListSheet(sheet) {
  // Headers for client list
  const headers = [
    'Client ID', 'Company Name', 'Location', 'Status', 'Profile URL', 
    'Created Date', 'Last Updated', 'Wix Profile ID', 'Contact Email', 'Contact Phone'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');
  
  // Add sample data row
  const sampleData = [
    'CLIENT-001', 'Sample Company', 'City, State', 'Active', 
    'https://www.psosprofiles.com/12345-sample-company', 
    new Date(), new Date(), '12345', 'contact@company.com', '555-1234'
  ];
  
  sheet.getRange(2, 1, 1, sampleData.length).setValues([sampleData]);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  // Add instructions
  sheet.getRange('A12').setValue('INSTRUCTIONS:');
  sheet.getRange('A13').setValue('• Each row represents one client profile');
  sheet.getRange('A14').setValue('• Client ID format: CLIENT-XXX (auto-generated)');
  sheet.getRange('A15').setValue('• Status options: Active, Pending, Inactive');
  sheet.getRange('A16').setValue('• Profile URL is auto-generated when profile is created');
  
  sheet.getRange('A12:A16').setFontWeight('bold');
}

/**
 * Sets up the Input Template sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input template sheet
 */
function setupInputTemplate(sheet) {
  // Instructions section
  sheet.getRange('A1').setValue('CLIENT PROFILE INPUT TEMPLATE');
  sheet.getRange('A2').setValue('Copy this template for each new client, then run createClientProfile()');
  sheet.getRange('A1:B2').setFontWeight('bold').setBackground('#e3f2fd');
  
  let currentRow = 4;
  
  // Basic Information Section
  currentRow = setupBasicInfoSection(sheet, currentRow);
  currentRow += 2;
  
  // Office Information Section  
  currentRow = setupOfficeInfoSection(sheet, currentRow);
  currentRow += 2;
  
  // Services Section
  currentRow = setupServicesSection(sheet, currentRow);
  currentRow += 2;
  
  // Technicians Section
  currentRow = setupTechniciansSection(sheet, currentRow);
  currentRow += 2;
  
  // Service Areas Section
  currentRow = setupServiceAreasSection(sheet, currentRow);
  currentRow += 2;
  
  // Policies Section
  currentRow = setupPoliciesSection(sheet, currentRow);
  
  // Format the sheet
  formatInputSheet(sheet);
}

/**
 * Sets up the Profile Tracker sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The profile tracker sheet
 */
function setupProfileTracker(sheet) {
  const headers = [
    'Client ID', 'Company Name', 'Profile Status', 'Wix Sync Status', 
    'Last Sync Date', 'Error Messages', 'Action Required', 'Notes'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#34a853')
    .setFontColor('white');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  // Add status legend
  sheet.getRange('A10').setValue('STATUS LEGEND:');
  sheet.getRange('A11').setValue('Profile Status: Draft, Ready, Published, Error');
  sheet.getRange('A12').setValue('Wix Sync Status: Synced, Pending, Failed, Modified');
  sheet.getRange('A10:A12').setFontWeight('bold');
}

/**
 * Sets up the services section of the input sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 */
function setupServicesSection(sheet) {
  const startRow = 16;
  
  sheet.getRange(startRow, 1).setValue('SERVICES');
  sheet.getRange(startRow + 1, 1).setValue('Service Name');
  sheet.getRange(startRow + 1, 2).setValue('Description');
  sheet.getRange(startRow + 1, 3).setValue('Pricing');
  sheet.getRange(startRow + 1, 4).setValue('Contract');
  sheet.getRange(startRow + 1, 5).setValue('Guarantee');
  sheet.getRange(startRow + 1, 6).setValue('Duration');
  
  // Add some example rows
  for (let i = 0; i < 5; i++) {
    sheet.getRange(startRow + 2 + i, 1, 1, 6).setValue(['', '', '', '', '', '']);
  }
}

/**
 * Sets up the technicians section of the input sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 */
function setupTechniciansSection(sheet) {
  const startRow = 24;
  
  sheet.getRange(startRow, 1).setValue('TECHNICIANS');
  sheet.getRange(startRow + 1, 1).setValue('Name');
  sheet.getRange(startRow + 1, 2).setValue('Phone');
  sheet.getRange(startRow + 1, 3).setValue('Email');
  sheet.getRange(startRow + 1, 4).setValue('Service Areas');
  sheet.getRange(startRow + 1, 5).setValue('Schedule');
  
  // Add some example rows
  for (let i = 0; i < 5; i++) {
    sheet.getRange(startRow + 2 + i, 1, 1, 5).setValue(['', '', '', '', '']);
  }
}

/**
 * Sets up the service areas section of the input sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 */
function setupServiceAreasSection(sheet) {
  const startRow = 32;
  
  sheet.getRange(startRow, 1).setValue('SERVICE AREAS & ZIP CODES');
  sheet.getRange(startRow + 1, 1).setValue('Zip Code');
  sheet.getRange(startRow + 1, 2).setValue('City');
  sheet.getRange(startRow + 1, 3).setValue('State');
  sheet.getRange(startRow + 1, 4).setValue('Region');
  
  // Add some example rows
  for (let i = 0; i < 10; i++) {
    sheet.getRange(startRow + 2 + i, 1, 1, 4).setValue(['', '', '', '']);
  }
}

/**
 * Sets up the policies section of the input sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 */
function setupPoliciesSection(sheet) {
  const startRow = 45;
  
  sheet.getRange(startRow, 1).setValue('SOS POLICIES');
  sheet.getRange(startRow + 1, 1).setValue('Policy Title');
  sheet.getRange(startRow + 1, 2).setValue('Policy Content');
  sheet.getRange(startRow + 1, 3).setValue('Category');
  
  // Add some example rows
  for (let i = 0; i < 5; i++) {
    sheet.getRange(startRow + 2 + i, 1, 1, 3).setValue(['', '', '']);
  }
}

/**
 * Formats the input sheet for better usability
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 */
function formatInputSheet(sheet) {
  // Format section headers
  const headerRanges = ['A1', 'A9', 'A16', 'A24', 'A32', 'A45'];
  headerRanges.forEach(range => {
    sheet.getRange(range).setFontWeight('bold').setFontSize(12).setBackground('#4285f4').setFontColor('white');
  });
  
  // Format sub-headers
  const subHeaderRanges = ['A17:F17', 'A25:E25', 'A33:D33', 'A46:C46'];
  subHeaderRanges.forEach(range => {
    sheet.getRange(range).setFontWeight('bold').setBackground('#e3f2fd');
  });
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 6);
  
  // Freeze the first column
  sheet.setFrozenColumns(1);
}

/**
 * Sets up the basic information section
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 * @param {number} startRow - Starting row number
 * @return {number} Next available row
 */
function setupBasicInfoSection(sheet, startRow) {
  sheet.getRange(startRow, 1).setValue('BASIC INFORMATION');
  sheet.getRange(startRow, 1).setFontWeight('bold').setBackground('#e8f0fe');
  
  const basicFields = [
    ['Company Name:', 'Enter the full company name'],
    ['Location:', 'City, State format'],
    ['Bulletin:', 'Brief company description'],
    ['Pests Not Covered:', 'List any pests not serviced'],
    ['Special Notes:', 'Additional information']
  ];
  
  basicFields.forEach((field, index) => {
    const row = startRow + index + 1;
    sheet.getRange(row, 1).setValue(field[0]);
    sheet.getRange(row, 3).setValue(field[1]);
    sheet.getRange(row, 1).setFontWeight('bold');
    sheet.getRange(row, 3).setFontStyle('italic');
  });
  
  return startRow + basicFields.length + 1;
}

/**
 * Sets up the office information section
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 * @param {number} startRow - Starting row number
 * @return {number} Next available row
 */
function setupOfficeInfoSection(sheet, startRow) {
  sheet.getRange(startRow, 1).setValue('OFFICE INFORMATION');
  sheet.getRange(startRow, 1).setFontWeight('bold').setBackground('#e8f0fe');
  
  const officeFields = [
    ['Address:', 'Full street address'],
    ['Phone:', 'Main business phone number'],
    ['Email:', 'Main business email'],
    ['Hours:', 'Business hours (e.g., Mon-Fri 8AM-5PM)'],
    ['Website:', 'Company website URL']
  ];
  
  officeFields.forEach((field, index) => {
    const row = startRow + index + 1;
    sheet.getRange(row, 1).setValue(field[0]);
    sheet.getRange(row, 3).setValue(field[1]);
    sheet.getRange(row, 1).setFontWeight('bold');
    sheet.getRange(row, 3).setFontStyle('italic');
  });
  
  return startRow + officeFields.length + 1;
}

/**
 * Sets up the services section
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 * @param {number} startRow - Starting row number
 * @return {number} Next available row
 */
function setupServicesSection(sheet, startRow) {
  sheet.getRange(startRow, 1).setValue('SERVICES');
  sheet.getRange(startRow, 1).setFontWeight('bold').setBackground('#e8f0fe');
  
  const serviceHeaders = ['Service Name', 'Description', 'Price', 'Active'];
  sheet.getRange(startRow + 1, 1, 1, serviceHeaders.length).setValues([serviceHeaders]);
  sheet.getRange(startRow + 1, 1, 1, serviceHeaders.length).setFontWeight('bold');
  
  // Add sample services
  const sampleServices = [
    ['General Pest Control', 'Quarterly pest control service', '$150', 'Yes'],
    ['Termite Inspection', 'Annual termite inspection', '$75', 'Yes'],
    ['Mosquito Control', 'Monthly mosquito treatment', '$100', 'Yes']
  ];
  
  sheet.getRange(startRow + 2, 1, sampleServices.length, serviceHeaders.length)
    .setValues(sampleServices);
  
  return startRow + sampleServices.length + 3;
}

/**
 * Sets up the technicians section
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 * @param {number} startRow - Starting row number
 * @return {number} Next available row
 */
function setupTechniciansSection(sheet, startRow) {
  sheet.getRange(startRow, 1).setValue('TECHNICIANS');
  sheet.getRange(startRow, 1).setFontWeight('bold').setBackground('#e8f0fe');
  
  const techHeaders = ['Technician Name', 'Certifications', 'Specialties', 'Years Experience'];
  sheet.getRange(startRow + 1, 1, 1, techHeaders.length).setValues([techHeaders]);
  sheet.getRange(startRow + 1, 1, 1, techHeaders.length).setFontWeight('bold');
  
  // Add sample technicians
  const sampleTechs = [
    ['John Smith', 'Licensed Pest Control Operator', 'Termites, Rodents', '5'],
    ['Sarah Johnson', 'Certified Applicator', 'General Pest, Mosquitoes', '3']
  ];
  
  sheet.getRange(startRow + 2, 1, sampleTechs.length, techHeaders.length)
    .setValues(sampleTechs);
  
  return startRow + sampleTechs.length + 3;
}

/**
 * Sets up the service areas section
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 * @param {number} startRow - Starting row number
 * @return {number} Next available row
 */
function setupServiceAreasSection(sheet, startRow) {
  sheet.getRange(startRow, 1).setValue('SERVICE AREAS');
  sheet.getRange(startRow, 1).setFontWeight('bold').setBackground('#e8f0fe');
  
  const areaHeaders = ['City/Area', 'Zip Codes', 'Service Radius (miles)', 'Additional Fees'];
  sheet.getRange(startRow + 1, 1, 1, areaHeaders.length).setValues([areaHeaders]);
  sheet.getRange(startRow + 1, 1, 1, areaHeaders.length).setFontWeight('bold');
  
  // Add sample areas
  const sampleAreas = [
    ['Downtown', '12345, 12346', '15', 'None'],
    ['Suburbs', '12347, 12348, 12349', '25', '$25 trip fee']
  ];
  
  sheet.getRange(startRow + 2, 1, sampleAreas.length, areaHeaders.length)
    .setValues(sampleAreas);
  
  return startRow + sampleAreas.length + 3;
}

/**
 * Sets up the policies section
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 * @param {number} startRow - Starting row number
 * @return {number} Next available row
 */
function setupPoliciesSection(sheet, startRow) {
  sheet.getRange(startRow, 1).setValue('POLICIES');
  sheet.getRange(startRow, 1).setFontWeight('bold').setBackground('#e8f0fe');
  
  const policyFields = [
    ['Cancellation Policy:', 'Policy for service cancellations'],
    ['Guarantee Policy:', 'Service guarantee terms'],
    ['Payment Terms:', 'Payment policies and terms'],
    ['Emergency Services:', 'Emergency service availability'],
    ['Insurance Info:', 'Insurance and bonding information']
  ];
  
  policyFields.forEach((field, index) => {
    const row = startRow + index + 1;
    sheet.getRange(row, 1).setValue(field[0]);
    sheet.getRange(row, 3).setValue(field[1]);
    sheet.getRange(row, 1).setFontWeight('bold');
    sheet.getRange(row, 3).setFontStyle('italic');
  });
  
  return startRow + policyFields.length + 1;
}

/**
 * Formats the input sheet for better usability
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 */
function formatInputSheet(sheet) {
  // Auto-resize columns
  sheet.autoResizeColumns(1, 4);
  
  // Set column widths for better visibility
  sheet.setColumnWidth(1, 200); // Labels
  sheet.setColumnWidth(2, 300); // Input values
  sheet.setColumnWidth(3, 250); // Instructions
  
  // Add borders to important sections
  const maxRow = sheet.getLastRow();
  sheet.getRange(1, 1, maxRow, 3).setBorder(true, true, true, true, true, true);
  
  // Freeze the first row
  sheet.setFrozenRows(1);
}

/**
 * Updates Wix profile when client data is edited
 * @param {string} clientId - The client ID that was edited
 * @param {string} spreadsheetName - Name of the spreadsheet
 */
async function handleClientDataUpdate(clientId, spreadsheetName = 'Client Profile Input') {
  try {
    // Find the spreadsheet
    const files = DriveApp.getFilesByName(spreadsheetName);
    if (!files.hasNext()) {
      throw new Error(`Spreadsheet "${spreadsheetName}" not found`);
    }
    
    const spreadsheet = SpreadsheetApp.open(files.next());
    const clientListSheet = spreadsheet.getSheetByName('Client List');
    
    if (!clientListSheet) {
      throw new Error('Client List sheet not found');
    }
    
    // Find the client row
    const data = clientListSheet.getDataRange().getValues();
    let clientRow = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === clientId) { // Client ID is in column A
        clientRow = i + 1; // Adjust for 0-based index
        break;
      }
    }
    
    if (clientRow === -1) {
      throw new Error(`Client ${clientId} not found in Client List`);
    }
    
    // Get the Wix Profile ID
    const wixProfileId = clientListSheet.getRange(clientRow, 8).getValue(); // Column H
    
    if (!wixProfileId) {
      throw new Error(`No Wix Profile ID found for client ${clientId}`);
    }
    
    // Read updated data from the Input Template sheet for this client
    const inputSheet = spreadsheet.getSheetByName(`${clientId}_Input`);
    
    if (!inputSheet) {
      Logger.log(`No input sheet found for ${clientId}, creating new profile instead`);
      return;
    }
    
    // Read the updated client data
    const updatedData = readClientDataFromSheet(inputSheet);
    
    // Update the Wix profile
    const wixApi = require('./wixApi');
    await wixApi.updateWixProfile(wixProfileId, updatedData);
    
    // Update the last modified date in Client List
    clientListSheet.getRange(clientRow, 7).setValue(new Date()); // Column G
    
    // Update Profile Tracker
    updateProfileTracker(spreadsheet, clientId, 'Synced', 'Profile updated successfully');
    
    Logger.log(`Successfully updated Wix profile for client ${clientId}`);
    
  } catch (error) {
    Logger.error(`Error updating client ${clientId}:`, error);
    
    // Update Profile Tracker with error
    try {
      const files = DriveApp.getFilesByName(spreadsheetName);
      if (files.hasNext()) {
        const spreadsheet = SpreadsheetApp.open(files.next());
        updateProfileTracker(spreadsheet, clientId, 'Failed', error.message);
      }
    } catch (trackerError) {
      Logger.error('Error updating profile tracker:', trackerError);
    }
    
    throw error;
  }
}

/**
 * Updates the Profile Tracker sheet
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The spreadsheet
 * @param {string} clientId - The client ID
 * @param {string} syncStatus - The sync status
 * @param {string} message - Status message
 */
function updateProfileTracker(spreadsheet, clientId, syncStatus, message) {
  const trackerSheet = spreadsheet.getSheetByName('Profile Tracker');
  
  if (!trackerSheet) {
    Logger.log('Profile Tracker sheet not found');
    return;
  }
  
  const data = trackerSheet.getDataRange().getValues();
  let clientRow = -1;
  
  // Find existing client row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === clientId) {
      clientRow = i + 1;
      break;
    }
  }
  
  // If client not found, add new row
  if (clientRow === -1) {
    clientRow = trackerSheet.getLastRow() + 1;
    trackerSheet.getRange(clientRow, 1).setValue(clientId); // Client ID
    
    // Get company name from Client List
    const clientListSheet = spreadsheet.getSheetByName('Client List');
    if (clientListSheet) {
      const clientData = clientListSheet.getDataRange().getValues();
      for (let i = 1; i < clientData.length; i++) {
        if (clientData[i][0] === clientId) {
          trackerSheet.getRange(clientRow, 2).setValue(clientData[i][1]); // Company Name
          break;
        }
      }
    }
  }
  
  // Update sync information
  trackerSheet.getRange(clientRow, 4).setValue(syncStatus); // Wix Sync Status
  trackerSheet.getRange(clientRow, 5).setValue(new Date()); // Last Sync Date
  trackerSheet.getRange(clientRow, 6).setValue(message); // Error Messages/Notes
}
