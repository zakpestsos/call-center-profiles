<<<<<<< HEAD
// Wix Backend Integration
// This file should be uploaded to your Wix site's backend folder

import { wixData } from 'wix-data';
import { fetch } from 'wix-fetch';

// Collection names in Wix CMS
const COLLECTIONS = {
  CLIENTS: 'Clients',
  SERVICES: 'Services', 
  TECHNICIANS: 'Technicians',
  POLICIES: 'Policies',
  SERVICE_AREAS: 'ServiceAreas'
};

/**
 * Get client profile data by client ID
 * This function can be called from your Wix frontend
 */
export async function getClientProfile(clientId) {
  try {
    // Get main client data
    const clientResult = await wixData.query(COLLECTIONS.CLIENTS)
      .eq('_id', clientId)
      .find();
    
    if (clientResult.items.length === 0) {
      throw new Error('Client not found');
    }
    
    const client = clientResult.items[0];
    
    // Get related data in parallel
    const [services, technicians, policies, serviceAreas] = await Promise.all([
      getClientServices(clientId),
      getClientTechnicians(clientId),
      getClientPolicies(clientId),
      getClientServiceAreas(clientId)
    ]);
    
    return {
      ...client,
      services,
      technicians,
      policies: organizePolicies(policies),
      serviceAreas
    };
    
  } catch (error) {
    console.error('Error getting client profile:', error);
    throw error;
  }
}

/**
 * Get services for a specific client
 */
async function getClientServices(clientId) {
  try {
    const result = await wixData.query(COLLECTIONS.SERVICES)
      .eq('clientId', clientId)
      .ascending('order')
      .find();
    
    return result.items;
  } catch (error) {
    console.error('Error getting services:', error);
    return [];
  }
}

/**
 * Get technicians for a specific client
 */
async function getClientTechnicians(clientId) {
  try {
    const result = await wixData.query(COLLECTIONS.TECHNICIANS)
      .eq('clientId', clientId)
      .ascending('name')
      .find();
    
    return result.items;
  } catch (error) {
    console.error('Error getting technicians:', error);
    return [];
  }
}

/**
 * Get policies for a specific client
 */
async function getClientPolicies(clientId) {
  try {
    const result = await wixData.query(COLLECTIONS.POLICIES)
      .eq('clientId', clientId)
      .ascending('category')
      .ascending('order')
      .find();
    
    return result.items;
  } catch (error) {
    console.error('Error getting policies:', error);
    return [];
  }
}

/**
 * Get service areas for a specific client
 */
async function getClientServiceAreas(clientId) {
  try {
    const result = await wixData.query(COLLECTIONS.SERVICE_AREAS)
      .eq('clientId', clientId)
      .ascending('zip')
      .find();
    
    return result.items;
  } catch (error) {
    console.error('Error getting service areas:', error);
    return [];
  }
}

/**
 * Organize flat policies array into categorized structure
 */
function organizePolicies(policiesArray) {
  const organized = {};
  
  policiesArray.forEach(policy => {
    const category = policy.category || 'General';
    if (!organized[category]) {
      organized[category] = [];
    }
    organized[category].push(policy);
  });
  
  return organized;
}

/**
 * Import data from Google Sheets into Wix CMS
 * This function can be called to sync data from your Google Sheets
 */
