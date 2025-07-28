function doGet(e) {
  try {
    const sheetId = e.parameter.sheetId;
    const profileId = e.parameter.profileId;
    const action = e.parameter.action;
    
    let data;
    
    if (action === "getProfile" && profileId) {
      data = getProfileById(profileId);
    } else if (sheetId) {
      data = getClientDataFromSheet(sheetId);
    } else {
      throw new Error("Missing required parameters");
    }
    
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    const errorResponse = {
      error: true,
      message: error.toString(),
      timestamp: new Date().toISOString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getProfileById(profileId) {
  return {
    profileId: profileId,
    companyName: "Test Company",
    location: "Test Location",
    message: "This is a test profile response"
  };
}

function getClientDataFromSheet(sheetId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const result = {
      sheetId: sheetId,
      companyName: spreadsheet.getName(),
      lastUpdated: new Date().toISOString(),
      services: [],
      technicians: [],
      policies: {},
      serviceAreas: []
    };
    
    return result;
  } catch (error) {
    throw new Error("Failed to access spreadsheet: " + error.message);
  }
}
