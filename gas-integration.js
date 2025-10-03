// Google Apps Script Web App for GitHub Pages Integration
// This script should be deployed as a Web App from Google Apps Script

function doGet(e) {
  try {
    // Check if requesting data by profileId
    const profileId = e.parameter.profileId;

    if (profileId) {
      return getProfileDataById(profileId);
    }

    // Legacy support for sheetId-based requests
    const sheetId = e.parameter.sheetId;

    if (!sheetId) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Missing profileId or sheetId parameter'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = getClientDataFromSheet(sheetId);

    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });

  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Generate unique profileId if not provided
    if (!data.profileId) {
      data.profileId = generateUniqueProfileId();
    }

    // Write to master sheet
    const result = createClientProfileInMasterSheet(data);

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });

  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getClientDataFromSheet(sheetId) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId);
    
    // Get basic client info from the first sheet
    const clientSheet = sheet.getSheets()[0];
    const clientData = parseClientInfo(clientSheet);
    
    // Get services data
    const servicesSheet = sheet.getSheetByName('Services');
    if (servicesSheet) {
      clientData.services = parseServicesData(servicesSheet);
    }
    
    // Get technicians data  
    const techSheet = sheet.getSheetByName('Technicians');
    if (techSheet) {
      clientData.technicians = parseTechniciansData(techSheet);
    }
    
    // Get policies data
    const policiesSheet = sheet.getSheetByName('Policies');
    if (policiesSheet) {
      clientData.policies = parsePoliciesData(policiesSheet);
    }
    
    // Get service areas data
    const areasSheet = sheet.getSheetByName('Service Areas');
    if (areasSheet) {
      clientData.serviceAreas = parseServiceAreasData(areasSheet);
    }
    
    return clientData;
    
  } catch (error) {
    console.error('Error getting client data:', error);
    throw new Error('Failed to read sheet data: ' + error.message);
  }
}

function parseClientInfo(sheet) {
  const data = sheet.getDataRange().getValues();
  const clientData = {
    companyName: '',
    location: '',
    timezone: 'Central',
    officeInfo: {
      phone: '',
      email: '',
      website: '',
      fieldRoutesLink: '',
      physicalAddress: '',
      officeHours: ''
    },
    bulletin: '',
    pestsNotCovered: ''
  };
  
  // Parse client information from the sheet
  // Assuming the format from your existing Apps Script
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row[0] && row[1]) {
      switch (row[0].toString().toLowerCase()) {
        case 'company name':
          clientData.companyName = row[1];
          break;
        case 'location':
          clientData.location = row[1];
          break;
        case 'timezone':
          clientData.timezone = row[1];
          break;
        case 'phone':
          clientData.officeInfo.phone = row[1];
          break;
        case 'email':
          clientData.officeInfo.email = row[1];
          break;
        case 'website':
          clientData.officeInfo.website = row[1];
          break;
        case 'fieldroutes link':
          clientData.officeInfo.fieldRoutesLink = row[1];
          break;
        case 'address':
          clientData.officeInfo.physicalAddress = row[1];
          break;
        case 'office hours':
          clientData.officeInfo.officeHours = row[1];
          break;
        case 'bulletin':
          clientData.bulletin = row[1];
          break;
        case 'pests not covered':
          clientData.pestsNotCovered = row[1];
          break;
      }
    }
  }
  
  return clientData;
}

function parseServicesData(sheet) {
  const data = sheet.getDataRange().getValues();
  const services = [];
  
  if (data.length < 2) return services;
  
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) { // If there's a service name
      const service = {};
      
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          service[header.toLowerCase().replace(/\s+/g, '')] = row[index];
        }
      });
      
      services.push(service);
    }
  }
  
  return services;
}

function parseTechniciansData(sheet) {
  const data = sheet.getDataRange().getValues();
  const technicians = [];
  
  if (data.length < 2) return technicians;
  
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) { // If there's a technician name
      const tech = {};
      
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          let value = row[index];
          
          // Special handling for ZIP codes
          if (header.toLowerCase().includes('zip')) {
            value = value.toString().split(',').map(zip => zip.trim());
          }
          
          tech[header.toLowerCase().replace(/\s+/g, '')] = value;
        }
      });
      
      technicians.push(tech);
    }
  }
  
  return technicians;
}

