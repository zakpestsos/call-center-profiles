/**
 * Wix API Integration Module
 * Handles all interactions with Wix CMS
 */

/**
 * Configuration for Wix API
 * These values should be set in the config module
 */
const WIX_CONFIG = {
  siteId: '', // Your Wix Site ID
  apiKey: '', // Your Wix API Key
  baseUrl: 'https://www.wixapis.com',
  collections: {
    profiles: 'Profiles',
    technicians: 'TechnicianList',
    policies: 'Policies',
    serviceAreas: 'ServiceAreas',
    services: 'Services',
    subServices: 'SubServices',
    spireZips: 'SpireZips', // For zip code lookup
    updates: 'Updates' // For Google Sheets updates
  }
};

/**
 * Creates a new profile in Wix CMS
 * @param {Object} clientData - Client data from Google Sheet or HTML form
 * @returns {Object} Creation result with profile ID
 */
function createWixProfile(clientData) {
  try {
    Logger.log('Creating Wix profile for: ' + clientData.companyName);
    
    // Initialize Wix credentials
    initializeWixCredentials();
    
    // Prepare profile data for Wix
    const profileData = prepareProfileData(clientData);
    
    // Create main profile record
    const profileResult = createWixRecord(WIX_CONFIG.collections.profiles, profileData);
    
    // Create associated records with the new data structure
    if (clientData.technicians && clientData.technicians.length > 0) {
      createTechnicianRecords(profileResult.id, clientData.technicians);
    }
    
    if (clientData.services && clientData.services.length > 0) {
      createServiceRecords(profileResult.id, clientData.services);
    }
    
    if (clientData.serviceAreas && clientData.serviceAreas.length > 0) {
      createServiceAreaRecords(profileResult.id, clientData.serviceAreas);
    }
    
    if (clientData.policies) {
      createPolicyRecords(profileResult.id, clientData.policies);
    }
    
    Logger.log('Profile created successfully with ID: ' + profileResult.id);
    
    return {
      success: true,
      profileId: profileResult.id,
      message: 'Profile created successfully'
    };
    
  } catch (error) {
    Logger.error('Error creating Wix profile:', error);
    throw new Error(`Failed to create Wix profile: ${error.message}`);
  }
}

/**
 * Prepares client data for Wix CMS format
 * @param {Object} clientData - Raw client data
 * @returns {Object} Formatted data for Wix
 */
function prepareProfileData(clientData) {
  return {
    title: clientData.companyName,
    companyName: clientData.companyName,
    profileId: generateProfileId(),
    slug: generateSlug(clientData.companyName),
    
    // Location and timezone information
    location: clientData.officeInfo?.locations || '',
    timezone: clientData.officeInfo?.timezone || '',
    
    // Office Information fields
    wixLink: clientData.officeInfo?.wixLink || '',
    officePhone: clientData.officeInfo?.officePhone || '',
    customerContactEmail: clientData.officeInfo?.customerContactEmail || '',
    physicalAddress: clientData.officeInfo?.physicalAddress || '',
    mailingAddress: clientData.officeInfo?.mailingAddress || '',
    officeHours: clientData.officeInfo?.officeHours || '',
    holidays: JSON.stringify(clientData.officeInfo?.holidays || []),
    website: clientData.officeInfo?.website || '',
    fieldRoutesLink: clientData.officeInfo?.fieldRoutesLink || '',
    
    // Call center specific fields
    bulletin: clientData.bulletin || '',
    pestsNotCovered: clientData.pestsNotCovered || '',
    
    // Legacy data storage (for backward compatibility)
    officeInformation: JSON.stringify(clientData.officeInfo || {}),
    services: JSON.stringify(clientData.services || []),
    technicians: JSON.stringify(clientData.technicians || []),
    serviceAreas: JSON.stringify(clientData.serviceAreas || []),
    policies: JSON.stringify(clientData.policies || {}),
    
    // Metadata
    status: 'active',
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Creates a record in a Wix CMS collection
 * @param {string} collectionId - The collection ID
 * @param {Object} data - The data to insert
 * @returns {Object} Creation result
 */
function createWixRecord(collectionId, data) {
  const config = getWixConfig();
  
  const url = `${WIX_CONFIG.baseUrl}/wix-data/v1/items`;
  
  const payload = {
    dataCollectionId: collectionId,
    dataItem: data
  };
  
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'wix-site-id': config.siteId
    },
    payload: JSON.stringify(payload)
  };
  
  const response = UrlFetchApp.fetch(url, options);
  
  if (response.getResponseCode() !== 200) {
    throw new Error(`Wix API error: ${response.getContentText()}`);
  }
  
  return JSON.parse(response.getContentText()).dataItem;
}

