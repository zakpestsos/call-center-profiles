# GitHub Pages + Google Sheets Profile System

This system allows you to create dynamic client profiles hosted on GitHub Pages that pull data from Google Sheets using unique identifiers.

## 🚀 Quick Setup

### Step 1: Set Up Google Apps Script

1. **Create a new Apps Script project**:
   - Go to [script.google.com](https://script.google.com)
   - Click "New project"
   - Replace the default `Code.gs` content with the content from `gas-integration.js`

2. **Update the configuration**:
   ```javascript
   // In gas-integration.js, replace YOUR_MASTER_SHEET_ID with your actual sheet ID
   const MASTER_SHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'; // Example
   ```

3. **Deploy as Web App**:
   - Click "Deploy" → "New deployment"
   - Choose type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone" (for cross-origin requests)
   - Copy the Web App URL

4. **Create your master sheet**:
   - Create a new Google Sheet
   - Add sheet tabs: "Profiles", "Services", "Technicians", "ServiceAreas"
   - Copy the sheet ID from the URL

### Step 2: Set Up GitHub Pages

1. **Create a GitHub repository**:
   - Go to [github.com](https://github.com)
   - Create new repository named `client-profiles` (or similar)
   - Make it public

2. **Upload files**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/client-profiles.git
   cd client-profiles

   # Copy the necessary files
   cp ../github-profile-page.html index.html
   cp ../config-github.js .
   cp ../styles.css . # If you have additional styles

   git add .
   git commit -m "Initial profile system setup"
   git push origin main
   ```

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: "main"
   - Your site will be at: `https://YOUR_USERNAME.github.io/client-profiles/`

### Step 3: Configure Everything

1. **Update `config-github.js`**:
   ```javascript
   const CONFIG = {
     GOOGLE_SHEETS: {
       MASTER_SHEET_ID: 'YOUR_ACTUAL_MASTER_SHEET_ID',
       WEB_APP_URL: 'YOUR_APPS_SCRIPT_WEB_APP_URL'
     },
     GITHUB: {
       REPO_URL: 'https://YOUR_USERNAME.github.io/client-profiles/',
       PROFILE_URL_PATTERN: 'https://YOUR_USERNAME.github.io/client-profiles/?profileId='
     }
   };
   ```

2. **Update the intake form**:
   - Open `client-input-form.html`
   - Add the config script tag at the top
   - The form will now use the configured URLs

### Step 4: Test the System

1. **Test the form**:
   - Open `client-input-form.html` in a browser
   - Fill out the form and submit
   - You should get a success message with a profile URL

2. **Test the profile page**:
   - The success message includes a URL like: `https://YOUR_USERNAME.github.io/client-profiles/?profileId=profile_1234567890_123`
   - Visit this URL to see the dynamic profile

3. **Verify data flow**:
   - Check that data appears in your Google Sheets
   - Verify that the profile page loads the correct data

## 🔧 How It Works

### Data Flow
1. **Form Submission**: User fills out `client-input-form.html`
2. **Data Storage**: Apps Script creates unique ID and stores in Google Sheets
3. **URL Generation**: Apps Script returns a unique URL with the profile ID
4. **Dynamic Loading**: GitHub Pages loads data based on URL parameter
5. **Display**: Profile page shows data fetched from Sheets via Apps Script API

### URL Structure
```
https://YOUR_USERNAME.github.io/client-profiles/?profileId=profile_1234567890_123
```

### Unique Identifier System
- Each profile gets a unique ID: `profile_[timestamp]_[random]`
- This ID is used as the primary key in all sheets
- URLs are generated automatically after form submission

## 📁 Required Files

- `index.html` (renamed from `github-profile-page.html`)
- `config-github.js` (configuration)
- `client-input-form.html` (intake form)
- `gas-integration.js` (Apps Script code)

## 🛠️ Customization

### Adding New Fields
1. Add to the intake form HTML
2. Update the Apps Script data structures
3. Update the profile display HTML
4. Ensure proper data types in all functions

### Styling
- Modify `index.html` styles
- Add custom CSS files if needed
- The current design is cyberpunk-themed but can be changed

### Additional Features
- Weather integration: Add to `index.html`
- Search functionality: Implement in the profile page
- Export features: Add download buttons

## 🔒 Security Notes

- Apps Script Web App is deployed with "Anyone" access for CORS
- Consider implementing API keys for production
- Data is stored in Google Sheets (ensure proper sharing settings)
- Profile URLs are publicly accessible

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure Apps Script is deployed with "Anyone" access
   - Check that headers are properly set

2. **Profile Not Loading**:
   - Verify the profile ID in the URL
   - Check browser console for errors
   - Ensure the master sheet ID is correct

3. **Form Not Submitting**:
   - Check that `config-github.js` has correct URLs
   - Verify Apps Script deployment is working
   - Check browser console for JavaScript errors

4. **Data Not Saving**:
   - Ensure you have edit permissions on the master sheet
   - Check that sheet tabs exist (Profiles, Services, etc.)
   - Verify the Apps Script has permission to edit the sheet

### Debug Steps

1. Test the Apps Script directly:
   ```
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?profileId=test
   ```

2. Check the master sheet for data
3. Verify GitHub Pages is serving the correct files
4. Check browser network tab for failed requests

## 📈 Scaling Considerations

- **Performance**: Apps Script has quotas - monitor usage
- **Rate Limiting**: Consider caching for frequently accessed profiles
- **Data Size**: Large datasets may need optimization
- **Backup**: Regularly backup your master sheet

## 🎯 Next Steps

1. Set up automated testing
2. Add user authentication if needed
3. Implement caching for better performance
4. Add analytics tracking
5. Create an admin interface for managing profiles

This system provides a simple, scalable way to create dynamic profile pages without the complexity of Wix while maintaining the flexibility of Google Sheets as your data source.









