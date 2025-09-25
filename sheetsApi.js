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
  
  // Set column widths
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 250);
  
  // Protection - allow editing of column B only
  const protection = sheet.protect().setDescription('Basic Info Protection');
  protection.setUnprotectedRanges([sheet.getRange('B3:B11')]);
  
  Logger.log('Basic info sheet set up');
}

/**
 * Sets up the services sheet
 */
function setupServicesSheet(spreadsheet, clientData) {
  let sheet = spreadsheet.getSheetByName('Services');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Services');
  } else {
    sheet.clear();
  }
  
  // Headers
  sheet.getRange('A1').setValue('SERVICES').setFontWeight('bold').setFontSize(14).setBackground('#34a853').setFontColor('white');
  sheet.getRange('A1:M1').merge();
  
  const headers = [
    'Service Name', 'Service Type', 'Frequency', 'Description', 'Pests Covered',
    'Contract', 'Guarantee', 'Duration', 'Product Type', 'Billing Frequency',
    'Agent Note', 'Queue Ext', 'Pricing Data (JSON)'
  ];
  
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, 1, headers.length).setFontWeight('bold').setBackground('#e8f5e8');
  
  // Add services data if available
  if (clientData.services && clientData.services.length > 0) {
    const servicesData = clientData.services.map(service => [
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
      JSON.stringify(service.pricingTiers || [])
    ]);
    
    sheet.getRange(3, 1, servicesData.length, headers.length).setValues(servicesData);
  }
  
  // Set column widths
  for (let i = 1; i <= headers.length; i++) {
    sheet.setColumnWidth(i, 150);
  }
  
  Logger.log('Services sheet set up');
}

/**
 * Sets up the technicians sheet
 */
function setupTechniciansSheet(spreadsheet, clientData) {
  let sheet = spreadsheet.getSheetByName('Technicians');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Technicians');
  } else {
    sheet.clear();
  }
  
  // Headers
  sheet.getRange('A1').setValue('TECHNICIANS').setFontWeight('bold').setFontSize(14).setBackground('#ea4335').setFontColor('white');
  sheet.getRange('A1:J1').merge();
  
  const headers = [
    'Tech Name', 'Company', 'Role', 'Phone', 'Schedule', 
    'Max Stops', 'Does Not Service', 'Additional Notes', 'Zip Codes (JSON)'
  ];
  
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, 1, headers.length).setFontWeight('bold').setBackground('#fce4ec');
  
  // Add technicians data if available
  if (clientData.technicians && clientData.technicians.length > 0) {
    const techData = clientData.technicians.map(tech => [
      tech.name || '',
      tech.company || '',
      tech.role || '',
      tech.phone || '',
      tech.schedule || '',
      tech.maxStops || '',
      tech.doesNotService || '',
      tech.additionalNotes || '',
      JSON.stringify(tech.zipCodes || [])
    ]);
    
    sheet.getRange(3, 1, techData.length, headers.length).setValues(techData);
  }
  
  // Set column widths
  for (let i = 1; i <= headers.length; i++) {
    sheet.setColumnWidth(i, 150);
  }
  
  Logger.log('Technicians sheet set up');
}

/**
 * Sets up the service areas sheet
 */
function setupServiceAreasSheet(spreadsheet, clientData) {
  let sheet = spreadsheet.getSheetByName('Service Areas');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Service Areas');
  } else {
    sheet.clear();
  }
  
  // Headers
  sheet.getRange('A1').setValue('SERVICE AREAS').setFontWeight('bold').setFontSize(14).setBackground('#9c27b0').setFontColor('white');
  sheet.getRange('A1:G1').merge();
  
  const headers = [
    'Zip Code', 'City', 'State', 'Branch', 'Territory', 'In Service'
  ];
  
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3e5f5');
  
  // Add service areas data if available
  if (clientData.serviceAreas && clientData.serviceAreas.length > 0) {
    const areasData = clientData.serviceAreas.map(area => [
      area.zip || '',
      area.city || '',
      area.state || '',
      area.branch || '',
      area.territory || '',
      area.inService !== false
    ]);
    
    sheet.getRange(3, 1, areasData.length, headers.length).setValues(areasData);
  }
  
  // Set column widths
  for (let i = 1; i <= headers.length; i++) {
    sheet.setColumnWidth(i, 120);
  }
  
  Logger.log('Service areas sheet set up');
}