/**
 * Creates technician records associated with a profile
 * @param {string} profileId - The profile ID
 * @param {Array} technicians - Array of technician data
 */
function createTechnicianRecords(profileId, technicians) {
  technicians.forEach(tech => {
    const techData = {
      profileId: profileId,
      name: tech.name,
      phone: tech.phone,
      email: tech.email,
      serviceAreas: tech.serviceAreas || [],
      schedule: tech.schedule || {}
    };
    
    createWixRecord(WIX_CONFIG.collections.technicians, techData);
  });
}

/**
 * Creates policy records associated with a profile
 * @param {string} profileId - The profile ID
 * @param {Array} policies - Array of policy data
 */
function createPolicyRecords(profileId, policies) {
  policies.forEach(policy => {
    const policyData = {
      profileId: profileId,
      title: policy.title,
      content: policy.content,
      category: policy.category || 'general'
    };
    
    createWixRecord(WIX_CONFIG.collections.policies, policyData);
  });
}

/**
 * Creates service area records associated with a profile
 * @param {string} profileId - The profile ID
 * @param {Array} serviceAreas - Array of service area data
 */
function createServiceAreaRecords(profileId, serviceAreas) {
  serviceAreas.forEach(area => {
    const areaData = {
      profileId: profileId,
      zipCode: area.zipCode,
      city: area.city,
      state: area.state,
      region: area.region || ''
    };
    
    createWixRecord(WIX_CONFIG.collections.serviceAreas, areaData);
  });
}

/**
 * Generates a unique profile ID
 * @returns {string} Unique profile ID
 */
function generateProfileId() {
  return 'profile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Generates a URL-friendly slug from company name
 * @param {string} companyName - The company name
 * @returns {string} URL slug
 */
function generateSlug(companyName) {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50); // Limit length
}

/**
 * Retrieves a complete client profile for call center display
 * @param {string} profileId - The profile ID to retrieve
 * @returns {Object} Complete profile data
 */
function getCallCenterProfile(profileId) {
  try {
    initializeWixCredentials();
    
    // Get main profile data
    const profile = getWixRecord(WIX_CONFIG.collections.profiles, profileId);
    
    if (!profile) {
      throw new Error('Profile not found');
    }
    
    // Get associated data
    const services = getProfileServices(profile._id);
    const technicians = getProfileTechnicians(profile._id);
    const policies = getProfilePolicies(profile._id);
    const serviceAreas = getProfileServiceAreas(profile._id);
    
    return {
      ...profile,
      services: services,
      technicians: technicians,
      policies: policies,
      serviceAreas: serviceAreas
    };
    
  } catch (error) {
    Logger.error('Error retrieving call center profile:', error);
    throw new Error(`Failed to retrieve profile: ${error.message}`);
  }
}

/**
 * Gets a single record from Wix CMS
 * @param {string} collectionId - The collection ID
 * @param {string} itemId - The item ID
 * @returns {Object} Retrieved record
 */
