# Complete Setup Guide - Wix Call Center Interface

## 🚀 Quick Start Checklist

- [ ] **Step 1**: Set up Wix collections
- [ ] **Step 2**: Configure Wix API credentials
- [ ] **Step 3**: Create dynamic profile page
- [ ] **Step 4**: Deploy Velo code
- [ ] **Step 5**: Test with sample data
- [ ] **Step 6**: Connect Google Apps Script
- [ ] **Step 7**: Train agents

---

## Step 1: Set Up Wix Collections

### 1.1 Access Wix CMS
1. Go to your Wix Dashboard
2. Click on **CMS** in the left sidebar
3. Click **Create Collection** for each collection below

### 1.2 Create Profiles Collection
**Collection Name:** `Profiles`

**Settings:**
- Collection Type: **Custom**
- Permissions: **Admin Only** (for security)

**Fields to Add:**
```
title (Text) - Display title
companyName (Text) - Company name
profileId (Text) - Unique identifier
slug (Text) - URL slug
location (Text) - Company location
timezone (Text) - Company timezone
wixLink (Text) - Wix website link
officePhone (Text) - Office phone
customerContactEmail (Text) - Customer email
physicalAddress (Text) - Physical address
mailingAddress (Text) - Mailing address
officeHours (Text) - Office hours
holidays (Text) - Holidays (JSON)
website (Text) - Company website
fieldRoutesLink (Text) - FieldRoutes link
bulletin (Text) - Important bulletin
pestsNotCovered (Text) - Pests not covered
officeInformation (Text) - Legacy office info
services (Text) - Legacy services data
technicians (Text) - Legacy technicians data
serviceAreas (Text) - Legacy service areas
policies (Text) - Legacy policies data
status (Text) - Profile status
createdDate (Date) - Creation date
lastUpdated (Date) - Last update
```

### 1.3 Create Services Collection
**Collection Name:** `Services`

**Fields:**
```
profileId (Text) - Profile reference
serviceName (Text) - Service name
serviceDescription (Text) - Description
serviceType (Text) - Type (recurring/one-time)
queueExt (Text) - Queue extension
companyName (Text) - Company for pricing
productType (Text) - Product type
soldAsName (Text) - Sold as name
billingFrequency (Text) - Billing frequency
firstPrice (Text) - First price
recurringPrice (Text) - Recurring price
sqftMin (Text) - Min square footage
sqftMax (Text) - Max square footage
serviceTypeDetail (Text) - Service type detail
pestsCovered (Text) - Pests covered
contractLength (Text) - Contract length
guarantee (Text) - Guarantee
serviceDuration (Text) - Duration
serviceDetails (Text) - Service details
serviceNote (Text) - Notes
isActive (Boolean) - Active status
sortOrder (Number) - Display order
createdDate (Date) - Creation date
```

### 1.4 Create SubServices Collection
**Collection Name:** `SubServices`

**Fields:** (Same as Services plus:)
```
parentServiceId (Text) - Parent service reference
```

### 1.5 Create TechnicianList Collection
**Collection Name:** `TechnicianList`

**Fields:**
```
profileId (Text) - Profile reference
technicianName (Text) - Technician name
role (Text) - Role (Technician/Inspector/Both)
schedule (Text) - Schedule
maxStops (Number) - Max stops per day
doesNotService (Text) - Areas not serviced
phoneNumber (Text) - Phone number
zipCode (Text) - Zip code
additionalNotes (Text) - Notes
sortOrder (Number) - Display order
isActive (Boolean) - Active status
```

### 1.6 Create Policies Collection
**Collection Name:** `Policies`

**Fields:**
```
profileId (Text) - Profile reference
policyTitle (Text) - Policy title
policyContent (Text) - Policy content
policyType (Text) - Policy type
sortOrder (Number) - Display order
isActive (Boolean) - Active status
```

### 1.7 Create ServiceAreas Collection
**Collection Name:** `ServiceAreas`

**Fields:**
```
profileId (Text) - Profile reference
zipCode (Text) - Zip code
branch (Text) - Branch name
state (Text) - State
serviceRadius (Number) - Service radius
additionalInfo (Text) - Additional info
isActive (Boolean) - Active status
sortOrder (Number) - Display order
createdDate (Date) - Creation date
```

### 1.8 Verify Existing Collections
Make sure you already have:
- **SpireZips** (for zip code lookup)
- **Updates** (for Google Sheets integration)

---

## Step 2: Configure Wix API Credentials

