# Wix Implementation Guide - Converting HTML to Wix Elements

## 🎯 **Simplified Wix Setup Process**

Since you can't upload HTML directly to Wix, I'll show you exactly how to recreate this design using Wix's drag-and-drop editor, then connect it with Velo code.

---

## **Method 1: Quick Setup with Wix Editor**

### **Step 1: Create Your Page Structure**

1. **Create New Dynamic Page**
   - Go to Wix Editor → Pages → Add Page → Dynamic Page
   - Connect to "Profiles" collection
   - Set URL: `/profile/{slug}`

2. **Add Header Section**
   ```
   📦 Container (Header)
   ├── 📝 Text Element: ID = "companyName"
   ├── 📝 Text Element: ID = "locationTimezone"  
   ├── 🔗 Button: ID = "websiteLink" (Link to external)
   ├── 🔗 Button: ID = "fieldRoutesLink" (Link to external)
   └── 🔘 Button: ID = "officeInfoBtn" (Opens lightbox)
   ```

3. **Add Main Layout (3-Column)**
   ```
   📦 Container (Main Layout)
   ├── 📦 Left Sidebar (Navigation)
   │   ├── 🔘 Button: ID = "servicesNavLink"
   │   ├── 🔘 Button: ID = "techniciansNavLink"
   │   ├── 🔘 Button: ID = "policiesNavLink"
   │   └── 🔘 Button: ID = "areasNavLink"
   │
   ├── 📦 Center Content
   │   ├── 📝 Text: ID = "bulletinContent" (Hidden initially)
   │   ├── 📝 Text: ID = "pestsNotCoveredContent" (Hidden initially)
   │   ├── 🔄 Repeater: ID = "servicesRepeater"
   │   ├── 🔄 Repeater: ID = "techniciansRepeater" (Hidden)
   │   └── 🔄 Repeater: ID = "policiesRepeater" (Hidden)
   │
   └── 📦 Right Sidebar (Tools)
       ├── 📝 Input: ID = "acresInput"
       ├── 🔘 Button: ID = "convertBtn"
       ├── 📝 Text: ID = "conversionResult"
       ├── 📝 Input: ID = "zipInput"
       ├── 🔘 Button: ID = "searchZipBtn"
       ├── 📝 Text: ID = "zipResult"
       └── ⏰ Text Elements for time zones
   ```

### **Step 2: Style with Dark Theme**
Apply these styles to match the cyberpunk design:

**Colors:**
- Background: `#0f172a` (Dark slate)
- Cards: `#1e293b` (Medium slate)
- Borders: `#334155` (Light slate)
- Accent: `#3b82f6` (Blue)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)

**Fonts:**
- Headers: Orbitron (if available) or Arial Bold
- Body: Inter or Arial
- Tech text: Rajdhani or Monaco

### **Step 3: Add Velo Code**
Copy the simplified Velo code I'll provide below.

---

## **Method 2: Use Wix App Market (Faster)**

### **Option A: Custom HTML Widget**
1. Go to Wix App Market
2. Search for "HTML Widget" or "Custom Code"
3. Install a custom HTML app
4. Paste the HTML/CSS (may have limitations)

### **Option B: Third-Party Embed**
1. Host the HTML file on GitHub Pages or Netlify (free)
2. Use Wix's iframe/embed element to display it
3. Set the iframe source to your hosted HTML

---

## **Recommended Approach: Simplified Wix Build**

Let me create a **step-by-step Wix editor guide** that recreates the key functionality without complex HTML:

### **Phase 1: Essential Elements Only**

Create just these core elements first:

```
1. Company Name (Text, bind to database)
2. Location/Timezone (Text, bind to database)
3. Navigation Buttons (5 buttons for sections)
4. Services Repeater (connected to Services collection)
5. Acreage Converter (Input + Button + Result Text)
6. Zip Lookup (Input + Button + Result Text)
7. Time Display (4 text elements)
```

### **Phase 2: Add Styling**
- Dark background colors
- Card-style containers
- Hover effects on buttons
- Responsive layout

### **Phase 3: Add Velo Code**
- Navigation functionality
- Tool calculations
- Database connections
- Time updates