function getWixRecord(collectionId, itemId) {
  const config = getWixConfig();
  
  const url = `${WIX_CONFIG.baseUrl}/wix-data/v1/items/${itemId}`;
  
  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'wix-site-id': config.siteId
    }
  };
  
  const response = UrlFetchApp.fetch(url, options);
  
  if (response.getResponseCode() !== 200) {
    return null;
  }
  
  return JSON.parse(response.getContentText()).dataItem;
}

/**
 * Gets services for a profile
 * @param {string} profileId - The profile ID
 * @returns {Array} Services array
 */
function getProfileServices(profileId) {
  return queryWixCollection(WIX_CONFIG.collections.services, 'profileId', profileId);
}

/**
 * Gets technicians for a profile
 * @param {string} profileId - The profile ID
 * @returns {Array} Technicians array
 */
function getProfileTechnicians(profileId) {
  return queryWixCollection(WIX_CONFIG.collections.technicians, 'profileId', profileId);
}

/**
 * Gets policies for a profile
 * @param {string} profileId - The profile ID
 * @returns {Array} Policies array
 */
function getProfilePolicies(profileId) {
  return queryWixCollection(WIX_CONFIG.collections.policies, 'profileId', profileId);
}

/**
 * Gets service areas for a profile
 * @param {string} profileId - The profile ID
 * @returns {Array} Service areas array
 */
function getProfileServiceAreas(profileId) {
  return queryWixCollection(WIX_CONFIG.collections.serviceAreas, 'profileId', profileId);
}

/**
 * Queries a Wix collection with filtering
 * @param {string} collectionId - The collection ID
 * @param {string} filterField - The field to filter by
 * @param {string} filterValue - The value to filter for
 * @returns {Array} Query results
 */
function queryWixCollection(collectionId, filterField, filterValue) {
  const config = getWixConfig();
  
  const url = `${WIX_CONFIG.baseUrl}/wix-data/v1/items/query`;
  
  const payload = {
    dataCollectionId: collectionId,
    filter: {
      [filterField]: filterValue
    },
    sort: [{ fieldName: 'sortOrder', order: 'ASC' }]
  };
  
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'wix-site-id': config.siteId
    },
    payload: JSON.stringify(payload)
  };
  
  const response = UrlFetchApp.fetch(url, options);
  
  if (response.getResponseCode() !== 200) {
    Logger.error(`Query failed: ${response.getContentText()}`);
    return [];
  }
  
  const result = JSON.parse(response.getContentText());
  return result.dataItems || [];
}

/**
 * Updates bulletin information for a profile
 * @param {string} profileId - The profile ID
 * @param {string} bulletin - The bulletin text
 * @returns {Object} Update result
 */
function updateProfileBulletin(profileId, bulletin) {
  try {
    initializeWixCredentials();
    
    const updateData = {
      bulletin: bulletin,
      lastUpdated: new Date().toISOString()
    };
    
    return updateWixRecord(WIX_CONFIG.collections.profiles, profileId, updateData);
    
  } catch (error) {
    Logger.error('Error updating bulletin:', error);
    throw new Error(`Failed to update bulletin: ${error.message}`);
  }
}

/**
 * Searches for profiles by company name (for call center search)
 * @param {string} searchTerm - The search term
 * @returns {Array} Matching profiles
 */
