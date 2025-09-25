# Complete Wix Setup Guide for Call Center Profile System

## Overview
This guide walks you through setting up the Wix portion of your call center profile automation system. The Wix site will serve as the interface where call center agents view client profiles that are synced from your Google Apps Script system.

## Prerequisites
- Wix Premium account with Corvid/Velo enabled
- Access to Wix Database Collections
- Your Google Apps Script Web App deployed and running

## Part 1: Wix Database Collections Setup

### 1. Create the Main Collections

#### A. Clients Collection
1. Go to your Wix Editor → Database → + Add Collection
2. Name: `Clients`
3. Add the following fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `profileId` | Text | Required, Unique |
| `companyName` | Text | Required |
| `location` | Text | Optional |
| `timezone` | Text | Default: "Central" |
| `phone` | Text | Optional |
| `email` | Text | Optional |
| `website` | Text | Optional |
| `address` | Text | Optional |
| `hours` | Text | Optional |
| `bulletin` | Rich Text | Optional |
| `pestsNotCovered` | Rich Text | Optional |
| `googleSheetUrl` | Text | Optional |
| `wixProfileUrl` | Text | Optional |
| `status` | Text | Default: "ACTIVE" |
| `syncStatus` | Text | Default: "PENDING" |
| `lastSyncDate` | Date & Time | Optional |

#### B. Services Collection
1. Create Collection: `Services`
2. Add fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `clientId` | Text | Required |
| `serviceName` | Text | Required |
| `serviceType` | Text | Required |
| `frequency` | Text | Optional |
| `description` | Rich Text | Optional |
| `pests` | Text | Optional |
| `contract` | Text | Optional |
| `guarantee` | Text | Optional |
| `duration` | Text | Optional |
| `productType` | Text | Optional |
| `billingFrequency` | Text | Optional |
| `agentNote` | Rich Text | Optional |
| `queueExt` | Text | Optional |
| `pricingTiers` | Text | JSON format |
| `isSubService` | Boolean | Default: false |
| `parentServiceId` | Text | Optional |
| `sortOrder` | Number | Default: 0 |

#### C. Technicians Collection
1. Create Collection: `Technicians`
2. Add fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `clientId` | Text | Required |
| `name` | Text | Required |
| `company` | Text | Optional |
| `role` | Text | Default: "Technician" |
| `phone` | Text | Optional |
| `schedule` | Text | Optional |
| `maxStops` | Text | Optional |
| `doesNotService` | Text | Optional |
| `additionalNotes` | Rich Text | Optional |
| `zipCodes` | Text | JSON array format |
| `sortOrder` | Number | Default: 0 |

#### D. Policies Collection
1. Create Collection: `Policies`
2. Add fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `clientId` | Text | Required |
| `category` | Text | Required |
| `type` | Text | Required |
| `title` | Text | Required |
| `description` | Rich Text | Optional |
| `options` | Text | JSON array format |
| `default` | Text | Optional |
| `sortOrder` | Number | Default: 0 |

#### E. ServiceAreas Collection
1. Create Collection: `ServiceAreas`
2. Add fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `clientId` | Text | Required |
| `zip` | Text | Required |
| `city` | Text | Optional |
| `state` | Text | Optional |
| `branch` | Text | Optional |
| `territory` | Text | Optional |
| `inService` | Boolean | Default: true |

### 2. Set Collection Permissions
For each collection:
1. Go to Collection Settings → Permissions
2. Set the following permissions:

**For Admin/Backend access:**
- Read: Anyone
- Create: Admin
- Update: Admin  
- Delete: Admin

**For Public access (if needed):**
- Read: Anyone
- Create: None
- Update: None
- Delete: None

## Part 2: Create the Profile Page

### 1. Create a New Page
1. In Wix Editor, go to Pages → + Add Page
2. Choose "Blank Template"
3. Name the page: "Client Profile"

### 2. Set Up Dynamic Page Routing
1. Go to Page Settings → SEO & Meta Tags
2. Set URL: `/profile/[clientId]`
3. This creates a dynamic route