/**
 * Sets up the policies sheet
 */
function setupPoliciesSheet(spreadsheet, clientData) {
  let sheet = spreadsheet.getSheetByName('Policies');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Policies');
  } else {
    sheet.clear();
  }
  
  // Headers
  sheet.getRange('A1').setValue('POLICIES').setFontWeight('bold').setFontSize(14).setBackground('#fbbc04').setFontColor('white');
  sheet.getRange('A1:G1').merge();
  
  const headers = [
    'Category', 'Policy Type', 'Title', 'Description', 'Options (JSON)', 'Default Value'
  ];
  
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, 1, headers.length).setFontWeight('bold').setBackground('#fff8e1');
  
  // Add policies data if available
  if (clientData.policies && Object.keys(clientData.policies).length > 0) {
    const policiesData = [];
    
    Object.keys(clientData.policies).forEach(category => {
      const categoryPolicies = clientData.policies[category];
      if (Array.isArray(categoryPolicies)) {
        categoryPolicies.forEach(policy => {
          policiesData.push([
            category,
            policy.type || '',
            policy.title || '',
            policy.description || '',
            JSON.stringify(policy.options || []),
            policy.default || ''
          ]);
        });
      }
    });
    
    if (policiesData.length > 0) {
      sheet.getRange(3, 1, policiesData.length, headers.length).setValues(policiesData);
    }
  }
  
  // Set column widths
  sheet.setColumnWidth(1, 200); // Category
  sheet.setColumnWidth(2, 150); // Policy Type
  sheet.setColumnWidth(3, 200); // Title
  sheet.setColumnWidth(4, 300); // Description
  sheet.setColumnWidth(5, 200); // Options
  sheet.setColumnWidth(6, 200); // Default Value
  
  Logger.log('Policies sheet set up');
}

/**
 * Sets up the sync status sheet
 */
function setupSyncStatusSheet(spreadsheet, clientData) {
  let sheet = spreadsheet.getSheetByName('Sync Status');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Sync Status');
  } else {
    sheet.clear();
  }
  
  // Headers
  sheet.getRange('A1').setValue('SYNC STATUS').setFontWeight('bold').setFontSize(14).setBackground('#607d8b').setFontColor('white');
  sheet.getRange('A1:D1').merge();
  
  const statusData = [
    ['Property', 'Value', 'Last Updated', 'Status'],
    ['Profile Created', new Date().toISOString(), new Date().toISOString(), 'CREATED'],
    ['Master Sheet Sync', '', '', 'PENDING'],
    ['Wix Sync', '', '', 'PENDING'],
    ['Last Edit', '', '', 'N/A']
  ];
  
  sheet.getRange(2, 1, statusData.length, 4).setValues(statusData);
  sheet.getRange(2, 1, 1, 4).setFontWeight('bold').setBackground('#eceff1');
  
  // Set column widths
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 120);
  
  Logger.log('Sync status sheet set up');
}

/**
 * Reads client data from individual client sheet
 */
function readClientDataFromSheet(spreadsheet) {
  try {
    const basicSheet = spreadsheet.getSheetByName('Basic Info');
    if (!basicSheet) return {};
    
    const data = basicSheet.getDataRange().getValues();
    const clientData = {};
    
    // Read basic info (assuming field-value format)
    for (let i = 1; i < data.length; i++) {
      const field = data[i][0];
      const value = data[i][1];
      
      switch (field) {
        case 'Company Name':
          clientData.companyName = value;
          break;
        case 'Location':
          clientData.location = value;
          break;
        case 'Business Address':
          clientData.address = value;
          break;
        case 'Primary Phone':
          clientData.phone = value;
          break;
        case 'Business Email':
          clientData.email = value;
          break;
        case 'Website':
          clientData.website = value;
          break;
        case 'Business Hours':
          clientData.hours = value;
          break;
        case 'Company Bulletin':
          clientData.bulletin = value;
          break;
        case 'Pests Not Covered':
          clientData.pestsNotCovered = value;
          break;
      }
    }
    
    // Read services, technicians, etc. from other sheets
    clientData.services = readServicesFromSheet(spreadsheet);
    clientData.technicians = readTechniciansFromSheet(spreadsheet);
    clientData.serviceAreas = readServiceAreasFromSheet(spreadsheet);
    clientData.policies = readPoliciesFromSheet(spreadsheet);
    
    return clientData;
    
  } catch (error) {
    Logger.log('Error reading client data from sheet: ' + error.toString());
    return {};
  }
}

