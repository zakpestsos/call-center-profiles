# GitHub Pages + Wix Integration - Data Connection Guide

## 🔌 **How the Connection Works**

The dynamic setup creates a bridge between your Wix database and the GitHub Pages interface:

```
Wix Database → Wix Page → GitHub Pages (Your Design)
     ↓              ↓              ↓
Profile Data → URL Parameters → Live Interface
```

---

## **Method 1: URL Parameter Connection (Recommended)**

### **How It Works:**
1. **Wix page** loads profile data from database
2. **Wix page** builds URL with data as parameters  
3. **GitHub Pages** receives data and displays it

### **Data Flow Example:**
```
Wix URL: yoursite.com/profile/acme-pest-control
    ↓
Wix loads: Company="ACME Pest Control", Location="Dallas"
    ↓
Wix creates: github.io/profiles/?company=ACME&location=Dallas
    ↓
GitHub Pages displays: ACME Pest Control in Dallas
```

---

## **Step-by-Step Integration Setup**

### **Step 1: Create Wix Integration Page**

In your Wix Editor:

1. **Create New Page**
   - Type: Dynamic Page
   - Connect to: Profiles collection
   - URL: `/profile/{slug}`
   - Name: "Client Profile"

2. **Add Elements:**
   ```
   📦 Container: ID = "profileContainer"
   ├── 📄 HTML iframe: ID = "profileFrame"
   ├── 📝 Loading text: ID = "loadingText" 
   └── 📝 Error text: ID = "errorText" (hidden)
   ```

3. **Style the Elements:**
   - iframe: Width 100%, Height 100vh
   - Loading text: Center aligned
   - Hide error text initially

### **Step 2: Add Wix Velo Code**

```javascript
import wixData from 'wix-data';
import wixWindow from 'wix-window';

$w.onReady(function () {
    loadProfileAndDisplay();
});

function loadProfileAndDisplay() {
    // Get company slug from URL
    const profileSlug = wixWindow.url.path[0];
    
    if (!profileSlug) {
        showError('No profile specified');
        return;
    }
    
    // Show loading
    $w('#loadingText').text = 'Loading profile...';
    $w('#loadingText').show();
    $w('#profileFrame').hide();
    $w('#errorText').hide();
    
    // Get profile data from Wix database
    wixData.query('Profiles')
        .eq('slug', profileSlug)
        .find()
        .then(results => {
            if (results.items.length > 0) {
                const profile = results.items[0];
                loadServicesAndDisplay(profile);
            } else {
                showError('Profile not found');
            }
        })
        .catch(error => {
            console.error('Error loading profile:', error);
            showError('Error loading profile');
        });
}

function loadServicesAndDisplay(profile) {
    // Load associated services data
    wixData.query('Services')
        .eq('profileId', profile._id)
        .find()
        .then(services => {
            // Build GitHub Pages URL with all data
            const githubUrl = buildGitHubUrl(profile, services.items);
            
            // Display in iframe
            $w('#profileFrame').src = githubUrl;
            $w('#profileFrame').show();
            $w('#loadingText').hide();
        })
        .catch(error => {
            console.error('Error loading services:', error);
            // Show profile without services if services fail
            const githubUrl = buildGitHubUrl(profile, []);
            $w('#profileFrame').src = githubUrl;
            $w('#profileFrame').show();
            $w('#loadingText').hide();
        });
}

function buildGitHubUrl(profile, services) {
    // Your GitHub Pages URL
    const baseUrl = 'https://YOUR-USERNAME.github.io/call-center-profiles/';
    
    // Build URL parameters with profile data
    const params = new URLSearchParams();
    
    // Basic profile info
    params.append('companyName', profile.companyName || '');
    params.append('location', profile.location || '');
    params.append('timezone', profile.timezone || '');
    params.append('phone', profile.officePhone || '');
    params.append('email', profile.customerContactEmail || '');
    params.append('website', profile.website || '');
    params.append('fieldRoutesLink', profile.fieldRoutesLink || '');
    params.append('address', profile.physicalAddress || '');
    params.append('hours', profile.officeHours || '');
    params.append('bulletin', profile.bulletin || '');
    params.append('pestsNotCovered', profile.pestsNotCovered || '');
    
    // Services data (as JSON)
    if (services && services.length > 0) {
        const servicesData = services.map(service => ({
            name: service.serviceName,
            description: service.serviceDescription,
            firstPrice: service.firstPrice,
            recurringPrice: service.recurringPrice,
            contract: service.contractLength,
            guarantee: service.guarantee,
            duration: service.serviceDuration,
            pests: service.pestsCovered
        }));
        params.append('services', JSON.stringify(servicesData));
    }
    
    return `${baseUrl}?${params.toString()}`;
}

function showError(message) {
    $w('#errorText').text = message;
    $w('#errorText').show();
    $w('#loadingText').hide();
    $w('#profileFrame').hide();
}
```

### **Step 3: Update GitHub Pages HTML**

The HTML file you uploaded needs this updated `loadClientData` function:

