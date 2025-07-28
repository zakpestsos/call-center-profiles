// Google Apps Script Web App for Wix Integration - UPDATED
// This script should be deployed as a Web App from Google Apps Script
function doGet(e) {
  try {
    // Handle different types of requests
    const action = e.parameter.action;
    const sheetId = e.parameter.sheetId;
    const profileId = e.parameter.profileId;
    let data;
    
    if (action === "getProfile" && profileId) {
      // New: Handle profile ID requests
      data = getProfileById(profileId);
    } else if (sheetId) {
      // Legacy: Handle sheet ID requests  
      data = getClientDataFromSheet(sheetId);
    } else {
      throw new Error("Missing required parameters. Provide either profileId with action=getProfile, or sheetId");
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, data: data}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      
  } catch (error) {
    console.error("Error in doGet:", error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS", 
        "Access-Control-Allow-Headers": "Content-Type"
      });
  }
}

// New function: Get profile by ID from your master sheet
function getProfileById(profileId) {
  try {
    Logger.log("Looking up profile ID: " + profileId);
    
    // First, try to get real data from your master profile sheet
    const realData = getProfileFromMasterSheet(profileId);
    
    if (realData) {
      Logger.log("Found real data for: " + profileId);
      return formatProfileData(realData);
    } else {
      Logger.log("No real data found, returning sample data for: " + profileId);
      return getSampleProfileData(profileId);
    }
    
  } catch (error) {
    Logger.log("Error getting profile by ID: " + error.toString());
    // Fallback to sample data if there's an error
    return getSampleProfileData(profileId);
  }
}

// Function to get profile from your master sheet
function getProfileFromMasterSheet(profileId) {
  try {
    // Look for your master profile sheet
    // Try common naming patterns
    const masterSheetNames = [
      "Master_Profile_List",
      "Master Profile List", 
      "Client_List",
      "Client List",
      "Profiles"
    ];
    
    let masterSheet = null;
    
    // Try to find the master sheet in the current spreadsheet
    try {
      const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      for (const sheetName of masterSheetNames) {
        const sheet = activeSpreadsheet.getSheetByName(sheetName);
        if (sheet) {
          masterSheet = sheet;
          Logger.log("Found master sheet: " + sheetName);
          break;
        }
      }
    } catch (e) {
      Logger.log("No active spreadsheet context");
    }
    
    // If not found in active spreadsheet, search Drive
    if (!masterSheet) {
      for (const sheetName of masterSheetNames) {
        try {
          const files = DriveApp.getFilesByName(sheetName);
          if (files.hasNext()) {
            const file = files.next();
            const spreadsheet = SpreadsheetApp.openById(file.getId());
            masterSheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.getSheets()[0];
            Logger.log("Found master sheet in Drive: " + sheetName);
            break;
          }
        } catch (e) {
          // Continue to next name
        }
      }
    }
    
    if (!masterSheet) {
      Logger.log("No master sheet found");
      return null;
    }
    
    // Get data from the master sheet
    const data = masterSheet.getDataRange().getValues();
    if (data.length === 0) {
      Logger.log("Master sheet is empty");
      return null;
    }
    
    const headers = data[0];
    Logger.log("Master sheet headers: " + headers.join(", "));
    
    // Find the profile by ID
    // Look for common column names for profile ID
    const profileIdColumns = ["Profile_ID", "profileId", "profile_id", "ID", "Client_ID", "clientId"];
    let profileIdColumnIndex = -1;
    
    for (const colName of profileIdColumns) {
      const index = headers.indexOf(colName);
      if (index !== -1) {
        profileIdColumnIndex = index;
        Logger.log("Found profile ID column: " + colName + " at index " + index);
        break;
      }
    }
    
    if (profileIdColumnIndex === -1) {
      Logger.log("No profile ID column found in headers");
      return null;
    }
    
    // Search for the profile
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowProfileId = row[profileIdColumnIndex];
      
      if (rowProfileId === profileId || rowProfileId === profileId.toLowerCase() || rowProfileId === profileId.toUpperCase()) {
        Logger.log("Found matching profile at row " + (i + 1));
        
        // Create profile object from row data
        const profileData = {};
        headers.forEach((header, index) => {
          profileData[header] = row[index];
        });
        
        return profileData;
      }
    }
    
    Logger.log("Profile not found in master sheet");
    return null;
    
  } catch (error) {
    Logger.log("Error accessing master sheet: " + error.toString());
    return null;
  }
}

// Function to format profile data for the web app
function formatProfileData(rawData) {
  try {
    // Map your master sheet columns to the expected format
    const formatted = {
      companyName: rawData.Company_Name || rawData.companyName || rawData["Company Name"] || "Unknown Company",
      location: rawData.Location || rawData.location || "",
      timezone: rawData.Timezone || rawData.timezone || "Central",
      officeInfo: {
        phone: rawData.Phone || rawData.phone || rawData["Office Phone"] || "",
        email: rawData.Email || rawData.email || rawData["Office Email"] || "",
        website: rawData.Website || rawData.website || "",
        fieldRoutesLink: rawData.FieldRoutes_Link || rawData.fieldRoutesLink || rawData.Website || "",
        physicalAddress: rawData.Address || rawData.address || rawData["Physical Address"] || "",
        officeHours: rawData.Hours || rawData.hours || rawData["Office Hours"] || ""
      },
      bulletin: rawData.Bulletin || rawData.bulletin || "",
      pestsNotCovered: rawData.Pests_Not_Covered || rawData.pestsNotCovered || rawData["Pests Not Covered"] || "",
      services: [], // Will be populated from services sheet if available
      technicians: [], // Will be populated from technicians sheet if available  
      policies: {}, // Will be populated from policies sheet if available
      serviceAreas: [] // Will be populated from service areas sheet if available
    };
    
    // Try to get additional data from linked sheets
    try {
      const profileId = rawData.Profile_ID || rawData.profileId || rawData.ID;
      if (profileId && rawData.Sheet_URL) {
        // If there's a linked sheet, try to get additional data
        const additionalData = getAdditionalProfileData(rawData.Sheet_URL, profileId);
        if (additionalData) {
          formatted.services = additionalData.services || [];
          formatted.technicians = additionalData.technicians || [];
          formatted.policies = additionalData.policies || {};
          formatted.serviceAreas = additionalData.serviceAreas || [];
        }
      }
    } catch (e) {
      Logger.log("Could not get additional profile data: " + e.toString());
    }
    
    return formatted;
    
  } catch (error) {
    Logger.log("Error formatting profile data: " + error.toString());
    return getSampleProfileData("error");
  }
}

