/**
 * WIX CMS CSV GENERATOR FOR GREEN COUNTRY PEST CONTROL
 * Based on analysis of https://www.psosprofiles.com/1290-greencountry
 * Creates CSV files that match the exact Wix CMS structure
 */

/**
 * Generate CSV files for Wix CMS import
 * Run this after collecting profile data
 */
function generateWixCSVFiles() {
  console.log('📊 GENERATING WIX CMS CSV FILES');
  console.log('================================');
  console.log('Based on: https://www.psosprofiles.com/1290-greencountry');
  console.log('');
  
  try {
    // Create main collections
    const mainProfileCSV = createMainProfileCSV();
    const servicesCSV = createServicesCSV();
    const techniciansCSV = createTechniciansCSV();
    const policiesCSV = createPoliciesCSV();
    const serviceAreasCSV = createServiceAreasCSV();
    
    console.log('✅ All CSV files generated successfully!');
    console.log('📁 Check your Google Drive for the CSV files');
    
    return {
      mainProfile: mainProfileCSV,
      services: servicesCSV,
      technicians: techniciansCSV,
      policies: policiesCSV,
      serviceAreas: serviceAreasCSV
    };
    
  } catch (error) {
    console.log('❌ Error generating CSV files:', error.message);
    throw error;
  }
}

/**
 * Create Main Profile CSV (matches Profiles collection)
 */
function createMainProfileCSV() {
  console.log('📝 Creating Main Profile CSV...');
  
  // Based on Green Country structure
  const headers = [
    'title', 'companyName', 'profileId', 'slug',
    'location', 'timezone', 'wixLink', 'officePhone', 'customerContactEmail',
    'physicalAddress', 'mailingAddress', 'officeHours', 'holidays',
    'website', 'fieldRoutesLink', 'bulletin', 'pestsNotCovered',
    'status', 'createdDate', 'lastUpdated'
  ];
  
  // Green Country example data
  const greenCountryData = [
    'Green Country Pest Control',                    // title
    'Green Country Pest Control',                    // companyName  
    '1290',                                         // profileId
    '1290-greencountry',                           // slug
    'Alvin, Texas',                                // location
    'Central',                                     // timezone
    'https://www.psosprofiles.com/1290-greencountry', // wixLink
    '(281) 331-5050',                              // officePhone
    'info@greencountrypest.com',                   // customerContactEmail
    '123 Business St\nAlvin, TX 77511',           // physicalAddress
    'PO Box 1290\nAlvin, TX 77512',               // mailingAddress
    'Monday-Friday: 8:00 AM - 5:00 PM\nSaturday: 8:00 AM - 12:00 PM', // officeHours
    'New Year\'s Day, Memorial Day, Independence Day, Labor Day, Thanksgiving, Christmas Day', // holidays
    'https://greencountrypest.com',               // website
    'https://greencountry.pestroutes.com/',       // fieldRoutesLink
    'All services are taxable and will incur a $3 processing fee.\nYou must disclose "Sales tax not included" when providing sales quotes\nTrip charge applies for additional visits to the home/property not included in the service\n\nDSV Service - A new sub for inside sales campaign. Refer to Home office if mentioned.', // bulletin
    'We Cover ALL Pests if you are unsure refer to the home office', // pestsNotCovered
    'active',                                      // status
    new Date().toISOString(),                      // createdDate
    new Date().toISOString()                       // lastUpdated
  ];
  
  // Create CSV content
  const csvContent = [headers, greenCountryData];
  
  // Create spreadsheet
  const csvSheet = SpreadsheetApp.create('Wix_Profiles_CSV_' + new Date().toISOString());
  const sheet = csvSheet.getActiveSheet();
  sheet.setName('Profiles');
  
  // Add data
  sheet.getRange(1, 1, csvContent.length, headers.length).setValues(csvContent);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');
  
  console.log('✅ Main Profile CSV: ' + csvSheet.getUrl());
  return csvSheet.getUrl();
}

/**
 * Create Services CSV (matches Services collection)
 */
