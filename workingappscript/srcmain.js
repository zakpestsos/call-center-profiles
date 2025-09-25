/**
 * Main Google Apps Script file for Wix Client Profile Automation
 * This file contains the core functions for creating and managing client profiles
 */

/**
 * Web App Entry Point - Serves the client input form
 * This function is called when someone visits the web app URL
 */
function doGet(e) {
  try {
    Logger.log('doGet called with parameters:', e.parameter);
    
    const action = e.parameter.action;
    const profileId = e.parameter.profileId;
    
    // Handle API requests for production app
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
    
    // Handle edit form requests
    if (action === 'edit' && profileId) {
      return showEditForm(profileId);
    }
    
    // Test with a simple HTML first
    if (e.parameter && e.parameter.test) {
      return HtmlService.createHtmlOutput('<h1>Test Page Works!</h1><p>The web app is functioning.</p>')
        .setTitle('Test')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    // Serve the original clean client input form
    return HtmlService.createHtmlOutputFromFile('ui/client-input-form')
      .setTitle('Client Profile Creator')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    Logger.log('Error in doGet:', error);
    // Return detailed error information
    return HtmlService.createHtmlOutput(
      '<h1>Error Loading Form</h1>' +
      '<p><strong>Error:</strong> ' + error.toString() + '</p>' +
      '<p><strong>Stack:</strong> ' + (error.stack || 'No stack trace') + '</p>' +
      '<p><a href="?test=1">Try Test Page</a></p>'
    ).setTitle('Error');
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
 * Serves the original client input form for web app deployment
 */
function doGet() {
  try {
    Logger.log('Serving enhanced client input form');
    return HtmlService.createTemplateFromFile('ui/enhanced-client-form')
        .evaluate()
        .setTitle('SOS Pest Control - Enhanced Client Profile Creator')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    Logger.log('Error serving client input form: ' + error.toString());
    return HtmlService.createHtmlOutput('<h1>Error loading form</h1><p>' + error.message + '</p>');
  }
}

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
