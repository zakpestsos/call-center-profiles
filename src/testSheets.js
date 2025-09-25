/**
 * Test Suite for Google Sheets Integration
 * Creates sample client sheets to demonstrate functionality
 */

/**
 * Creates a test client profile to demonstrate the Google Sheets functionality
 */
function createTestClientProfile() {
  try {
    Logger.log('=== CREATING TEST CLIENT PROFILE ===');
    
    // Sample client data that matches the HTML form structure
    const testClientData = {
      companyName: 'ACME Pest Control',
      location: 'Dallas, TX',
      address: '123 Pest Control Way, Dallas, TX 75001',
      phone: '(972) 555-PEST',
      email: 'contact@acmepest.com',
      website: 'https://acmepest.com',
      hours: 'Monday-Friday: 8:00 AM - 5:00 PM\nSaturday: 8:00 AM - 12:00 PM\nSunday: Emergency Only',
      bulletin: 'ACME Pest Control has been serving the Dallas area for over 25 years. We specialize in comprehensive pest management solutions for residential and commercial properties.',
      pestsNotCovered: 'Large wildlife, Bees (refer to local beekeeper), Skunks (refer to wildlife removal)',
      
      // Office information
      officeInfo: {
        googleDriveFolder: 'https://drive.google.com/drive/folders/test-folder-id',
        wixLink: 'https://acmepest.wixsite.com/mysite',
        locations: 'Dallas, Plano, Frisco, Allen',
        timezone: 'Central',
        officePhone: '(972) 555-PEST',
        customerContactEmail: 'service@acmepest.com',
        physicalAddress: '123 Pest Control Way\nDallas, TX 75001',
        mailingAddress: 'PO Box 12345\nDallas, TX 75001',
        officeHours: 'Monday-Friday: 8:00 AM - 5:00 PM\nSaturday: 8:00 AM - 12:00 PM\nSunday: Emergency Only',
        holidays: ['New Year\'s Day', 'Independence Day', 'Thanksgiving', 'Christmas'],
        website: 'https://acmepest.com',
        fieldRoutesLink: 'https://app.fieldroutes.com/acmepest'
      },
      
      // Services with pricing tiers
      services: [
        {
          name: 'Quarterly General Pest Control',
          category: 'standard',
          type: 'recurring',
          description: 'Comprehensive interior and exterior treatment for common household pests',
          pests: 'Ants, Roaches, Spiders, Crickets, Silverfish, Earwigs',
          frequency: 'quarterly',
          contract: '12 Months',
          guarantee: '90-day guarantee between services',
          callAhead: 'Yes',
          initialDuration: '45-60 minutes',
          recurringDuration: '30-45 minutes',
          leaveDuringService: 'No',
          followUp: 'None unless issues',
          prepSheet: 'No',
          pricingTiers: [
            {
              sqftMin: 0,
              sqftMax: 2500,
              firstPrice: '$125.00',
              recurringPrice: '$120.00',
              serviceType: 'Quarterly GPC'
            },
            {
              sqftMin: 2501,
              sqftMax: 3500,
              firstPrice: '$135.00',
              recurringPrice: '$130.00',
              serviceType: 'Quarterly GPC'
            },
            {
              sqftMin: 3501,
              sqftMax: 5000,
              firstPrice: '$155.00',
              recurringPrice: '$150.00',
              serviceType: 'Quarterly GPC'
            }
          ]
        },
        {
          name: 'Monthly Mosquito Control',
          category: 'specialty',
          type: 'recurring',
          description: 'Monthly barrier spray treatment for mosquito control',
          pests: 'Mosquitoes, Fleas, Ticks',
          frequency: 'monthly',
          contract: 'Seasonal (April - October)',
          guarantee: '30-day guarantee',
          callAhead: 'Yes',
          initialDuration: '30 minutes',
          recurringDuration: '20-30 minutes',
          leaveDuringService: 'Yes',
          followUp: 'None',
          prepSheet: 'Yes',
          pricingTiers: [
            {
              sqftMin: 0,
              sqftMax: 10000,
              firstPrice: '$85.00',
              recurringPrice: '$75.00',
              serviceType: 'Monthly Mosquito'
            },
            {
              sqftMin: 10001,
              sqftMax: 20000,
              firstPrice: '$95.00',
              recurringPrice: '$85.00',
              serviceType: 'Monthly Mosquito'
            }
          ]
        },
        {
          name: 'Termite Inspection',
          category: 'termite',
          type: 'inspection',
          description: 'Comprehensive termite inspection for real estate transactions',
          pests: 'Termites, Wood-destroying insects',
          frequency: 'one-time',
          contract: 'None',
          guarantee: 'Report accuracy guaranteed',
          callAhead: 'Yes',
          initialDuration: '60-90 minutes',
          recurringDuration: 'N/A',
          leaveDuringService: 'No',
          followUp: 'Report within 24 hours',
          prepSheet: 'No',
          pricingTiers: [
            {
              sqftMin: 0,
              sqftMax: 99999,
              firstPrice: '$125.00',
              recurringPrice: 'N/A',
              serviceType: 'Termite Inspection'
            }
          ]
        }
      ],
      
      // Technicians
      technicians: [
        {
          name: 'John Smith',
          role: 'Both',
          schedule: 'Monday-Friday 8AM-5PM',
          maxStops: 12,
          doesNotService: 'Commercial Buildings over 3 stories',
          phone: '(972) 555-0101',
          zipCode: '75001 - North Dallas',
          notes: 'Lead technician, 10+ years experience, bilingual (English/Spanish)'
        },
        {
          name: 'Sarah Johnson',
          role: 'Technician',
          schedule: 'Tuesday-Saturday 7AM-4PM',
          maxStops: 10,
          doesNotService: 'Termite treatments, Large commercial',
          phone: '(972) 555-0102',
          zipCode: '75023 - Plano/Frisco',
          notes: 'Specialist in residential pest control, excellent customer service'
        },
        {
          name: 'Mike Rodriguez',
          role: 'Inspector',
          schedule: 'Monday-Friday 9AM-6PM',
          maxStops: 8,
          doesNotService: 'N/A',
          phone: '(972) 555-0103',
          zipCode: '75002 - Allen/McKinney',
          notes: 'Licensed termite inspector, real estate specialist'
        }
      ],
      
      // Service Areas
      serviceAreas: [
        { zip: '75001', city: 'Addison', state: 'TX', branch: 'North Dallas Branch', inService: 'true' },
        { zip: '75002', city: 'Allen', state: 'TX', branch: 'North Dallas Branch', inService: 'true' },
        { zip: '75023', city: 'Plano', state: 'TX', branch: 'North Dallas Branch', inService: 'true' },
        { zip: '75034', city: 'Frisco', state: 'TX', branch: 'North Dallas Branch', inService: 'true' },
        { zip: '75069', city: 'McKinney', state: 'TX', branch: 'North Dallas Branch', inService: 'true' },
        { zip: '75025', city: 'Plano', state: 'TX', branch: 'North Dallas Branch', inService: 'true' },
        { zip: '75075', city: 'Plano', state: 'TX', branch: 'North Dallas Branch', inService: 'true' }
      ],
      
      // Policies
      policies: {
        cancellation: 'Customers may cancel services with 24-hour notice. Cancellations on the day of service may incur a trip charge.',
        guarantee: 'We guarantee our work for 90 days. If pests return within the guarantee period, we will re-treat at no additional charge.',
        payment: 'Payment is due upon completion of service. We accept cash, check, and all major credit cards. Automatic payment plans available.',
        emergency: 'Emergency services available 24/7 for urgent pest issues. Emergency service calls incur a $75 after-hours fee.',
        insurance: 'Fully licensed and insured. General liability: $2M, Workers compensation: Full coverage. License #PCO12345.'
      }
    };
    
    Logger.log('Creating test sheets for: ' + testClientData.companyName);
    
    // 1. Create the individual client sheet
    const clientSheetUrl = createEditableClientSheet(testClientData);
    Logger.log('✓ Client sheet created: ' + clientSheetUrl);
    
    // 2. Create in client's drive folder (simulated)
    const driveSheetUrl = createClientDriveSheet(testClientData);
    Logger.log('✓ Drive folder sheet created: ' + driveSheetUrl);
    
    // 3. Update master profile database
    const masterDbUrl = updateMasterProfileDatabase(testClientData, clientSheetUrl, driveSheetUrl);
    Logger.log('✓ Master database updated: ' + masterDbUrl);
    
    // Show success message with all URLs
    const message = `✅ TEST CLIENT PROFILE CREATED SUCCESSFULLY!

📊 Main Editable Sheet: ${clientSheetUrl}

📁 Client Drive Sheet: ${driveSheetUrl}

🗄️ Master Profile Database: ${masterDbUrl}

🔍 Test Data Includes:
• 3 Services with pricing tiers
• 3 Technicians with territories
• 7 Service area ZIP codes
• Complete policy information
• Office details and contact info

Next Steps:
1. Open the sheets to review the structure
2. Test editing data in the sheets
3. Run syncUpdatesToWix() to sync changes`;

    SpreadsheetApp.getUi().alert('Test Complete!', message, SpreadsheetApp.getUi().Button.OK);
    
    return {
      success: true,
      clientSheetUrl: clientSheetUrl,
      driveSheetUrl: driveSheetUrl,
      masterDbUrl: masterDbUrl,
      testData: testClientData
    };
    
  } catch (error) {
    Logger.log('Error creating test client profile: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error', 'Failed to create test profile: ' + error.message, SpreadsheetApp.getUi().Button.OK);
    throw error;
  }
}