function parsePoliciesData(sheet) {
  const data = sheet.getDataRange().getValues();
  const policies = {};
  
  if (data.length < 2) return policies;
  
  let currentCategory = '';
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Check if this is a category header (colored background)
    if (row[0] && !row[1] && !row[2]) {
      currentCategory = row[0];
      policies[currentCategory] = [];
    } else if (row[0] && row[1] && currentCategory) {
      // This is a policy item
      policies[currentCategory].push({
        type: row[0].toLowerCase().replace(/\s+/g, ''),
        title: row[0],
        description: row[1] || '',
        default: row[2] || '',
        options: row[3] ? row[3].split(',').map(opt => opt.trim()) : []
      });
    }
  }
  
  return policies;
}

function parseServiceAreasData(sheet) {
  const data = sheet.getDataRange().getValues();
  const serviceAreas = [];
  
  if (data.length < 2) return serviceAreas;
  
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) { // If there's a ZIP code
      const area = {};
      
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          let value = row[index];
          
          // Special handling for boolean fields
          if (header.toLowerCase().includes('service')) {
            value = value.toString().toLowerCase() === 'true' || value.toString().toLowerCase() === 'yes';
          }
          
          area[header.toLowerCase().replace(/\s+/g, '')] = value;
        }
      });
      
      serviceAreas.push(area);
    }
  }
  
  return serviceAreas;
}

function updateClientDataInSheet(sheetId, data) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId);
    
    // Update basic client info
    if (data.clientInfo) {
      updateClientInfoSheet(sheet.getSheets()[0], data.clientInfo);
    }
    
    // Update other sheets as needed
    if (data.services) {
      const servicesSheet = sheet.getSheetByName('Services');
      if (servicesSheet) {
        updateServicesSheet(servicesSheet, data.services);
      }
    }
    
    // Add more update logic as needed
    
    return { success: true, message: 'Data updated successfully' };
    
  } catch (error) {
    console.error('Error updating sheet:', error);
    return { success: false, error: error.message };
  }
}

function updateClientInfoSheet(sheet, clientInfo) {
  // Implementation for updating client info
  // This would update the basic client information in the sheet
}

function updateServicesSheet(sheet, services) {
  // Implementation for updating services
  // This would update the services data in the sheet
}

// Generate unique profile ID
function generateUniqueProfileId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return 'profile_' + timestamp + '_' + random;
}

// Create client profile in master sheet
function createClientProfileInMasterSheet(data) {
  try {
    // You'll need to set this to your actual master sheet ID
    const MASTER_SHEET_ID = 'YOUR_MASTER_SHEET_ID';
    const sheet = SpreadsheetApp.openById(MASTER_SHEET_ID);
    const masterSheet = sheet.getSheetByName('Profiles') || sheet.getSheets()[0];

    // Get existing data to check for duplicates
    const existingData = masterSheet.getDataRange().getValues();

    // Check if profileId already exists
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][0] === data.profileId) {
        throw new Error('Profile with this ID already exists');
      }
    }

    // Prepare data for insertion
    const profileRow = [
      data.profileId,
      data.companyName || '',
      data.location || '',
      data.timezone || 'Central',
      data.phone || '',
      data.email || '',
      data.website || '',
      data.address || '',
      data.hours || '',
      data.bulletin || '',
      data.pestsNotCovered || '',
      new Date().toISOString(), // createdAt
      new Date().toISOString(), // updatedAt
      'ACTIVE' // status
    ];

    // Append to master sheet
    masterSheet.appendRow(profileRow);

    // Handle related data (services, technicians, etc.)
    if (data.services && data.services.length > 0) {
      saveServicesData(sheet, data.profileId, data.services);
    }

    if (data.technicians && data.technicians.length > 0) {
      saveTechniciansData(sheet, data.profileId, data.technicians);
    }

    if (data.serviceAreas && data.serviceAreas.length > 0) {
      saveServiceAreasData(sheet, data.profileId, data.serviceAreas);
    }

    // Generate GitHub Pages URL
    const profileUrl = 'https://YOUR_USERNAME.github.io/YOUR_REPO/?profileId=' + data.profileId;

    return {
      success: true,
      message: 'Profile created successfully',
      profileId: data.profileId,
      profileUrl: profileUrl
    };

  } catch (error) {
    console.error('Error creating profile:', error);
    throw new Error('Failed to create profile: ' + error.message);
  }
}