### 3. Add Page Elements
Add these elements to your page:

#### Header Section:
- Text element for company name (ID: `#companyName`)
- Text element for location/timezone (ID: `#locationTimezone`)
- Text element for current time (ID: `#currentTime`)

#### Navigation Section:
- Button for Services (ID: `#servicesBtn`)
- Button for Technicians (ID: `#techniciansBtn`)  
- Button for Policies (ID: `#policiesBtn`)
- Button for Service Areas (ID: `#serviceAreasBtn`)

#### Content Sections:
- Container for Services (ID: `#servicesSection`)
- Container for Technicians (ID: `#techniciansSection`)
- Container for Policies (ID: `#policiesSection`)
- Container for Service Areas (ID: `#serviceAreasSection`)

#### Info Cards:
- Container for bulletin (ID: `#bulletinSection`)
- Container for pests not covered (ID: `#pestsSection`)

### 4. Add the Velo Code
1. Turn on Velo (if not already enabled)
2. Open the Page Code tab
3. Copy and paste this code:

```javascript
import wixData from 'wix-data';
import wixLocation from 'wix-location';

let clientData = {};

$w.onReady(function () {
    // Get client ID from URL
    const url = wixLocation.url;
    const clientId = extractClientIdFromUrl(url);
    
    if (clientId) {
        loadClientData(clientId);
    } else {
        showError('No client ID provided');
    }
    
    // Setup navigation
    setupNavigation();
    
    // Setup time updates
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000); // Update every minute
});

function extractClientIdFromUrl(url) {
    const parts = url.split('/');
    const profileIndex = parts.indexOf('profile');
    if (profileIndex !== -1 && profileIndex + 1 < parts.length) {
        return parts[profileIndex + 1];
    }
    return null;
}

async function loadClientData(clientId) {
    try {
        // Load main client data
        const clientResult = await wixData.query('Clients')
            .eq('profileId', clientId)
            .find();
        
        if (clientResult.items.length === 0) {
            showError('Client not found');
            return;
        }
        
        clientData = clientResult.items[0];
        
        // Load related data
        await Promise.all([
            loadServices(clientId),
            loadTechnicians(clientId), 
            loadPolicies(clientId),
            loadServiceAreas(clientId)
        ]);
        
        // Populate the page
        populateClientData();
        
    } catch (error) {
        console.error('Error loading client:', error);
        showError('Error loading client data');
    }
}

async function loadServices(clientId) {
    const result = await wixData.query('Services')
        .eq('clientId', clientId)
        .ascending('sortOrder')
        .find();
    
    clientData.services = result.items;
}

async function loadTechnicians(clientId) {
    const result = await wixData.query('Technicians')
        .eq('clientId', clientId)
        .ascending('sortOrder')
        .find();
    
    clientData.technicians = result.items;
}

async function loadPolicies(clientId) {
    const result = await wixData.query('Policies')
        .eq('clientId', clientId)
        .ascending('category')
        .ascending('sortOrder')
        .find();
    
    clientData.policies = organizePolicies(result.items);
}

async function loadServiceAreas(clientId) {
    const result = await wixData.query('ServiceAreas')
        .eq('clientId', clientId)
        .ascending('zip')
        .find();
    
    clientData.serviceAreas = result.items;
}

function organizePolicies(policies) {
    const organized = {};
    policies.forEach(policy => {
        if (!organized[policy.category]) {
            organized[policy.category] = [];
        }
        organized[policy.category].push(policy);
    });
    return organized;
}

function populateClientData() {
    // Update header
    $w('#companyName').text = clientData.companyName;
    $w('#locationTimezone').text = `${clientData.location || ''} • ${clientData.timezone || 'Central'} Time`;
    
    // Show sections with data
    populateServices();
    populateTechnicians(); 
    populatePolicies();
    populateServiceAreas();
    
    // Show first section
    showSection('services');
}

function populateServices() {
    // Implementation for services display
    // This will depend on your specific Wix elements
}

function populateTechnicians() {
    // Implementation for technicians display
}

function populatePolicies() {
    // Implementation for policies display
}

function populateServiceAreas() {
    // Implementation for service areas display
}

function setupNavigation() {
    $w('#servicesBtn').onClick(() => showSection('services'));
    $w('#techniciansBtn').onClick(() => showSection('technicians'));
    $w('#policiesBtn').onClick(() => showSection('policies'));
    $w('#serviceAreasBtn').onClick(() => showSection('serviceAreas'));
}

function showSection(section) {
    // Hide all sections
    $w('#servicesSection').hide();
    $w('#techniciansSection').hide();
    $w('#policiesSection').hide();
    $w('#serviceAreasSection').hide();
    
    // Show selected section
    $w(`#${section}Section`).show();
    
    // Update button states
    updateButtonStates(section);
}

