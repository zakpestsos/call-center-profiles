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

// New function: Get profile by ID
function getProfileById(profileId) {
  try {
    // Return sample data for testing - you can update this later with real data
    return getSampleProfileData(profileId);
    
  } catch (error) {
    console.error("Error getting profile by ID:", error);
    return getSampleProfileData(profileId);
  }
}

// Sample data for testing
function getSampleProfileData(profileId) {
  return {
    companyName: "Sample Company (" + profileId + ")",
    location: "Dallas, TX",
    timezone: "Central",
    officeInfo: {
      phone: "(214) 555-0000",
      email: "info@sample.com",
      website: "https://sample.com",
      fieldRoutesLink: "https://fieldroutes.com",
      physicalAddress: "123 Sample Street\\nDallas, TX 75201",
      officeHours: "Monday-Friday: 8 AM - 5 PM"
    },
    bulletin: "This is sample data for " + profileId + ". System is working correctly!",
    pestsNotCovered: "Carpenter Ants, Bed Bugs, Termites",
    services: [{
      name: "General Pest Control",
      serviceType: "Recurring",
      frequency: "Quarterly",
      description: "Complete pest control service",
      pests: "Ants, Roaches, Spiders",
      contract: "12 Months",
      guarantee: "90 days",
      duration: "45 minutes",
      productType: "General Pest Control",
      billingFrequency: "After service",
      agentNote: "Sample service data - system is working!",
      pricingTiers: [
        { sqftMin: 0, sqftMax: 2500, firstPrice: "$125.00", recurringPrice: "$120.00" }
      ]
    }],
    technicians: [{
      name: "Sample Technician",
      company: "Sample Company",
      role: "Technician", 
      phone: "(214) 555-0001",
      schedule: "Mon-Fri 8-5",
      maxStops: "10",
      additionalNotes: "Sample technician data",
      zipCodes: ["75001", "75002"]
    }],
    policies: {
      "Service Coverage": [{
        type: "commercial",
        title: "Commercial Properties", 
        description: "Sample policy data",
        options: ["Available", "Not Available"],
        default: "Available"
      }]
    },
    serviceAreas: [{
      zip: "75001",
      city: "Dallas",
      state: "TX", 
      branch: "Sample Branch",
      territory: "North Dallas",
      inService: true
    }]
  };
}