function searchProfiles(searchTerm) {
  try {
    initializeWixCredentials();
    
    const config = getWixConfig();
    const url = `${WIX_CONFIG.baseUrl}/wix-data/v1/items/query`;
    
    const payload = {
      dataCollectionId: WIX_CONFIG.collections.profiles,
      filter: {
        $or: [
          { companyName: { $contains: searchTerm } },
          { title: { $contains: searchTerm } }
        ]
      },
      sort: [{ fieldName: 'companyName', order: 'ASC' }],
      limit: 50
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'wix-site-id': config.siteId
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(url, options);
    
    if (response.getResponseCode() !== 200) {
      Logger.error(`Search failed: ${response.getContentText()}`);
      return [];
    }
    
    const result = JSON.parse(response.getContentText());
    return result.dataItems || [];
    
  } catch (error) {
    Logger.error('Error searching profiles:', error);
    return [];
  }
}

/**
 * Gets Wix configuration from PropertiesService
 * @returns {Object} Wix configuration
 */
function getWixConfig() {
  const properties = PropertiesService.getScriptProperties();
  
  return {
    siteId: properties.getProperty('WIX_SITE_ID'),
    apiKey: properties.getProperty('WIX_API_KEY'),
    baseUrl: WIX_CONFIG.baseUrl
  };
}

/**
 * Sets up Wix API credentials
 * Call this function once to configure your Wix credentials
 * @param {string} siteId - Your Wix Site ID
 * @param {string} apiKey - Your Wix API Key
 */
function setupWixCredentials(siteId, apiKey) {
  const properties = PropertiesService.getScriptProperties();
  
  properties.setProperties({
    'WIX_SITE_ID': siteId,
    'WIX_API_KEY': apiKey
  });
  
  Logger.log('Wix credentials configured successfully');
}

/**
 * Tests the Wix API connection
 * @returns {boolean} True if connection is successful
 */
function testWixConnection() {
  try {
    const config = getWixConfig();
    
    if (!config.siteId || !config.apiKey) {
      throw new Error('Wix credentials not configured. Please run setupWixCredentials() first.');
    }
    
    // Test API call to get collections
    const url = `${WIX_CONFIG.baseUrl}/wix-data/v1/collections`;
    
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'wix-site-id': config.siteId
      }
    };
    
    const response = UrlFetchApp.fetch(url, options);
    
    if (response.getResponseCode() === 200) {
      Logger.log('Wix API connection successful');
      return true;
    } else {
      throw new Error(`API test failed: ${response.getContentText()}`);
    }
    
  } catch (error) {
    Logger.log('Wix API connection failed: ' + error.toString());
    return false;
  }
}

/**
 * Initializes Wix credentials from PropertiesService
 */
function initializeWixCredentials() {
  const properties = PropertiesService.getScriptProperties();
  WIX_CONFIG.siteId = properties.getProperty('WIX_SITE_ID') || '';
  WIX_CONFIG.apiKey = properties.getProperty('WIX_API_KEY') || '';
  
  if (!WIX_CONFIG.siteId || !WIX_CONFIG.apiKey) {
    throw new Error('Wix credentials not configured. Please set WIX_SITE_ID and WIX_API_KEY in Script Properties.');
  }
}

/**
 * Creates service records in Wix CMS with enhanced structure for call center
 * @param {string} profileId - The profile ID to associate with
 * @param {Array} services - Array of service objects
 */
