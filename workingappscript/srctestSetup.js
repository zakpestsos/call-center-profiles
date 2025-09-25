/**
 * Test Script for Wix Call Center Integration
 * Run these functions to test your setup step by step
 */

/**
 * Step 1: Test Wix API Connection
 * Run this first to verify your credentials are working
 */
function step1_testConnection() {
  Logger.log('=== STEP 1: Testing Wix Connection ===');
  
  try {
    const result = testWixConnection();
    if (result) {
      Logger.log('✅ SUCCESS: Wix API connection working');
      return true;
    } else {
      Logger.log('❌ FAILED: Wix API connection failed');
      return false;
    }
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    Logger.log('💡 TIP: Make sure you\'ve run setupWixCredentials() first');
    return false;
  }
}

/**
 * Step 2: Set up your Wix credentials
 * Replace these with your actual values
 */
function step2_setupCredentials() {
  Logger.log('=== STEP 2: Setting up Wix Credentials ===');
  
  // 🚨 REPLACE THESE WITH YOUR ACTUAL VALUES 🚨
  const siteId = 'your-wix-site-id-here';
  const apiKey = 'your-wix-api-key-here';
  
  if (siteId === 'your-wix-site-id-here' || apiKey === 'your-wix-api-key-here') {
    Logger.log('❌ SETUP REQUIRED: Please edit this function with your actual Wix credentials');
    Logger.log('📝 Get Site ID from: Wix Dashboard → Settings → Domains');
    Logger.log('🔑 Get API Key from: Wix Dashboard → Settings → API Keys');
    return false;
  }
  
  try {
    setupWixCredentials(siteId, apiKey);
    Logger.log('✅ SUCCESS: Wix credentials configured');
    return true;
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    return false;
  }
}

/**
 * Step 3: Create a test profile
 * This will create sample data in your Wix collections
 */