// Function to get additional data from linked profile sheets
function getAdditionalProfileData(sheetUrl, profileId) {
  try {
    // Extract sheet ID from URL
    const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return null;
    
    const sheetId = match[1];
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    
    const result = {
      services: [],
      technicians: [],
      policies: {},
      serviceAreas: []
    };
    
    // Get services data
    try {
      const servicesSheet = spreadsheet.getSheetByName("Services");
      if (servicesSheet) {
        const servicesData = servicesSheet.getDataRange().getValues();
        if (servicesData.length > 1) {
          const headers = servicesData[0];
          for (let i = 1; i < servicesData.length; i++) {
            const row = servicesData[i];
            if (row[0]) { // If first column has data
              const service = {};
              headers.forEach((header, index) => {
                service[header] = row[index];
              });
              result.services.push(service);
            }
          }
        }
      }
    } catch (e) {
      Logger.log("Could not get services data: " + e.toString());
    }
    
    // Get technicians data
    try {
      const techniciansSheet = spreadsheet.getSheetByName("Technicians");
      if (techniciansSheet) {
        const techniciansData = techniciansSheet.getDataRange().getValues();
        if (techniciansData.length > 1) {
          const headers = techniciansData[0];
          for (let i = 1; i < techniciansData.length; i++) {
            const row = techniciansData[i];
            if (row[0]) { // If first column has data
              const technician = {};
              headers.forEach((header, index) => {
                technician[header] = row[index];
              });
              result.technicians.push(technician);
            }
          }
        }
      }
    } catch (e) {
      Logger.log("Could not get technicians data: " + e.toString());
    }
    
    return result;
    
  } catch (error) {
    Logger.log("Error getting additional profile data: " + error.toString());
    return null;
  }
}

// Legacy function for sheet ID requests
function getClientDataFromSheet(sheetId) {
  // Your existing implementation for sheetId requests
  // Keep this for backward compatibility
  return getSampleProfileData("legacy-" + sheetId);
}

// Sample data for testing
function getSampleProfileData(profileId) {
  return {
    companyName: "Hill Country Exterminators (" + profileId + ")",
    location: "Austin, TX", 
    timezone: "Central",
    officeInfo: {
      phone: "(512) 555-0123",
      email: "info@hillcountryext.com",
      website: "https://hillcountryexterminators.com",
      fieldRoutesLink: "https://hillcountryexterminators.com",
      physicalAddress: "123 Hill Country Dr\\nAustin, TX 78701",
      officeHours: "Monday-Friday: 8:00 AM - 6:00 PM"
    },
    bulletin: "Professional pest control services serving the Austin area since 1995. Licensed and insured. [Sample data for " + profileId + "]",
    pestsNotCovered: "We do not service wildlife (raccoons, possums, etc.) or large rodent infestations.",
    services: [{
      name: "Monthly Pest Control",
      serviceType: "Recurring", 
      frequency: "Monthly",
      description: "Comprehensive monthly pest control service",
      pests: "Ants, roaches, spiders, silverfish",
      contract: "12 Months",
      guarantee: "30-day guarantee", 
      duration: "30-45 minutes",
      productType: "General Pest Control",
      billingFrequency: "After service",
      agentNote: "Most popular service - great for residential customers",
      pricingTiers: [
        { sqftMin: 0, sqftMax: 2500, firstPrice: "$149.00", recurringPrice: "$45.00" },
        { sqftMin: 2501, sqftMax: 4000, firstPrice: "$179.00", recurringPrice: "$55.00" }
      ]
    }],
    technicians: [{
      name: "Mike Johnson",
      company: "Hill Country Exterminators",
      role: "Senior Technician", 
      phone: "(512) 555-0124",
      schedule: "Monday-Friday",
      maxStops: "12 per day",
      doesNotService: "Commercial accounts",
      additionalNotes: "Specializes in residential pest control. Very reliable.",
      zipCodes: ["78701", "78702", "78703"]
    }],
    policies: {
      "Service Policies": [{
        type: "missed-appointment",
        title: "Missed Appointment Policy", 
        description: "If we miss your scheduled appointment, your next service is free.",
        options: ["Next service free", "Reschedule within 24 hours"],
        default: "Next service free"
      }]
    },
    serviceAreas: [{
      zip: "78701",
      city: "Austin", 
      state: "TX",
      branch: "Central Austin",
      territory: "Downtown",
      inService: true
    }]
  };
}

// Test function
function testProfileLookup() {
  try {
    const result = getProfileById("hill-country-exterminators");
    Logger.log("Test result: " + JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    Logger.log("Test error: " + error.toString());
    return { error: error.toString() };
  }
}
