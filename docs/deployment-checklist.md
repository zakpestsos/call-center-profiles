# Deployment Checklist

## Pre-Deployment Setup

### Google Apps Script Setup
- [ ] Create new Google Apps Script project
- [ ] Upload all source files (`src/`, `ui/`, `config/`, `utils/`)
- [ ] Configure `appsscript.json` manifest
- [ ] Deploy as web app with "Anyone" access
- [ ] Copy web app URL
- [ ] Run `quickSetup()` function
- [ ] Run `verifySetup()` function

### Production Configuration
- [ ] Update `production/config.js` with actual web app URL
- [ ] Test profile creation form
- [ ] Test profile editing form  
- [ ] Test production web app with `?profileId=TEST_ID`
- [ ] Verify data syncing between systems

### Wix Integration (Optional)
- [ ] Create Wix CMS collections
- [ ] Configure Wix API credentials
- [ ] Test Wix sync functionality
- [ ] Update production config for Wix environment

## Deployment Options

### Option 1: GitHub Pages + Netlify
1. Upload `production/` folder to GitHub repository
2. Enable GitHub Pages or deploy to Netlify
3. Configure custom domain if needed
4. Test with profile URLs

### Option 2: Wix Website Integration
1. Upload files to Wix site
2. Set `IS_WIX_ENVIRONMENT: true` in config
3. Configure Wix routing for profile pages
4. Test full integration

### Option 3: Custom Hosting
1. Upload `production/` files to web server
2. Configure HTTPS and CORS as needed
3. Set up domain and SSL
4. Test all functionality

## Post-Deployment Testing

### Core Functionality
- [ ] Profile creation form works
- [ ] Profile editing form works
- [ ] Master sheet updates correctly
- [ ] Individual client sheets sync
- [ ] Web app displays profiles correctly
- [ ] Weather data loads
- [ ] Search functionality works

### Data Flow Testing
- [ ] Create new profile via form
- [ ] Verify data in master sheet
- [ ] Edit via edit form
- [ ] Verify changes sync everywhere
- [ ] Edit in client sheet directly  
- [ ] Verify changes sync to master sheet
- [ ] Test automatic sync triggers

### Error Handling
- [ ] Test with invalid profile IDs
- [ ] Test with missing data
- [ ] Test network connectivity issues
- [ ] Verify fallback data displays

## Maintenance

### Regular Tasks
- [ ] Monitor sync logs in master sheet
- [ ] Check Google Apps Script execution logs
- [ ] Verify automatic triggers are running
- [ ] Backup master sheet data regularly

### Scaling Considerations
- [ ] Monitor Google Apps Script quotas
- [ ] Consider rate limiting for high traffic
- [ ] Plan for multiple environments (dev/prod)
- [ ] Document custom configurations

## Troubleshooting Quick Reference

### Common Issues
- **Form not loading**: Check web app deployment settings
- **Data not syncing**: Verify triggers are set up
- **Profile not found**: Check profile ID in master sheet
- **Weather not working**: Check API endpoints in browser console

### Key URLs to Test
- Web App: `YOUR_SCRIPT_URL`
- Profile API: `YOUR_SCRIPT_URL?action=getProfile&profileId=ID`
- Edit Form: `YOUR_SCRIPT_URL?action=edit&profileId=ID`
- Production App: `YOUR_DOMAIN/profile?profileId=ID`

## Success Criteria

✅ **System is ready when:**
- Profile creation form works end-to-end
- Data appears in all three places (form → master sheet → web app)
- Editing works from both form and sheet
- Automatic syncing is active
- Production web app displays real data
- All error scenarios are handled gracefully

## Support

For issues, check:
1. Google Apps Script execution logs
2. Master sheet sync log tab
3. Browser developer console
4. Network requests in dev tools