function step3_createTestProfile() {
  Logger.log('=== STEP 3: Creating Test Profile ===');
  
  const testData = {
    companyName: "ACME Pest Control (TEST)",
    officeInfo: {
      locations: "Dallas, Texas",
      timezone: "Central",
      officePhone: "(555) 123-4567",
      customerContactEmail: "contact@acmepest.com",
      website: "https://acmepest.com",
      fieldRoutesLink: "https://acme.fieldroutes.com",
      physicalAddress: "123 Main Street\nDallas, TX 75001",
      mailingAddress: "PO Box 123\nDallas, TX 75001",
      officeHours: "Monday-Friday: 8:00 AM - 5:00 PM\nSaturday: 8:00 AM - 12:00 PM\nSunday: Closed",
      holidays: ["New Year's Day", "Independence Day", "Christmas Day"]
    },
    bulletin: "IMPORTANT: Davidson Pest Control has merged with Dynasty Pest Control. Welcome Davidson customers to the Dynasty family!",
    pestsNotCovered: "Stinging Insects (Wasps, Bees, Hornets), Skunks, Grubs",
    services: [
      {
        name: "General Pest ADVANTAGE",
        description: "The Advantage PC plan provides thorough initial service with ongoing exterior protection.",
        type: "recurring",
        pricing: {
          queueExt: "ADV001",
          companyName: "ACME Pest Control",
          productType: "Residential",
          soldAsName: "General Pest ADVANTAGE",
          billingFrequency: "Quarterly",
          firstPrice: "$150.00",
          recurringPrice: "$45.00",
          sqftMin: "0",
          sqftMax: "3000",
          serviceType: "Exterior Treatment"
        },
        pestsCovered: "Roaches, Ants, Spiders, Scorpions, Silverfish, Crickets",
        contractLength: "12 Months",
        guarantee: "Unlimited Reservices Between Regular Services",
        duration: "35 Minutes",
        serviceDetails: "Yes",
        serviceNote: "Standard residential pest control service",
        active: "Yes",
        variants: [
          {
            name: "General Pest PLUS",
            description: "Enhanced pest control with interior treatment",
            type: "variant",
            pricing: {
              queueExt: "ADV002",
              companyName: "ACME Pest Control",
              productType: "Residential",
              soldAsName: "General Pest PLUS",
              billingFrequency: "Quarterly",
              firstPrice: "$180.00",
              recurringPrice: "$65.00",
              sqftMin: "0",
              sqftMax: "3000",
              serviceType: "Interior + Exterior"
            },
            pestsCovered: "All pests covered in ADVANTAGE plus inside treatment",
            contractLength: "12 Months",
            guarantee: "Unlimited Reservices",
            duration: "45 Minutes",
            serviceDetails: "Yes",
            serviceNote: "Includes interior treatment"
          }
        ]
      }
    ],
    technicians: [
      {
        name: "John Smith",
        role: "Technician",
        schedule: "Monday-Friday: 8:00 AM - 4:00 PM",
        maxStops: 15,
        doesNotService: "Downtown Dallas",
        phone: "(555) 987-6543",
        zipCode: "75001",
        notes: "Experienced technician, handles commercial accounts"
      },
      {
        name: "Sarah Johnson",
        role: "Inspector",
        schedule: "Tuesday-Saturday: 9:00 AM - 5:00 PM",
        maxStops: 12,
        doesNotService: "",
        phone: "(555) 876-5432",
        zipCode: "75002",
        notes: "Specializes in termite inspections"
      }
    ],
    serviceAreas: [
      {
        zipCodes: "75001,75002,75003,75004,75005",
        branch: "North Dallas Branch",
        state: "TX"
      },
      {
        zipCodes: "75010,75011,75012,75013",
        branch: "East Dallas Branch", 
        state: "TX"
      }
    ],
    policies: {
      cancellation: "24-hour advance notice required for cancellations. Same-day cancellations may incur a service charge.",
      guarantee: "We guarantee our work! If you see pest activity between regular services, we'll return at no charge.",
      payment: "Payment is due at time of service. We accept cash, check, and major credit cards.",
      emergency: "Emergency services available 24/7 for severe infestations. Additional charges apply.",
      insurance: "Fully licensed, bonded, and insured. $1,000,000 liability coverage."
    }
  };
  
  try {
    const result = createWixProfile(testData);
    Logger.log('✅ SUCCESS: Test profile created');
    Logger.log('📊 Profile ID: ' + result.profileId);
    Logger.log('🌐 Profile URL: https://yoursite.com/profile/' + generateSlug(testData.companyName));
    Logger.log('💡 TIP: Check your Wix CMS to see the data in all collections');
    return result;
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    Logger.log('💡 TIP: Make sure all Wix collections are created first');
    return null;
  }
}

/**
 * Step 4: Test profile retrieval
 * This tests getting data back from Wix
 */
function step4_testProfileRetrieval(profileId) {
  Logger.log('=== STEP 4: Testing Profile Retrieval ===');
  
  if (!profileId) {
    Logger.log('❌ ERROR: No profile ID provided');
    Logger.log('💡 TIP: Run step3_createTestProfile() first and use the returned profile ID');
    return null;
  }
  
  try {
    const profile = getCallCenterProfile(profileId);
    Logger.log('✅ SUCCESS: Profile retrieved');
    Logger.log('📋 Company: ' + profile.companyName);
    Logger.log('🛡️ Services: ' + profile.services.length);
    Logger.log('👨‍🔧 Technicians: ' + profile.technicians.length);
    Logger.log('📜 Policies: ' + profile.policies.length);
    Logger.log('📍 Service Areas: ' + profile.serviceAreas.length);
    return profile;
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    return null;
  }
}

/**
 * Step 5: Test search functionality
 * This tests finding profiles by company name
 */
