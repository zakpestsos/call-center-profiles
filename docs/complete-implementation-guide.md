# 🚀 Complete Implementation Guide - Wix Call Center System

## 📋 **Pre-Implementation Checklist**
- [ ] Wix site with Editor access
- [ ] GitHub account created
- [ ] Consolidated CSV file downloaded: `consolidated-profiles.csv`
- [ ] Google Apps Script project access
- [ ] 1.5 hours for full setup

---

## **PHASE 1: WIX CMS SETUP (10 minutes)**

### **Step 1.1: Create Single Consolidated Collection**

1. **Access Wix CMS:**
   - Login to Wix Editor
   - Go to "CMS" in left sidebar
   - Click "Create Collection"

2. **Import Consolidated Profiles Collection:**
   - Click "Import from CSV"
   - Upload: `consolidated-profiles.csv`
   - Collection Name: "Import1" (or rename to match your existing collection)
   - Set permissions: "Admin" (read/write)
   - Primary field: "companyName"
   - URL slug field: "slug"
   - Verify your dynamic page is connected to the "Import1" collection

3. **Verify Data Structure:**
   - Check that all fields imported correctly:
     - ✅ Basic info: Company name, location, contact details
     - ✅ Services: JSON array with pricing, details, and variants
     - ✅ Technicians: JSON array with contact info and specializations
     - ✅ Policies: JSON array with options and defaults
     - ✅ Service Areas: JSON array with ZIP codes and territories
   - ✅ **Expected:** All 5 companies with complete embedded data

### **Step 1.2: Configure Collection Settings**

1. **Set Field Types (Wix will auto-detect most):**
   - Text fields: companyName, location, timezone, officePhone, etc.
   - Long Text fields: services, technicians, policies, serviceAreas (JSON data)
   - URL fields: website, fieldRoutesLink
   - Rich Text: physicalAddress, officeHours, bulletin, pestsNotCovered
   - Status field: status (dropdown: active, inactive)

2. **Configure Permissions:**
   - Read permissions: "Admin"
   - Write permissions: "Admin" 
   - ✅ **Note:** This keeps data secure while allowing API access

3. **Verify JSON Fields:**
   - Click on any profile record in CMS
   - Check that JSON fields show properly formatted data
   - Services should show array of service objects with variants
   - All other JSON fields should be readable arrays

---

## **PHASE 2: GITHUB PAGES SETUP (15 minutes)**

### **Step 2.1: Create GitHub Repository**

1. **Create Repository:**
   - Go to GitHub.com
   - Click "New Repository"
   - Repository name: "call-center-profiles"
   - Set to Public
   - Initialize with README
   - Click "Create repository"

2. **Upload HTML File:**
   - Click "Add file" → "Upload files"
   - Upload: `call-center-profile-dynamic.html`
   - Rename to: `index.html`
   - Commit with message: "Add call center interface"

3. **Enable GitHub Pages:**
   - Go to repository "Settings"
   - Scroll to "Pages" section
   - Source: "Deploy from a branch"
   - Branch: "main" or "master"
   - Folder: "/ (root)"
   - Click "Save"
   - ✅ **Note:** Your URL will be `https://zakpestsos.github.io/call-center-profiles/`

4. **Test GitHub Pages:**
   - Wait 2-3 minutes for deployment
   - Visit your GitHub Pages URL
   - ✅ **Verify:** Interface loads with sample data showing all sections
   - ✅ **Test:** Navigation works (Services, Technicians, Policies, Service Areas)
   - ✅ **Test:** Tools work (acreage converter, time zones)

### **Step 2.2: Test with URL Parameters**

Test consolidated data connection by visiting:
```
https://zakpestsos.github.io/call-center-profiles/?companyName=Test%20Company&location=Dallas&bulletin=Test%20message&services=[{"name":"Test%20Service","firstPrice":"$100"}]
```

✅ **Verify:** Page shows "Test Company", "Dallas", and test service data instead of sample data

---

## **PHASE 3: WIX INTEGRATION PAGE (20 minutes)**

### **Step 3.1: Create Dynamic Page**

1. **Add Dynamic Page:**
   - Wix Editor → Pages → Add Page → Dynamic Page
   - Page name: "Client Profile"
   - Connect to: "Import1" collection
   - URL: `/profile/{slug}`
   - Page template: Blank

2. **Add Page Elements:**
   - Add Container (full width/height)
   - Add HTML Embed/iframe element inside container
   - Element ID: "profileFrame"
   - iframe settings:
     - Width: 100%
     - Height: 100vh
     - Border: None
     - Scrolling: Auto

