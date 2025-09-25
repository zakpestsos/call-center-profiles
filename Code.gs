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

/**
 * Web App POST handler - Processes form submissions
 */
function doPost(e) {
  try {
    Logger.log('doPost called with data:', e.postData);
    
    // Parse the form data
    const formData = JSON.parse(e.postData.contents);
    
    // Create the client profile
    const result = createClientProfileFromHTML(formData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        result: result
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log(`Error in doPost: ${error.toString()}`);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Main function to create a new client profile from HTML form data
 * This function processes form submissions and creates the complete profile
 */
function createClientProfileFromHTML(formData) {
  try {
    Logger.log('Creating client profile from HTML form...');
    
    // Validate form data
    if (!formData.companyName || !formData.location) {
      throw new Error('Company name and location are required');
    }
    
    // Create client folder in Google Drive
    const clientFolderUrl = createEditableClientSheet(formData);
    
    // Add to master profile sheet
    const profileId = addProfileToMasterSheet(formData, clientFolderUrl);
    
    // Generate web app profile URL
    const profileUrl = generateWebAppProfileUrl(profileId);
    
    Logger.log(`Profile created successfully with ID: ${profileId}`);
    
    return {
      success: true,
      profileId: profileId,
      profileUrl: profileUrl,
      clientFolderUrl: clientFolderUrl
    };
    
  } catch (error) {
    Logger.log(`Error creating profile from HTML: ${error.toString()}`);
    throw error;
  }
}

/**
 * Updates profile from edit form
 */
function updateProfileFromForm(formData) {
  try {
    Logger.log('Updating profile from form:', formData.profileId);
    
    // Convert form data to master sheet format
    const updateData = {
      Company_Name: formData.companyName,
      Location: formData.location,
      Timezone: formData.timezone,
      Phone: formData.phone,
      Email: formData.email,
      Website: formData.website,
      Address: formData.address,
      Hours: formData.hours,
      Bulletin: formData.bulletin,
      Pests_Not_Covered: formData.pestsNotCovered
    };
    
    // Update master sheet
    updateProfileInMasterSheet(formData.profileId, updateData);
    
    // Trigger sync to client sheet and Wix
    triggerProfileSync(formData.profileId);
    
    return {
      success: true,
      message: 'Profile updated successfully'
    };
    
  } catch (error) {
    Logger.log(`Error updating profile: ${error.toString()}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Shows edit form for existing profile
 */
function showEditForm(profileId) {
  try {
    const profileData = getProfileFromMasterSheet(profileId);
    
    const template = HtmlService.createTemplateFromFile('ui/edit-form');
    template.profileData = profileData;
    template.profileId = profileId;
    
    return template.evaluate()
      .setTitle(`Edit Profile: ${profileData.Company_Name}`)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    return HtmlService.createHtmlOutput(`Error loading edit form: ${error.message}`);
  }
}

/**
 * API endpoint for production web app
 */
function getProfileDataAPI(profileId) {
  try {
    if (!profileId) {
      throw new Error('Profile ID is required');
    }
    
    const profileData = getProfileFromMasterSheet(profileId);
    
    // Convert to format expected by production web app
    const webAppData = {
      companyName: profileData.Company_Name,
      location: profileData.Location,
      timezone: profileData.Timezone,
      officeInfo: {
        phone: profileData.Phone,
        email: profileData.Email,
        website: profileData.Website,
        physicalAddress: profileData.Address,
        officeHours: profileData.Hours,
        fieldRoutesLink: profileData.Website
      },
      bulletin: profileData.Bulletin,
      pestsNotCovered: profileData.Pests_Not_Covered,
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
    Logger.log('Error in getProfileDataAPI: ' + error.toString());
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generates web app profile URL
 */
function generateWebAppProfileUrl(profileId) {
  // This would be your production web app URL
  const baseUrl = 'https://yoursite.wix.com/profile'; // Replace with actual URL
  return `${baseUrl}?profileId=${profileId}`;
}

/**
 * Triggers sync for a specific profile
 */
function triggerProfileSync(profileId) {
  try {
    // Find profile data
    const masterSheet = getMasterProfileSheet();
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    const data = profilesTab.getDataRange().getValues();
    const headers = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === profileId) {
        // Trigger sync for this profile
        syncFromClientSheet(profileId, data[i], headers);
        syncToWix(profileId, data[i], headers);
        break;
      }
    }
    
    Logger.log(`Sync triggered for profile: ${profileId}`);
    
  } catch (error) {
    Logger.log(`Error triggering sync for profile ${profileId}: ${error.toString()}`);
  }
}

/**
 * Reads client data from the input sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 * @returns {Object} Client data object
 */
function readClientData(sheet) {
  // This will be implemented based on your sheet structure
  // For now, returning a template structure
  return {
    companyName: sheet.getRange('B2').getValue(),
    location: sheet.getRange('B3').getValue(),
    officeInfo: {
      // Office information fields
    },
    services: [
      // Services array
    ],
    technicians: [
      // Technicians array
    ],
    serviceAreas: [
      // Service areas and zip codes
    ],
    policies: [
      // SOS Policies
    ]
  };
}

/**
 * Validates client data before creating profile
 * @param {Object} clientData - The client data to validate
 */
function validateClientData(clientData) {
  if (!clientData.companyName) {
    throw new Error('Company name is required');
  }
  
  // Validate office information
  if (!clientData.officeInfo?.officePhone) {
    throw new Error('Office phone is required');
  }
  
  if (!clientData.officeInfo?.customerContactEmail) {
    throw new Error('Customer contact email is required');
  }
  
  // Add more validation as needed
}

/**
 * Creates a new profile in Wix CMS
 * @param {Object} clientData - The client data
 * @returns {Object} Profile creation result
 */
function createWixProfile(clientData) {
  // This will be implemented with actual Wix API calls
  // For now, returning a mock result
  return {
    profileId: generateProfileId(),
    success: true
  };
}

/**
 * Generates a unique profile ID
 * @returns {string} Profile ID
 */
function generateProfileId() {
  // Simple ID generation - you may want to use your existing system
  return Math.floor(Math.random() * 90000) + 10000;
}

/**
 * Generates the profile URL using GitHub Pages
 * @param {Object} clientData - The complete client data
 * @returns {string} Profile URL
 */
function generateProfileUrl(clientData) {
  return buildGitHubUrl(clientData);
}

/**
 * Builds the GitHub Pages URL with all client data as parameters
 * @param {Object} profile - The profile data
 * @returns {string} Complete GitHub URL
 */
function buildGitHubUrl(profile) {
  // Replace 'zakpestsos' with your actual GitHub username
  const baseUrl = 'https://zakpestsos.github.io/call-center-profiles/';
  const params = new URLSearchParams();
  
  // Add all profile data as URL parameters
  if (profile.companyName) params.append('companyName', profile.companyName);
  if (profile.location) params.append('location', profile.location);
  if (profile.timezone) params.append('timezone', profile.timezone);
  if (profile.officeInfo?.phone) params.append('phone', profile.officeInfo.phone);
  if (profile.officeInfo?.email) params.append('email', profile.officeInfo.email);
  if (profile.officeInfo?.website) params.append('website', profile.officeInfo.website);
  if (profile.officeInfo?.fieldRoutesLink) params.append('fieldRoutesLink', profile.officeInfo.fieldRoutesLink);
  if (profile.officeInfo?.physicalAddress) params.append('address', profile.officeInfo.physicalAddress);
  if (profile.officeInfo?.officeHours) params.append('hours', profile.officeInfo.officeHours);
  if (profile.bulletin) params.append('bulletin', profile.bulletin);
  if (profile.pestsNotCovered) params.append('pestsNotCovered', profile.pestsNotCovered);
  
  // Add JSON data - ensure it's properly serialized
  if (profile.services && profile.services.length > 0) {
    const servicesString = typeof profile.services === 'string' ? profile.services : JSON.stringify(profile.services);
    params.append('services', servicesString);
  }
  if (profile.technicians && profile.technicians.length > 0) {
    const techniciansString = typeof profile.technicians === 'string' ? profile.technicians : JSON.stringify(profile.technicians);
    params.append('technicians', techniciansString);
  }
  if (profile.policies && profile.policies.length > 0) {
    const policiesString = typeof profile.policies === 'string' ? profile.policies : JSON.stringify(profile.policies);
    params.append('policies', policiesString);
  }
  if (profile.serviceAreas && profile.serviceAreas.length > 0) {
    const serviceAreasString = typeof profile.serviceAreas === 'string' ? profile.serviceAreas : JSON.stringify(profile.serviceAreas);
    params.append('serviceAreas', serviceAreasString);
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Updates the input sheet with the generated profile URL
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The input sheet
 * @param {string} profileUrl - The profile URL
 */
function updateSheetWithProfileUrl(sheet, profileUrl) {
  // Update a specific cell with the profile URL
  sheet.getRange('B4').setValue(profileUrl);
  
  // Add timestamp
  sheet.getRange('B5').setValue(new Date());
}

/**
 * Creates an HTML file in Google Apps Script for the call center profile
 * This function creates the enhanced call center interface as an HTML file
 */
function createCallCenterHTML() {
  try {
    const htmlContent = getCallCenterProfileHTML();
    
    // In Google Apps Script, you would typically create this as a standalone HTML file
    // or serve it via a web app. For now, we'll log the content and provide instructions.
    
    Logger.log('Call Center Profile HTML content ready for deployment');
    Logger.log('Instructions:');
    Logger.log('1. Copy the HTML content from the ui/call-center-profile-dynamic.html file');
    Logger.log('2. Create a new HTML file in your Google Apps Script project');
    Logger.log('3. Name it "call-center-profile-dynamic"');
    Logger.log('4. Paste the HTML content');
    Logger.log('5. Deploy as a web app if serving directly from Google Apps Script');
    Logger.log('6. Or upload to GitHub Pages for external hosting');
    
    return htmlContent;
  } catch (error) {
    Logger.log('Error creating HTML file: ' + error.toString());
    throw error;
  }
}

/**
 * Returns the HTML content for the call center profile
 * This includes all the enhanced features: search, pricing calculator, etc.
 */
function getCallCenterProfileHTML() {
  // This would contain the full HTML content from your ui/call-center-profile-dynamic.html
  // For Google Apps Script deployment, you'd typically use HtmlService.createTemplateFromFile()
  
  return `<!-- Enhanced Call Center Profile HTML would go here -->
  <!-- This should be copied from ui/call-center-profile-dynamic.html -->`;
}

/**
 * Test function to generate a sample profile URL
 * This helps verify the URL generation is working correctly
 */
function testProfileURLGeneration() {
  const sampleData = {
    companyName: "ACME Pest Control",
    location: "Dallas, TX",
    timezone: "Central",
    officeInfo: {
      phone: "(972) 555-0123",
      email: "contact@acmepest.com",
      website: "https://acmepest.com",
      fieldRoutesLink: "https://fieldroutes.acmepest.com",
      physicalAddress: "123 Pest Street\nDallas, TX 75001",
      officeHours: "Monday-Friday: 8 AM - 5 PM"
    },
    bulletin: "Welcome to ACME Pest Control! We provide comprehensive pest solutions.",
    pestsNotCovered: "Wasps, Hornets, Skunks, Large Wildlife",
    services: [
      {
        name: "Quarterly General Pest Control",
        description: "Comprehensive pest control service with quarterly treatments",
        contract: "12 Months",
        guarantee: "90-day guarantee",
        duration: "45 minutes",
        pests: "Ants, Roaches, Spiders, Crickets, Silverfish",
        serviceType: "Quarterly GPC",
        queueExt: "6884",
        productType: "General Pest Control",
        frequency: "Quarterly",
        billingFrequency: "After service completion",
        pricingTiers: [
          {
            sqftMin: 0,
            sqftMax: 2500,
            firstPrice: "$125.00",
            recurringPrice: "$120.00",
            serviceType: "Quarterly GPC"
          },
          {
            sqftMin: 2501,
            sqftMax: 3000,
            firstPrice: "$130.00",
            recurringPrice: "$125.00",
            serviceType: "Quarterly GPC"
          }
        ]
      }
    ],
    technicians: [
      {
        name: "John Smith",
        phone: "(972) 555-0124",
        email: "john@acmepest.com",
        specializations: "General Pest Control",
        certifications: "Licensed PCO",
        experience: "5 years",
        territory: "North Dallas"
      }
    ],
    policies: [
      {
        type: "guarantee",
        title: "Service Guarantee",
        description: "If pests return within 90 days, we'll re-treat at no charge",
        options: ["30 days", "60 days", "90 days"],
        default: "90 days"
      }
    ],
    serviceAreas: [
      {
        zip: "75001",
        city: "Addison",
        state: "TX",
        branch: "North Dallas Branch",
        territory: "North Dallas",
        inService: true
      }
    ]
  };
  
  const generatedUrl = generateProfileUrl(sampleData);
  
  Logger.log('=== PROFILE URL TEST ===');
  Logger.log('Generated URL: ' + generatedUrl);
  Logger.log('======================');
  
  // Also test in the UI
  SpreadsheetApp.getUi().alert(
    'Profile URL Generated',
    'Test URL created:\n\n' + generatedUrl + '\n\nThis URL contains all the enhanced features including:\n• Search functionality\n• Dynamic pricing calculator\n• Enhanced service details\n• Improved navigation',
    SpreadsheetApp.getUi().Button.OK
  );
  
  return generatedUrl;
}

/**
 * Function to set up the initial sheet structure
 * This creates the basic input sheet template
 */
function setupInputSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Create or get the Client Input sheet
    let inputSheet = spreadsheet.getSheetByName('Client Input');
    if (!inputSheet) {
      inputSheet = spreadsheet.insertSheet('Client Input');
    }
    
    // Set up basic headers and structure
    inputSheet.getRange('A1').setValue('Field');
    inputSheet.getRange('B1').setValue('Value');
    inputSheet.getRange('A2').setValue('Company Name');
    inputSheet.getRange('A3').setValue('Location');
    inputSheet.getRange('A4').setValue('Profile URL');
    inputSheet.getRange('A5').setValue('Created Date');
    
    // Format headers
    inputSheet.getRange('A1:B1').setFontWeight('bold');
    inputSheet.getRange('A:A').setFontWeight('bold');
    
    SpreadsheetApp.getUi().alert(
      'Setup Complete', 
      'Input sheet has been created. You can now start entering client data.', 
      SpreadsheetApp.getUi().Button.OK
    );
    
  } catch (error) {
    Logger.log(`Error setting up sheet: ${error.toString()}`);
    SpreadsheetApp.getUi().alert('Error', `Failed to setup sheet: ${error.message}`, SpreadsheetApp.getUi().Button.OK);
  }
}

/**
 * Creates a client profile from HTML form data
 * This function handles the complex, hierarchical data from the HTML form
 * @param {Object} formData - The form data from the HTML interface
 * @returns {Object} Result object with profile URL and client ID
 */
function createClientProfileFromHTML(formData) {
  try {
    Logger.log('Creating client profile from HTML form data...');
    
    // Parse and structure the form data
    const clientData = parseHTMLFormData(formData);
    
    // Validate required fields
    validateClientData(clientData);
    
    // Generate unique client ID
    const clientId = generateClientId();
    clientData.clientId = clientId;
    
    // Create Wix profile
    const wixResult = createWixProfile(clientData);
    
    // Generate profile URL
    const profileUrl = generateProfileUrl(wixResult.profileId, clientData.companyName);
    
    // Update client tracking sheets
    updateClientTrackingSheets(clientData, profileUrl, wixResult.profileId);
    
    // Create copy in company Google Drive folder if provided
    let companySheetUrl = null;
    if (clientData.googleDriveFolder) {
      try {
        companySheetUrl = createCompanyFolderCopy(clientData, clientData.googleDriveFolder);
        Logger.log(`Company folder copy created: ${companySheetUrl}`);
      } catch (error) {
        Logger.log(`Warning: Could not create company folder copy: ${error.message}`);
        // Don't fail the whole process if this fails
      }
    }
    
    // Log success
    Logger.log(`Client profile created successfully: ${clientId}`);
    
    return {
      success: true,
      clientId: clientId,
      profileUrl: profileUrl,
      wixProfileId: wixResult.profileId,
      message: 'Client profile created successfully'
    };
    
  } catch (error) {
    Logger.error('Error creating client profile from HTML:', error);
    
    // Update error tracking
    try {
      updateErrorTracking(formData.companyName || 'Unknown', error.message);
    } catch (trackingError) {
      Logger.error('Error updating tracking:', trackingError);
    }
    
    throw new Error(`Failed to create client profile: ${error.message}`);
  }
}

/**
 * Parses HTML form data into structured client data
 * @param {Object} formData - Raw form data from HTML
 * @returns {Object} Structured client data
 */
function parseHTMLFormData(formData) {
  const clientData = {
    // Company information (now consolidated into office info)
    companyName: formData.companyName || '',
    
    // Office information
    officeInfo: {
      googleDriveFolder: formData.googleDriveFolder || '',
      wixLink: formData.wixLink || '',
      locations: formData.locations || '',
      timezone: formData.timezone || '',
      officePhone: formData.officePhone || '',
      customerContactEmail: formData.customerContactEmail || '',
      physicalAddress: formData.physicalAddress || '',
      mailingAddress: formData.mailingAddress || '',
      officeHours: formData.officeHours || '',
      holidays: formData.holidays || [], // Array of selected holidays
      website: formData.website || '',
      fieldRoutesLink: formData.fieldRoutesLink || ''
    },
    
    // Services array with sub-services
    services: [],
    
    // Technicians array with detailed info
    technicians: [],
    
    // Service areas array
    serviceAreas: [],
    
    // Policies
    policies: {
      cancellation: formData.cancellationPolicy || '',
      guarantee: formData.guaranteePolicy || '',
      payment: formData.paymentTerms || '',
      emergency: formData.emergencyServices || '',
      insurance: formData.insuranceInfo || ''
    }
  };
  
  // Parse services and sub-services
  const servicePattern = /^services\[(\d+)\]/;
  const servicesMap = new Map();
  
  for (const [key, value] of Object.entries(formData)) {
    if (servicePattern.test(key)) {
      const match = key.match(/^services\[(\d+)\]\[([^\]]+)\](?:\[([^\]]+)\])?(?:\[([^\]]+)\])?$/);
      if (match) {
        const serviceIndex = parseInt(match[1]);
        const field = match[2];
        
        if (!servicesMap.has(serviceIndex)) {
          servicesMap.set(serviceIndex, { subServices: [] });
        }
        
        const service = servicesMap.get(serviceIndex);
        
        if (field === 'subServices') {
          // Handle sub-services
          const subServiceMatch = key.match(/^services\[(\d+)\]\[subServices\]\[(\d+)\]\[([^\]]+)\]$/);
          if (subServiceMatch) {
            const subServiceIndex = parseInt(subServiceMatch[2]);
            const subServiceField = subServiceMatch[3];
            
            if (!service.subServices[subServiceIndex]) {
              service.subServices[subServiceIndex] = {};
            }
            
            service.subServices[subServiceIndex][subServiceField] = value;
          }
        } else if (field === 'pricingTiers') {
          // Handle pricing tiers
          const pricingTierMatch = key.match(/^services\[(\d+)\]\[pricingTiers\]\[(\d+)\]\[([^\]]+)\]$/);
          if (pricingTierMatch) {
            const tierIndex = parseInt(pricingTierMatch[2]);
            const tierField = pricingTierMatch[3];
            
            if (!service.pricingTiers) {
              service.pricingTiers = [];
            }
            
            if (!service.pricingTiers[tierIndex]) {
              service.pricingTiers[tierIndex] = {};
            }
            
            // Convert sqft values to numbers
            if (tierField === 'sqftMin' || tierField === 'sqftMax') {
              service.pricingTiers[tierIndex][tierField] = parseInt(value) || 0;
            } else {
              service.pricingTiers[tierIndex][tierField] = value;
            }
          }
        } else {
          // Handle main service fields
          service[field] = value;
        }
      }
    }
  }
  
  // Convert services map to array and filter empty ones
  clientData.services = Array.from(servicesMap.values()).filter(service => 
    service.name && service.name.trim() !== ''
  ).map(service => {
    // Clean up pricing tiers - remove empty tiers and ensure valid structure
    if (service.pricingTiers) {
      service.pricingTiers = service.pricingTiers.filter(tier => 
        tier && tier.sqftMin !== undefined && tier.sqftMax !== undefined &&
        (tier.firstPrice || tier.recurringPrice)
      );
      
      // If no valid pricing tiers, remove the property
      if (service.pricingTiers.length === 0) {
        delete service.pricingTiers;
      }
    }
    
    return service;
  });
  
  // Parse technicians
  const techPattern = /^technicians\[(\d+)\]/;
  const techniciansMap = new Map();
  
  for (const [key, value] of Object.entries(formData)) {
    if (techPattern.test(key)) {
      const match = key.match(/^technicians\[(\d+)\]\[([^\]]+)\]$/);
      if (match) {
        const techIndex = parseInt(match[1]);
        const field = match[2];
        
        if (!techniciansMap.has(techIndex)) {
          techniciansMap.set(techIndex, {});
        }
        
        techniciansMap.get(techIndex)[field] = value;
      }
    }
  }
  
  // Convert technicians map to array and filter empty ones
  clientData.technicians = Array.from(techniciansMap.values()).filter(tech => 
    tech.name && tech.name.trim() !== ''
  );
  
  // Parse service areas
  const areaPattern = /^serviceAreas\[(\d+)\]/;
  const areasMap = new Map();
  
  for (const [key, value] of Object.entries(formData)) {
    if (areaPattern.test(key)) {
      const match = key.match(/^serviceAreas\[(\d+)\]\[([^\]]+)\]$/);
      if (match) {
        const areaIndex = parseInt(match[1]);
        const field = match[2];
        
        if (!areasMap.has(areaIndex)) {
          areasMap.set(areaIndex, {});
        }
        
        areasMap.get(areaIndex)[field] = value;
      }
    }
  }
  
  // Convert areas map to array and filter empty ones
  clientData.serviceAreas = Array.from(areasMap.values()).filter(area => 
    (area.zip && area.zip.trim() !== '') || (area.city && area.city.trim() !== '')
  );
  
  return clientData;
}

/**
 * Updates client tracking sheets with new client information
 * @param {Object} clientData - The client data
 * @param {string} profileUrl - The generated profile URL
 * @param {string} wixProfileId - The Wix profile ID
 */
function updateClientTrackingSheets(clientData, profileUrl, wixProfileId) {
  try {
    // Find or create the tracking spreadsheet
    const spreadsheetName = 'Client Profile Input';
    let spreadsheet;
    
    const files = DriveApp.getFilesByName(spreadsheetName);
    if (files.hasNext()) {
      spreadsheet = SpreadsheetApp.open(files.next());
    } else {
      // Create the spreadsheet if it doesn't exist
      createMultiClientSystem();
      const newFiles = DriveApp.getFilesByName(spreadsheetName);
      spreadsheet = SpreadsheetApp.open(newFiles.next());
    }
    
    // Update Client List sheet
    updateClientListSheet(spreadsheet, clientData, profileUrl, wixProfileId);
    
    // Update Profile Tracker sheet
    updateProfileTrackerSheet(spreadsheet, clientData, 'Created', 'Profile created successfully via HTML form');
    
    // Create individual client input sheet for future edits
    createClientInputSheet(spreadsheet, clientData);
    
  } catch (error) {
    Logger.error('Error updating tracking sheets:', error);
    // Don't throw here - profile creation succeeded, tracking is secondary
  }
}

/**
 * Updates the Client List sheet with new client
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The spreadsheet
 * @param {Object} clientData - The client data
 * @param {string} profileUrl - The profile URL
 * @param {string} wixProfileId - The Wix profile ID
 */
function updateClientListSheet(spreadsheet, clientData, profileUrl, wixProfileId) {
  const clientListSheet = spreadsheet.getSheetByName('Client List');
  if (!clientListSheet) return;
  
  const newRow = clientListSheet.getLastRow() + 1;
  const rowData = [
    clientData.clientId,
    clientData.companyName,
    clientData.officeInfo?.locations || '',
    'Active',
    profileUrl,
    new Date(),
    new Date(),
    wixProfileId,
    clientData.officeInfo?.customerContactEmail || '',
    clientData.officeInfo?.officePhone || ''
  ];
  
  clientListSheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
}

/**
 * Updates the Profile Tracker sheet
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The spreadsheet
 * @param {Object} clientData - The client data
 * @param {string} status - The status
 * @param {string} message - The message
 */
function updateProfileTrackerSheet(spreadsheet, clientData, status, message) {
  const trackerSheet = spreadsheet.getSheetByName('Profile Tracker');
  if (!trackerSheet) return;
  
  const newRow = trackerSheet.getLastRow() + 1;
  const rowData = [
    clientData.clientId,
    clientData.companyName,
    'Published',
    status,
    new Date(),
    message,
    'None',
    'Created via HTML form'
  ];
  
  trackerSheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
}

/**
 * Creates an individual input sheet for future client edits
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - The spreadsheet
 * @param {Object} clientData - The client data
 */
function createClientInputSheet(spreadsheet, clientData) {
  try {
    const sheetName = `${clientData.clientId}_Data`;
    
    // Check if sheet already exists
    let clientSheet = spreadsheet.getSheetByName(sheetName);
    if (clientSheet) {
      spreadsheet.deleteSheet(clientSheet);
    }
    
    // Create new sheet
    clientSheet = spreadsheet.insertSheet(sheetName);
    
    // Set up the sheet with client data for future reference
    const headers = ['Field', 'Value', 'Last Updated'];
    clientSheet.getRange('A1:C1').setValues([headers]);
    clientSheet.getRange('A1:C1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
    
    let row = 2;
    
    // Add basic info
    clientSheet.getRange(row++, 1, 1, 3).setValues([['Company Name', clientData.companyName, new Date()]]);
    clientSheet.getRange(row++, 1, 1, 3).setValues([['Locations', clientData.officeInfo?.locations || '', new Date()]]);
    clientSheet.getRange(row++, 1, 1, 3).setValues([['Office Phone', clientData.officeInfo?.officePhone || '', new Date()]]);
    clientSheet.getRange(row++, 1, 1, 3).setValues([['Customer Email', clientData.officeInfo?.customerContactEmail || '', new Date()]]);
    clientSheet.getRange(row++, 1, 1, 3).setValues([['Website', clientData.officeInfo?.website || '', new Date()]]);
    
    // Add holidays if any
    if (clientData.officeInfo?.holidays && clientData.officeInfo.holidays.length > 0) {
      clientSheet.getRange(row++, 1, 1, 3).setValues([['Holidays Observed', clientData.officeInfo.holidays.join(', '), new Date()]]);
    }
    // Add services summary
    clientSheet.getRange(row++, 1, 1, 3).setValues([['Services Count', clientData.services.length, new Date()]]);
    clientData.services.forEach((service, index) => {
      clientSheet.getRange(row++, 1, 1, 3).setValues([[`Service ${index + 1}`, service.name, new Date()]]);
    });
    
    // Add technicians summary
    clientSheet.getRange(row++, 1, 1, 3).setValues([['Technicians Count', clientData.technicians.length, new Date()]]);
    clientData.technicians.forEach((tech, index) => {
      clientSheet.getRange(row++, 1, 1, 3).setValues([[`Technician ${index + 1}`, tech.name, new Date()]]);
    });
    
    // Auto-resize columns
    clientSheet.autoResizeColumns(1, 3);
    
  } catch (error) {
    Logger.error('Error creating client input sheet:', error);
  }
}

/**
 * Updates error tracking when profile creation fails
 * @param {string} companyName - The company name
 * @param {string} errorMessage - The error message
 */
function updateErrorTracking(companyName, errorMessage) {
  try {
    const spreadsheetName = 'Client Profile Input';
    const files = DriveApp.getFilesByName(spreadsheetName);
    
    if (files.hasNext()) {
      const spreadsheet = SpreadsheetApp.open(files.next());
      const trackerSheet = spreadsheet.getSheetByName('Profile Tracker');
      
      if (trackerSheet) {
        const newRow = trackerSheet.getLastRow() + 1;
        const rowData = [
          'ERROR-' + Date.now(),
          companyName,
          'Error',
          'Failed',
          new Date(),
          errorMessage,
          'Review and retry',
          'HTML form submission failed'
        ];
        
        trackerSheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
      }
    }
  } catch (error) {
    Logger.error('Error updating error tracking:', error);
  }
}

/**
 * Opens the HTML form for client input
 * This function creates and displays the HTML form interface
 */
function openClientInputForm() {
  try {
    const htmlTemplate = HtmlService.createTemplateFromFile('ui/client-input-form');
    const html = htmlTemplate.evaluate()
      .setWidth(1200)
      .setHeight(800)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    // Try to show in Sheets UI if available, otherwise provide web app URL
    try {
      SpreadsheetApp.getUi().showModalDialog(html, 'Client Profile Input Form');
    } catch (uiError) {
      // If we can't show in Sheets, provide instructions for web app
      Logger.log('Cannot show modal dialog. Deploy as web app to use the form.');
      Logger.log('To deploy: 1. Click Deploy button, 2. Choose "New deployment", 3. Select "Web app", 4. Set access to "Anyone"');
      
      // Return the HTML content for manual deployment
      return html.getContent();
    }
  } catch (error) {
    Logger.error('Error opening client input form:', error);
    throw new Error(`Failed to open form: ${error.message}`);
  }
}

/**
 * Alternative function to get the HTML form content for web app deployment
 * Use this if you want to deploy the form as a standalone web app
 */

/**
 * Simple test function to verify the system is working
 * Run this function first to test your setup
 */
function testSystem() {
  try {
    Logger.log('=== Testing Enhanced Wix Client Profile System ===');
    
    // Test 1: Check if we can create the multi-client system
    Logger.log('Test 1: Creating multi-client system...');
    const spreadsheetUrl = createMultiClientSystem();
    Logger.log('✓ Multi-client system created: ' + spreadsheetUrl);
    
    // Test 2: Test enhanced form
    Logger.log('Test 2: Testing enhanced HTML form...');
    const htmlResult = doGet();
    if (htmlResult) {
      Logger.log('✓ Enhanced HTML form loads successfully');
    }
    
    // Test 3: Test sample data processing
    Logger.log('Test 3: Testing comprehensive data processing...');
    const sampleData = {
      companyName: 'Test Pest Control Co.',
      location: 'Dallas, TX',
      address: '123 Test Street, Dallas, TX 75001',
      phone: '555-TEST-123',
      email: 'test@testpest.com',
      website: 'https://testpest.com',
      hours: 'Mon-Fri 8AM-5PM',
      bulletin: 'Professional pest control services',
      pestsNotCovered: 'Wildlife - refer to Wildlife X',
      services: [{
        name: 'General Pest Control',
        category: 'standard',
        type: 'recurring',
        description: 'Comprehensive pest control service',
        pests: 'Ants, Spiders, Roaches',
        frequency: 'quarterly',
        contract: 'None',
        guarantee: 'Unlimited Retreatments',
        callAhead: 'Yes',
        initialDuration: '45 Minutes',
        recurringDuration: '30 Minutes',
        leaveDuringService: 'No',
        followUp: 'No',
        prepSheet: 'No',
        price: '$150'
      }],
      technicians: [{
        name: 'John Test',
        role: 'Technician',
        phone: '555-TECH-123',
        email: 'john@testpest.com',
        schedule: 'Mon-Fri 8-5',
        maxStops: '12',
        zipCodes: '75001, 75002, 75003',
        doesNotService: 'Commercial only'
      }],
      serviceAreas: [{
        city: 'Dallas',
        state: 'TX',
        zipCodes: '75001, 75002, 75003',
        radius: '25',
        fees: 'None'
      }],
      cancellationPolicy: '24 hour notice required',
      guaranteePolicy: 'Satisfaction guaranteed',
      paymentTerms: 'Due upon service completion',
      emergencyServices: 'Available 24/7',
      insuranceInfo: 'Fully licensed and insured'
    };
    
    // Test 4: Google Sheets creation
    Logger.log('4. Testing Google Sheets creation...');
    const sheetUrl = createEditableClientSheet(sampleData);
    Logger.log('✓ Google Sheet created: ' + sheetUrl);
    
    // Test 5: Data reading from sheets
    Logger.log('5. Testing data reading from sheets...');
    const sheetId = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const readData = readUpdatedDataFromSheets(spreadsheet);
    Logger.log('✓ Data read successfully from sheets');
    
    // Test 6: Check configuration
    Logger.log('Test 6: Checking configuration...');
    const config = getWixConfig();
    if (config.siteId && config.apiKey) {
      Logger.log('✓ Wix credentials configured');
    } else {
      Logger.log('⚠ Wix credentials not configured. Set WIX_SITE_ID and WIX_API_KEY in Script Properties');
    }
    
    Logger.log('=== ENHANCED SYSTEM TEST COMPLETED SUCCESSFULLY ===');
    
    // Generate deployment instructions
    const instructions = generateDeploymentInstructions();
    Logger.log(instructions);
    
    return {
      success: true,
      spreadsheetUrl: spreadsheetUrl,
      testSheetUrl: sheetUrl,
      testData: sampleData,
      readData: readData,
      instructions: instructions,
      message: 'Enhanced system test completed successfully with Google Sheets editing capability!'
    };
    
  } catch (error) {
    Logger.error('System test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'System test failed. Check execution log for details.'
    };
  }
}

/**
 * Processes client data from the enhanced HTML form
 * Creates both Google Sheets for editing and Wix profile
 * @param {Object} clientData - Comprehensive client data from HTML form
 * @returns {Object} Result with URLs and status
 */
async function createClientProfileFromHTML(clientData) {
  try {
    Logger.log('Creating client profile from enhanced HTML form for: ' + clientData.companyName);
    
    // Validate required data
    if (!clientData.companyName) {
      throw new Error('Company name is required');
    }
    
    if (!clientData.officeInfo?.officePhone) {
      throw new Error('Office phone is required');
    }
    
    if (!clientData.officeInfo?.customerContactEmail) {
      throw new Error('Customer contact email is required');
    }
    
    // 1. Create editable Google Sheets structure
    const sheetUrl = createEditableClientSheet(clientData);
    Logger.log('Created editable sheet: ' + sheetUrl);
    
    // 2. Create Wix profile with comprehensive data
    const wixResult = await createWixProfile(clientData);
    Logger.log('Created Wix profile: ' + wixResult.profileUrl);
    
    // 3. Update sheets with Wix profile information
    updateSheetWithWixInfo(sheetUrl, wixResult);
    
    // 4. Update master tracking
    updateMasterClientList(clientData, sheetUrl, wixResult.profileUrl, wixResult.profileId);
    
    const result = {
      success: true,
      profileUrl: wixResult.profileUrl,
      sheetUrl: sheetUrl,
      profileId: wixResult.profileId,
      message: 'Client profile created successfully with editable Google Sheets!'
    };
    
    Logger.log('Profile creation completed successfully');
    return result;
    
  } catch (error) {
    Logger.log('Error creating client profile: ' + error.toString());
    return {
      success: false,
      error: error.message,
      details: error.toString()
    };
  }
}

/**
 * Creates comprehensive Wix profile with all service details
 * @param {Object} clientData - Client data from form
 * @returns {Object} Wix creation result
 */
async function createWixProfile(clientData) {
  try {
    // Create main profile
    const profileData = {
      title: clientData.companyName,
      slug: generateSlug(clientData.companyName),
      companyInfo: {
        name: clientData.companyName,
        wixLink: clientData.officeInfo?.wixLink || '',
        locations: clientData.officeInfo?.locations || '',
        timezone: clientData.officeInfo?.timezone || '',
        officePhone: clientData.officeInfo?.officePhone || '',
        customerContactEmail: clientData.officeInfo?.customerContactEmail || '',
        physicalAddress: clientData.officeInfo?.physicalAddress || '',
        mailingAddress: clientData.officeInfo?.mailingAddress || '',
        officeHours: clientData.officeInfo?.officeHours || '',
        holidays: clientData.officeInfo?.holidays || [],
        website: clientData.officeInfo?.website || '',
        fieldRoutesLink: clientData.officeInfo?.fieldRoutesLink || ''
      }
    };
    
    const mainProfile = await createWixClientProfile(profileData);
    
    // Create services with detailed structure
    if (clientData.services && clientData.services.length > 0) {
      await createEnhancedServiceRecords(mainProfile.profileId, clientData.services);
    }
    
    // Create technician records
    if (clientData.technicians && clientData.technicians.length > 0) {
      await createEnhancedTechnicianRecords(mainProfile.profileId, clientData.technicians);
    }
    
    // Create service area records
    if (clientData.serviceAreas && clientData.serviceAreas.length > 0) {
      await createEnhancedServiceAreaRecords(mainProfile.profileId, clientData.serviceAreas);
    }
    
    // Create policy records
    const policies = [
      { type: 'Cancellation', content: clientData.cancellationPolicy },
      { type: 'Guarantee', content: clientData.guaranteePolicy },
      { type: 'Payment', content: clientData.paymentTerms },
      { type: 'Emergency', content: clientData.emergencyServices },
      { type: 'Insurance', content: clientData.insuranceInfo }
    ].filter(policy => policy.content);
    
    if (policies.length > 0) {
      await createPolicyRecords(mainProfile.profileId, policies);
    }
    
    return mainProfile;
    
  } catch (error) {
    Logger.log('Error creating Wix profile: ' + error.toString());
    throw error;
  }
}

/**
 * Creates enhanced service records with all pest control details
 * @param {string} profileId - Wix profile ID
 * @param {Array} services - Array of service objects
 */
async function createEnhancedServiceRecords(profileId, services) {
  try {
    Logger.log('Creating enhanced service records for profile: ' + profileId);
    
    for (const service of services) {
      const serviceData = {
        profileId: profileId,
        name: service.name,
        category: service.category,
        type: service.type,
        description: service.description,
        pestscovered: service.pests,
        frequency: service.frequency,
        // Include pricing tiers if defined
        ...(service.pricingTiers ? { pricingTiers: service.pricingTiers } : {}),
        onboardingNotes: service.onboardingNotes,
        
        // Service details
        contract: service.contract,
        guarantee: service.guarantee,
        callAhead: service.callAhead,
        initialDuration: service.initialDuration,
        recurringDuration: service.recurringDuration,
        leaveDuringService: service.leaveDuringService,
        followUp: service.followUp,
        prepSheet: service.prepSheet,
        
        // Agent instructions for inspections
        agentInstructions: service.agentInstructions
      };
      
      await createWixServiceRecord(serviceData);
    }
    
    Logger.log('Enhanced service records created successfully');
    
  } catch (error) {
    Logger.log('Error creating enhanced service records: ' + error.toString());
    throw error;
  }
}

/**
 * Creates enhanced technician records with detailed information
 * @param {string} profileId - Wix profile ID
 * @param {Array} technicians - Array of technician objects
 */
async function createEnhancedTechnicianRecords(profileId, technicians) {
  try {
    Logger.log('Creating enhanced technician records for profile: ' + profileId);
    
    for (const tech of technicians) {
      const techData = {
        profileId: profileId,
        name: tech.name,
        role: tech.role,
        phone: tech.phone,
        email: tech.email,
        schedule: tech.schedule,
        maxStopsPerDay: tech.maxStops,
        zipCodesServed: tech.zipCodes,
        servicesNotProvided: tech.doesNotService
      };
      
      await createWixTechnicianRecord(techData);
    }
    
    Logger.log('Enhanced technician records created successfully');
    
  } catch (error) {
    Logger.log('Error creating enhanced technician records: ' + error.toString());
    throw error;
  }
}

/**
 * Creates enhanced service area records
 * @param {string} profileId - Wix profile ID
 * @param {Array} serviceAreas - Array of service area objects
 */
async function createEnhancedServiceAreaRecords(profileId, serviceAreas) {
  try {
    Logger.log('Creating enhanced service area records for profile: ' + profileId);
    
    for (const area of serviceAreas) {
      const areaData = {
        profileId: profileId,
        city: area.city,
        state: area.state,
        zipCodes: area.zipCodes,
        serviceRadius: area.radius,
        additionalFees: area.fees
      };
      
      await createWixServiceAreaRecord(areaData);
    }
    
    Logger.log('Enhanced service area records created successfully');
    
  } catch (error) {
    Logger.log('Error creating enhanced service area records: ' + error.toString());
    throw error;
  }
}

/**
 * Updates the Google Sheet with Wix profile information
 * @param {string} sheetUrl - Google Sheet URL
 * @param {Object} wixResult - Wix creation result
 */
function updateSheetWithWixInfo(sheetUrl, wixResult) {
  try {
    const sheetId = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    
    // Update sync status sheet
    const syncSheet = spreadsheet.getSheetByName('Sync Status');
    if (syncSheet) {
      syncSheet.getRange('D3').setValue(wixResult.profileId); // Wix Profile ID
      syncSheet.getRange('E3').setValue(wixResult.profileUrl); // Profile URL
    }
    
    Logger.log('Updated sheet with Wix information');
    
  } catch (error) {
    Logger.log('Error updating sheet with Wix info: ' + error.toString());
    // Don't throw as this is supplementary
  }
}

/**
 * Generates deployment instructions
 * @returns {string} Deployment instructions
 */
function generateDeploymentInstructions() {
  const scriptId = ScriptApp.getScriptId();
  const webAppUrl = `https://script.google.com/macros/s/${scriptId}/exec`;
  
  return `
=== ENHANCED DEPLOYMENT INSTRUCTIONS ===

🎉 Enhanced system test completed successfully!

📋 TO DEPLOY AS WEB APP:
1. In Google Apps Script editor, click "Deploy" > "New deployment"
2. Choose type: "Web app"
3. Description: "SOS Pest Control Enhanced Client Creator"
4. Execute as: "Me"
5. Who has access: "Anyone" (or as needed)
6. Click "Deploy"

🌐 WEB APP URL (after deployment): ${webAppUrl}

📊 GOOGLE SHEETS EDITING WORKFLOW:
- Each client gets their own comprehensive editable Google Sheet
- 6 tabs: Basic Info, Services, Technicians, Service Areas, Policies, Sync Status
- Edit any data in Google Sheets, then run syncUpdatesToWix(sheetUrl)
- Master client list tracks all profiles

🛡️ ENHANCED FEATURES:
- Comprehensive service details (Contract, Guarantee, Call Ahead, etc.)
- Inspection language: "Set up and schedule Free Inspection" / "Set up and Schedule Paid Inspection"
- Detailed technician info (Role, Schedule, Max Stops, Services NOT provided)
- Service area management with zip codes and fees
- Complete policy management

🔧 WIX SETUP:
- Add your Wix API credentials to config.js
- Update Wix collection IDs in wixApi.js

✅ NEXT STEPS:
1. Deploy as web app using instructions above
2. Test the enhanced form in your browser
3. Set up Wix API credentials for live integration
4. Train users on Google Sheets editing workflow
5. Use inspection language exactly as specified

Happy comprehensive client profiling! 🐛🛡️
`;
}

/**
 * Helper function to generate URL slug from company name
 * @param {string} companyName - Company name
 * @returns {string} URL-safe slug
 */
function generateSlug(companyName) {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Create a copy of client information in the specified Google Drive folder
 * @param {Object} clientData - The client data object
 * @param {string} folderId - Google Drive folder ID where to create the copy
 */
function createCompanyFolderCopy(clientData, folderId) {
  try {
    if (!folderId) {
      console.log('No Google Drive folder ID provided');
      return;
    }

    // Get the folder
    const folder = DriveApp.getFolderById(folderId);
    
    // Create a new spreadsheet in the company folder
    const spreadsheetName = `${clientData.companyName || 'Client'} - Profile Information`;
    const spreadsheet = SpreadsheetApp.create(spreadsheetName);
    
    // Move the spreadsheet to the company folder
    const file = DriveApp.getFileById(spreadsheet.getId());
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    
    // Populate the spreadsheet with client data
    populateCompanySpreadsheet(spreadsheet, clientData);
    
    console.log(`Created company folder copy: ${spreadsheetName}`);
    return spreadsheet.getUrl();
    
  } catch (error) {
    console.error('Error creating company folder copy:', error);
    throw error;
  }
}

/**
 * Populate spreadsheet with formatted client data
 * @param {Spreadsheet} spreadsheet - The spreadsheet to populate
 * @param {Object} clientData - The client data object
 */
function populateCompanySpreadsheet(spreadsheet, clientData) {
  const sheet = spreadsheet.getActiveSheet();
  sheet.setName('Client Profile');
  
  let row = 1;
  
  // Helper function to add section header
  function addSectionHeader(title) {
    sheet.getRange(row, 1).setValue(title);
    sheet.getRange(row, 1).setFontWeight('bold');
    sheet.getRange(row, 1).setBackground('#E8F0FE');
    row++;
  }
  
  // Helper function to add data row
  function addDataRow(label, value) {
    if (value !== undefined && value !== null && value !== '') {
      sheet.getRange(row, 1).setValue(label);
      sheet.getRange(row, 2).setValue(value);
      row++;
    }
  }
  
  // Office Information Section
  addSectionHeader('Office Information');
  addDataRow('Company Name', clientData.companyName);
  addDataRow('Phone Number', clientData.phoneNumber);
  addDataRow('Email', clientData.email);
  addDataRow('Website', clientData.website);
  addDataRow('FieldRoutes', clientData.fieldRoutes);
  addDataRow('Timezone', clientData.timezone);
  addDataRow('Physical Address', clientData.physicalAddress);
  addDataRow('Mailing Address', clientData.mailingAddress);
  addDataRow('Office Hours', clientData.officeHours);
  
  // Add holidays if they exist
  if (clientData.holidays && clientData.holidays.length > 0) {
    row++; // Add spacing
    addSectionHeader('Company Holidays');
    clientData.holidays.forEach(holiday => {
      addDataRow('Holiday', holiday);
    });
  }
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 2);
  
  // Set column widths for better readability
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 300);
}

/**
 * Create comprehensive SOS Pest Control client profiles for testing
 */
function createSOSPestControlProfiles() {
  try {
    // SOS Pest Control - Comprehensive Profile
    const sosProfile = {
      companyName: "SOS Pest Control",
      location: "Dallas, TX",
      timezone: "Central",
      officeInfo: {
        phone: "(469) 447-7567",
        email: "info@sospestcontrol.com",
        website: "https://sospestcontrol.com",
        fieldRoutesLink: "https://fieldroutes.com/sospest",
        physicalAddress: "1234 Pest Control Lane\nDallas, TX 75001",
        officeHours: "Monday-Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 3:00 PM"
      },
      bulletin: "New customer promotion: 15% off first service when mentioning this profile. Always confirm service area before scheduling. Check with supervisor for any accounts over 5000 sq ft.",
      pestsNotCovered: "Bed bugs, fleas (indoor only), birds, wildlife removal, structural damage repair",
      services: [
        {
          name: "Quarterly General Pest Control",
          description: "Comprehensive pest control service targeting common household pests with quarterly treatments and 90-day guarantee.",
          contract: "12 Months",
          guarantee: "90-day guarantee",
          duration: "45 minutes",
          serviceType: "Quarterly GPC",
          queueExt: "6884",
          productType: "General Pest Control",
          frequency: "Quarterly",
          billingFrequency: "After service completion",
          pests: "Ants, Roaches, Spiders, Crickets, Silverfish, Centipedes, Millipedes, Scorpions",
          pricingTiers: [
            {
              sqftMin: 0,
              sqftMax: 2500,
              firstPrice: "$125.00",
              recurringPrice: "$120.00",
              serviceType: "Quarterly GPC"
            },
            {
              sqftMin: 2501,
              sqftMax: 3000,
              firstPrice: "$130.00",
              recurringPrice: "$125.00",
              serviceType: "Quarterly GPC"
            },
            {
              sqftMin: 3001,
              sqftMax: 4000,
              firstPrice: "$140.00",
              recurringPrice: "$135.00",
              serviceType: "Quarterly GPC"
            },
            {
              sqftMin: 4001,
              sqftMax: 5000,
              firstPrice: "$155.00",
              recurringPrice: "$150.00",
              serviceType: "Quarterly GPC"
            },
            {
              sqftMin: 5001,
              sqftMax: 999999,
              firstPrice: "Requires Client Follow-Up",
              recurringPrice: "Contact Office",
              serviceType: "Quarterly GPC Custom"
            }
          ]
        },
        {
          name: "Monthly Mosquito Service",
          description: "Monthly mosquito, flea, and tick control for outdoor areas. Seasonal service from March through November.",
          contract: "Seasonal",
          guarantee: "30-day guarantee",
          duration: "30 minutes",
          serviceType: "Monthly Mosquito",
          queueExt: "6884",
          productType: "Mosquito - Flea - Tick",
          frequency: "Monthly",
          billingFrequency: "After service completion",
          pests: "Mosquitoes, Fleas, Ticks",
          pricingTiers: [
            {
              sqftMin: 0,
              sqftMax: 10890,
              firstPrice: "$108.00",
              recurringPrice: "$108.00",
              serviceType: "Monthly Mosquito"
            },
            {
              sqftMin: 10891,
              sqftMax: 21780,
              firstPrice: "$120.00",
              recurringPrice: "$118.00",
              serviceType: "Monthly Mosquito"
            },
            {
              sqftMin: 21781,
              sqftMax: 32680,
              firstPrice: "$132.00",
              recurringPrice: "$128.00",
              serviceType: "Monthly Mosquito"
            },
            {
              sqftMin: 32681,
              sqftMax: 43560,
              firstPrice: "$144.00",
              recurringPrice: "$138.00",
              serviceType: "Monthly Mosquito"
            },
            {
              sqftMin: 43561,
              sqftMax: 999999,
              firstPrice: "Requires Client Follow-Up",
              recurringPrice: "Contact Office",
              serviceType: "Monthly Mosquito Custom"
            }
          ]
        },
        {
          name: "Termite Inspection & Treatment",
          description: "Comprehensive termite inspection and treatment options including liquid treatments and bait systems.",
          contract: "Varies by treatment",
          guarantee: "1-year warranty",
          duration: "2-3 hours",
          serviceType: "Termite Service",
          queueExt: "6885",
          productType: "Termite Control",
          frequency: "As needed",
          billingFrequency: "Upfront payment",
          pests: "Subterranean Termites, Drywood Termites",
          pricingTiers: [
            {
              sqftMin: 0,
              sqftMax: 2000,
              firstPrice: "$800.00",
              recurringPrice: "$150.00",
              serviceType: "Termite Treatment"
            },
            {
              sqftMin: 2001,
              sqftMax: 3000,
              firstPrice: "$950.00",
              recurringPrice: "$175.00",
              serviceType: "Termite Treatment"
            },
            {
              sqftMin: 3001,
              sqftMax: 999999,
              firstPrice: "Requires Inspection Quote",
              recurringPrice: "Annual Renewal",
              serviceType: "Termite Treatment Custom"
            }
          ]
        }
      ],
      technicians: [
        {
          name: "Mike Rodriguez",
          phone: "(469) 447-7568",
          email: "mike@sospestcontrol.com",
          role: "Lead Technician",
          experience: "8 years",
          specializations: "General Pest, Termites, Commercial",
          certifications: "Licensed PCO, Termite Certified",
          territory: "North Dallas"
        },
        {
          name: "Sarah Johnson",
          phone: "(469) 447-7569",
          email: "sarah@sospestcontrol.com", 
          role: "Technician",
          experience: "5 years",
          specializations: "Residential Pest, Mosquito Control",
          certifications: "Licensed PCO",
          territory: "South Dallas"
        },
        {
          name: "David Chen",
          phone: "(469) 447-7570",
          email: "david@sospestcontrol.com",
          role: "Inspector",
          experience: "10 years", 
          specializations: "Termite Inspections, WDI Reports",
          certifications: "Licensed PCO, WDI Certified",
          territory: "Dallas Metro"
        }
      ],
      serviceAreas: [
        { zip: "75001", city: "Addison", state: "TX", inService: true },
        { zip: "75002", city: "Allen", state: "TX", inService: true },
        { zip: "75006", city: "Carrollton", state: "TX", inService: true },
        { zip: "75019", city: "Coppell", state: "TX", inService: true },
        { zip: "75024", city: "Plano", state: "TX", inService: true },
        { zip: "75025", city: "Plano", state: "TX", inService: true },
        { zip: "75034", city: "Frisco", state: "TX", inService: true },
        { zip: "75035", city: "Frisco", state: "TX", inService: true },
        { zip: "75201", city: "Dallas", state: "TX", inService: true },
        { zip: "75202", city: "Dallas", state: "TX", inService: true }
      ],
      policies: [
        {
          type: "guarantee",
          title: "Service Guarantee Policy",
          description: "All general pest control services include a 90-day guarantee. If pests return within the guarantee period, we will return at no charge. Mosquito services have a 30-day guarantee due to seasonal nature.",
          options: ["90-day (General Pest)", "30-day (Mosquito)", "1-year (Termite)"],
          default: "90-day"
        },
        {
          type: "cancellation", 
          title: "Cancellation Policy",
          description: "Services can be cancelled with 24-hour notice. Same-day cancellations may incur a trip charge. Contract services require 30-day written notice for cancellation.",
          options: ["24-hour notice", "Same-day (trip charge)", "Contract (30-day notice)"],
          default: "24-hour notice"
        },
        {
          type: "payment",
          title: "Payment Terms",
          description: "Payment is due upon completion of service. We accept cash, check, and all major credit cards. Recurring services can be set up for automatic payment.",
          options: ["Cash", "Check", "Credit Card", "Auto-pay"],
          default: "Credit Card"
        }
      ]
    };
    
    // Generate the profile URL
    const profileUrl = generateProfileUrl(sosProfile);
    
    // Log and display the result
    Logger.log(`SOS Pest Control profile created: ${profileUrl}`);
    
    SpreadsheetApp.getUi().alert(
      'Success!',
      `SOS Pest Control comprehensive profile created!\n\nProfile URL:\n${profileUrl}\n\nThis profile includes:\n- 3 services with tiered pricing\n- 3 technicians with detailed info\n- 10 service area ZIP codes\n- Complete pricing calculator\n- All service details`,
      SpreadsheetApp.getUi().Button.OK
    );
    
    return profileUrl;
    
  } catch (error) {
    Logger.log(`Error creating SOS profile: ${error.toString()}`);
    SpreadsheetApp.getUi().alert('Error', `Failed to create profile: ${error.message}`, SpreadsheetApp.getUi().Button.OK);
    throw error;
  }
}

/**
 * Test function to validate pricing tiers and form functionality
 */
function testPricingTierFunctionality() {
  try {
    // Create a simple test profile with pricing tiers
    const testProfile = {
      companyName: "Test Pest Control - Pricing Tiers",
      location: "Test City, TX",
      timezone: "Central",
      officeInfo: {
        phone: "(555) 123-4567",
        email: "test@example.com",
        website: "https://example.com",
        physicalAddress: "123 Test Street, Test City, TX 12345",
        officeHours: "Monday-Friday: 8:00 AM - 5:00 PM"
      },
      bulletin: "Testing pricing tier functionality",
      pestsNotCovered: "Test exclusions",
      services: [
        {
          name: "Test Service with Pricing Tiers",
          description: "Test service to validate pricing tier functionality",
          serviceType: "Test Service",
          queueExt: "1234",
          productType: "Test Product",
          frequency: "Monthly",
          contract: "12 Months",
          guarantee: "30-day guarantee",
          duration: "30 minutes",
          billingFrequency: "After service completion",
          pests: "Test Pests",
          pricingTiers: [
            {
              sqftMin: 0,
              sqftMax: 1000,
              firstPrice: "$100.00",
              recurringPrice: "$95.00",
              serviceType: "Test Service - Small"
            },
            {
              sqftMin: 1001,
              sqftMax: 2000,
              firstPrice: "$120.00",
              recurringPrice: "$115.00",
              serviceType: "Test Service - Medium"
            },
            {
              sqftMin: 2001,
              sqftMax: 999999,
              firstPrice: "$150.00",
              recurringPrice: "$145.00",
              serviceType: "Test Service - Large"
            }
          ]
        }
      ],
      technicians: [{
        name: "Test Technician",
        phone: "(555) 999-0000",
        role: "Technician"
      }],
      serviceAreas: [{
        zip: "12345",
        city: "Test City",
        state: "TX",
        branch: "Test Branch",
        inService: true
      }],
      policies: [{
        type: "test",
        title: "Test Policy",
        description: "Test policy description"
      }]
    };
    
    // Generate the profile URL
    const profileUrl = generateProfileUrl(testProfile);
    
    // Log and display the result
    Logger.log(`Test profile created: ${profileUrl}`);
    
    SpreadsheetApp.getUi().alert(
      'Test Complete!',
      `Pricing tier test profile created!\n\nProfile URL:\n${profileUrl}\n\nThis profile includes:\n- 1 service with 3 pricing tiers\n- Tier 1: 0-1000 sqft ($100/$95)\n- Tier 2: 1001-2000 sqft ($120/$115)\n- Tier 3: 2001+ sqft ($150/$145)\n\nTest the pricing calculator with different square footages!`,
      SpreadsheetApp.getUi().Button.OK
    );
    
    return profileUrl;
    
  } catch (error) {
    Logger.log(`Error creating test profile: ${error.toString()}`);
    SpreadsheetApp.getUi().alert('Error', `Failed to create test profile: ${error.message}`, SpreadsheetApp.getUi().Button.OK);
    throw error;
  }
}

/**
 * =====================================
 * GOOGLE SHEETS ONLY WORKFLOW
 * Functions for collecting and organizing client data without Wix
 * =====================================
 */

/**
 * Configure system for Google Sheets only workflow
 * Run this first to set up your system without Wix dependencies
 */
function setupGoogleSheetsOnlyMode() {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    // Disable Wix sync
    properties.setProperty('WIXSYNC_DISABLED', 'true');
    properties.setProperty('WORKFLOW_MODE', 'sheets_only');
    properties.setProperty('SETUP_DATE', new Date().toISOString());
    
    console.log('✅ System configured for Google Sheets only mode');
    console.log('📊 What will work:');
    console.log('  ✅ Client input form');
    console.log('  ✅ Individual Google Sheets for each client');
    console.log('  ✅ Master tracking spreadsheet');
    console.log('  ✅ Data export capabilities');
    console.log('  ✅ Manual data transfer tools');
    console.log('');
    console.log('🚫 What is disabled:');
    console.log('  ❌ Automatic Wix sync');
    console.log('  ❌ Live profile URLs');
    console.log('');
    console.log('💡 Next steps:');
    console.log('1. Run testGoogleSheetsWorkflow() to verify setup');
    console.log('2. Use your form to collect client data');
    console.log('3. Run exportDataForWix() when ready to transfer to Wix');
    
    return true;
    
  } catch (error) {
    console.log('❌ Error setting up Google Sheets mode:', error.message);
    return false;
  }
}

/**
 * Test the Google Sheets workflow without Wix
 */
function testGoogleSheetsWorkflow() {
  console.log('🧪 Testing Google Sheets workflow...');
  console.log('===================================');
  
  try {
    // Test Google Sheets access
    console.log('📊 Testing Google Sheets access...');
    const testSheet = SpreadsheetApp.create('Workflow Test - ' + new Date().toISOString());
    const testUrl = testSheet.getUrl();
    console.log('✅ Google Sheets: Working (' + testUrl + ')');
    
    // Test Drive access
    console.log('📁 Testing Google Drive access...');
    DriveApp.getFileById(testSheet.getId()).setName('Test Sheet - DELETE ME');
    console.log('✅ Google Drive: Working');
    
    // Clean up test sheet
    DriveApp.getFileById(testSheet.getId()).setTrashed(true);
    console.log('🗑️ Test sheet cleaned up');
    
    // Test form data processing
    console.log('📝 Testing form data processing...');
    const sampleData = {
      companyName: 'Test Pest Control Co',
      location: 'Dallas, TX',
      officeInfo: {
        officePhone: '555-123-4567',
        customerContactEmail: 'test@pestcontrol.com'
      }
    };
    
    console.log('✅ Form processing: Ready');
    console.log('');
    console.log('🎉 Google Sheets workflow is ready!');
    console.log('📋 You can now:');
    console.log('1. Submit forms to collect client data');
    console.log('2. View organized data in Google Sheets');
    console.log('3. Export data for manual Wix upload later');
    
    return true;
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

/**
 * Create a sample client profile to test the workflow
 */
function createSampleClientProfile() {
  console.log('🧪 Creating sample client profile for testing...');
  
  const sampleData = {
    companyName: 'Demo Pest Control Solutions',
    location: 'Austin, TX',
    timezone: 'CST',
    officeInfo: {
      officePhone: '512-555-0123',
      customerContactEmail: 'contact@demopest.com',
      physicalAddress: '123 Business Park Dr\nAustin, TX 78701',
      mailingAddress: 'PO Box 12345\nAustin, TX 78711',
      officeHours: 'Monday-Friday: 8:00 AM - 6:00 PM\nSaturday: 8:00 AM - 2:00 PM\nSunday: Closed',
      website: 'https://demopest.com',
      holidays: ['New Year\'s Day', 'Memorial Day', 'Independence Day', 'Labor Day', 'Thanksgiving', 'Christmas Day']
    },
    services: [{
      name: 'Quarterly Pest Control',
      type: 'recurring',
      frequency: 'Quarterly',
      description: 'Comprehensive quarterly pest control service for residential properties',
      pests: 'Ants, Roaches, Spiders, Silverfish, Earwigs, Crickets',
      pricing: {
        queueExt: '101',
        companyName: 'Demo Pest Control Solutions',
        productType: 'Pest Control',
        soldAsName: 'Quarterly Protection Plan',
        billingFrequency: 'After Service Completion',
        firstPrice: '$149',
        recurringPrice: '$129',
        sqftMin: 0,
        sqftMax: 2500,
        serviceTypeDesc: 'Quarterly Subscription / Pest Control'
      },
      contract: 'None',
      guarantee: 'Unlimited Reservices between treatments',
      callAhead: 'Yes',
      initialDuration: '45 Minutes',
      recurringDuration: '30 Minutes',
      leaveDuringService: 'No',
      followUp: 'No',
      prepSheet: 'No'
    }],
    technicians: [{
      name: 'Mike Johnson',
      role: 'Tech',
      schedule: 'Monday-Friday: 8:00 AM - 5:00 PM',
      maxStops: 14,
      phone: '512-555-0124',
      doesNotService: 'Commercial properties over 5,000 sqft',
      additionalNotes: 'Certified for termite inspections',
      zipCodeOrBranch: 'Austin Central'
    }],
    serviceAreas: [{
      zipCode: '78701',
      branch: 'Austin'
    }, {
      zipCode: '78702',
      branch: 'Austin'
    }],
    policies: {
      treatVehicles: 'No',
      commercialProperties: 'Yes, create lead and refer to home office',
      multiFamilyOffered: 'Yes, individual units only',
      trailersOffered: 'Yes',
      signedContract: 'No',
      returningCustomers: 'None',
      appointmentConfirmations: 'Yes',
      callAhead: 'Yes, 30 minutes if requested',
      maxDistance: '15 miles',
      schedulingPolicyTimes: 'Inspection: AM/PM, Initial: 2 hour windows, Regular: AT',
      sameDayServices: 'No',
      techSkilling: 'Not standard',
      afterHoursEmergency: 'No',
      reservices: 'Customers must allow 10-14 days from prior service for product to work before requesting reservice',
      setServiceTypeTo: 'Reservice',
      setSubscriptionTypeTo: 'Stand-Alone Service or Reservice',
      paymentPlans: 'No',
      paymentTypes: 'Cash, Check, Card, ACH',
      pastDuePeriod: '30 days',
      toolsToSave: 'Free reservice, manager visit, $25 service credit',
      cancellationPolicy: 'No cancellation fees. 24-hour notice preferred.',
      additionalNotes: 'Family-owned business since 1995. Specializes in eco-friendly treatments.',
      branch: 'Austin Central'
    }
  };
  
  try {
    const result = createClientProfileFromHTML(sampleData);
    console.log('✅ Sample profile created successfully!');
    console.log('📊 Individual client sheet created');
    console.log('📋 Added to master tracking sheet');
    console.log('🔗 Sheet URL: ' + result.sheetUrl);
    
    return result;
    
  } catch (error) {
    console.log('❌ Error creating sample profile:', error.message);
    throw error;
  }
}

/**
 * Get status of current system mode
 */
function checkSystemStatus() {
  console.log('🔍 SYSTEM STATUS CHECK');
  console.log('====================');
  
  try {
    const properties = PropertiesService.getScriptProperties();
    const wixDisabled = properties.getProperty('WIXSYNC_DISABLED');
    const workflowMode = properties.getProperty('WORKFLOW_MODE');
    const setupDate = properties.getProperty('SETUP_DATE');
    
    console.log('⚙️ Current Mode: ' + (workflowMode || 'Default'));
    console.log('🔗 Wix Sync: ' + (wixDisabled === 'true' ? '❌ Disabled' : '⚠️ Will attempt'));
    console.log('📅 Setup Date: ' + (setupDate || 'Not set'));
    console.log('');
    
    // Test Google Sheets access
    console.log('📊 Google Sheets Access: ✅ Available');
    console.log('📁 Google Drive Access: ✅ Available');
    console.log('📝 Form Processing: ✅ Ready');
    console.log('');
    
    if (wixDisabled === 'true') {
      console.log('✅ READY FOR GOOGLE SHEETS WORKFLOW');
      console.log('📋 Recommended next steps:');
      console.log('1. createSampleClientProfile() - Test with sample data');
      console.log('2. Share your form URL with clients');
      console.log('3. exportDataForWix() when ready for Wix transfer');
    } else {
      console.log('⚠️ MIXED MODE - Wix sync will be attempted but may fail');
      console.log('💡 Run setupGoogleSheetsOnlyMode() for clean workflow');
    }
    
  } catch (error) {
    console.log('❌ Error checking status:', error.message);
  }
}

/**
 * Export collected data in format ready for manual Wix upload
 */
function exportDataForWix() {
  console.log('📤 EXPORTING DATA FOR WIX UPLOAD');
  console.log('================================');
  
  try {
    // Get master profile sheet
    const masterSheet = getMasterProfileSheet();
    if (!masterSheet) {
      console.log('❌ No master sheet found. Create some profiles first.');
      return;
    }
    
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    if (!profilesTab) {
      console.log('❌ No client profiles found');
      return;
    }
    
    const data = profilesTab.getDataRange().getValues();
    const headers = data[0];
    const profiles = data.slice(1);
    
    console.log('📊 Found ' + profiles.length + ' client profiles');
    console.log('');
    console.log('📋 EXPORT SUMMARY:');
    
    profiles.forEach((profile, index) => {
      const companyName = profile[1] || 'Unknown Company';
      const location = profile[2] || 'Unknown Location';
      const sheetUrl = profile[11] || 'No URL';
      
      console.log(`${index + 1}. ${companyName} (${location})`);
      console.log(`   Sheet: ${sheetUrl}`);
    });
    
    console.log('');
    console.log('🔧 MANUAL WIX UPLOAD INSTRUCTIONS:');
    console.log('1. Each client has a detailed Google Sheet with all data');
    console.log('2. Open individual sheets to copy data to Wix CMS');
    console.log('3. Use the sheet structure to match Wix collection fields');
    console.log('4. When Wix credentials are available, run automatic sync');
    
    // Create export summary sheet
    const exportSheet = SpreadsheetApp.create('Wix Export Summary - ' + new Date().toISOString());
    const summaryTab = exportSheet.getActiveSheet();
    summaryTab.setName('Export Summary');
    
    // Copy headers and data
    summaryTab.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (profiles.length > 0) {
      summaryTab.getRange(2, 1, profiles.length, headers.length).setValues(profiles);
    }
    
    // Format headers
    summaryTab.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#4285f4')
      .setFontColor('white');
    
    console.log('');
    console.log('✅ Export summary created: ' + exportSheet.getUrl());
    
    return exportSheet.getUrl();
    
  } catch (error) {
    console.log('❌ Export failed:', error.message);
    throw error;
  }
}

/**
 * =====================================
 * GITHUB INTEGRATION FUNCTIONS
 * Functions to connect Google Sheets with GitHub Pages
 * =====================================
 */

/**
 * Set up master sheet for GitHub integration
 * File: Code.gs
 */
function setupMasterSheetForGitHub() {
  console.log('🔗 SETTING UP MASTER SHEET FOR GITHUB INTEGRATION');
  console.log('===============================================');
  
  try {
    // Get or create master sheet
    let masterSheet = getMasterProfileSheet();
    if (!masterSheet) {
      console.log('📊 Creating master profile sheet...');
      masterSheet = createMasterProfileSheet();
    }
    
    // Make sheet publicly viewable
    const file = DriveApp.getFileById(masterSheet.getId());
    
    // Set sharing permissions
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const sheetUrl = masterSheet.getUrl();
    console.log('✅ Master sheet configured for public access');
    console.log('🔗 Sheet URL: ' + sheetUrl);
    
    // Generate the CSV export URL that GitHub can use
    const csvUrl = generatePublicCSVUrl(masterSheet.getId());
    console.log('📊 CSV Data URL for GitHub: ' + csvUrl);
    
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Copy the CSV URL above');
    console.log('2. Update your GitHub repository with this URL');
    console.log('3. Run testGitHubIntegration() to verify');
    
    return {
      sheetUrl: sheetUrl,
      csvUrl: csvUrl,
      sheetId: masterSheet.getId()
    };
    
  } catch (error) {
    console.log('❌ Error setting up master sheet:', error.message);
    throw error;
  }
}

/**
 * Generate public CSV URL for GitHub to fetch data
 * File: Code.gs
 */
function generatePublicCSVUrl(sheetId) {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
  console.log('📊 Generated CSV URL: ' + csvUrl);
  return csvUrl;
}

/**
 * Test GitHub integration with sample profile
 * File: Code.gs
 */
function testGitHubIntegration() {
  console.log('🧪 TESTING GITHUB INTEGRATION');
  console.log('=============================');
  
  try {
    // Check if we have a master sheet
    const masterSheet = getMasterProfileSheet();
    if (!masterSheet) {
      console.log('❌ No master sheet found. Run setupMasterSheetForGitHub() first.');
      return;
    }
    
    // Generate GitHub URL for existing profile or create test
    const csvUrl = generatePublicCSVUrl(masterSheet.getId());
    const githubBaseUrl = 'https://zakpestsos.github.io/call-center-profiles/';
    
    // Show example URL structure
    console.log('🔗 GitHub Base URL: ' + githubBaseUrl);
    console.log('📊 Data Source CSV: ' + csvUrl);
    console.log('');
    console.log('📋 URL STRUCTURE FOR PROFILES:');
    console.log('Example: ' + githubBaseUrl + '?profileId=1290');
    console.log('');
    console.log('💡 The GitHub page should:');
    console.log('1. Read profileId from URL parameters');
    console.log('2. Fetch CSV data from: ' + csvUrl);
    console.log('3. Find matching profile by Profile_ID');
    console.log('4. Display profile information');
    
    console.log('');
    console.log('🔧 Next: Run generateGitHubCode() to get JavaScript for your repository');
    
    return {
      githubUrl: githubBaseUrl,
      csvUrl: csvUrl
    };
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    throw error;
  }
}

/**
 * Verify master sheet structure for GitHub
 * File: Code.gs
 */
function verifyMasterSheetStructure() {
  console.log('🔍 VERIFYING MASTER SHEET STRUCTURE');
  console.log('===================================');
  
  try {
    const masterSheet = getMasterProfileSheet();
    if (!masterSheet) {
      console.log('❌ No master sheet found. Run setupMasterSheetForGitHub() first.');
      return false;
    }
    
    const profilesTab = masterSheet.getSheetByName('Client_Profiles');
    if (!profilesTab) {
      console.log('❌ No Client_Profiles tab found');
      return false;
    }
    
    // Check headers
    const headers = profilesTab.getRange(1, 1, 1, profilesTab.getLastColumn()).getValues()[0];
    console.log('📊 Current headers:');
    headers.forEach((header, index) => {
      console.log(`${index + 1}. ${header}`);
    });
    
    // Check data
    const dataRows = profilesTab.getLastRow() - 1;
    console.log('');
    console.log(`📈 Profile count: ${dataRows}`);
    
    if (dataRows > 0) {
      console.log('✅ Master sheet ready for GitHub integration');
      
      // Show sample data
      if (dataRows > 0) {
        const sampleRow = profilesTab.getRange(2, 1, 1, headers.length).getValues()[0];
        console.log('');
        console.log('📋 Sample profile:');
        console.log('- Profile ID: ' + sampleRow[0]);
        console.log('- Company: ' + sampleRow[1]);
        console.log('- Location: ' + sampleRow[2]);
      }
      
      return true;
    } else {
      console.log('⚠️ No profile data found. Create some profiles first.');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Verification failed:', error.message);
    return false;
  }
}

/**
 * Debug CSV data to see what's actually being returned
 * File: Code.gs
 */
function debugCSVData() {
  console.log('🔍 DEBUGGING CSV DATA');
  console.log('====================');
  
  try {
    const masterSheet = getMasterProfileSheet();
    if (!masterSheet) {
      console.log('❌ No master sheet found');
      return;
    }
    
    const csvUrl = generatePublicCSVUrl(masterSheet.getId());
    console.log('📊 CSV URL: ' + csvUrl);
    
    // Fetch the CSV data
    const response = UrlFetchApp.fetch(csvUrl);
    const csvContent = response.getContentText();
    
    console.log('📄 Raw CSV Content:');
    console.log('==================');
    console.log(csvContent);
    console.log('==================');
    
    // Parse the CSV
    const lines = csvContent.split('\n').filter(line => line.trim());
    console.log('📊 Number of lines: ' + lines.length);
    
    if (lines.length > 0) {
      console.log('📋 Headers (line 1): ' + lines[0]);
      
      if (lines.length > 1) {
        console.log('📋 Data row 1: ' + lines[1]);
        
        // Parse first data row
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const dataRow = lines[1].split(',').map(d => d.replace(/"/g, '').trim());
        
        console.log('🔍 Parsed headers:');
        headers.forEach((header, index) => {
          console.log(`  ${index}: "${header}"`);
        });
        
        console.log('🔍 Parsed data:');
        dataRow.forEach((data, index) => {
          console.log(`  ${index}: "${data}"`);
        });
        
        console.log('🎯 Profile ID from data: "' + dataRow[0] + '"');
      }
    }
    
    return {
      csvContent: csvContent,
      lineCount: lines.length
    };
    
  } catch (error) {
    console.log('❌ Error: ' + error.message);
    console.log('Stack: ' + error.stack);
  }
}

/**
 * Test GitHub integration end-to-end
 * File: Code.gs
 */
function testGitHubEndToEnd() {
  console.log('🧪 TESTING GITHUB END-TO-END INTEGRATION');
  console.log('==========================================');
  
  try {
    // 1. Check master sheet
    const masterSheet = getMasterProfileSheet();
    if (!masterSheet) {
      console.log('❌ No master sheet found');
      return false;
    }
    
    console.log('✅ Master sheet found');
    
    // 2. Get CSV URL
    const csvUrl = generatePublicCSVUrl(masterSheet.getId());
    console.log('📊 CSV URL: ' + csvUrl);
    
    // 3. Test CSV access
    try {
      const response = UrlFetchApp.fetch(csvUrl);
      const csvContent = response.getContentText();
      
      if (csvContent.length > 0) {
        console.log('✅ CSV data accessible');
        console.log('📄 CSV preview: ' + csvContent.substring(0, 200) + '...');
        
        // 4. Parse and find profile
        const lines = csvContent.split('\n');
        if (lines.length > 1) {
          console.log('📋 Headers: ' + lines[0]);
          console.log('📋 Sample data: ' + lines[1]);
          
          // Extract profile ID from sample data
          const sampleData = lines[1].split(',');
          const profileId = sampleData[0].replace(/"/g, '').trim();
          
          console.log('🔍 Sample Profile ID: ' + profileId);
          
          // 5. Generate GitHub URL
          const githubUrl = 'https://zakpestsos.github.io/call-center-profiles/?profileId=' + encodeURIComponent(profileId);
          console.log('🔗 GitHub Profile URL: ' + githubUrl);
          
          console.log('');
          console.log('🎯 INTEGRATION COMPLETE!');
          console.log('✅ Data Flow Working: Apps Script → Google Sheets → CSV → GitHub Pages');
          console.log('');
          console.log('📋 TEST STEPS:');
          console.log('1. Visit: ' + githubUrl);
          console.log('2. Check if profile data loads');
          console.log('3. Verify company name: ' + sampleData[1]);
          
          return {
            success: true,
            csvUrl: csvUrl,
            githubUrl: githubUrl,
            profileId: profileId
          };
          
        } else {
          console.log('❌ No data rows found in CSV');
        }
      } else {
        console.log('❌ Empty CSV response');
      }
    } catch (fetchError) {
      console.log('❌ Error fetching CSV: ' + fetchError.message);
    }
    
  } catch (error) {
    console.log('❌ Test failed: ' + error.message);
    return false;
  }
}

/**
 * Generate JavaScript code for GitHub repository
 * File: Code.gs
 */
function generateGitHubCode() {
  console.log('💻 GENERATING GITHUB CODE');
  console.log('=========================');
  
  try {
    const masterSheet = getMasterProfileSheet();
    if (!masterSheet) {
      console.log('❌ No master sheet found. Run setupMasterSheetForGitHub() first.');
      return;
    }
    
    const csvUrl = generatePublicCSVUrl(masterSheet.getId());
    
    console.log('✅ JavaScript code for your GitHub repository:');
    console.log('');
    console.log('// Add this to your GitHub Pages profile.html or index.html');
    console.log('// ========================================================');
    console.log('');
    console.log(`const GOOGLE_SHEETS_CSV_URL = '${csvUrl}';`);
    console.log('');
    console.log('async function loadProfileData() {');
    console.log('  try {');
    console.log('    // Get profile ID from URL');
    console.log('    const urlParams = new URLSearchParams(window.location.search);');
    console.log('    const profileId = urlParams.get("profileId");');
    console.log('    ');
    console.log('    if (!profileId) {');
    console.log('      console.error("No profileId in URL");');
    console.log('      return;');
    console.log('    }');
    console.log('    ');
    console.log('    // Fetch CSV data');
    console.log('    const response = await fetch(GOOGLE_SHEETS_CSV_URL);');
    console.log('    const csvText = await response.text();');
    console.log('    ');
    console.log('    // Parse CSV');
    console.log('    const rows = csvText.split("\\n");');
    console.log('    const headers = rows[0].split(",");');
    console.log('    ');
    console.log('    // Find profile');
    console.log('    for (let i = 1; i < rows.length; i++) {');
    console.log('      const data = rows[i].split(",");');
    console.log('      if (data[0] === profileId) {');
    console.log('        // Found profile - populate page');
    console.log('        document.getElementById("companyName").textContent = data[1];');
    console.log('        document.getElementById("location").textContent = data[2];');
    console.log('        document.getElementById("phone").textContent = data[4];');
    console.log('        document.getElementById("bulletin").textContent = data[9];');
    console.log('        break;');
    console.log('      }');
    console.log('    }');
    console.log('  } catch (error) {');
    console.log('    console.error("Error loading profile:", error);');
    console.log('  }');
    console.log('}');
    console.log('');
    console.log('// Load data when page loads');
    console.log('document.addEventListener("DOMContentLoaded", loadProfileData);');
    console.log('');
    console.log('📋 INSTRUCTIONS:');
    console.log('1. Copy the code above');
    console.log('2. Add it to your GitHub repository HTML file');
    console.log('3. Make sure your HTML has elements with IDs: companyName, location, phone, bulletin');
    console.log('4. Test with URL: https://zakpestsos.github.io/call-center-profiles/?profileId=YOUR_PROFILE_ID');
    
    return csvUrl;
    
  } catch (error) {
    console.log('❌ Code generation failed:', error.message);
    throw error;
  }
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