function step5_testSearch() {
  Logger.log('=== STEP 5: Testing Profile Search ===');
  
  try {
    const results = searchProfiles('ACME');
    Logger.log('✅ SUCCESS: Search completed');
    Logger.log('📊 Found ' + results.length + ' profiles');
    
    if (results.length > 0) {
      results.forEach((profile, index) => {
        Logger.log(`${index + 1}. ${profile.companyName} (ID: ${profile.profileId})`);
      });
    }
    
    return results;
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    return [];
  }
}

/**
 * Complete Test Suite
 * Run this to test everything at once
 */
function runCompleteTest() {
  Logger.log('🚀 STARTING COMPLETE TEST SUITE');
  Logger.log('=====================================');
  
  // Step 1: Test connection
  const connectionTest = step1_testConnection();
  if (!connectionTest) {
    Logger.log('❌ STOPPING: Fix connection issues first');
    return;
  }
  
  Logger.log('');
  
  // Step 3: Create test profile (skip step 2 if credentials already set)
  const profileResult = step3_createTestProfile();
  if (!profileResult) {
    Logger.log('❌ STOPPING: Fix profile creation issues first');
    return;
  }
  
  Logger.log('');
  
  // Step 4: Test retrieval
  const retrievalTest = step4_testProfileRetrieval(profileResult.profileId);
  if (!retrievalTest) {
    Logger.log('❌ WARNING: Profile retrieval failed');
  }
  
  Logger.log('');
  
  // Step 5: Test search
  step5_testSearch();
  
  Logger.log('');
  Logger.log('🎉 TEST SUITE COMPLETE!');
  Logger.log('=====================================');
  Logger.log('✅ Next Steps:');
  Logger.log('1. Check your Wix CMS collections for data');
  Logger.log('2. Create your dynamic profile page in Wix');
  Logger.log('3. Add the Velo code to your page');
  Logger.log('4. Test the live profile page');
}

/**
 * Cleanup function to remove test data
 */
function cleanupTestData() {
  Logger.log('🧹 CLEANUP: Removing test profiles...');
  
  try {
    const testProfiles = searchProfiles('TEST');
    Logger.log('Found ' + testProfiles.length + ' test profiles to remove');
    
    // Note: You would need to implement deleteWixRecord function
    // For now, just log the profiles that should be manually deleted
    testProfiles.forEach(profile => {
      Logger.log('Manual delete needed: ' + profile.companyName + ' (ID: ' + profile._id + ')');
    });
    
    Logger.log('💡 TIP: Delete test profiles manually from Wix CMS');
  } catch (error) {
    Logger.log('❌ ERROR during cleanup: ' + error.toString());
  }
}

/**
 * Quick setup check
 * Run this to see what still needs to be done
 */
function checkSetupStatus() {
  Logger.log('📋 SETUP STATUS CHECK');
  Logger.log('=====================');
  
  // Check credentials
  try {
    const config = getWixConfig();
    if (config.siteId && config.apiKey) {
      Logger.log('✅ Wix credentials configured');
    } else {
      Logger.log('❌ Wix credentials missing - run step2_setupCredentials()');
    }
  } catch (error) {
    Logger.log('❌ Wix credentials not set - run step2_setupCredentials()');
  }
  
  // Check connection
  try {
    const connected = testWixConnection();
    if (connected) {
      Logger.log('✅ Wix API connection working');
    } else {
      Logger.log('❌ Wix API connection failed');
    }
  } catch (error) {
    Logger.log('❌ Cannot test connection - fix credentials first');
  }
  
  // Check for test data
  try {
    const testProfiles = searchProfiles('ACME');
    if (testProfiles.length > 0) {
      Logger.log('✅ Test profile exists');
    } else {
      Logger.log('⚠️ No test profiles found - run step3_createTestProfile()');
    }
  } catch (error) {
    Logger.log('❌ Cannot search profiles - check setup');
  }
  
  Logger.log('');
  Logger.log('💡 Next: Run runCompleteTest() to test everything');
}