3. **Add Loading Elements:**
   - Add Text element: "Loading profile..."
   - Element ID: "loadingText"
   - Style: Center aligned, visible by default
   - Add Text element: "Error loading profile"
   - Element ID: "errorText"
   - Style: Center aligned, red color, hidden by default

### **Step 3.2: Add Velo Code**

1. **Enable Velo:**
   - Click "Dev Mode" in top menu
   - Enable Velo development

2. **Add Page Code:**
   - Open page code editor
   - Replace all code with:

```javascript
import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    console.log('=== PROFILE PAGE STARTING ===');
    
    // Simple approach - try to get slug and fallback to test data
    let profileSlug = getProfileSlug();
    
    if (!profileSlug) {
        console.warn('No slug found, using test profile');
        profileSlug = 'acme-pest-control';
    }
    
    console.log('Using profile slug:', profileSlug);
    loadProfile(profileSlug);
});

function getProfileSlug() {
    try {
        // Method 1: Try dataset first
        if ($w.dataset && typeof $w.dataset.getCurrentItem === 'function') {
            const item = $w.dataset.getCurrentItem();
            if (item && item.slug) {
                console.log('✅ Got slug from dataset:', item.slug);
                return item.slug;
            }
        }
        
        // Method 2: Try wixLocation URL parsing
        if (wixLocation && wixLocation.url) {
            console.log('Current location URL:', wixLocation.url);
            
            // Look for /profile/ pattern in URL
            const profileMatch = wixLocation.url.match(/\/profile\/([^\/\?#]+)/);
            if (profileMatch) {
                console.log('✅ Got slug from URL:', profileMatch[1]);
                return profileMatch[1];
            }
        }
        
        console.log('❌ No slug found in dataset or URL');
        return null;
        
    } catch (error) {
        console.error('Error getting profile slug:', error);
        return null;
    }
}

function loadProfile(slug) {
    // Show loading
    if ($w('#loadingText')) {
        $w('#loadingText').text = `Loading profile: ${slug}...`;
        $w('#loadingText').show();
    }
    if ($w('#profileFrame')) $w('#profileFrame').hide();
    if ($w('#errorText')) $w('#errorText').hide();
    
    console.log('Querying Import1 collection for slug:', slug);
    
    wixData.query('Import1')
        .eq('slug', slug)
        .find()
        .then(results => {
            console.log('Query results:', results);
            
            if (results.items && results.items.length > 0) {
                const profile = results.items[0];
                console.log('✅ Profile found:', profile.companyName);
                displayProfile(profile);
            } else {
                console.error('❌ No profile found for slug:', slug);
                showError(`Profile "${slug}" not found in database`);
            }
        })
        .catch(error => {
            console.error('❌ Database query error:', error);
            showError('Error loading profile: ' + error.message);
        });
}

function displayProfile(profile) {
    console.log('Building GitHub interface URL...');
    console.log('Profile data received:', profile);
    
    // Debug: Check data types of JSON fields
    console.log('Services type:', typeof profile.services, 'Value:', profile.services);
    console.log('Technicians type:', typeof profile.technicians, 'Value:', profile.technicians);
    console.log('Policies type:', typeof profile.policies, 'Value:', profile.policies);
    console.log('Service Areas type:', typeof profile.serviceAreas, 'Value:', profile.serviceAreas);
    
    try {
        const githubUrl = buildGitHubUrl(profile);
        console.log('✅ GitHub URL ready:', githubUrl);
        
        // Load in iframe
        if ($w('#profileFrame')) {
            $w('#profileFrame').src = githubUrl;
            $w('#profileFrame').show();
        }
        if ($w('#loadingText')) $w('#loadingText').hide();
        
    } catch (error) {
        console.error('❌ Error building GitHub URL:', error);
        showError('Error loading interface: ' + error.message);
    }
}

function buildGitHubUrl(profile) {
    const baseUrl = 'https://zakpestsos.github.io/call-center-profiles/';
    const params = new URLSearchParams();
    
    // Add all profile data as URL parameters
    if (profile.companyName) params.append('companyName', profile.companyName);
    if (profile.location) params.append('location', profile.location);
    if (profile.timezone) params.append('timezone', profile.timezone);
    if (profile.officePhone) params.append('phone', profile.officePhone);
    if (profile.customerContactEmail) params.append('email', profile.customerContactEmail);
    if (profile.website) params.append('website', profile.website);
    if (profile.fieldRoutesLink) params.append('fieldRoutesLink', profile.fieldRoutesLink);
    if (profile.physicalAddress) params.append('address', profile.physicalAddress);
    if (profile.officeHours) params.append('hours', profile.officeHours);
    if (profile.bulletin) params.append('bulletin', profile.bulletin);
    if (profile.pestsNotCovered) params.append('pestsNotCovered', profile.pestsNotCovered);
    
    // Add JSON data - ensure it's already a string or convert it
    if (profile.services) {
        const servicesString = typeof profile.services === 'string' ? profile.services : JSON.stringify(profile.services);
        params.append('services', servicesString);
    }
    if (profile.technicians) {
        const techniciansString = typeof profile.technicians === 'string' ? profile.technicians : JSON.stringify(profile.technicians);
        params.append('technicians', techniciansString);
    }
    if (profile.policies) {
        const policiesString = typeof profile.policies === 'string' ? profile.policies : JSON.stringify(profile.policies);
        params.append('policies', policiesString);
    }
    if (profile.serviceAreas) {
        const serviceAreasString = typeof profile.serviceAreas === 'string' ? profile.serviceAreas : JSON.stringify(profile.serviceAreas);
        params.append('serviceAreas', serviceAreasString);
    }
    
    return `${baseUrl}?${params.toString()}`;
}

function showError(message) {
    console.error('Showing error:', message);
    if ($w('#errorText')) {
        $w('#errorText').text = message;
        $w('#errorText').show();
    }
    if ($w('#loadingText')) $w('#loadingText').hide();
    if ($w('#profileFrame')) $w('#profileFrame').hide();
}
```