/**
 * Creates a standalone sheet in the client's Google Drive folder
 * @param {Object} clientData - The client data
 * @returns {string} The sheet URL in the client's drive
 */
function createClientDriveSheet(clientData) {
  try {
    Logger.log('Creating client drive sheet for: ' + clientData.companyName);
    
    // Create a copy specifically for the client's drive folder
    const driveSheetName = `${clientData.companyName} - Profile & Services`;
    const driveSpreadsheet = SpreadsheetApp.create(driveSheetName);
    
    // Set up sheets with client-friendly layout
    setupClientDriveSheets(driveSpreadsheet, clientData);
    
    // Move to client's drive folder if specified
    if (clientData.officeInfo?.googleDriveFolder) {
      try {
        const folderId = extractFolderIdFromUrl(clientData.officeInfo.googleDriveFolder);
        const folder = DriveApp.getFolderById(folderId);
        const file = DriveApp.getFileById(driveSpreadsheet.getId());
        folder.addFile(file);
        DriveApp.getRootFolder().removeFile(file);
        Logger.log('Sheet moved to client drive folder');
      } catch (folderError) {
        Logger.log('Could not move to client folder: ' + folderError.message);
        // Continue without moving to folder
      }
    }
    
    return driveSpreadsheet.getUrl();
    
  } catch (error) {
    Logger.log('Error creating client drive sheet: ' + error.toString());
    throw error;
  }
}

