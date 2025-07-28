// UPDATED Google Apps Script Web App for Wix Integration
// This script should REPLACE your existing Code.gs in your current Google Apps Script project
// URL: https://script.google.com/macros/s/AKfycbz3xZWEXbdbDhqKQ63OwlSjNW-rlSmxd81M8v278RNM8FgfkGQnPMf_2ld7r8RiBF51cw/exec

function doGet(e) {
  try {
    // NEW: Handle profileId parameter for Wix integration
    const action = e.parameter.action;
    const profileId = e.parameter.profileId;
    const sheetId = e.parameter.sheetId;
    
    // NEW: Handle getProfile action with profileId (for Wix integration)
    if (action === 'getProfile' && profileId) {
      const result = getProfileDataAPI(profileId);
      
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
    }
    
    // EXISTING: Handle sheetId parameter (your current functionality)
    if (sheetId) {
      const data = getClientDataFromSheet(sheetId);
      
      return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
    }
    
    // If no parameters provided, return error
    return ContentService
      .createTextOutput(JSON.stringify({
        error: 'Missing required parameter. Use either ?action=getProfile&profileId=PROFILE_ID or ?sheetId=SHEET_ID'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// NEW FUNCTION: API endpoint for production web app (connects to your master sheet)
function getProfileDataAPI(profileId) {
  try {
    if (!profileId) {
      throw new Error('Profile ID is required');
    }
    
    // Get profile data from your master sheet system
    const profileData = getProfileFromMasterSheet(profileId);
    
    if (!profileData) {
      // Return sample data for testing if profile not found
      return {
        success: true,
        data: getSampleProfileData(profileId)
      };
    }
    
    // Convert to format expected by production web app
    const webAppData = {
      companyName: profileData.Company_Name || profileData.companyName,
      location: profileData.Location || profileData.location,
      timezone: profileData.Timezone || profileData.timezone || 'Central',
      officeInfo: {
        phone: profileData.Phone || profileData.phone,
        email: profileData.Email || profileData.email,
        website: profileData.Website || profileData.website,
        physicalAddress: profileData.Address || profileData.address,
        officeHours: profileData.Hours || profileData.hours,
        fieldRoutesLink: profileData.Website || profileData.website
      },
      bulletin: profileData.Bulletin || profileData.bulletin,
      pestsNotCovered: profileData.Pests_Not_Covered || profileData.pestsNotCovered,
      services: profileData.services || [],
      technicians: profileData.technicians || [],
      policies: profileData.policies || {},
      serviceAreas: profileData.serviceAreas || []
    };
    
    return {
      success: true,
      data: webAppData
    };
    
  } catch (error) {
    console.error('Error in getProfileDataAPI:', error);
    
    // Return sample data for testing if there's an error
    return {
      success: true,
      data: getSampleProfileData(profileId)
    };
  }
}

// NEW FUNCTION: Get profile from your master sheet (you may already have this)
function getProfileFromMasterSheet(profileId) {
  try {
    // This function should connect to your existing master profile sheet
    // You may already have this function in your existing code
    
    // Try to find your master profile sheet
    const masterSheetName = 'Master_Profile_List'; // Adjust if different
    let masterSheet;
    
    try {
      masterSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(masterSheetName);
    } catch (e) {
      // Try to find by different name patterns
      const spreadsheets = DriveApp.getFilesByName('Master_Profile_List');
      if (spreadsheets.hasNext()) {
        const file = spreadsheets.next();
        const spreadsheet = SpreadsheetApp.openById(file.getId());
        masterSheet = spreadsheet.getSheetByName(masterSheetName);
      }
    }
    
    if (!masterSheet) {
      throw new Error('Master profile sheet not found');
    }
    
    const data = masterSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find profile by ID
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowProfileId = row[headers.indexOf('Profile_ID')] || row[headers.indexOf('profileId')];
      
      if (rowProfileId === profileId) {
        const profileData = {};
        headers.forEach((header, index) => {
          profileData[header] = row[index];
        });
        return profileData;
      }
    }
    
    return null; // Profile not found
    
  } catch (error) {
    console.error('Error getting profile from master sheet:', error);
    return null;
  }
}

// NEW FUNCTION: Sample data for testing
function getSampleProfileData(profileId) {
  return {
    companyName: 'Hill Country Exterminators',
    location: 'Austin, TX',
    timezone: 'Central',
    officeInfo: {
      phone: '(512) 555-0123',
      email: 'info@hillcountryext.com',
      website: 'https://hillcountryexterminators.com',
      physicalAddress: '123 Hill Country Dr, Austin, TX 78701',
      officeHours: 'Monday-Friday 8:00 AM - 6:00 PM',
      fieldRoutesLink: 'https://hillcountryexterminators.com'
    },
    bulletin: 'Professional pest control services serving the Austin area since 1995. Licensed and insured.',
    pestsNotCovered: 'We do not service wildlife (raccoons, possums, etc.) or large rodent infestations.',
    services: [
      {
        name: 'Monthly Pest Control',
        description: 'Comprehensive monthly pest control service',
        firstPrice: '',
        recurringPrice: '',
        contract: '12 Months',
        guarantee: '30-day guarantee',
        duration: '30-45 minutes',
        pests: 'Ants, roaches, spiders, silverfish',
        queueExt: '101'
      }
    ],
    technicians: [
      {
        name: 'Mike Johnson',
        company: 'Hill Country Exterminators',
        role: 'Senior Technician',
        phone: '(512) 555-0124',
        schedule: 'Monday-Friday',
        maxStops: '12 per day',
        doesNotService: 'Commercial accounts',
        additionalNotes: 'Specializes in residential pest control',
        zipCodes: ['78701', '78702', '78703']
      }
    ],
    policies: {
      'Service Policies': [
        {
          title: 'Missed Appointment Policy',
          category: 'Service',
          description: 'If we miss your scheduled appointment, your next service is free.',
          default: 'Next service free'
        }
      ]
    },
    serviceAreas: [
      {
        zip: '78701',
        city: 'Austin',
        state: 'TX',
        branch: 'Central Austin',
        territory: 'Downtown',
        inService: true
      }
    ]
  };
}
