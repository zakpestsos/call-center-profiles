# GitHub Pages + Wix Embedding Solution

## 🚀 **Quick Setup: Host HTML on GitHub, Embed in Wix**

This approach lets you use the exact HTML design while still integrating with Wix.

---

## **Step 1: Set Up GitHub Pages (5 minutes)**

### **1.1 Create GitHub Repository**
1. Go to [github.com](https://github.com) and sign in (or create account)
2. Click "New repository"
3. Name it: `pest-control-profiles`
4. Make it **Public**
5. Check "Add a README file"
6. Click "Create repository"

### **1.2 Upload Your HTML File**
1. In your new repository, click "Add file" → "Upload files"
2. Upload the `wix-profile-page.html` file
3. Rename it to `index.html` (important!)
4. Commit the file

### **1.3 Enable GitHub Pages**
1. Go to repository Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: "main" or "master"
4. Folder: "/ (root)"
5. Click Save

Your page will be available at:
`https://yourusername.github.io/pest-control-profiles/`

---

## **Step 2: Modify HTML for Dynamic Data**

Create a version that can receive data from URL parameters:

```html
<!-- Add this to the <script> section of your HTML -->
<script>
// Get profile data from URL parameters or Wix
function getProfileData() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if data is passed from Wix
    if (urlParams.has('companyName')) {
        return {
            companyName: urlParams.get('companyName'),
            location: urlParams.get('location'),
            timezone: urlParams.get('timezone'),
            website: urlParams.get('website'),
            fieldRoutesLink: urlParams.get('fieldRoutesLink'),
            bulletin: urlParams.get('bulletin'),
            pestsNotCovered: urlParams.get('pestsNotCovered')
        };
    }
    
    // Fallback to sample data for testing
    return {
        companyName: "Sample Pest Control",
        location: "Dallas, TX",
        timezone: "Central",
        website: "https://example.com",
        fieldRoutesLink: "https://fieldroutes.com",
        bulletin: "Sample bulletin message",
        pestsNotCovered: "Wasps, Bees, Hornets"
    };
}

// Update the loadClientData function
function loadClientData() {
    clientData = getProfileData();
    populateClientData();
}
</script>
```

---

## **Step 3: Create Wix Integration Page**

### **3.1 Create Wix Page**
1. In Wix Editor, create a new page called "Client Profile"
2. Add these elements:
   - **HTML iframe**: ID = "profileFrame"
   - **Loading text**: ID = "loadingText"

### **3.2 Add Velo Code to Wix Page**
```javascript
import wixData from 'wix-data';
import wixWindow from 'wix-window';

$w.onReady(function () {
    loadProfileAndDisplay();
});

function loadProfileAndDisplay() {
    const profileSlug = wixWindow.url.path[0]; // Get slug from URL
    
    // Show loading
    $w('#loadingText').text = 'Loading profile...';
    $w('#profileFrame').hide();
    
    // Get profile data from Wix database
    wixData.query('Profiles')
        .eq('slug', profileSlug)
        .find()
        .then(results => {
            if (results.items.length > 0) {
                const profile = results.items[0];
                
                // Build URL with parameters for GitHub Pages
                const params = new URLSearchParams({
                    companyName: profile.companyName || '',
                    location: profile.location || '',
                    timezone: profile.timezone || '',
                    website: profile.website || '',
                    fieldRoutesLink: profile.fieldRoutesLink || '',
                    bulletin: profile.bulletin || '',
                    pestsNotCovered: profile.pestsNotCovered || ''
                });
                
                const githubUrl = `https://yourusername.github.io/pest-control-profiles/?${params.toString()}`;
                
                // Set iframe source
                $w('#profileFrame').src = githubUrl;
                $w('#profileFrame').show();
                $w('#loadingText').hide();
                
            } else {
                $w('#loadingText').text = 'Profile not found';
            }
        })
        .catch(error => {
            console.error('Error loading profile:', error);
            $w('#loadingText').text = 'Error loading profile';
        });
}
```

---

## **Step 4: Enhanced Version with Full Data**

For complete functionality, create an API endpoint to serve JSON data:

### **4.1 Create Data API File**
Create `profile-data.js` in your GitHub repository:

```javascript
// This would normally come from your Wix database
// For demo, using the URL to determine which profile to load