/**
 * Sets up client-friendly sheets in their drive folder
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The spreadsheet
 * @param {Object} clientData - The client data
 */
function setupClientDriveSheets(spreadsheet, clientData) {
  // Clear default sheet
  const defaultSheet = spreadsheet.getSheets()[0];
  defaultSheet.setName('Company Overview');
  defaultSheet.clear();
  
  // 1. Company Overview Sheet
  setupCompanyOverviewSheet(defaultSheet, clientData);
  
  // 2. Services & Pricing Sheet
  const servicesSheet = spreadsheet.insertSheet('Services & Pricing');
  setupClientServicesSheet(servicesSheet, clientData);
  
  // 3. Team & Coverage Sheet
  const teamSheet = spreadsheet.insertSheet('Team & Coverage');
  setupTeamCoverageSheet(teamSheet, clientData);
  
  // 4. Policies & Procedures Sheet
  const policiesSheet = spreadsheet.insertSheet('Policies & Procedures');
  setupClientPoliciesSheet(policiesSheet, clientData);
}

/**
 * Updates the master profile database with client information
 * @param {Object} clientData - The client data
 * @param {string} clientSheetUrl - URL of the main client sheet
 * @param {string} driveSheetUrl - URL of the client's drive sheet
 * @returns {string} Master database URL
 */
function updateMasterProfileDatabase(clientData, clientSheetUrl, driveSheetUrl) {
  try {
    Logger.log('Updating master profile database...');
    
    // Find or create master profile database
    const dbName = 'SOS_Master_Profile_Database';
    let masterDb;
    
    const files = DriveApp.getFilesByName(dbName);
    if (files.hasNext()) {
      masterDb = SpreadsheetApp.openById(files.next().getId());
    } else {
      masterDb = SpreadsheetApp.create(dbName);
      setupMasterProfileDatabase(masterDb);
    }
    
    // Add client to main profiles sheet
    const profilesSheet = masterDb.getSheetByName('Client Profiles');
    const lastRow = profilesSheet.getLastRow();
    const clientId = 'SOS-' + String(lastRow).padStart(4, '0');
    
    const profileRow = [
      clientId,
      clientData.companyName,
      clientData.location || clientData.officeInfo?.locations,
      'Active',
      new Date(),
      new Date(),
      clientData.officeInfo?.customerContactEmail || clientData.email,
      clientData.officeInfo?.officePhone || clientData.phone,
      clientData.officeInfo?.website || clientData.website,
      clientData.services?.length || 0,
      clientData.technicians?.length || 0,
      clientData.serviceAreas?.length || 0,
      clientSheetUrl,
      driveSheetUrl,
      '', // Wix Profile URL (to be filled when Wix profile is created)
      clientData.officeInfo?.googleDriveFolder || 'Not specified'
    ];
    
    profilesSheet.getRange(lastRow + 1, 1, 1, profileRow.length).setValues([profileRow]);
    
    Logger.log('Added profile to master database: ' + clientId);
    return masterDb.getUrl();
    
  } catch (error) {
    Logger.log('Error updating master profile database: ' + error.toString());
    throw error;
  }
}

