# Wix API Setup Guide

This guide will walk you through setting up your Wix API credentials and configuring your CMS collections for the client profile automation system.

## 📋 Prerequisites

- A Wix website with CMS collections
- Wix Developer account
- Google Apps Script project set up

## 🔧 Step 1: Access Wix Developer Console

1. Go to [Wix Developers Console](https://dev.wix.com/)
2. Sign in with your Wix account
3. If you don't have a developer account, you'll need to create one

## 🏗️ Step 2: Create or Select Your App

### Option A: Create New App
1. Click "Create New App"
2. Choose "Headless" app type
3. Give your app a name (e.g., "Profile Automation")
4. Select your website

### Option B: Use Existing App
1. Select your existing app from the dashboard
2. Make sure it has the necessary permissions

## 🔑 Step 3: Get Your Credentials

### Site ID
1. In your Wix Developer Console, go to your app
2. Navigate to "Workspace" → "Site Details"
3. Copy your **Site ID** (looks like: `12345678-1234-1234-1234-123456789abc`)

### API Key
1. In your app dashboard, go to "API Keys"
2. Create a new API key or use an existing one
3. Copy your **API Key**
4. **Important**: Keep this secure and never share it publicly

## 🔐 Step 4: Configure API Permissions

Your app needs the following permissions:

### Required Permissions:
- **CMS Data**: Read and Write
- **Site Content**: Read and Write
- **Collections**: Manage

### To Set Permissions:
1. Go to "Permissions" in your app dashboard
2. Enable the required permissions listed above
3. Save changes

## 🗃️ Step 5: Set Up CMS Collections

You need to create the following collections in your Wix site:

### 1. Profiles Collection
**Collection ID**: `Profiles`

**Fields**:
- `title` (Text) - Company name
- `location` (Text) - Company location
- `profileId` (Number) - Unique profile ID
- `slug` (Text) - URL slug
- `officeInformation` (Rich Text) - Office details
- `services` (Rich Text) - Services information
- `bulletinInfo` (Rich Text) - Bulletin information
- `pestsNotCovered` (Text) - Pests not covered
- `status` (Text) - Profile status
- `createdDate` (Date) - Creation date

### 2. TechnicianList Collection
**Collection ID**: `TechnicianList`

**Fields**:
- `profileId` (Text) - Reference to profile
- `name` (Text) - Technician name
- `phone` (Text) - Phone number
- `email` (Text) - Email address
- `serviceAreas` (Text) - Service areas (comma-separated)
- `schedule` (Rich Text) - Schedule information

### 3. Policies Collection
**Collection ID**: `Policies`

**Fields**:
- `profileId` (Text) - Reference to profile
- `title` (Text) - Policy title
- `content` (Rich Text) - Policy content
- `category` (Text) - Policy category

### 4. ServiceAreas Collection
**Collection ID**: `ServiceAreas`

**Fields**:
- `profileId` (Text) - Reference to profile
- `zipCode` (Text) - Zip code
- `city` (Text) - City name
- `state` (Text) - State
- `region` (Text) - Region/area name

## 🔧 Step 6: Configure in Google Apps Script

1. Open your Google Apps Script project
2. Run the following function to set up your credentials:

```javascript
function setupCredentials() {
  // Replace with your actual credentials
  const siteId = 'YOUR_SITE_ID_HERE';
  const apiKey = 'YOUR_API_KEY_HERE';
  
  setupWixCredentials(siteId, apiKey);
}
```

3. Test the connection:

```javascript
function testConnection() {
  const result = testWixConnection();
  console.log('Connection test result:', result);
}
```

## 🌐 Step 7: Update Collection Configuration

If your collection names are different, update the configuration in `config/config.js`:

```javascript
const CONFIG = {
  WIX: {
    COLLECTIONS: {
      PROFILES: 'YourProfilesCollectionName',
      TECHNICIANS: 'YourTechniciansCollectionName', 
      POLICIES: 'YourPoliciesCollectionName',
      SERVICE_AREAS: 'YourServiceAreasCollectionName'
    }
  }
};
```

## 🧪 Step 8: Test Your Setup

1. Create a test Google Sheet with the input template
2. Add sample client data
3. Run the profile creation function
4. Check your Wix CMS to verify the data was created

### Test Data Example:
```
Company Name: Test Company
Location: Test City, TX
Services: General Pest Control
Technician: John Doe, 555-1234, john@test.com
Zip Code: 12345
```

## 🔍 Step 9: Verify in Wix

1. Go to your Wix site dashboard
2. Navigate to CMS → Collections
3. Check each collection to see if test data was created
4. Verify the profile page displays correctly

## 🚨 Troubleshooting

### Common Issues:

**"Unauthorized" Error**
- Check your API key is correct
- Verify permissions are set properly
- Ensure your app is published

**"Collection not found" Error**
- Verify collection names match exactly
- Check collection IDs in your Wix CMS
- Update configuration if needed

**"Site ID invalid" Error**
- Double-check your Site ID
- Make sure you're using the correct site

### Testing API Connection:

```javascript
function debugApiConnection() {
  try {
    const config = getWixConfig();
    console.log('Site ID:', config.siteId);
    console.log('API Key length:', config.apiKey ? config.apiKey.length : 'Not set');
    
    const connectionResult = testWixConnection();
    console.log('Connection successful:', connectionResult);
  } catch (error) {
    console.log('Connection error:', error.message);
  }
}
```

## 📚 Additional Resources

- [Wix REST API Documentation](https://dev.wix.com/api/rest/getting-started/introduction)
- [Wix CMS API Reference](https://dev.wix.com/api/rest/wix-data/wix-data)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)

## 🔒 Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment-specific credentials**
3. **Regularly rotate API keys**
4. **Monitor API usage and logs**
5. **Implement proper error handling**

---

Once you've completed this setup, your Wix API integration should be ready to automate client profile creation!