/**
 * Helper functions to read specific data types
 */
function readServicesFromSheet(spreadsheet) {
  try {
    const servicesSheet = spreadsheet.getSheetByName('Services');
    if (!servicesSheet) return [];
    
    const data = servicesSheet.getDataRange().getValues();
    const services = [];
    
    for (let i = 2; i < data.length; i++) { // Skip header rows
      if (data[i][0]) { // If service name exists
        services.push({
          name: data[i][0],
          serviceType: data[i][1],
          frequency: data[i][2],
          description: data[i][3],
          pests: data[i][4],
          contract: data[i][5],
          guarantee: data[i][6],
          duration: data[i][7],
          productType: data[i][8],
          billingFrequency: data[i][9],
          agentNote: data[i][10],
          queueExt: data[i][11],
          pricingTiers: JSON.parse(data[i][12] || '[]')
        });
      }
    }
    
    return services;
  } catch (error) {
    Logger.log('Error reading services: ' + error.toString());
    return [];
  }
}

function readTechniciansFromSheet(spreadsheet) {
  try {
    const techSheet = spreadsheet.getSheetByName('Technicians');
    if (!techSheet) return [];
    
    const data = techSheet.getDataRange().getValues();
    const technicians = [];
    
    for (let i = 2; i < data.length; i++) { // Skip header rows
      if (data[i][0]) { // If tech name exists
        technicians.push({
          name: data[i][0],
          company: data[i][1],
          role: data[i][2],
          phone: data[i][3],
          schedule: data[i][4],
          maxStops: data[i][5],
          doesNotService: data[i][6],
          additionalNotes: data[i][7],
          zipCodes: JSON.parse(data[i][8] || '[]')
        });
      }
    }
    
    return technicians;
  } catch (error) {
    Logger.log('Error reading technicians: ' + error.toString());
    return [];
  }
}

function readServiceAreasFromSheet(spreadsheet) {
  try {
    const areasSheet = spreadsheet.getSheetByName('Service Areas');
    if (!areasSheet) return [];
    
    const data = areasSheet.getDataRange().getValues();
    const serviceAreas = [];
    
    for (let i = 2; i < data.length; i++) { // Skip header rows
      if (data[i][0]) { // If zip code exists
        serviceAreas.push({
          zip: data[i][0],
          city: data[i][1],
          state: data[i][2],
          branch: data[i][3],
          territory: data[i][4],
          inService: data[i][5]
        });
      }
    }
    
    return serviceAreas;
  } catch (error) {
    Logger.log('Error reading service areas: ' + error.toString());
    return [];
  }
}

function readPoliciesFromSheet(spreadsheet) {
  try {
    const policiesSheet = spreadsheet.getSheetByName('Policies');
    if (!policiesSheet) return {};
    
    const data = policiesSheet.getDataRange().getValues();
    const policies = {};
    
    for (let i = 2; i < data.length; i++) { // Skip header rows
      if (data[i][0]) { // If category exists
        const category = data[i][0];
        if (!policies[category]) {
          policies[category] = [];
        }
        
        policies[category].push({
          type: data[i][1],
          title: data[i][2],
          description: data[i][3],
          options: JSON.parse(data[i][4] || '[]'),
          default: data[i][5]
        });
      }
    }
    
    return policies;
  } catch (error) {
    Logger.log('Error reading policies: ' + error.toString());
    return {};
  }
}