function getProfileData() {
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('profileId');
    
    // Sample data structure matching your form
    const sampleProfiles = {
        'addison-pest-control': {
            companyName: "Addison Pest Control",
            location: "Frisco, Texas", 
            timezone: "Central",
            officeInfo: {
                phone: "(972) 555-0123",
                email: "contact@addisonpest.com",
                website: "https://www.addisonpest.com",
                fieldRoutesLink: "https://addison.fieldroutes.com/",
                physicalAddress: "123 Main Street\nFrisco, TX 75034",
                officeHours: "Monday-Friday: 8:00 AM - 5:00 PM"
            },
            bulletin: "Davidson Pest Control has merged with Dynasty Pest Control.",
            pestsNotCovered: "Stinging Insects, Skunks, Grubs",
            services: [{
                name: "General Pest ADVANTAGE",
                description: "Comprehensive pest control service",
                firstPrice: "$150",
                recurringPrice: "$45",
                contract: "12 Months",
                guarantee: "Unlimited Reservices",
                duration: "35 Minutes",
                pests: "Roaches, Ants, Spiders, Scorpions, Silverfish"
            }]
        }
    };
    
    return sampleProfiles[profileId] || sampleProfiles['addison-pest-control'];
}

// Make available globally
window.getProfileData = getProfileData;
```

### **4.2 Update HTML to Use API**
```html
<script src="profile-data.js"></script>
<script>
function loadClientData() {
    // Get data from API instead of hardcoded
    clientData = window.getProfileData();
    populateClientData();
}
</script>
```

---

## **Step 5: Test the Integration**

### **5.1 Test GitHub Pages**
1. Visit your GitHub Pages URL
2. Add parameters: `?companyName=Test&location=Dallas&timezone=Central`
3. Verify the page updates with the parameters

### **5.2 Test Wix Integration**
1. Create a test profile in your Wix database
2. Visit your Wix page with the profile slug
3. Verify the iframe loads with correct data

### **5.3 Test Tools**
- Acreage converter
- Zip code lookup (may need to adjust for cross-domain)
- Time zone displays
- Navigation

---

## **Step 6: Production Setup**

### **6.1 Update Wix Database Integration**
Create a Wix API endpoint to serve profile data:

```javascript
// In Wix backend (backend/profiles.js)
import wixData from 'wix-data';

export function getProfileData(profileId) {
    return wixData.query('Profiles')
        .eq('profileId', profileId)
        .include(['services', 'technicians', 'policies', 'serviceAreas'])
        .find()
        .then(results => {
            if (results.items.length > 0) {
                const profile = results.items[0];
                
                // Format data for HTML page
                return {
                    companyName: profile.companyName,
                    location: profile.location,
                    timezone: profile.timezone,
                    // ... include all needed fields
                    services: profile.services,
                    technicians: profile.technicians
                };
            }
            return null;
        });
}
```

### **6.2 Update GitHub Pages to Fetch from Wix**
```javascript
// In your GitHub Pages HTML
async function loadClientData() {
    const profileId = new URLSearchParams(window.location.search).get('profileId');
    
    try {
        const response = await fetch(`https://yoursite.com/_functions/getProfile?id=${profileId}`);
        clientData = await response.json();
        populateClientData();
    } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to sample data
        loadSampleData();
    }
}
```

---

## **Advantages of This Approach**

✅ **Keep Your Exact Design**: No need to recreate in Wix editor
✅ **Fast Setup**: GitHub Pages is free and fast
✅ **Full Control**: Complete HTML/CSS/JS control
✅ **Wix Integration**: Still connects to your Wix database
✅ **Easy Updates**: Just update GitHub files
✅ **Professional URLs**: Clean routing through Wix

## **Limitations**

⚠️ **Cross-Domain**: Some features may need CORS setup
⚠️ **Mobile**: May need responsive adjustments for Wix mobile
⚠️ **SEO**: Content in iframe not crawled by search engines

---

## **Quick Start Commands**

1. **Upload to GitHub**:
   ```bash
   # Create repository, upload index.html, enable Pages
   ```

2. **Test with parameters**:
   ```
   https://yourusername.github.io/pest-control-profiles/?companyName=Test&location=Dallas
   ```

3. **Create Wix integration page** with iframe pointing to GitHub URL

4. **Add Velo code** to pass database data to iframe

**This gives you the full design with minimal Wix editor work!**

Would you like me to walk you through setting up the GitHub repository, or would you prefer a different approach?