function updateButtonStates(activeSection) {
    const buttons = ['#servicesBtn', '#techniciansBtn', '#policiesBtn', '#serviceAreasBtn'];
    buttons.forEach(btn => {
        if (btn.includes(activeSection)) {
            // Add active styling
        } else {
            // Remove active styling
        }
    });
}

function updateCurrentTime() {
    const timezone = clientData.timezone || 'Central';
    const timeZoneMap = {
        'Pacific': 'America/Los_Angeles',
        'Mountain': 'America/Denver',
        'Central': 'America/Chicago', 
        'Eastern': 'America/New_York'
    };
    
    const timeZone = timeZoneMap[timezone] || 'America/Chicago';
    const now = new Date();
    const localTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timeZone
    });
    
    if ($w('#currentTime')) {
        $w('#currentTime').text = localTime;
    }
}

function showError(message) {
    console.error(message);
    // Display error to user
}
```

## Part 3: Backend Integration (Optional)

### 1. Create Backend File
1. In Wix Editor, enable Velo if not already enabled
2. Go to Backend (Server Code)
3. Create new file: `http-functions.js`

```javascript
import { ok, badRequest, serverError } from 'wix-http-functions';
import wixData from 'wix-data';

// Handle profile sync from Google Apps Script
export function post_syncProfile(request) {
    return handleProfileSync(request);
}

async function handleProfileSync(request) {
    try {
        const { body } = request;
        const profileData = JSON.parse(body);
        
        // Validate required fields
        if (!profileData.profileId || !profileData.companyName) {
            return badRequest({ error: 'Missing required fields' });
        }
        
        // Check if profile exists
        const existingProfile = await wixData.query('Clients')
            .eq('profileId', profileData.profileId)
            .find();
        
        let result;
        if (existingProfile.items.length > 0) {
            // Update existing profile
            const updatedData = {
                ...existingProfile.items[0],
                ...profileData,
                lastSyncDate: new Date(),
                syncStatus: 'SYNCED'
            };
            result = await wixData.update('Clients', updatedData);
        } else {
            // Create new profile
            const newData = {
                ...profileData,
                lastSyncDate: new Date(),
                syncStatus: 'SYNCED'
            };
            result = await wixData.insert('Clients', newData);
        }
        
        // Sync related data
        await syncRelatedData(profileData);
        
        return ok({ 
            success: true, 
            profileId: result.profileId,
            wixUrl: `https://yoursite.wixsite.com/profile/${result.profileId}`
        });
        
    } catch (error) {
        console.error('Error syncing profile:', error);
        return serverError({ error: 'Internal server error' });
    }
}

async function syncRelatedData(profileData) {
    const { profileId } = profileData;
    
    // Sync services
    if (profileData.services) {
        await syncServices(profileId, profileData.services);
    }
    
    // Sync technicians
    if (profileData.technicians) {
        await syncTechnicians(profileId, profileData.technicians);
    }
    
    // Sync policies
    if (profileData.policies) {
        await syncPolicies(profileId, profileData.policies);
    }
    
    // Sync service areas
    if (profileData.serviceAreas) {
        await syncServiceAreas(profileId, profileData.serviceAreas);
    }
}

