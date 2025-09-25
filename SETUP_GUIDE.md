# Call Center Profile System - Complete Setup Guide

This guide will walk you through setting up the complete call center profile system that integrates Google Sheets, Google Apps Script, and Wix CMS.

## 📋 Prerequisites

- Google Account with access to Google Sheets and Apps Script
- Wix Premium Plan (for backend code and custom databases)
- GitHub account (for version control)
- Domain name (if using custom domain with Wix)

## 🚀 Setup Order (IMPORTANT: Follow this exact sequence)

### Phase 1: Google Apps Script Setup

#### Step 1: Set Up Google Apps Script Project
1. **Create New Apps Script Project**
   - Go to [script.google.com](https://script.google.com)
   - Click "New project"
   - Name it "Call Center Profile API"

2. **Upload the Apps Script Code**
   - Delete the default `Code.gs` content
   - Copy the content from `production/gas-integration.js`
   - Paste it into `Code.gs`
   - Save the project (Ctrl+S)

3. **Deploy as Web App**
   - Click "Deploy" → "New deployment"
   - Choose type: "Web app"
   - Description: "Call Center Profile API v1"
   - Execute as: "Me"
   - Who has access: "Anyone" (for cross-origin requests)
   - Click "Deploy"
   - **IMPORTANT**: Copy the Web App URL - you'll need this later!

#### Step 2: Test Google Apps Script
1. Create a test Google Sheet with your client data
2. Note the Sheet ID from the URL (between `/d/` and `/edit`)
3. Test the API by visiting: `YOUR_WEB_APP_URL?sheetId=YOUR_SHEET_ID`
4. Verify you get JSON response with client data

### Phase 2: GitHub Repository Setup

#### Step 3: Create GitHub Repository
1. **Create New Repository**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name: "call-center-profiles"
   - Make it public
   - Initialize with README

2. **Upload Production Files**
   ```bash
   git clone https://github.com/YOUR_USERNAME/call-center-profiles.git
   cd call-center-profiles
   
   # Copy all files from production folder
   cp production/* .
   
   git add .
   git commit -m "Initial call center profile system"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: "Deploy from a branch"
   - Branch: "main" / Root
   - Save
   - Note your GitHub Pages URL: `https://YOUR_USERNAME.github.io/call-center-profiles`

### Phase 3: Wix CMS Setup

#### Step 4: Create Wix Collections
Create these collections in your Wix CMS (Content Manager):

1. **Clients Collection**
   ```
   Fields:
   - title (Text) - Company Name
   - companyName (Text)
   - location (Text)
   - timezone (Text)
   - phone (Text)
   - email (Text)
   - website (URL)
   - fieldRoutesLink (URL)
   - physicalAddress (Text)
   - officeHours (Text)
   - bulletin (Rich Text)
   - pestsNotCovered (Rich Text)
   ```

2. **Services Collection**
   ```
   Fields:
   - title (Text) - Service Name
   - clientId (Reference to Clients)
   - name (Text)
   - description (Rich Text)
   - serviceType (Text)
   - frequency (Text)
   - pests (Text)
   - contract (Text)
   - guarantee (Text)
   - duration (Text)
   - order (Number)
   ```

3. **Technicians Collection**
   ```
   Fields:
   - title (Text) - Technician Name
   - clientId (Reference to Clients)
   - name (Text)
   - company (Text)
   - role (Text)
   - phone (Text)
   - schedule (Text)
   - maxStops (Text)
   - doesNotService (Text)
   - additionalNotes (Rich Text)
   - zipCodes (Tags)
   ```

4. **Policies Collection**
   ```
   Fields:
   - title (Text) - Policy Title
   - clientId (Reference to Clients)
   - category (Text)
   - type (Text)
   - description (Rich Text)
   - default (Text)
   - options (Tags)
   - order (Number)
   ```

5. **ServiceAreas Collection**
   ```
   Fields:
   - title (Text) - ZIP Code
   - clientId (Reference to Clients)
   - zip (Text)
   - city (Text)
   - state (Text)
   - branch (Text)
   - territory (Text)
   - inService (Boolean)
   ```

#### Step 5: Set Up Wix Backend
1. **Enable Dev Mode** in your Wix Editor
2. **Create Backend File**
   - In the Wix Editor, go to Dev Mode
   - Create new file: `backend/client-profiles.js`
   - Copy content from `production/wix-backend.js`
   - Save the file

3. **Test Backend Functions**
   - Use Wix's backend testing tools
   - Test the `getClientProfile` function

### Phase 4: Configuration

#### Step 6: Update Configuration Files

1. **Update config.js**
   ```javascript
   const CONFIG = {
     GOOGLE_SHEETS: {
       WEB_APP_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
       API_KEY: '', // Optional for direct API access
       SPREADSHEET_ID: '' // Optional
     },
     WIX: {
       IS_WIX_ENVIRONMENT: true, // Set to true when deploying to Wix
       COLLECTIONS: {
         CLIENTS: 'Clients',
         SERVICES: 'Services',
         TECHNICIANS: 'Technicians',
         POLICIES: 'Policies',
         SERVICE_AREAS: 'ServiceAreas'
       }
     },
     // ... rest of config
   };
   ```

2. **Commit Configuration Changes**
   ```bash
   git add config.js
   git commit -m "Update configuration with production URLs"
   git push origin main
   ```

### Phase 5: Wix Integration

#### Step 7: Create Wix Profile Page

1. **Create New Page**
   - In Wix Editor, add new page: "Client Profile"
   - Add HTML embed element covering full page

2. **Embed the Application**
   ```html
   <iframe 
     src="https://YOUR_USERNAME.github.io/call-center-profiles?clientId=CLIENT_ID_HERE"
     width="100%" 
     height="100%" 
     frameborder="0"
     style="min-height: 100vh;">
   </iframe>
   ```

3. **Alternative: Direct Integration**
   - Copy contents of `index.html` into a Wix HTML element
   - Upload `styles.css` and `app.js` to Wix Media Manager
   - Reference them in your HTML

#### Step 8: Create Dynamic Pages

1. **Set Up Dynamic Page**
   - Connect dynamic page to Clients collection
   - URL pattern: `/profile/CLIENT_NAME`

2. **Add Profile Page Code**
   ```javascript
   // In your Wix page code
   import { getClientProfile } from 'backend/client-profiles';
   
   $w.onReady(async function () {
     const clientId = $w('#dynamicDataset').getCurrentItem()._id;
     
     try {
       const profileData = await getClientProfile(clientId);
       
       // Option 1: Use iframe with data
       const iframe = $w('#profileIframe');
       const dataUrl = encodeURIComponent(JSON.stringify(profileData));
       iframe.src = `https://YOUR_USERNAME.github.io/call-center-profiles?data=${dataUrl}`;
       
       // Option 2: Populate Wix elements directly
       // $w('#companyName').text = profileData.companyName;
       // ... etc
       
     } catch (error) {
       console.error('Error loading profile:', error);
     }
   });
   ```

### Phase 6: Testing & Deployment

#### Step 9: Test the Complete System

1. **Test Data Flow**
   - Create test data in Google Sheets
   - Verify Apps Script returns correct JSON
   - Test GitHub Pages loads correctly
   - Test Wix integration displays data

2. **Test All Features**
   - Search functionality
   - Technician filtering
   - Policy organization
   - Weather integration
   - Responsive design

#### Step 10: Production Deployment

1. **Update Production Settings**
   ```javascript
   // In config.js
   WIX: {
     IS_WIX_ENVIRONMENT: true, // Enable Wix mode
     // ... other settings
   }
   ```

2. **Deploy to Wix**
   - Publish your Wix site
   - Test all functionality in production
   - Monitor for any errors

## 🔄 Data Import Workflow

### Importing from Google Sheets to Wix

1. **Prepare Your Google Sheet**
   - Use the format from your existing Apps Script
   - Ensure all required sheets exist (Services, Technicians, Policies, etc.)

2. **Import Data**
   ```javascript
   // Call this from Wix backend or frontend
   import { importFromGoogleSheets } from 'backend/client-profiles';
   
   const result = await importFromGoogleSheets(
     'YOUR_SHEET_ID',
     'YOUR_APPS_SCRIPT_WEB_APP_URL'
   );
   ```

3. **Verify Import**
   - Check Wix CMS collections
   - Test profile page displays correctly

## 🎯 URL Patterns for Integration

### Different Ways to Load Client Data

1. **From Wix CMS (Recommended for Production)**
   ```
   https://yoursite.wix.com/profile/client-name
   ```

2. **From Google Sheets Direct**
   ```
   https://yoursite.wix.com/profile?sheetId=SHEET_ID
   ```

3. **With URL Parameters**
   ```
   https://yoursite.wix.com/profile?companyName=Company&location=City,ST&...
   ```

4. **Standalone GitHub Pages**
   ```
   https://YOUR_USERNAME.github.io/call-center-profiles?clientId=123
   ```

## 🔧 Troubleshooting

### Common Issues and Solutions

1. **CORS Errors**
   - Ensure Apps Script is deployed with "Anyone" access
   - Check that headers are properly set in Apps Script

2. **Wix Backend Errors**
   - Verify collection names match CONFIG settings
   - Check that all required fields exist in collections

3. **Data Not Loading**
   - Test Apps Script URL directly in browser
   - Check browser console for JavaScript errors
   - Verify Google Sheets permissions

4. **Styling Issues**
   - Ensure CSS file is properly loaded
   - Check for missing font imports
   - Verify responsive breakpoints

## 📱 Mobile Optimization

The system is fully responsive and optimized for:
- Desktop displays
- Tablets
- Mobile phones
- Touch interfaces

## 🔒 Security Considerations

1. **API Security**
   - Apps Script deployed with proper permissions
   - No sensitive data in client-side code
   - Wix backend handles sensitive operations

2. **Data Privacy**
   - Client data secured in Wix CMS
   - Google Sheets access controlled
   - No client data stored in GitHub

## 🚀 Performance Optimization

1. **Lazy Loading**
   - Weather data loads asynchronously
   - Large datasets paginated

2. **Caching**
   - Browser caches static assets
   - Wix CMS provides built-in caching

3. **Optimization**
   - Minified CSS and JavaScript
   - Optimized images and fonts
   - Efficient database queries

## 📊 Analytics & Monitoring

Consider adding:
- Google Analytics tracking
- Wix Analytics integration
- Error logging and monitoring
- Performance monitoring

## 🔄 Maintenance

### Regular Tasks
1. Monitor Apps Script quotas
2. Update client data as needed
3. Review and update policies
4. Test system functionality monthly

### Updates
1. Update GitHub repository
2. Redeploy if necessary
3. Test in staging environment first
4. Document all changes

This setup provides a complete, production-ready call center profile system that scales with your business needs!
