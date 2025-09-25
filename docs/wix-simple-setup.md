# Simplified Wix Integration - GitHub Pages Bridge

## Overview
You're absolutely right! The Wix setup should be much simpler. Your architecture is:

```
Google Apps Script (Data) → GitHub Pages (Interface) → Wix (Professional URL)
```

## The ACTUAL Wix Setup (Simple!)

### What Wix Does:
- Provides professional URLs (`yourcompany.wixsite.com/profile/client-name`)
- Acts as a wrapper around your existing GitHub Pages interface
- No complex database setup needed!

### What You Keep Using:
- ✅ **Google Apps Script** - Your master database (already working)
- ✅ **GitHub Pages** - Your beautiful interface (already built)
- ✅ **Existing workflow** - Form → Sheets → Profile generation

---

## Simple Wix Setup (15 minutes)

### Step 1: Create One Wix Page
1. **Open Wix Editor**
2. **Add New Page** → Blank Template  
3. **Name**: "Client Profile"
4. **URL**: `/profile/[clientId]` (dynamic page)

### Step 2: Add One Element
1. **Add HTML Embed/iframe element**
2. **ID**: `#profileFrame`
3. **Size**: Full width, full height (100vw x 100vh)
4. **Remove margins/padding**

### Step 3: Add Simple Velo Code
```javascript
import wixLocation from 'wix-location';

$w.onReady(function () {
    console.log('=== SIMPLE PROFILE PAGE STARTING ===');
    
    // Get profile ID from URL
    const profileId = getProfileIdFromUrl();
    
    if (!profileId) {
        console.warn('No profile ID found');
        showError('No profile ID specified');
        return;
    }
    
    console.log('Loading profile ID:', profileId);
    loadGitHubProfile(profileId);
});

function getProfileIdFromUrl() {
    try {
        if (wixLocation && wixLocation.url) {
            console.log('Current URL:', wixLocation.url);
            
            // Look for /profile/[profileId] pattern
            const profileMatch = wixLocation.url.match(/\/profile\/([^\/\?#]+)/);
            if (profileMatch) {
                console.log('✅ Got profile ID:', profileMatch[1]);
                return profileMatch[1];
            }
        }
        return null;
    } catch (error) {
        console.error('Error getting profile ID:', error);
        return null;
    }
}

function loadGitHubProfile(profileId) {
    try {
        // Direct call to your GitHub Pages with profileId
        const githubUrl = `https://zakpestsos.github.io/call-center-profiles/?profileId=${encodeURIComponent(profileId)}`;
        
        console.log('✅ Loading GitHub URL:', githubUrl);
        
        // Show loading
        if ($w('#loadingText')) {
            $w('#loadingText').text = `Loading profile: ${profileId}...`;
            $w('#loadingText').show();
        }
        
        // Load in iframe
        if ($w('#profileFrame')) {
            $w('#profileFrame').src = githubUrl;
            $w('#profileFrame').show();
        }
        
        // Hide loading after a delay
        setTimeout(() => {
            if ($w('#loadingText')) $w('#loadingText').hide();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error loading GitHub:', error);
        showError('Error loading profile: ' + error.message);
    }
}

function showError(message) {
    console.error('Error:', message);
    if ($w('#profileFrame')) {
        $w('#profileFrame').html = `<div style="padding: 40px; text-align: center; font-family: Arial;"><h2>Profile Error</h2><p>${message}</p></div>`;
        $w('#profileFrame').show();
    }
    if ($w('#loadingText')) $w('#loadingText').hide();
}
```

### Step 4: Update Your GitHub Pages
Your existing `app.js` already has the `loadFromGoogleAppsScript(profileId)` function! Just make sure your GitHub Pages URL accepts the `profileId` parameter.

---

## How It Works

### URL Flow:
```
1. Agent visits: yourcompany.wixsite.com/profile/ACME001
                              ↓
2. Wix extracts: clientId = "ACME001"  
                              ↓
3. Wix loads: github.io/wix-integration/?profileId=ACME001
                              ↓
4. GitHub calls: Your Google Apps Script with profileId
                              ↓
5. Displays: Your beautiful existing interface!
```

### What Each System Does:
- **Wix**: Professional URL + iframe wrapper
- **GitHub**: Your existing beautiful interface (no changes needed!)  
- **Google Apps Script**: Your existing data system (no changes needed!)

---

## Benefits of This Approach

✅ **Keeps your existing work** - Nothing you built is wasted
✅ **Professional URLs** - `yourcompany.wixsite.com/profile/client-name`  
✅ **No data duplication** - One source of truth (Google Sheets)
✅ **Easy maintenance** - Update GitHub, automatically updates in Wix
✅ **Fast setup** - 15 minutes instead of hours

---

## Testing Your Setup

1. **Deploy your existing GitHub Pages** (if not already deployed)
2. **Create the simple Wix page** (3 elements total)
3. **Test URL**: `yoursite.wixsite.com/profile/TEST001`
4. **Should load**: Your existing GitHub interface with TEST001 data

---

## Optional Enhancements

### Custom Domain (Professional)
- Connect custom domain to Wix: `profiles.yourcompany.com/profile/client-name`

### Loading States
```javascript
$w.onReady(function () {
    $w('#profileFrame').onMessage((event) => {
        if (event.data === 'loaded') {
            // Hide loading spinner
        }
    });
});
```

### Branded Wrapper
- Add your company logo above iframe
- Add navigation breadcrumbs
- Add print/share buttons

---

## Why This Is Better

### Original Complex Plan:
- Create 5 Wix collections ❌
- Duplicate all your Google Sheets data ❌  
- Rebuild your interface in Wix ❌
- Maintain two systems ❌

### Simplified Approach:
- One Wix page with iframe ✅
- Use your existing GitHub interface ✅
- Keep Google Apps Script as single source ✅
- Professional Wix URLs ✅

---

## Next Steps

1. **Test your GitHub Pages** with profileId parameter
2. **Create simple Wix iframe page** (15 minutes)
3. **Update GitHub Pages URL** in Wix code
4. **Test end-to-end flow**
5. **Add custom domain** if desired

This approach respects all the work you've already done while giving you the professional Wix URLs and hosting you want!