async function syncServices(profileId, services) {
    // Delete existing services
    await wixData.query('Services')
        .eq('clientId', profileId)
        .find()
        .then(result => {
            const deletePromises = result.items.map(item => 
                wixData.remove('Services', item._id)
            );
            return Promise.all(deletePromises);
        });
    
    // Insert new services
    const insertPromises = services.map((service, index) => {
        const serviceData = {
            clientId: profileId,
            serviceName: service.name,
            serviceType: service.serviceType,
            frequency: service.frequency,
            description: service.description,
            pests: service.pests,
            contract: service.contract,
            guarantee: service.guarantee,
            duration: service.duration,
            productType: service.productType,
            billingFrequency: service.billingFrequency,
            agentNote: service.agentNote,
            queueExt: service.queueExt,
            pricingTiers: JSON.stringify(service.pricingTiers || []),
            sortOrder: index
        };
        return wixData.insert('Services', serviceData);
    });
    
    return Promise.all(insertPromises);
}

// Similar functions for syncTechnicians, syncPolicies, syncServiceAreas...
```

## Part 4: Google Apps Script Integration

### 1. Update Your Google Apps Script
Add this function to sync data to Wix:

```javascript
function syncProfileToWix(profileId) {
  try {
    const profileData = getProfileFromMasterSheet(profileId);
    
    const wixEndpoint = 'https://yoursite.wixsite.com/_functions/syncProfile';
    
    const response = UrlFetchApp.fetch(wixEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(profileData)
    });
    
    const result = JSON.parse(response.getContentText());
    
    if (result.success) {
      // Update master sheet with Wix URL
      updateProfileWixUrl(profileId, result.wixUrl);
      Logger.log('Profile synced to Wix successfully');
      return result.wixUrl;
    } else {
      throw new Error(result.error);
    }
    
  } catch (error) {
    Logger.log('Error syncing to Wix: ' + error.toString());
    throw error;
  }
}
```

## Part 5: Testing and Deployment

### 1. Test the Setup
1. Create a test profile in your Google Apps Script
2. Run the sync function
3. Check if data appears in Wix collections
4. Navigate to the profile page: `https://yoursite.wixsite.com/profile/[profileId]`

### 2. Deploy Your Wix Site
1. In Wix Editor, click "Publish"
2. Choose your domain
3. Publish the site

### 3. Configure URLs
1. Note your Wix site URL
2. Update your Google Apps Script with the correct Wix endpoints
3. Update any hardcoded URLs in your configuration

## Part 6: Styling and Customization

### 1. Apply Styling
Copy the CSS from your `wix-profile-page.html` file and adapt it for Wix:
- Use Wix's design elements
- Apply custom CSS in the page settings
- Ensure responsive design

### 2. Add Interactive Features
- Search functionality
- Filtering options
- Print/export capabilities
- Weather integration
- Real-time updates

## Troubleshooting

### Common Issues:
1. **Collection Permission Errors**: Check collection permissions
2. **CORS Issues**: Ensure proper headers in backend functions
3. **Data Not Syncing**: Check API endpoints and authentication
4. **Page Not Loading**: Verify URL routing and dynamic page setup

### Debugging:
1. Use Wix's console for frontend debugging
2. Check backend logs in Wix
3. Test API endpoints individually
4. Verify data structure matches collection fields

## Security Considerations

1. **API Authentication**: Implement proper authentication for sync endpoints
2. **Data Validation**: Validate all incoming data
3. **Access Control**: Limit access to sensitive information
4. **HTTPS**: Ensure all connections use HTTPS

## Next Steps

1. Set up automated syncing schedule
2. Add user authentication for call center agents
3. Implement search and filtering
4. Add reporting capabilities
5. Set up monitoring and alerts

This completes the Wix setup for your call center profile system. The integration will allow seamless syncing from your Google Apps Script to create a professional interface for call center agents.