### 2.1 Get Wix Site ID
1. In Wix Dashboard, go to **Settings** → **Domains**
2. Your Site ID is in the URL or site settings
3. Copy this ID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 2.2 Create API Key
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: "Call Center Integration"
4. Permissions needed:
   - **Wix Data**: Read, Write, Delete
   - **Site Content**: Read
5. Copy the generated API key

### 2.3 Configure Google Apps Script
1. Open your Google Apps Script project
2. Run this function in the script editor:

```javascript
function setupWixCredentials() {
  // Replace with your actual values
  const siteId = 'your-site-id-here';
  const apiKey = 'your-api-key-here';
  
  setupWixCredentials(siteId, apiKey);
}
```

3. Test the connection:
```javascript
function testConnection() {
  const result = testWixConnection();
  console.log('Connection successful:', result);
}
```

---

## Step 3: Create Dynamic Profile Page

### 3.1 Create New Page
1. In Wix Editor, click **Pages** → **Add Page**
2. Choose **Dynamic Page**
3. Connect to **Profiles** collection
4. Set URL structure: `/profile/{slug}`
5. Page name: "Client Profile"

### 3.2 Design the Page Layout
Use the provided HTML structure as reference. Create these elements:

**Header Section:**
```
- Text element: ID = "companyName"
- Text element: ID = "locationTimezone"  
- Button: ID = "websiteLink"
- Button: ID = "fieldRoutesLink"
- Button: ID = "officeInfoBtn"
- Button: ID = "updatedBtn"
```

**Navigation Sidebar:**
```
- Button: ID = "servicesNavLink"
- Button: ID = "techniciansNavLink"
- Button: ID = "policiesNavLink"
- Button: ID = "areasNavLink"
- Button: ID = "discountsNavLink"
```

**Content Sections:**
```
- Container: ID = "bulletinSection"
  - Text: ID = "bulletinContent"
- Container: ID = "pestsNotCoveredSection"
  - Text: ID = "pestsNotCoveredContent"
- Container: ID = "servicesSection"
  - Repeater: ID = "servicesRepeater"
- Container: ID = "techniciansSection"
  - Repeater: ID = "techniciansRepeater"
- Container: ID = "policiesSection"
  - Repeater: ID = "policiesRepeater"
- Container: ID = "areasSection"
  - Repeater: ID = "serviceAreasRepeater"
```

**Sidebar Tools:**
```
- Input: ID = "acresInput"
- Button: ID = "convertBtn"
- Text: ID = "conversionResult"
- Input: ID = "zipInput"
- Button: ID = "searchZipBtn"
- Text: ID = "zipResult"
- Image: ID = "zipStatusIcon"
- Text: ID = "pacificTime"
- Text: ID = "mountainTime"
- Text: ID = "centralTime"
- Text: ID = "easternTime"
```

**Modals:**
```
- Container: ID = "officeModal"
  - Button: ID = "closeOfficeModal"
  - Text elements for office info
- Container: ID = "updatesModal"
  - Repeater: ID = "updatesRepeater"
```

### 3.3 Style the Elements
Apply the cyberpunk dark theme styling:
- Background: Dark slate colors
- Fonts: Inter, Orbitron, Rajdhani
- Colors: Blues, greens, slate grays
- Border effects and shadows

---

## Step 4: Deploy Velo Code

### 4.1 Enable Wix Velo
1. In Wix Editor, click **Dev Mode** toggle
2. Confirm enabling Velo

### 4.2 Add Page Code
1. Click on your profile page
2. In the code panel, replace the content with the provided Velo code
3. Make sure all element IDs match your page elements

### 4.3 Add Backend Code (if needed)
If you need the Google Sheets integration:
1. Create `backend/googlesheets.js`
2. Add your Google Sheets integration code

---

## Step 5: Test with Sample Data

### 5.1 Create Test Profile
Run this in Google Apps Script to create a test profile:

```javascript
function createTestProfile() {
  const testData = {
    companyName: "Test Pest Control",
    officeInfo: {
      locations: "Dallas, TX",
      timezone: "Central",
      officePhone: "(555) 123-4567",
      customerContactEmail: "contact@testpest.com",
      website: "https://testpest.com",
      fieldRoutesLink: "https://test.fieldroutes.com",
      physicalAddress: "123 Test St\nDallas, TX 75001",
      officeHours: "Monday-Friday: 8 AM - 5 PM"
    },
    bulletin: "Test bulletin message",
    pestsNotCovered: "Wasps, Bees, Hornets",
    services: [{
      name: "General Pest Control",
      description: "Comprehensive pest control service",
      type: "recurring",
      pricing: {
        firstPrice: "$150",
        recurringPrice: "$45",
        billingFrequency: "Quarterly"
      },
      pestsCovered: "Ants, Roaches, Spiders",
      contractLength: "12 months",
      guarantee: "Free re-service",
      duration: "30 minutes"
    }],
    technicians: [{
      name: "John Smith",
      role: "Technician",
      schedule: "Monday-Friday",
      maxStops: 15,
      phone: "(555) 987-6543"
    }],
    serviceAreas: [{
      zipCodes: "75001,75002,75003",
      branch: "North Dallas"
    }],
    policies: {
      cancellation: "24-hour cancellation required",
      guarantee: "30-day satisfaction guarantee"
    }
  };
  
  const result = createWixProfile(testData);
  console.log('Test profile created:', result);
}
```