---

## **Simplified Velo Code for Wix**

Here's the essential Velo code you'll need:

```javascript
import wixData from 'wix-data';

$w.onReady(function () {
    loadClientProfile();
    setupNavigation();
    setupTimeUpdates();
    setupTools();
});

// Load profile data
function loadClientProfile() {
    const slug = wixWindow.url.path[0]; // Get from URL
    
    wixData.query('Profiles')
        .eq('slug', slug)
        .find()
        .then(results => {
            if (results.items.length > 0) {
                const profile = results.items[0];
                
                // Update page elements
                $w('#companyName').text = profile.companyName;
                $w('#locationTimezone').text = `${profile.location} • ${profile.timezone}`;
                
                // Load services
                loadServices(profile._id);
            }
        });
}

// Load services data
function loadServices(profileId) {
    wixData.query('Services')
        .eq('profileId', profileId)
        .find()
        .then(results => {
            $w('#servicesRepeater').data = results.items;
        });
}

// Setup navigation
function setupNavigation() {
    $w('#servicesNavLink').onClick(() => showSection('services'));
    $w('#techniciansNavLink').onClick(() => showSection('technicians'));
    $w('#policiesNavLink').onClick(() => showSection('policies'));
}

function showSection(section) {
    // Hide all sections
    $w('#servicesRepeater').hide();
    $w('#techniciansRepeater').hide();
    $w('#policiesRepeater').hide();
    
    // Show target section
    $w(`#${section}Repeater`).show();
}

// Setup tools
function setupTools() {
    $w('#convertBtn').onClick(() => {
        const acres = parseFloat($w('#acresInput').value);
        const sqft = acres * 43560;
        $w('#conversionResult').text = `${sqft.toLocaleString()} sq ft`;
    });
    
    $w('#searchZipBtn').onClick(() => {
        const zip = $w('#zipInput').value;
        // Query your zip database
        wixData.query('SpireZips')
            .eq('title', zip)
            .find()
            .then(results => {
                if (results.items.length > 0) {
                    $w('#zipResult').text = `In service area: ${results.items[0].branch}`;
                } else {
                    $w('#zipResult').text = 'Not in service area';
                }
            });
    });
}

// Time updates
function setupTimeUpdates() {
    setInterval(() => {
        const now = new Date();
        // Update time zone displays
        $w('#pacificTime').text = getTimeInZone(now, -8);
        $w('#centralTime').text = getTimeInZone(now, -6);
        $w('#easternTime').text = getTimeInZone(now, -5);
    }, 1000);
}

function getTimeInZone(date, offset) {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (offset * 3600000));
    return targetTime.toLocaleTimeString();
}
```

---

## **Quick Start Instructions**

### **For Immediate Setup:**

1. **Create the collections** (use my previous collection setup guide)

2. **Build basic page in Wix Editor:**
   - Add text elements for company info
   - Add 1 repeater for services
   - Add inputs/buttons for tools
   - Set all the IDs I specified

3. **Add minimal Velo code** (the simplified version above)

4. **Test with your data** from Google Apps Script

### **Styling Tips:**
- Use Wix's built-in dark themes as starting point
- Apply custom CSS in Velo if needed
- Focus on functionality first, polish later

### **Progressive Enhancement:**
- Start with basic functionality
- Add styling and animations later
- Expand sections as needed

---

## **Alternative: Host Externally**

If you want to use the full HTML design:

1. **Host on GitHub Pages** (free):
   - Create GitHub repository
   - Upload your HTML file
   - Enable GitHub Pages
   - Get URL: `https://yourusername.github.io/repo-name/`

2. **Embed in Wix**:
   - Add HTML iframe element to Wix page
   - Set source to your GitHub Pages URL
   - Full design preserved, but loses some Wix integration

3. **Hybrid Approach**:
   - Use external HTML for complex layouts
   - Use Wix pages for simple admin functions
   - Link between them as needed

---

**Which approach would you prefer?** I can help you with:
1. Step-by-step Wix editor recreation
2. Simplified Velo-only version
3. External hosting + Wix embedding
4. Hybrid solution

Let me know which direction you'd like to go and I'll create the specific implementation guide!