export async function importFromGoogleSheets(sheetId, webAppUrl) {
  try {
    // Fetch data from Google Apps Script
    const response = await fetch(`${webAppUrl}?sheetId=${sheetId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Google Sheets');
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Import the data into Wix CMS
    const clientId = await importClientData(data);
    
    if (data.services && data.services.length > 0) {
      await importServicesData(clientId, data.services);
    }
    
    if (data.technicians && data.technicians.length > 0) {
      await importTechniciansData(clientId, data.technicians);
    }
    
    if (data.policies && Object.keys(data.policies).length > 0) {
      await importPoliciesData(clientId, data.policies);
    }
    
    if (data.serviceAreas && data.serviceAreas.length > 0) {
      await importServiceAreasData(clientId, data.serviceAreas);
    }
    
    return {
      success: true,
      clientId,
      message: 'Data imported successfully'
    };
    
  } catch (error) {
    console.error('Error importing from Google Sheets:', error);
    throw error;
  }
}

/**
 * Import client basic information
 */
async function importClientData(data) {
  try {
    const clientData = {
      companyName: data.companyName,
      location: data.location,
      timezone: data.timezone,
      phone: data.officeInfo?.phone || '',
      email: data.officeInfo?.email || '',
      website: data.officeInfo?.website || '',
      fieldRoutesLink: data.officeInfo?.fieldRoutesLink || '',
      physicalAddress: data.officeInfo?.physicalAddress || '',
      officeHours: data.officeInfo?.officeHours || '',
      bulletin: data.bulletin,
      pestsNotCovered: data.pestsNotCovered
    };
    
    // Check if client already exists
    const existingClient = await wixData.query(COLLECTIONS.CLIENTS)
      .eq('companyName', data.companyName)
      .find();
    
    if (existingClient.items.length > 0) {
      // Update existing client
      const clientId = existingClient.items[0]._id;
      await wixData.update(COLLECTIONS.CLIENTS, {
        _id: clientId,
        ...clientData
      });
      return clientId;
    } else {
      // Create new client
      const result = await wixData.insert(COLLECTIONS.CLIENTS, clientData);
      return result._id;
    }
    
  } catch (error) {
    console.error('Error importing client data:', error);
    throw error;
  }
}

/**
 * Import services data
 */
async function importServicesData(clientId, services) {
  try {
    // Remove existing services for this client
    const existingServices = await wixData.query(COLLECTIONS.SERVICES)
      .eq('clientId', clientId)
      .find();
    
    if (existingServices.items.length > 0) {
      const idsToRemove = existingServices.items.map(item => item._id);
      await wixData.bulkRemove(COLLECTIONS.SERVICES, idsToRemove);
    }
    
    // Insert new services
    const servicesToInsert = services.map((service, index) => ({
      clientId,
      order: index,
      ...service
    }));
    
    if (servicesToInsert.length > 0) {
      await wixData.bulkInsert(COLLECTIONS.SERVICES, servicesToInsert);
    }
    
  } catch (error) {
    console.error('Error importing services:', error);
    throw error;
  }
}

/**
 * Import technicians data
 */
async function importTechniciansData(clientId, technicians) {
  try {
    // Remove existing technicians for this client
    const existingTechs = await wixData.query(COLLECTIONS.TECHNICIANS)
      .eq('clientId', clientId)
      .find();
    
    if (existingTechs.items.length > 0) {
      const idsToRemove = existingTechs.items.map(item => item._id);
      await wixData.bulkRemove(COLLECTIONS.TECHNICIANS, idsToRemove);
    }
    
    // Insert new technicians
    const techsToInsert = technicians.map(tech => ({
      clientId,
      ...tech
    }));
    
    if (techsToInsert.length > 0) {
      await wixData.bulkInsert(COLLECTIONS.TECHNICIANS, techsToInsert);
    }
    
  } catch (error) {
    console.error('Error importing technicians:', error);
    throw error;
  }
}

/**
 * Import policies data
 */
async function importPoliciesData(clientId, policies) {
  try {
    // Remove existing policies for this client
    const existingPolicies = await wixData.query(COLLECTIONS.POLICIES)
      .eq('clientId', clientId)
      .find();
    
    if (existingPolicies.items.length > 0) {
      const idsToRemove = existingPolicies.items.map(item => item._id);
      await wixData.bulkRemove(COLLECTIONS.POLICIES, idsToRemove);
    }
    
    // Flatten and insert new policies
    const policiesToInsert = [];
    let orderCounter = 0;
    
    Object.entries(policies).forEach(([category, categoryPolicies]) => {
      categoryPolicies.forEach(policy => {
        policiesToInsert.push({
          clientId,
          category,
          order: orderCounter++,
          ...policy
        });
      });
    });
    
    if (policiesToInsert.length > 0) {
      await wixData.bulkInsert(COLLECTIONS.POLICIES, policiesToInsert);
    }
    
  } catch (error) {
    console.error('Error importing policies:', error);
    throw error;
  }
}

/**
 * Import service areas data
 */
async function importServiceAreasData(clientId, serviceAreas) {
  try {
    // Remove existing service areas for this client
    const existingAreas = await wixData.query(COLLECTIONS.SERVICE_AREAS)
      .eq('clientId', clientId)
      .find();
    
    if (existingAreas.items.length > 0) {
      const idsToRemove = existingAreas.items.map(item => item._id);
      await wixData.bulkRemove(COLLECTIONS.SERVICE_AREAS, idsToRemove);
    }
    
    // Insert new service areas
    const areasToInsert = serviceAreas.map(area => ({
      clientId,
      ...area
    }));
    
    if (areasToInsert.length > 0) {
      await wixData.bulkInsert(COLLECTIONS.SERVICE_AREAS, areasToInsert);
    }
    
  } catch (error) {
    console.error('Error importing service areas:', error);
    throw error;
  }
}

/**
 * Search clients by company name
 */
export async function searchClients(searchTerm) {
  try {
    const result = await wixData.query(COLLECTIONS.CLIENTS)
      .contains('companyName', searchTerm)
      .limit(20)
      .find();
    
    return result.items;
    
  } catch (error) {
    console.error('Error searching clients:', error);
    throw error;
  }
}

/**
 * Get all clients (for admin purposes)
 */
export async function getAllClients() {
  try {
    const result = await wixData.query(COLLECTIONS.CLIENTS)
      .ascending('companyName')
      .find();
    
    return result.items;
    
  } catch (error) {
    console.error('Error getting all clients:', error);
    throw error;
  }
}
=======
// Wix Backend Integration
// This file should be uploaded to your Wix site's backend folder

import { wixData } from 'wix-data';
import { fetch } from 'wix-fetch';

// Collection names in Wix CMS
const COLLECTIONS = {
  CLIENTS: 'Clients',
  SERVICES: 'Services', 
  TECHNICIANS: 'Technicians',
  POLICIES: 'Policies',
  SERVICE_AREAS: 'ServiceAreas'
};

/**
 * Get client profile data by client ID
 * This function can be called from your Wix frontend
 */
export async function getClientProfile(clientId) {
  try {
    // Get main client data
    const clientResult = await wixData.query(COLLECTIONS.CLIENTS)
      .eq('_id', clientId)
      .find();
    
    if (clientResult.items.length === 0) {
      throw new Error('Client not found');
    }
    
    const client = clientResult.items[0];
    
    // Get related data in parallel
    const [services, technicians, policies, serviceAreas] = await Promise.all([
      getClientServices(clientId),
      getClientTechnicians(clientId),
      getClientPolicies(clientId),
      getClientServiceAreas(clientId)
    ]);
    
    return {
      ...client,
      services,
      technicians,
      policies: organizePolicies(policies),
      serviceAreas
    };
    
  } catch (error) {
    console.error('Error getting client profile:', error);
    throw error;
  }
}

/**
 * Get services for a specific client
 */
async function getClientServices(clientId) {
  try {
    const result = await wixData.query(COLLECTIONS.SERVICES)
      .eq('clientId', clientId)
      .ascending('order')
      .find();
    
    return result.items;
  } catch (error) {
    console.error('Error getting services:', error);
    return [];
  }
}

/**
 * Get technicians for a specific client
 */
async function getClientTechnicians(clientId) {
  try {
    const result = await wixData.query(COLLECTIONS.TECHNICIANS)
      .eq('clientId', clientId)
      .ascending('name')
      .find();
    
    return result.items;
  } catch (error) {
    console.error('Error getting technicians:', error);
    return [];
  }
}

/**
 * Get policies for a specific client
 */
async function getClientPolicies(clientId) {
  try {
    const result = await wixData.query(COLLECTIONS.POLICIES)
      .eq('clientId', clientId)
      .ascending('category')
      .ascending('order')
      .find();
    
    return result.items;
  } catch (error) {
    console.error('Error getting policies:', error);
    return [];
  }
}

/**
 * Get service areas for a specific client
 */
async function getClientServiceAreas(clientId) {
  try {
    const result = await wixData.query(COLLECTIONS.SERVICE_AREAS)
      .eq('clientId', clientId)
      .ascending('zip')
      .find();
    
    return result.items;
  } catch (error) {
    console.error('Error getting service areas:', error);
    return [];
  }
}

/**
 * Organize flat policies array into categorized structure
 */
function organizePolicies(policiesArray) {
  const organized = {};
  
  policiesArray.forEach(policy => {
    const category = policy.category || 'General';
    if (!organized[category]) {
      organized[category] = [];
    }
    organized[category].push(policy);
  });
  
  return organized;
}

/**
 * Import data from Google Sheets into Wix CMS
 * This function can be called to sync data from your Google Sheets
 */
export async function importFromGoogleSheets(sheetId, webAppUrl) {
  try {
    // Fetch data from Google Apps Script
    const response = await fetch(`${webAppUrl}?sheetId=${sheetId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Google Sheets');
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Import the data into Wix CMS
    const clientId = await importClientData(data);
    
    if (data.services && data.services.length > 0) {
      await importServicesData(clientId, data.services);
    }
    
    if (data.technicians && data.technicians.length > 0) {
      await importTechniciansData(clientId, data.technicians);
    }
    
    if (data.policies && Object.keys(data.policies).length > 0) {
      await importPoliciesData(clientId, data.policies);
    }
    
    if (data.serviceAreas && data.serviceAreas.length > 0) {
      await importServiceAreasData(clientId, data.serviceAreas);
    }
    
    return {
      success: true,
      clientId,
      message: 'Data imported successfully'
    };
    
  } catch (error) {
    console.error('Error importing from Google Sheets:', error);
    throw error;
  }
}

/**
 * Import client basic information
 */
async function importClientData(data) {
  try {
    const clientData = {
      companyName: data.companyName,
      location: data.location,
      timezone: data.timezone,
      phone: data.officeInfo?.phone || '',
      email: data.officeInfo?.email || '',
      website: data.officeInfo?.website || '',
      fieldRoutesLink: data.officeInfo?.fieldRoutesLink || '',
      physicalAddress: data.officeInfo?.physicalAddress || '',
      officeHours: data.officeInfo?.officeHours || '',
      bulletin: data.bulletin,
      pestsNotCovered: data.pestsNotCovered
    };
    
    // Check if client already exists
    const existingClient = await wixData.query(COLLECTIONS.CLIENTS)
      .eq('companyName', data.companyName)
      .find();
    
    if (existingClient.items.length > 0) {
      // Update existing client
      const clientId = existingClient.items[0]._id;
      await wixData.update(COLLECTIONS.CLIENTS, {
        _id: clientId,
        ...clientData
      });
      return clientId;
    } else {
      // Create new client
      const result = await wixData.insert(COLLECTIONS.CLIENTS, clientData);
      return result._id;
    }
    
  } catch (error) {
    console.error('Error importing client data:', error);
    throw error;
  }
}

/**
 * Import services data
 */
async function importServicesData(clientId, services) {
  try {
    // Remove existing services for this client
    const existingServices = await wixData.query(COLLECTIONS.SERVICES)
      .eq('clientId', clientId)
      .find();
    
    if (existingServices.items.length > 0) {
      const idsToRemove = existingServices.items.map(item => item._id);
      await wixData.bulkRemove(COLLECTIONS.SERVICES, idsToRemove);
    }
    
    // Insert new services
    const servicesToInsert = services.map((service, index) => ({
      clientId,
      order: index,
      ...service
    }));
    
    if (servicesToInsert.length > 0) {
      await wixData.bulkInsert(COLLECTIONS.SERVICES, servicesToInsert);
    }
    
  } catch (error) {
    console.error('Error importing services:', error);
    throw error;
  }
}

/**
 * Import technicians data
 */
async function importTechniciansData(clientId, technicians) {
  try {
    // Remove existing technicians for this client
    const existingTechs = await wixData.query(COLLECTIONS.TECHNICIANS)
      .eq('clientId', clientId)
      .find();
    
    if (existingTechs.items.length > 0) {
      const idsToRemove = existingTechs.items.map(item => item._id);
      await wixData.bulkRemove(COLLECTIONS.TECHNICIANS, idsToRemove);
    }
    
    // Insert new technicians
    const techsToInsert = technicians.map(tech => ({
      clientId,
      ...tech
    }));
    
    if (techsToInsert.length > 0) {
      await wixData.bulkInsert(COLLECTIONS.TECHNICIANS, techsToInsert);
    }
    
  } catch (error) {
    console.error('Error importing technicians:', error);
    throw error;
  }
}

/**
 * Import policies data
 */
async function importPoliciesData(clientId, policies) {
  try {
    // Remove existing policies for this client
    const existingPolicies = await wixData.query(COLLECTIONS.POLICIES)
      .eq('clientId', clientId)
      .find();
    
    if (existingPolicies.items.length > 0) {
      const idsToRemove = existingPolicies.items.map(item => item._id);
      await wixData.bulkRemove(COLLECTIONS.POLICIES, idsToRemove);
    }
    
    // Flatten and insert new policies
    const policiesToInsert = [];
    let orderCounter = 0;
    
    Object.entries(policies).forEach(([category, categoryPolicies]) => {
      categoryPolicies.forEach(policy => {
        policiesToInsert.push({
          clientId,
          category,
          order: orderCounter++,
          ...policy
        });
      });
    });
    
    if (policiesToInsert.length > 0) {
      await wixData.bulkInsert(COLLECTIONS.POLICIES, policiesToInsert);
    }
    
  } catch (error) {
    console.error('Error importing policies:', error);
    throw error;
  }
}

/**
 * Import service areas data
 */
async function importServiceAreasData(clientId, serviceAreas) {
  try {
    // Remove existing service areas for this client
    const existingAreas = await wixData.query(COLLECTIONS.SERVICE_AREAS)
      .eq('clientId', clientId)
      .find();
    
    if (existingAreas.items.length > 0) {
      const idsToRemove = existingAreas.items.map(item => item._id);
      await wixData.bulkRemove(COLLECTIONS.SERVICE_AREAS, idsToRemove);
    }
    
    // Insert new service areas
    const areasToInsert = serviceAreas.map(area => ({
      clientId,
      ...area
    }));
    
    if (areasToInsert.length > 0) {
      await wixData.bulkInsert(COLLECTIONS.SERVICE_AREAS, areasToInsert);
    }
    
  } catch (error) {
    console.error('Error importing service areas:', error);
    throw error;
  }
}

/**
 * Search clients by company name
 */
export async function searchClients(searchTerm) {
  try {
    const result = await wixData.query(COLLECTIONS.CLIENTS)
      .contains('companyName', searchTerm)
      .limit(20)
      .find();
    
    return result.items;
    
  } catch (error) {
    console.error('Error searching clients:', error);
    throw error;
  }
}

/**
 * Get all clients (for admin purposes)
 */
export async function getAllClients() {
  try {
    const result = await wixData.query(COLLECTIONS.CLIENTS)
      .ascending('companyName')
      .find();
    
    return result.items;
    
  } catch (error) {
    console.error('Error getting all clients:', error);
    throw error;
  }
}
>>>>>>> 2736c685fc8fe36c89bbf61e8bcaaac71c17974d