```javascript
function loadClientData() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if data is passed from Wix
    if (urlParams.has('companyName')) {
        clientData = {
            companyName: urlParams.get('companyName') || 'Unknown Company',
            location: urlParams.get('location') || '',
            timezone: urlParams.get('timezone') || '',
            officeInfo: {
                phone: urlParams.get('phone') || '',
                email: urlParams.get('email') || '',
                website: urlParams.get('website') || '',
                fieldRoutesLink: urlParams.get('fieldRoutesLink') || '',
                physicalAddress: urlParams.get('address') || '',
                officeHours: urlParams.get('hours') || ''
            },
            bulletin: urlParams.get('bulletin') || '',
            pestsNotCovered: urlParams.get('pestsNotCovered') || '',
            services: []
        };
        
        // Parse services JSON if provided
        const servicesParam = urlParams.get('services');
        if (servicesParam) {
            try {
                clientData.services = JSON.parse(decodeURIComponent(servicesParam));
            } catch (e) {
                console.error('Error parsing services:', e);
                clientData.services = [{
                    name: 'Service data error',
                    description: 'Unable to load service information',
                    firstPrice: 'N/A',
                    recurringPrice: 'N/A',
                    contract: 'N/A',
                    guarantee: 'N/A',
                    duration: 'N/A',
                    pests: 'N/A'
                }];
            }
        }
    } else {
        // Fallback sample data for testing
        clientData = {
            companyName: "Sample Pest Control (No Wix Data)",
            location: "Test Location",
            timezone: "Central",
            officeInfo: {
                phone: "(555) 123-4567",
                email: "test@example.com",
                website: "https://example.com",
                fieldRoutesLink: "https://fieldroutes.com",
                physicalAddress: "123 Test Street\nTest City, TX 12345",
                officeHours: "Monday-Friday: 8 AM - 5 PM"
            },
            bulletin: "This is test data - no Wix connection detected",
            pestsNotCovered: "Test pests (sample data)",
            services: [{
                name: "Sample Service",
                description: "This is sample data for testing",
                firstPrice: "$150",
                recurringPrice: "$45",
                contract: "12 Months",
                guarantee: "Test Guarantee",
                duration: "30 Minutes",
                pests: "Test Pests"
            }]
        };
    }
    
    populateClientData();
}
```

---

## **Method 2: Direct API Connection (Advanced)**

For real-time data without URL parameters:

### **Option A: Wix HTTP Functions**

Create a Wix backend API:

```javascript
// backend/http-functions.js
import { ok, badRequest } from 'wix-http-functions';
import wixData from 'wix-data';

export function get_profile(request) {
    const profileId = request.query.id;
    
    if (!profileId) {
        return badRequest({ error: 'Profile ID required' });
    }
    
    return wixData.query('Profiles')
        .eq('profileId', profileId)
        .include(['services', 'technicians', 'policies'])
        .find()
        .then(results => {
            if (results.items.length > 0) {
                return ok({ 
                    headers: { 'Content-Type': 'application/json' },
                    body: results.items[0]
                });
            } else {
                return badRequest({ error: 'Profile not found' });
            }
        });
}
```

### **Option B: GitHub Pages Fetch**

Update your HTML to fetch directly:

```javascript
async function loadClientData() {
    const profileId = new URLSearchParams(window.location.search).get('profileId');
    
    if (profileId) {
        try {
            const response = await fetch(`https://yoursite.com/_functions/profile?id=${profileId}`);
            const profile = await response.json();
            
            clientData = {
                companyName: profile.companyName,
                location: profile.location,
                // ... map all fields
                services: profile.services || []
            };
        } catch (error) {
            console.error('Error fetching profile:', error);
            loadSampleData();
        }
    } else {
        loadSampleData();
    }
    
    populateClientData();
}
```

---

## **Testing the Connection**

### **Step 1: Test URL Parameters**
Visit your GitHub Pages directly with test data:
```
https://your-username.github.io/call-center-profiles/?companyName=Test%20Company&location=Dallas&bulletin=Test%20Message
```

### **Step 2: Test Wix Integration**
1. Create test profile in Wix database
2. Visit: `yoursite.com/profile/test-company`
3. Should load GitHub Pages with real data

### **Step 3: Debug Issues**
Check browser console for:
- URL parameter parsing errors
- JSON parsing errors
- Missing data fields

---

## **Complete Setup Checklist**

- [ ] **GitHub Pages**: HTML file uploaded and live
- [ ] **Wix Collections**: All collections created with data
- [ ] **Wix Page**: Dynamic page with iframe element
- [ ] **Velo Code**: Integration code added to Wix page
- [ ] **URL Building**: GitHub URL correctly references your username
- [ ] **Data Mapping**: All fields mapped between Wix and HTML
- [ ] **Testing**: Both direct and integrated access work

---

## **URL Examples**

### **Your Setup URLs:**

**Wix Profile Page:**
```
https://yoursite.com/profile/acme-pest-control
```

**Generated GitHub URL:**
```
https://your-username.github.io/call-center-profiles/?companyName=ACME%20Pest%20Control&location=Dallas%2C%20TX&timezone=Central&bulletin=Welcome%20message&services=%5B%7B%22name%22%3A%22General%20Pest%22%7D%5D
```

---

**The connection will work as long as:**
1. ✅ Your GitHub Pages site is live
2. ✅ Your Wix page has the integration code
3. ✅ The GitHub URL in Velo code matches your actual GitHub username
4. ✅ Your Wix collections have data

**Need help setting up any specific part?** I can walk you through the Wix page creation or help debug the data connection!