/**
 * Sets up the master profile database structure
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The master database
 */
function setupMasterProfileDatabase(spreadsheet) {
  // Rename default sheet
  const defaultSheet = spreadsheet.getSheets()[0];
  defaultSheet.setName('Client Profiles');
  
  // Set up headers for the master profile database
  const headers = [
    'Client ID', 'Company Name', 'Location', 'Status', 'Created Date', 'Last Updated',
    'Contact Email', 'Contact Phone', 'Website', 'Services Count', 'Technicians Count',
    'Service Areas Count', 'Main Sheet URL', 'Client Drive URL', 'Wix Profile URL', 'Drive Folder'
  ];
  
  defaultSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  defaultSheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#1f4e79')
    .setFontColor('white');
  
  // Auto-resize columns
  defaultSheet.autoResizeColumns(1, headers.length);
  
  // Add summary sheet
  const summarySheet = spreadsheet.insertSheet('Database Summary');
  setupDatabaseSummary(summarySheet);
}

/**
 * Extracts folder ID from Google Drive URL
 * @param {string} driveUrl - The Google Drive folder URL
 * @returns {string} The folder ID
 */
function extractFolderIdFromUrl(driveUrl) {
  const match = driveUrl.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  if (match) {
    return match[1];
  }
  throw new Error('Invalid Google Drive folder URL');
}

/**
 * Sets up company overview sheet for client drive
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet
 * @param {Object} clientData - The client data
 */
function setupCompanyOverviewSheet(sheet, clientData) {
  // Title
  sheet.getRange('A1').setValue(clientData.companyName + ' - Company Profile')
    .setFontSize(18).setFontWeight('bold').setBackground('#1f4e79').setFontColor('white');
  sheet.getRange('A1:D1').merge();
  
  // Basic information
  const basicInfo = [
    ['Company Information', '', '', ''],
    ['Company Name:', clientData.companyName, '', ''],
    ['Location:', clientData.location || clientData.officeInfo?.locations, '', ''],
    ['Phone:', clientData.officeInfo?.officePhone || clientData.phone, '', ''],
    ['Email:', clientData.officeInfo?.customerContactEmail || clientData.email, '', ''],
    ['Website:', clientData.officeInfo?.website || clientData.website, '', ''],
    ['', '', '', ''],
    ['Business Hours:', '', '', ''],
    [clientData.officeInfo?.officeHours || clientData.hours || 'Not specified', '', '', ''],
    ['', '', '', ''],
    ['Company Description:', '', '', ''],
    [clientData.bulletin || 'No description provided', '', '', '']
  ];
  
  sheet.getRange(3, 1, basicInfo.length, 4).setValues(basicInfo);
  sheet.getRange(3, 1, 1, 4).setFontWeight('bold').setBackground('#e6f3ff');
  
  // Auto-resize
  sheet.autoResizeColumns(1, 4);
}

/**
 * Sets up services sheet for client drive
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet
 * @param {Object} clientData - The client data
 */