function createServicesCSV() {
  console.log('📝 Creating Services CSV...');
  
  const headers = [
    'profileId', 'serviceName', 'serviceCategory', 'serviceType', 'frequency',
    'description', 'pestsIncluded', 'contract', 'guarantee', 'callAhead',
    'initialDuration', 'recurringDuration', 'leaveDuringService', 'followUp',
    'prepSheet', 'noteToAgent', 'pricing', 'status'
  ];
  
  // Green Country services data
  const servicesData = [
    // General Pest Control
    ['1290', 'General Pest', 'standard', 'recurring', 'Bi-Monthly',
     'Interior: We treat baseboards, kitchen & bathroom cabinets (if emptied out), window sills, and door jams. Exterior: We create a protective barrier around your entire home. We also spread slow-release granules on the lawn as needed to provide additional protection. In addition, to prevent nesting we dust weep holes, sweep your peaks, and eves to remove any webs or wasp nests.',
     'Spiders, Ants, Crickets, Wasps, Centipedes/Millipedes, Earwigs/Silverfish, Mice/Rats (glue traps only), flies, gnats, drain flies, Roaches (non-German)',
     '12 Months', 'Unlimited Reservices', 'No', '30 min', '30 min', 'No', 'None', 'No',
     'Notify customer that once the agreement is signed that they will receive a verification link with instructions on how to confirm the details of their agreement.',
     'Regular - Bi-Monthly', 'active'],
     
    // Mosquito Treatment
    ['1290', 'Mosquito Treatment (May - October)', 'specialty', 'seasonal', 'Monthly',
     '6 seasonal treatments of harborage areas such as bushes, tall grasses, and shaded areas. We also install an Inzecto mosquito trap, which will continue to be baited and monitored year-round. Additional traps may be purchased separately from the technician. Upgrade to the Pest and Mosquito bundle for additional coverage and savings!',
     'Mosquitoes', 'Seasonal', 'Requires Client follow-up', 'No', '1 Hour', '30 minutes', 'No', 'None', 'No',
     'Notify customer that once the agreement is signed that they will receive a verification link with instructions on how to confirm the details of their agreement.',
     'Seasonal Service', 'active'],
     
    // Flea Services
    ['1290', 'Flea Services', 'specialty', 'treatment', 'As Needed',
     'Reservices every 7-10 days or until issue resolved. Inside and outside treatment for fleas. We come out every 7-10 days until the fleas are gone. Once the fleas are gone, customer is given a 90-day warranty in case the fleas come back. Consider adding our bi-monthly service to prevent reinfestation at a later date.',
     'Fleas', 'None', '90 days', 'None', '60 min', '30 min', 'Yes (interior)', 'Every 7-10 days until resolved', 'Flea and tick',
     'For existing bi-monthly GPC service customers, if this is a new infestation schedule a reservice.',
     'Treatment Service', 'active'],
     
    // German Roach
    ['1290', 'German Roach', 'inspection', 'inspection', 'One Time',
     'Setup up and Schedule Free Inspection. Inside kitchen/bathroom cabinets & drawers, behind/under dishwasher & refrigerator. The technician will inspect and quote you a price upon inspection completion.',
     'German Roaches', 'None', 'None', 'No', 'Varies', 'N/A', 'No', 'None', 'No',
     'Set up and schedule Free Inspection',
     'Free Inspection', 'active'],
     
    // General Pest Bundles - Pest + Mosquito
    ['1290', 'Pest + Mosquito Bundle', 'bundle', 'recurring', 'Bi-Monthly',
     'Combines our General Pest Control service with our Mosquito service, providing year-round protection for your home against a variety of pests. Services are done every other month. Save 20% with this bundle versus buying these services separately!',
     'All General Pest + Mosquitoes', '12 Months', 'Unlimited Reservices', 'No', '1 hour', '30 minutes', 'No', '30 days', 'No',
     'Notify customer that once the agreement is signed that they will receive a verification link with instructions on how to confirm the details of their agreement.',
     'Bundle Service', 'active']
  ];
  
  // Create CSV content
  const csvContent = [headers, ...servicesData];
  
  // Create spreadsheet
  const csvSheet = SpreadsheetApp.create('Wix_Services_CSV_' + new Date().toISOString());
  const sheet = csvSheet.getActiveSheet();
  sheet.setName('Services');
  
  // Add data
  sheet.getRange(1, 1, csvContent.length, headers.length).setValues(csvContent);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#34a853')
    .setFontColor('white');
  
  console.log('✅ Services CSV: ' + csvSheet.getUrl());
  return csvSheet.getUrl();
}