function createServiceRecords(profileId, services) {
  try {
    services.forEach((service, index) => {
      // Create main service record with all pricing and details
      const serviceData = {
        profileId: profileId,
        serviceName: service.name || '',
        serviceDescription: service.description || '',
        serviceType: service.type || 'recurring',
        
        // Pricing information
        queueExt: service.pricing?.queueExt || '',
        companyName: service.pricing?.companyName || '',
        productType: service.pricing?.productType || '',
        soldAsName: service.pricing?.soldAsName || '',
        billingFrequency: service.pricing?.billingFrequency || '',
        firstPrice: service.pricing?.firstPrice || '',
        recurringPrice: service.pricing?.recurringPrice || '',
        sqftMin: service.pricing?.sqftMin || '',
        sqftMax: service.pricing?.sqftMax || '',
        serviceTypeDetail: service.pricing?.serviceType || '',
        
        // Service details
        pestsCovered: service.pestsCovered || '',
        contractLength: service.contractLength || '',
        guarantee: service.guarantee || '',
        serviceDuration: service.duration || '',
        serviceDetails: service.serviceDetails || 'Yes',
        serviceNote: service.serviceNote || '',
        
        // Advanced fields
        isActive: service.active !== 'No',
        sortOrder: index + 1,
        createdDate: new Date().toISOString()
      };
      
      const serviceResult = createWixRecord(WIX_CONFIG.collections.services || 'Services', serviceData);
      
      // Create service variants if they exist
      if (service.variants && service.variants.length > 0) {
        service.variants.forEach((variant, variantIndex) => {
          if (variant.name && variant.name.trim() !== '') {
            const variantData = {
              profileId: profileId,
              parentServiceId: serviceResult.id,
              serviceName: variant.name,
              serviceDescription: variant.description || '',
              serviceType: variant.type || 'variant',
              
              // Variant pricing (same structure as main service)
              queueExt: variant.pricing?.queueExt || '',
              companyName: variant.pricing?.companyName || '',
              productType: variant.pricing?.productType || '',
              soldAsName: variant.pricing?.soldAsName || '',
              billingFrequency: variant.pricing?.billingFrequency || '',
              firstPrice: variant.pricing?.firstPrice || '',
              recurringPrice: variant.pricing?.recurringPrice || '',
              sqftMin: variant.pricing?.sqftMin || '',
              sqftMax: variant.pricing?.sqftMax || '',
              serviceTypeDetail: variant.pricing?.serviceType || '',
              
              // Variant details
              pestsCovered: variant.pestsCovered || '',
              contractLength: variant.contractLength || '',
              guarantee: variant.guarantee || '',
              serviceDuration: variant.duration || '',
              serviceDetails: variant.serviceDetails || 'Yes',
              serviceNote: variant.serviceNote || '',
              
              isActive: true,
              sortOrder: variantIndex + 1,
              createdDate: new Date().toISOString()
            };
            
            createWixRecord(WIX_CONFIG.collections.subServices || 'SubServices', variantData);
          }
        });
      }
    });
    
    Logger.log(`Created ${services.length} service records with variants`);
    
  } catch (error) {
    Logger.error('Error creating service records:', error);
    // Don't throw - continue with profile creation
  }
}

/**
 * Creates technician records with enhanced data structure
 * @param {string} profileId - The profile ID to associate with
 * @param {Array} technicians - Array of technician objects with enhanced fields
 */
function createTechnicianRecords(profileId, technicians) {
  try {
    technicians.forEach((tech, index) => {
      const technicianData = {
        profileId: profileId,
        technicianName: tech.name || '',
        role: tech.role || 'Technician', // Technician, Inspector, Both
        schedule: tech.schedule || '',
        maxStops: parseInt(tech.maxStops) || 0,
        doesNotService: tech.doesNotService || '',
        phoneNumber: tech.phone || '',
        zipCode: tech.zipCode || '',
        additionalNotes: tech.notes || '',
        sortOrder: index + 1,
        isActive: true
      };
      
      createWixRecord(WIX_CONFIG.collections.technicians, technicianData);
    });
    
    Logger.log(`Created ${technicians.length} technician records`);
    
  } catch (error) {
    Logger.error('Error creating technician records:', error);
    // Don't throw - continue with profile creation
  }
}

/**
 * Creates service area records with simplified zip/branch structure
 * @param {string} profileId - The profile ID to associate with
 * @param {Array} serviceAreas - Array of service area objects
 */