function setupClientServicesSheet(sheet, clientData) {
  // Title
  sheet.getRange('A1').setValue('Services & Pricing')
    .setFontSize(16).setFontWeight('bold').setBackground('#28a745').setFontColor('white');
  sheet.getRange('A1:G1').merge();
  
  // Headers
  const headers = ['Service Name', 'Description', 'Frequency', 'Pricing Tiers', 'Contract', 'Guarantee', 'Notes'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(3, 1, 1, headers.length).setFontWeight('bold').setBackground('#d4edda');
  
  // Service data
  if (clientData.services && clientData.services.length > 0) {
    let row = 4;
    clientData.services.forEach(service => {
      const pricingInfo = service.pricingTiers ? 
        service.pricingTiers.map(tier => 
          `${tier.sqftMin}-${tier.sqftMax} sqft: First $${tier.firstPrice}, Recurring $${tier.recurringPrice}`
        ).join('\n') : 
        'Contact for pricing';
      
      const serviceRow = [
        service.name,
        service.description,
        service.frequency,
        pricingInfo,
        service.contract,
        service.guarantee,
        service.notes || ''
      ];
      
      sheet.getRange(row, 1, 1, serviceRow.length).setValues([serviceRow]);
      row++;
    });
  }
  
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Sets up team and coverage sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet
 * @param {Object} clientData - The client data
 */
function setupTeamCoverageSheet(sheet, clientData) {
  // Team section
  sheet.getRange('A1').setValue('Our Team')
    .setFontSize(16).setFontWeight('bold').setBackground('#ffc107').setFontColor('black');
  sheet.getRange('A1:E1').merge();
  
  if (clientData.technicians && clientData.technicians.length > 0) {
    const techHeaders = ['Name', 'Role', 'Schedule', 'Territory', 'Contact'];
    sheet.getRange(3, 1, 1, techHeaders.length).setValues([techHeaders]);
    sheet.getRange(3, 1, 1, techHeaders.length).setFontWeight('bold').setBackground('#fff3cd');
    
    let row = 4;
    clientData.technicians.forEach(tech => {
      const techRow = [
        tech.name,
        tech.role,
        tech.schedule,
        tech.zipCode,
        tech.phone
      ];
      sheet.getRange(row, 1, 1, techRow.length).setValues([techRow]);
      row++;
    });
  }
  
  // Service areas section
  const areasStartRow = Math.max(8, (clientData.technicians?.length || 0) + 6);
  sheet.getRange(areasStartRow, 1).setValue('Service Areas')
    .setFontSize(16).setFontWeight('bold').setBackground('#17a2b8').setFontColor('white');
  sheet.getRange(areasStartRow, 1, 1, 4).merge();
  
  if (clientData.serviceAreas && clientData.serviceAreas.length > 0) {
    const areaHeaders = ['ZIP Code', 'City', 'State', 'Branch'];
    sheet.getRange(areasStartRow + 2, 1, 1, areaHeaders.length).setValues([areaHeaders]);
    sheet.getRange(areasStartRow + 2, 1, 1, areaHeaders.length).setFontWeight('bold').setBackground('#d1ecf1');
    
    let row = areasStartRow + 3;
    clientData.serviceAreas.forEach(area => {
      const areaRow = [area.zip, area.city, area.state, area.branch];
      sheet.getRange(row, 1, 1, areaRow.length).setValues([areaRow]);
      row++;
    });
  }
  
  sheet.autoResizeColumns(1, 5);
}

/**
 * Sets up policies sheet for client drive
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet
 * @param {Object} clientData - The client data
 */
function setupClientPoliciesSheet(sheet, clientData) {
  sheet.getRange('A1').setValue('Policies & Procedures')
    .setFontSize(16).setFontWeight('bold').setBackground('#dc3545').setFontColor('white');
  sheet.getRange('A1:C1').merge();
  
  const policies = [
    ['Policy Type', 'Details', ''],
    ['Cancellation Policy', clientData.policies?.cancellation || 'Not specified', ''],
    ['Service Guarantee', clientData.policies?.guarantee || 'Not specified', ''],
    ['Payment Terms', clientData.policies?.payment || 'Not specified', ''],
    ['Emergency Services', clientData.policies?.emergency || 'Not specified', ''],
    ['Insurance & Licensing', clientData.policies?.insurance || 'Not specified', '']
  ];
  
  sheet.getRange(3, 1, policies.length, 3).setValues(policies);
  sheet.getRange(3, 1, 1, 3).setFontWeight('bold').setBackground('#f8d7da');
  
  sheet.autoResizeColumns(1, 3);
}

/**
 * Sets up database summary sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The summary sheet
 */
function setupDatabaseSummary(sheet, clientData) {
  sheet.getRange('A1').setValue('SOS Master Profile Database - Summary')
    .setFontSize(18).setFontWeight('bold').setBackground('#1f4e79').setFontColor('white');
  sheet.getRange('A1:D1').merge();
  
  const summaryData = [
    ['Database Statistics', '', '', ''],
    ['Total Clients:', '=COUNTA(\'Client Profiles\'!B:B)-1', '', ''],
    ['Active Clients:', '=COUNTIF(\'Client Profiles\'!D:D,"Active")', '', ''],
    ['Last Updated:', '=MAX(\'Client Profiles\'!F:F)', '', ''],
    ['', '', '', ''],
    ['Quick Actions', '', '', ''],
    ['View All Clients', '=HYPERLINK("#gid=0","Go to Client Profiles")', '', ''],
    ['', '', '', ''],
    ['Instructions', '', '', ''],
    ['• Use Client Profiles sheet to view all client data', '', '', ''],
    ['• Click URLs to access individual client sheets', '', '', ''],
    ['• Contact info and stats are automatically calculated', '', '', '']
  ];
  
  sheet.getRange(3, 1, summaryData.length, 4).setValues(summaryData);
  sheet.autoResizeColumns(1, 4);
}