// Get profile data by ID
function getProfileDataById(profileId) {
  try {
    const MASTER_SHEET_ID = 'YOUR_MASTER_SHEET_ID';
    const sheet = SpreadsheetApp.openById(MASTER_SHEET_ID);
    const masterSheet = sheet.getSheetByName('Profiles') || sheet.getSheets()[0];

    const data = masterSheet.getDataRange().getValues();

    // Find the profile row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === profileId) {
        const profileData = {
          profileId: row[0],
          companyName: row[1],
          location: row[2],
          timezone: row[3],
          officeInfo: {
            phone: row[4],
            email: row[5],
            website: row[6],
            address: row[7],
            hours: row[8]
          },
          bulletin: row[9],
          pestsNotCovered: row[10],
          createdAt: row[11],
          updatedAt: row[12],
          status: row[13]
        };

        // Get related data
        profileData.services = getServicesData(sheet, profileId);
        profileData.technicians = getTechniciansData(sheet, profileId);
        profileData.serviceAreas = getServiceAreasData(sheet, profileId);

        return ContentService
          .createTextOutput(JSON.stringify(profileData))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({error: 'Profile not found'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error getting profile:', error);
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper functions for related data
function saveServicesData(sheet, profileId, services) {
  let servicesSheet = sheet.getSheetByName('Services');
  if (!servicesSheet) {
    servicesSheet = sheet.insertSheet('Services');
    servicesSheet.appendRow(['ProfileID', 'ServiceName', 'Description', 'ServiceType', 'Frequency', 'Contract', 'Guarantee', 'Duration', 'Pests', 'ProductType', 'BillingFrequency', 'QueueExt', 'PricingTiers']);
  }

  services.forEach(service => {
    servicesSheet.appendRow([
      profileId,
      service.name || '',
      service.description || '',
      service.serviceType || '',
      service.frequency || '',
      service.contract || '',
      service.guarantee || '',
      service.duration || '',
      service.pests || '',
      service.productType || '',
      service.billingFrequency || '',
      service.queueExt || '',
      JSON.stringify(service.pricingTiers || [])
    ]);
  });
}

function getServicesData(sheet, profileId) {
  const servicesSheet = sheet.getSheetByName('Services');
  if (!servicesSheet) return [];

  const data = servicesSheet.getDataRange().getValues();
  const services = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === profileId) {
      services.push({
        name: row[1],
        description: row[2],
        serviceType: row[3],
        frequency: row[4],
        contract: row[5],
        guarantee: row[6],
        duration: row[7],
        pests: row[8],
        productType: row[9],
        billingFrequency: row[10],
        queueExt: row[11],
        pricingTiers: JSON.parse(row[12] || '[]')
      });
    }
  }

  return services;
}

function saveTechniciansData(sheet, profileId, technicians) {
  let techSheet = sheet.getSheetByName('Technicians');
  if (!techSheet) {
    techSheet = sheet.insertSheet('Technicians');
    techSheet.appendRow(['ProfileID', 'Name', 'Role', 'Schedule', 'MaxStops', 'Phone', 'ZipCode', 'ServicesNotProvided', 'Notes']);
  }

  technicians.forEach(tech => {
    techSheet.appendRow([
      profileId,
      tech.name || '',
      tech.role || '',
      tech.schedule || '',
      tech.maxStops || '',
      tech.phone || '',
      tech.zipCode || '',
      tech.doesNotService || '',
      tech.notes || ''
    ]);
  });
}

function getTechniciansData(sheet, profileId) {
  const techSheet = sheet.getSheetByName('Technicians');
  if (!techSheet) return [];

  const data = techSheet.getDataRange().getValues();
  const technicians = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === profileId) {
      technicians.push({
        name: row[1],
        role: row[2],
        schedule: row[3],
        maxStops: row[4],
        phone: row[5],
        zipCode: row[6],
        doesNotService: row[7],
        notes: row[8]
      });
    }
  }

  return technicians;
}

function saveServiceAreasData(sheet, profileId, serviceAreas) {
  let areaSheet = sheet.getSheetByName('ServiceAreas');
  if (!areaSheet) {
    areaSheet = sheet.insertSheet('ServiceAreas');
    areaSheet.appendRow(['ProfileID', 'Zip', 'City', 'State', 'Branch', 'InService', 'Notes']);
  }

  serviceAreas.forEach(area => {
    areaSheet.appendRow([
      profileId,
      area.zip || '',
      area.city || '',
      area.state || '',
      area.branch || '',
      area.inService || 'true',
      area.notes || ''
    ]);
  });
}

function getServiceAreasData(sheet, profileId) {
  const areaSheet = sheet.getSheetByName('ServiceAreas');
  if (!areaSheet) return [];

  const data = areaSheet.getDataRange().getValues();
  const serviceAreas = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === profileId) {
      serviceAreas.push({
        zip: row[1],
        city: row[2],
        state: row[3],
        branch: row[4],
        inService: row[5] === 'true',
        notes: row[6]
      });
    }
  }

  return serviceAreas;
}

// Test function for development
function testGetData() {
  const testSheetId = 'YOUR_TEST_SHEET_ID';
  try {
    const data = getClientDataFromSheet(testSheetId);
    console.log('Test data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}
