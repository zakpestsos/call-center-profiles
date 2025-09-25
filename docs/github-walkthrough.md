# GitHub Pages Setup - Step by Step Walkthrough

## 🚀 **Complete GitHub Pages Setup Guide**

This will take about 10-15 minutes and give you a live website with your exact design.

---

## **Step 1: Create GitHub Account (2 minutes)**

### **1.1 Sign Up**
1. Go to [github.com](https://github.com)
2. Click **"Sign up"** (top right)
3. Enter:
   - Username: `your-company-name` (e.g., `psos-profiles`)
   - Email: Your email address
   - Password: Strong password
4. Verify your account via email

### **1.2 Choose Free Plan**
- Select **"Free"** plan (perfect for our needs)
- Skip the survey questions if you want

---

## **Step 2: Create Repository (3 minutes)**

### **2.1 Create New Repository**
1. Click the **green "New"** button (or go to github.com/new)
2. Repository name: `call-center-profiles` 
3. Description: `Client profiles for call center agents`
4. Make sure it's **Public** (required for free GitHub Pages)
5. ✅ Check **"Add a README file"**
6. Click **"Create repository"**

### **2.2 Upload Your HTML File**
1. In your new repository, click **"Add file"** → **"Upload files"**
2. Drag and drop your `wix-profile-page.html` file
3. **IMPORTANT**: Rename it to `index.html` in the text box
4. Scroll down to "Commit changes"
5. Add commit message: `Add call center profile page`
6. Click **"Commit changes"**

---

## **Step 3: Enable GitHub Pages (2 minutes)**

### **3.1 Enable Pages**
1. Click **"Settings"** tab (top of repository)
2. Scroll down to **"Pages"** in left sidebar
3. Under "Source": Select **"Deploy from a branch"**
4. Branch: Select **"main"** (or "master")
5. Folder: Select **"/ (root)"**
6. Click **"Save"**

### **3.2 Get Your URL**
- After saving, you'll see: `Your site is published at https://username.github.io/call-center-profiles/`
- **Copy this URL** - this is your live website!
- It may take 2-3 minutes to go live

---

## **Step 4: Test Your Live Site (2 minutes)**

### **4.1 Visit Your Site**
1. Open the GitHub Pages URL in a new tab
2. You should see your call center interface!
3. Test the tools:
   - Acreage converter
   - Zip code lookup  
   - Time zones
   - Navigation

### **4.2 Test with Parameters**
Try adding data via URL parameters:
```
https://username.github.io/call-center-profiles/?companyName=Test%20Company&location=Dallas&timezone=Central
```

---

## **Step 5: Modify HTML for Dynamic Data (5 minutes)**

Now let's make your HTML work with real Wix data:

### **5.1 Edit Your HTML File**
1. In GitHub, click on `index.html`
2. Click the **pencil icon** (✏️) to edit
3. Find the `loadClientData` function (around line 750)
4. Replace it with this code:

```javascript
// Load client data from URL parameters or default
function loadClientData() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if data is passed from Wix via URL parameters
    if (urlParams.has('companyName')) {
        clientData = {
            companyName: urlParams.get('companyName') || 'Unknown Company',
            location: urlParams.get('location') || 'Unknown Location',
            timezone: urlParams.get('timezone') || 'Unknown',
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
        
        // Parse services if provided
        const servicesParam = urlParams.get('services');
        if (servicesParam) {
            try {
                clientData.services = JSON.parse(decodeURIComponent(servicesParam));
            } catch (e) {
                console.error('Error parsing services:', e);
                clientData.services = [];
            }
        }
        
    } else {
        // Default sample data for testing
        clientData = {
            companyName: "Sample Pest Control",
            location: "Dallas, Texas",
            timezone: "Central",
            officeInfo: {
                phone: "(555) 123-4567",
                email: "contact@sample.com",
                website: "https://sample.com",
                fieldRoutesLink: "https://fieldroutes.com",
                physicalAddress: "123 Main St\nDallas, TX 75001",
                officeHours: "Monday-Friday: 8 AM - 5 PM"
            },
            bulletin: "This is a sample bulletin message for testing.",
            pestsNotCovered: "Wasps, Bees, Hornets (sample)",
            services: [
                {
                    name: "Sample General Pest Control",
                    description: "Sample service description",
                    firstPrice: "$150",
                    recurringPrice: "$45",
                    contract: "12 Months",
                    guarantee: "Satisfaction Guaranteed",
                    duration: "30 Minutes",
                    pests: "Ants, Roaches, Spiders"
                }
            ]
        };
    }
    
    populateClientData();
}
```

### **5.2 Commit Your Changes**
1. Scroll down to "Commit changes"
2. Add message: `Add dynamic data loading from URL parameters`
3. Click **"Commit changes"**
4. Wait 1-2 minutes for GitHub Pages to update

---

## **Step 6: Test Dynamic Data (3 minutes)**

### **6.1 Test with Sample Data**
Visit your URL with parameters:
```
https://username.github.io/call-center-profiles/?companyName=ACME%20Pest%20Control&location=Dallas%2C%20TX&timezone=Central&bulletin=Welcome%20to%20ACME!&pestsNotCovered=Wasps%2C%20Bees
```

### **6.2 Verify Display**
Check that:
- ✅ Company name updates
- ✅ Location/timezone shows  
- ✅ Bulletin appears
- ✅ Pests not covered shows
- ✅ Tools still work

---

## **Step 7: Create Wix Integration (Optional)**

If you want to integrate with Wix now:

### **7.1 Create Simple Wix Page**
1. In Wix Editor, create new page: "Client Profile"
2. Add an **HTML iframe** element
3. Set iframe ID: `profileFrame`
4. Set iframe source to your GitHub Pages URL

### **7.2 Add Basic Velo Code**
```javascript
$w.onReady(function () {
    // Sample: Load with test data
    const testUrl = 'https://username.github.io/call-center-profiles/?companyName=Test%20Company&location=Dallas';
    $w('#profileFrame').src = testUrl;
});
```

---

## **Your Live URLs**

After setup, you'll have:

### **Main Profile Page:**
```
https://username.github.io/call-center-profiles/
```

### **With Sample Data:**
```
https://username.github.io/call-center-profiles/?companyName=ACME%20Pest&location=Dallas&timezone=Central
```

### **Full Data Example:**
```
https://username.github.io/call-center-profiles/?companyName=Dynasty%20Pest%20Control&location=Frisco%2C%20TX&timezone=Central&phone=(972)555-0123&website=https://dynasty.com&bulletin=Welcome%20Davidson%20customers!&pestsNotCovered=Wasps%2C%20Hornets%2C%20Skunks
```

---

## **Next Steps**

### **Immediate (Working Solution):**
1. ✅ Your profile page is live on GitHub Pages
2. ✅ You can pass data via URL parameters
3. ✅ All your tools work (converter, zip lookup, etc.)

### **Future Integration:**
1. **Connect to Wix Database**: Modify to pull data from your Wix collections
2. **Add User Authentication**: If needed for security
3. **Custom Domain**: Point your own domain to GitHub Pages

---

## **Troubleshooting**

### **Common Issues:**

**"Page not found"**
- Make sure file is named `index.html` (not `wix-profile-page.html`)
- Wait 2-3 minutes for GitHub Pages to deploy
- Check repository is **Public**

**"Styling looks wrong"**
- GitHub Pages sometimes takes time to load CSS
- Hard refresh the page (Ctrl+F5)

**"Parameters not working"**
- Make sure URL parameters are URL-encoded
- Spaces become `%20`, commas become `%2C`

**"Tools not working"**
- Check browser console for JavaScript errors
- Make sure all IDs in HTML match the JavaScript

---

## **What You've Accomplished**

🎉 **You now have:**
- ✅ Professional call center interface hosted on GitHub
- ✅ Your exact design with all functionality
- ✅ Dynamic data loading via URL parameters
- ✅ Free hosting with fast global CDN
- ✅ Easy updates (just edit files in GitHub)
- ✅ Ready for Wix integration

**Time invested:** ~15 minutes  
**Monthly cost:** $0  
**Result:** Production-ready call center interface

---

**Need help with any step?** Let me know where you get stuck and I'll walk you through it! 

**Ready for Wix integration?** I can show you how to connect this to your Wix database next.