3. **Update GitHub URL:**
   - The code above is already configured for zakpestsos GitHub username
   - Save the page code

### **Step 3.3: Test Wix Integration**

1. **Publish Wix Site:**
   - Click "Publish" in top-right
   - Wait for publishing to complete

2. **Test Profile URLs:**
   - Visit: `psosprofiles.com/profile/acme-pest-control`
   - ✅ **Verify:** Page loads GitHub interface with ACME data
   - ✅ **Check:** All sections work (Services, Technicians, Policies, Service Areas)
   - Visit: `psosprofiles.com/profile/spire-pest-solutions`
   - ✅ **Verify:** Page loads with Spire data and eco-friendly services

3. **Debug if Needed:**
   - Open browser console (F12)
   - Check for JavaScript errors or JSON parsing issues
   - Verify GitHub Pages URL is correct in Velo code
   - Check that consolidated CSV data imported correctly
   - Ensure JSON fields are properly formatted

---

## **PHASE 4: GOOGLE APPS SCRIPT INTEGRATION (15 minutes)**

### **Step 4.1: Update wixApi.js**

1. **Open Google Apps Script:**
   - Go to script.google.com
   - Open your existing project

2. **Update wixApi.js with Simplified Integration:**
   - Replace existing `createWixProfile` function with this consolidated version:

```javascript
// Simplified Wix API integration - Single Collection
function createWixProfile(profileData) {
    const wixApiKey = PropertiesService.getScriptProperties().getProperty('WIX_API_KEY');
    const wixSiteId = PropertiesService.getScriptProperties().getProperty('WIX_SITE_ID');
    
    try {
        // Create consolidated profile record with all data
        const consolidatedData = {
            profileId: profileData.profileId || generateProfileId(),
            companyName: profileData.companyName,
            slug: createSlug(profileData.companyName),
            location: profileData.location,
            timezone: profileData.timezone,
            officePhone: profileData.officePhone,
            customerContactEmail: profileData.customerContactEmail,
            website: profileData.website,
            fieldRoutesLink: profileData.fieldRoutesLink,
            physicalAddress: profileData.physicalAddress,
            officeHours: profileData.officeHours,
            bulletin: profileData.bulletin,
            pestsNotCovered: profileData.pestsNotCovered,
            
            // Convert arrays to JSON strings for Wix CMS
            services: JSON.stringify(profileData.services || []),
            technicians: JSON.stringify(profileData.technicians || []),
            policies: JSON.stringify(profileData.policies || []),
            serviceAreas: JSON.stringify(profileData.serviceAreas || []),
            
            status: 'active'
        };
        
        const profile = createWixRecord('Import1', consolidatedData, wixApiKey, wixSiteId);
        
        return {
            success: true,
            profileId: profile._id,
            message: 'Consolidated profile created successfully'
        };
        
    } catch (error) {
        console.error('Error creating Wix profile:', error);
        return {
            success: false,
            error: error.toString()
        };
    }
}

// Helper functions remain the same
function generateProfileId() {
    return 'prof_' + Utilities.getUuid().substring(0, 8);
}

function createSlug(companyName) {
    return companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function createWixRecord(collection, data, apiKey, siteId) {
    const url = `https://www.wixapis.com/wix-data/v1/collections/${collection}/items`;
    
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'wix-site-id': siteId
        },
        payload: JSON.stringify({
            dataItem: data
        })
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() !== 200) {
        throw new Error(`Failed to create ${collection} record: ${result.message}`);
    }
    
    return result.dataItem;
}
```

### **Step 4.2: Test Simplified Integration**

1. **Run Test Function:**
   - Create test function in script editor:

```javascript
function testConsolidatedWixIntegration() {
    const testProfile = {
        companyName: "Test Consolidated Pest Control",
        location: "Test City, TX",
        timezone: "Central",
        officePhone: "(555) 999-0000",
        customerContactEmail: "test@testpest.com",
        website: "https://testpest.com",
        bulletin: "Test bulletin message",
        services: [{
            name: "Test Service",
            description: "Test description",
            firstPrice: "$100",
            recurringPrice: "$35",
            contract: "12 Months",
            guarantee: "30-day guarantee",
            duration: "45 minutes",
            pests: "Test pests",
            queueExt: "999",
            productType: "Residential"
        }],
        technicians: [{
            name: "Test Technician",
            phone: "(555) 999-0001",
            email: "tech@testpest.com",
            specializations: "General Pest",
            certifications: "Licensed PCO",
            experience: "5 years",
            territory: "Test Area"
        }],
        policies: [{
            type: "guarantee",
            title: "Test Guarantee",
            description: "Test guarantee policy",
            options: ["30 days", "60 days"],
            default: "30 days"
        }],
        serviceAreas: [{
            zip: "99999",
            city: "Test City",
            state: "TX",
            branch: "Test Branch",
            territory: "Test Territory",
            inService: true
        }]
    };
    
    const result = createWixProfile(testProfile);
    console.log('Consolidated test result:', result);
}
```

2. **Execute Test:**
   - Run `testConsolidatedWixIntegration` function
   - ✅ **Verify:** New consolidated profile appears in Wix CMS
   - ✅ **Check:** All data (services, technicians, policies, areas) in single record
   - ✅ **Test:** Profile accessible at `psosprofiles.com/profile/test-consolidated-pest-control`

---

## **PHASE 5: FINAL TESTING & VALIDATION (15 minutes)**

### **Step 5.1: End-to-End Testing**

1. **Test Data Flow:**
   - Google Sheets → Google Apps Script → Wix CMS → GitHub Pages

2. **Test Each Profile:**
   - `psosprofiles.com/profile/acme-pest-control`
   - `psosprofiles.com/profile/spire-pest-solutions` 
   - `psosprofiles.com/profile/guardian-pest-management`
   - `psosprofiles.com/profile/coastal-pest-control`
   - `psosprofiles.com/profile/hill-country-exterminators`

3. **Test Interface Features:**
   - ✅ Company name displays correctly
   - ✅ Services load with pricing and variants
   - ✅ Technicians section shows contact info and specializations
   - ✅ Policies section displays with options and defaults
   - ✅ Service Areas show ZIP codes grouped by branch
   - ✅ Tools work (acreage converter, zip lookup)
   - ✅ Navigation between all sections works smoothly
   - ✅ Office info modal opens with complete details
   - ✅ Time zones update correctly

### **Step 5.2: Performance & Security Checks**

1. **Performance Testing:**
   - Page load times under 3 seconds
   - Smooth navigation between sections
   - Responsive design on mobile/tablet

2. **Security Verification:**
   - API keys properly stored in PropertiesService
   - No sensitive data exposed in URLs
   - HTTPS connections only

3. **Data Integrity:**
   - All consolidated CSV records imported correctly
   - JSON data in each field is properly formatted
   - No broken links or missing data in any section
   - Service variants display correctly within services
   - All ZIP codes and territories are accessible

---

## **PHASE 6: DEPLOYMENT & MONITORING (10 minutes)**

### **Step 6.1: Production Deployment**

1. **Final Wix Site Publish:**
   - Review all pages and functionality
   - Publish site to production
   - Update DNS if using custom domain

2. **GitHub Pages Final Check:**
   - Verify repository is public
   - Confirm GitHub Pages is enabled
   - Test direct access to interface

3. **Documentation:**
   - Update team on new URLs
   - Create user guide for accessing profiles
   - Document any custom procedures

### **Step 6.2: Monitoring Setup**

1. **Set Up Monitoring:**
   - Bookmark key profile URLs for regular testing
   - Monitor Google Apps Script execution logs
   - Set up alerts for Wix API failures

2. **Create Maintenance Schedule:**
   - Weekly: Test key profile pages and all sections
   - Monthly: Review consolidated CSV data for updates
   - Quarterly: Performance optimization and JSON field review

---

## **🎯 SUCCESS CHECKLIST**

### **Wix CMS Setup:**
- [ ] 1 Consolidated collection created from CSV file
- [ ] All profile data visible in single CMS records
- [ ] JSON data fields properly formatted
- [ ] Dynamic page created and published

### **GitHub Pages:**
- [ ] Repository created and HTML uploaded
- [ ] GitHub Pages enabled and accessible
- [ ] Interface loads with sample data
- [ ] URL parameter testing successful

### **Integration:**
- [ ] Wix page loads GitHub interface in iframe
- [ ] Real profile data displays correctly in all sections
- [ ] All 5 test profiles accessible with complete data
- [ ] Navigation works for Services, Technicians, Policies, Service Areas
- [ ] JSON data parsing works correctly for all fields

### **Google Apps Script:**
- [ ] Simplified wixApi.js deployed
- [ ] Consolidated profile creation successful
- [ ] JSON data handling working correctly
- [ ] Error handling and logging active

---

## **📞 FINAL VERIFICATION URLS**

Test these URLs to confirm everything works:

1. **ACME Pest Control:**
   `psosprofiles.com/profile/acme-pest-control`

2. **Spire Pest Solutions:**
   `psosprofiles.com/profile/spire-pest-solutions`

3. **Guardian Pest Management:**
   `psosprofiles.com/profile/guardian-pest-management`

4. **Coastal Pest Control:**
   `psosprofiles.com/profile/coastal-pest-control`

5. **Hill Country Exterminators:**
   `psosprofiles.com/profile/hill-country-exterminators`

---

## **🚨 TROUBLESHOOTING GUIDE**

### **Common Issues:**

1. **"Profile not found" error:**
   - Check CSV import completed successfully
   - Verify slug field matches URL pattern
   - Confirm collection permissions set correctly

2. **GitHub Pages not loading:**
   - Wait 5-10 minutes after enabling Pages
   - Check repository is set to public
   - Verify HTML file is named `index.html`

3. **Wix integration showing sample data:**
   - Check GitHub username in Velo code is correct (should be zakpestsos)
   - Verify profile exists in Wix CMS collection
   - Test URL parameter format manually

4. **JavaScript errors in Wix Velo:**
   - **Multiple "already declared" errors:** This indicates duplicate scripts. Try these steps:
     * Clear browser cache completely (Ctrl+Shift+Delete)
     * In Wix Editor: Dev Mode → Clear all cached code
     * Republish the site completely
     * Make sure you only have ONE dynamic page with Velo code
     * Disable browser extensions temporarily
   - **"snakeCasePattern already declared":** Clear browser cache and republish site
   - **"Cannot read properties of undefined (reading 'path')":** Use the updated simplified Velo code
   - **"No profile specified in URL":** The new code automatically uses test data if no slug found
   - **Page not loading:** Check browser console for specific errors and ensure all element IDs exist
   - **"[object Object]" is not valid JSON errors:** This means the Wix data isn't properly serialized. The updated buildGitHubUrl function fixes this
   - **Solution:** Copy the complete simplified Velo code from Step 3.2 with the updated buildGitHubUrl function

5. **JSON data parsing errors:**
   - **"[object Object]" errors:** The Wix CMS is storing the JSON data but the Velo code wasn't properly serializing it for URL parameters
   - **Solution:** The updated buildGitHubUrl function now checks if data is already a string or converts it properly
   - **Check CSV imported with proper JSON formatting:** Verify quotes are properly escaped in JSON fields
   - **Test individual JSON fields in browser console:** You can debug by logging the profile data before building the URL

6. **Google Apps Script errors:**
   - Check API credentials stored in PropertiesService
   - Verify Wix collection name is "Import1"
   - Review execution transcript for specific errors

### **Quick Debug Steps:**
1. Open browser console (F12) on your Wix page
2. Look for console.log messages showing URL and profile data
3. Check that all page elements exist (profileFrame, loadingText, errorText)
4. Verify your collection is named exactly "Import1"
5. Test with a direct URL like: `psosprofiles.com/profile/acme-pest-control`

---

**🎉 Congratulations! Your Wix Call Center System is now live!**

**Total Implementation Time:** ~1.5 hours
**System Status:** Production Ready
**Next Steps:** Train team and start using the new interface!
