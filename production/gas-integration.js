// Google Apps Script Web App for Wix Integration
// This script should be deployed as a Web App from Google Apps Script

function doGet(e) {
  try {
    const sheetId = e.parameter.sheetId;
    
    if (!sheetId) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Missing sheetId parameter'}))
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
    const sheetId = data.sheetId;
    
    if (!sheetId) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Missing sheetId'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle POST requests for updating data
    const result = updateClientDataInSheet(sheetId, data);
    
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