function createServiceAreaRecords(profileId, serviceAreas) {
  try {
    serviceAreas.forEach((area, index) => {
      // Create individual records for each zip code with branch information
      const zipCodes = area.zipCodes ? 
        area.zipCodes.split(/[,\n]/).map(zip => zip.trim()).filter(zip => zip !== '') : [];
      
      if (zipCodes.length > 0) {
        zipCodes.forEach(zipCode => {
          const areaData = {
            profileId: profileId,
            zipCode: zipCode,
            branch: area.branch || area.cityArea || '',
            state: area.state || '',
            isActive: true,
            createdDate: new Date().toISOString()
          };
          
          createWixRecord(WIX_CONFIG.collections.serviceAreas, areaData);
        });
      } else {
        // If no zip codes, create a general area record
        const areaData = {
          profileId: profileId,
          zipCode: '',
          branch: area.branch || area.cityArea || '',
          state: area.state || '',
          serviceRadius: parseInt(area.radius) || 0,
          additionalInfo: area.additionalFees || '',
          isActive: true,
          sortOrder: index + 1,
          createdDate: new Date().toISOString()
        };
        
        createWixRecord(WIX_CONFIG.collections.serviceAreas, areaData);
      }
    });
    
    Logger.log(`Created service area records for ${serviceAreas.length} areas`);
    
  } catch (error) {
    Logger.error('Error creating service area records:', error);
    // Don't throw - continue with profile creation
  }
}

/**
 * Creates policy records with enhanced data structure
 * @param {string} profileId - The profile ID to associate with
 * @param {Object} policies - Policies object with different policy types
 */
function createPolicyRecords(profileId, policies) {
  try {
    const policyTypes = [
      { key: 'cancellation', title: 'Cancellation Policy' },
      { key: 'guarantee', title: 'Guarantee Policy' },
      { key: 'payment', title: 'Payment Terms' },
      { key: 'emergency', title: 'Emergency Services' },
      { key: 'insurance', title: 'Insurance & Bonding' }
    ];
    
    let createdCount = 0;
    
    policyTypes.forEach((policyType, index) => {
      const content = policies[policyType.key];
      if (content && content.trim() !== '') {
        const policyData = {
          profileId: profileId,
          policyTitle: policyType.title,
          policyContent: content,
          policyType: policyType.key,
          sortOrder: index + 1,
          isActive: true
        };
        
        createWixRecord(WIX_CONFIG.collections.policies, policyData);
        createdCount++;
      }
    });
    
    Logger.log(`Created ${createdCount} policy records`);
    
  } catch (error) {
    Logger.error('Error creating policy records:', error);
    // Don't throw - continue with profile creation
  }
}

/**
 * Updates an existing Wix profile with new data
 * @param {string} profileId - The Wix profile ID to update
 * @param {Object} clientData - Updated client data
 * @returns {Object} Update result
 */
function updateWixProfile(profileId, clientData) {
  try {
    Logger.log(`Updating Wix profile: ${profileId}`);
    
    // Initialize credentials
    initializeWixCredentials();
    
    // Prepare updated profile data
    const profileData = prepareProfileData(clientData);
    
    // Update main profile record
    const updateResult = updateWixRecord(WIX_CONFIG.collections.profiles, profileId, profileData);
    
    // Note: For a complete update system, you would also need to:
    // 1. Delete existing related records (services, technicians, etc.)
    // 2. Create new records with updated data
    // This is a simplified version focusing on the main profile
    
    Logger.log('Profile updated successfully');
    
    return {
      success: true,
      profileId: profileId,
      message: 'Profile updated successfully'
    };
    
  } catch (error) {
    Logger.error('Error updating Wix profile:', error);
    throw new Error(`Failed to update Wix profile: ${error.message}`);
  }
}

/**
 * Updates a record in a Wix CMS collection
 * @param {string} collectionId - The collection ID
 * @param {string} itemId - The item ID to update
 * @param {Object} data - The data to update
 * @returns {Object} Update result
 */
function updateWixRecord(collectionId, itemId, data) {
  const config = getWixConfig();
  
  const url = `${WIX_CONFIG.baseUrl}/wix-data/v1/items/${itemId}`;
  
  const payload = {
    dataCollectionId: collectionId,
    dataItem: data
  };
  
  const options = {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'wix-site-id': config.siteId
    },
    payload: JSON.stringify(payload)
  };
  
  const response = UrlFetchApp.fetch(url, options);
  
  if (response.getResponseCode() !== 200) {
    throw new Error(`Wix API error: ${response.getContentText()}`);
  }
  
  return JSON.parse(response.getContentText());
}