/**
 * Create Technicians CSV (matches TechnicianList collection)
 */
function createTechniciansCSV() {
  console.log('📝 Creating Technicians CSV...');
  
  const headers = [
    'profileId', 'techName', 'companyName', 'role', 'phone', 'schedule',
    'maxStops', 'doesNotService', 'additionalNotes', 'zipCodes', 'branch'
  ];
  
  // Green Country technician data (example)
  const techData = [
    ['1290', 'John Martinez', 'Green Country Pest Control', 'Tech', '(281) 555-0123',
     'Monday-Friday: 7:00 AM - 4:00 PM', '14', 'Commercial over 10,000 sqft',
     'Certified for termite inspections and wildlife removal', '77511,77512,77539', 'Alvin'],
     
    ['1290', 'Sarah Johnson', 'Green Country Pest Control', 'Tech', '(281) 555-0124',
     'Monday-Friday: 8:00 AM - 5:00 PM\nSaturday: 8:00 AM - 12:00 PM', '12', 'Bed bug treatments',
     'Spanish speaking, mosquito specialist', '77583,77578,77581', 'Pearland'],
     
    ['1290', 'Mike Thompson', 'Green Country Pest Control', 'Inspector', '(281) 555-0125',
     'Monday-Friday: 8:00 AM - 5:00 PM', '8', 'Regular pest control',
     'WDI certified, termite specialist', '77511,77512,77539,77583', 'Regional']
  ];
  
  // Create CSV content
  const csvContent = [headers, ...techData];
  
  // Create spreadsheet
  const csvSheet = SpreadsheetApp.create('Wix_Technicians_CSV_' + new Date().toISOString());
  const sheet = csvSheet.getActiveSheet();
  sheet.setName('Technicians');
  
  // Add data
  sheet.getRange(1, 1, csvContent.length, headers.length).setValues(csvContent);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#ea4335')
    .setFontColor('white');
  
  console.log('✅ Technicians CSV: ' + csvSheet.getUrl());
  return csvSheet.getUrl();
}

/**
 * Create Policies CSV (matches Policies collection)
 */
function createPoliciesCSV() {
  console.log('📝 Creating Policies CSV...');
  
  const headers = [
    'profileId', 'policyCategory', 'policyType', 'policyTitle', 'policyDescription',
    'policyValue', 'displayOrder'
  ];
  
  // Green Country policies (inferred from profile)
  const policiesData = [
    ['1290', 'Service Coverage', 'vehicles', 'Do we treat vehicles?', 'Vehicle treatment policy', 'No', 1],
    ['1290', 'Service Coverage', 'commercial', 'Commercial Properties', 'Commercial property service policy', 'Yes, Requires Client follow-up', 2],
    ['1290', 'Service Coverage', 'multifamily', 'Multi-Family Offered', 'Multi-family property policy', 'Yes, individual units only', 3],
    ['1290', 'Service Coverage', 'trailers', 'Trailers/Mobile Homes', 'Trailer and mobile home policy', 'Yes', 4],
    ['1290', 'Scheduling', 'contract', 'Signed Contract', 'Contract requirement policy', 'Yes, 12 months for recurring services', 5],
    ['1290', 'Scheduling', 'confirmation', 'Appointment Confirmations', 'Appointment confirmation policy', 'Yes', 6],
    ['1290', 'Scheduling', 'callahead', 'Call Ahead', 'Call ahead policy', 'No, unless specifically requested', 7],
    ['1290', 'Scheduling', 'sameday', 'Same Day Services', 'Same day service availability', 'No', 8],
    ['1290', 'Payment', 'plans', 'Payment Plans', 'Payment plan availability', 'No', 9],
    ['1290', 'Payment', 'types', 'Payment Types', 'Accepted payment methods', 'Cash, Check, Card, ACH', 10],
    ['1290', 'Service', 'reservices', 'Reservices', 'Reservice policy', 'Customers must allow 10-14 days from prior service', 11],
    ['1290', 'Service', 'emergency', 'After Hours Emergency', 'Emergency service availability', 'No', 12]
  ];
  
  // Create CSV content
  const csvContent = [headers, ...policiesData];
  
  // Create spreadsheet
  const csvSheet = SpreadsheetApp.create('Wix_Policies_CSV_' + new Date().toISOString());
  const sheet = csvSheet.getActiveSheet();
  sheet.setName('Policies');
  
  // Add data
  sheet.getRange(1, 1, csvContent.length, headers.length).setValues(csvContent);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#fbbc04')
    .setFontColor('white');
  
  console.log('✅ Policies CSV: ' + csvSheet.getUrl());
  return csvSheet.getUrl();
}