### 5.2 Verify Data in Wix
1. Check Wix CMS to see if all collections have data
2. Note the `profileId` from the created profile

### 5.3 Test Profile Page
1. Navigate to: `yoursite.com/profile/{slug}`
2. Verify all sections display correctly
3. Test interactive elements:
   - Navigation between sections
   - Acreage converter
   - Zip code lookup
   - Office info modal

---

## Step 6: Connect Google Apps Script

### 6.1 Update Form Integration
In your `main.js`, add profile creation:

```javascript
function processFormSubmission(formData) {
  // Your existing form processing...
  
  // Create Wix profile
  try {
    const wixResult = createWixProfile(formData);
    console.log('Wix profile created:', wixResult.profileId);
    
    // Store profile URL for later use
    const profileUrl = `https://yoursite.com/profile/${generateSlug(formData.companyName)}`;
    
    return {
      success: true,
      profileId: wixResult.profileId,
      profileUrl: profileUrl
    };
  } catch (error) {
    console.error('Error creating Wix profile:', error);
    // Continue with other processing even if Wix fails
  }
}
```

### 6.2 Test End-to-End
1. Fill out your enhanced client form
2. Submit the form
3. Check that:
   - Google Sheets updates
   - Wix collections populate
   - Profile page displays correctly

---

## Step 7: Train Agents

### 7.1 Create Agent Quick Reference
```
CALL CENTER INTERFACE GUIDE
===========================

Profile URL: yoursite.com/profile/{company-name}

NAVIGATION:
- Services: See all pest control services
- Technicians: View tech schedules and info
- Policies: Company policies and terms
- Service Areas: Coverage areas and zip codes

TOOLS:
- Acreage Converter: Enter acres → get sq ft
- Zip Lookup: Enter zip → see if covered
- Time Zones: Current time all US zones

QUICK ACTIONS:
- Office Info button: Contact details
- Updated button: Recent changes
- Website/FieldRoutes: Direct links
```

### 7.2 Conduct Training Session
1. Show interface layout
2. Demonstrate navigation
3. Practice using tools
4. Test with real customer scenarios

---

## 🔧 Troubleshooting

### Common Issues

**1. "Wix credentials not configured"**
- Run `setupWixCredentials()` in Google Apps Script
- Verify Site ID and API Key are correct

**2. "Collection not found"**
- Check collection names match exactly
- Ensure collections are published in Wix

**3. "Profile page not loading"**
- Verify dynamic page is connected to Profiles collection
- Check URL structure: `/profile/{slug}`
- Ensure Velo code has correct element IDs

**4. "Zip lookup not working"**
- Verify SpireZips collection exists
- Check field names: `title` for zip, `branch` for branch
- Test with known zip codes

**5. "Services not displaying"**
- Check Services collection has data
- Verify `profileId` field links correctly
- Check repeater connection in Velo code

### Debug Steps

**Test API Connection:**
```javascript
function debugWix() {
  console.log('Testing Wix connection...');
  const result = testWixConnection();
  console.log('Result:', result);
}
```

**Check Profile Data:**
```javascript
function checkProfile(profileId) {
  const profile = getCallCenterProfile(profileId);
  console.log('Profile data:', profile);
}
```

**Verify Collections:**
1. Go to Wix CMS
2. Check each collection has sample data
3. Verify field names match code exactly

---

## 🚀 Go Live

### Pre-Launch Checklist
- [ ] All collections created and populated
- [ ] API credentials configured and tested
- [ ] Profile page displays correctly
- [ ] All interactive tools working
- [ ] Agent training completed
- [ ] Backup of existing system

### Launch Steps
1. Deploy profile page to live site
2. Update any existing profile links
3. Notify call center team
4. Monitor for issues first week
5. Gather feedback and iterate

### Success Metrics
- Page load time < 3 seconds
- All tools functional
- Agents report improved efficiency
- Positive user feedback
- Reduced call handling time

---

**Need Help?** Reference the full technical documentation in `wix-call-center-setup.md` for detailed implementation guidance.