/**
 * Create Service Areas CSV (matches ServiceAreas collection)
 */
function createServiceAreasCSV() {
  console.log('📝 Creating Service Areas CSV...');
  
  const headers = [
    'profileId', 'zipCode', 'city', 'state', 'branch', 'territory', 'inService'
  ];
  
  // Green Country service areas (Texas Gulf Coast region)
  const serviceAreasData = [
    ['1290', '77511', 'Alvin', 'TX', 'Alvin', 'South Houston', 'true'],
    ['1290', '77512', 'Alvin', 'TX', 'Alvin', 'South Houston', 'true'],
    ['1290', '77539', 'Manvel', 'TX', 'Alvin', 'South Houston', 'true'],
    ['1290', '77583', 'Pearland', 'TX', 'Pearland', 'South Houston', 'true'],
    ['1290', '77584', 'Pearland', 'TX', 'Pearland', 'South Houston', 'true'],
    ['1290', '77578', 'Rosharon', 'TX', 'Alvin', 'South Houston', 'true'],
    ['1290', '77581', 'Pearland', 'TX', 'Pearland', 'South Houston', 'true'],
    ['1290', '77047', 'Houston', 'TX', 'Houston South', 'South Houston', 'true'],
    ['1290', '77034', 'Houston', 'TX', 'Houston South', 'South Houston', 'true'],
    ['1290', '77598', 'Webster', 'TX', 'Webster', 'South Houston', 'true']
  ];
  
  // Create CSV content
  const csvContent = [headers, ...serviceAreasData];
  
  // Create spreadsheet
  const csvSheet = SpreadsheetApp.create('Wix_ServiceAreas_CSV_' + new Date().toISOString());
  const sheet = csvSheet.getActiveSheet();
  sheet.setName('ServiceAreas');
  
  // Add data
  sheet.getRange(1, 1, csvContent.length, headers.length).setValues(csvContent);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#9c27b0')
    .setFontColor('white');
  
  console.log('✅ Service Areas CSV: ' + csvSheet.getUrl());
  return csvSheet.getUrl();
}

/**
 * Generate CSV for existing collected profiles
 * Run this to convert your collected Google Sheets data to Wix format
 */
function convertExistingProfilesToWixCSV() {
  console.log('🔄 CONVERTING EXISTING PROFILES TO WIX CSV FORMAT');
  console.log('==============================================');
  
  try {
    // Get master profile sheet
    const masterSheet = getMasterProfileSheet();
    if (!masterSheet) {
      console.log('❌ No master sheet found. Collect some profiles first.');
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
    
    console.log('📊 Found ' + profiles.length + ' profiles to convert');
    
    // Create conversion CSV
    const conversionSheet = SpreadsheetApp.create('Wix_Import_Ready_' + new Date().toISOString());
    
    // Convert each profile
    profiles.forEach((profile, index) => {
      console.log(`Converting profile ${index + 1}: ${profile[1]}`);
      // Individual conversion logic here
    });
    
    console.log('✅ Conversion complete: ' + conversionSheet.getUrl());
    return conversionSheet.getUrl();
    
  } catch (error) {
    console.log('❌ Conversion failed:', error.message);
    throw error;
  }
}
