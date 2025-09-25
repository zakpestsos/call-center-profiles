# 🔍 Consolidated CSV Data Verification Guide

## ✅ **Quick Verification Steps**

### **Step 1: Verify CSV Structure**
Open `consolidated-profiles.csv` and check:

1. **Headers Match Expected:**
   ```
   profileId,companyName,slug,location,timezone,officePhone,customerContactEmail,website,fieldRoutesLink,physicalAddress,officeHours,bulletin,pestsNotCovered,services,technicians,policies,serviceAreas,status
   ```

2. **5 Complete Profiles:**
   - ACME Pest Control (prof_001)
   - Spire Pest Solutions (prof_002)
   - Guardian Pest Management (prof_003)
   - Coastal Pest Control (prof_004)
   - Hill Country Exterminators (prof_005)

3. **JSON Fields Properly Formatted:**
   - Services: Array with name, description, pricing, variants
   - Technicians: Array with contact info and specializations
   - Policies: Array with type, title, options, defaults
   - Service Areas: Array with ZIP codes and territories

### **Step 2: Test JSON Parsing**
Use this JavaScript to test JSON fields:

```javascript
// Test services JSON parsing
const servicesJson = `[{"name":"General Pest Control","description":"Comprehensive pest control service..."}]`;
try {
    const services = JSON.parse(servicesJson);
    console.log('Services parsed successfully:', services.length, 'services');
} catch (e) {
    console.error('Services JSON error:', e);
}

// Test technicians JSON parsing
const technicianJson = `[{"name":"Mike Johnson","phone":"(555) 123-4571"...}]`;
try {
    const technicians = JSON.parse(technicianJson);
    console.log('Technicians parsed successfully:', technicians.length, 'technicians');
} catch (e) {
    console.error('Technicians JSON error:', e);
}
```

### **Step 3: Verify Wix Import**
After importing to Wix CMS:

1. **Check Record Count:**
   - Should see exactly 5 profile records
   - All records should have "active" status

2. **Verify JSON Fields:**
   - Click on ACME Pest Control record
   - Check "services" field shows JSON array
   - Verify all other JSON fields have data

3. **Test Slug Generation:**
   - ACME should have slug: "acme-pest-control"
   - Spire should have slug: "spire-pest-solutions"
   - All slugs should be lowercase with hyphens

### **Step 4: Test GitHub Pages Interface**
Visit your GitHub Pages URL with test parameters:

```
https://YOUR-USERNAME.github.io/call-center-profiles/?companyName=ACME%20Pest%20Control&services=[{"name":"Test%20Service","firstPrice":"$100"}]&technicians=[{"name":"Test%20Tech","phone":"555-0000"}]
```

Expected results:
- ✅ Company name shows "ACME Pest Control"
- ✅ Services section shows test service
- ✅ Technicians section shows test technician
- ✅ All navigation buttons work

### **Step 5: Test Full Integration**
Test each profile URL:

1. **ACME Pest Control:**
   ```
   yoursite.com/profile/acme-pest-control
   ```
   Should show:
   - 4 services (including General Pest with quarterly variant)
   - 3 technicians (Mike, Sarah, Carlos)
   - 4 policies (cancellation, guarantee, payment, liability)
   - 6 service areas (Dallas area ZIP codes)

2. **Spire Pest Solutions:**
   ```
   yoursite.com/profile/spire-pest-solutions
   ```
   Should show:
   - 3 services (including eco-friendly options)
   - 3 technicians (Jennifer, David, Maria)
   - 3 policies (environmental, cancellation, guarantee)
   - 5 service areas (Austin area ZIP codes)

## 🚨 **Common Issues & Solutions**

### **Issue: JSON Parse Errors**
**Symptoms:** JavaScript console shows "Unexpected token" errors
**Solution:** 
- Check CSV for unescaped quotes in JSON fields
- Verify JSON arrays are properly formatted
- Use online JSON validator to test individual fields

### **Issue: Empty Sections in Interface**
**Symptoms:** Services/Technicians show "No data available"
**Solution:**
- Verify Wix CMS imported JSON fields correctly
- Check browser console for URL parameter errors
- Test direct JSON parsing in browser console

### **Issue: Profile Not Found**
**Symptoms:** Wix page shows "Profile not found" error
**Solution:**
- Verify slug field exists and matches URL pattern
- Check collection permissions are set to "Admin"
- Ensure profile status is "active"

### **Issue: Variant Services Not Showing**
**Symptoms:** Service variants missing from services section
**Solution:**
- Check services JSON includes "variants" array
- Verify HTML template handles variants correctly
- Test with simplified service data first

## ✅ **Verification Checklist**

### **CSV File:**
- [ ] All 5 company profiles present
- [ ] All JSON fields properly formatted
- [ ] No unescaped quotes or invalid characters
- [ ] Slugs match expected pattern

### **Wix CMS:**
- [ ] 5 records imported successfully
- [ ] JSON fields display as readable text
- [ ] Slug field correctly populated
- [ ] All profiles have "active" status

### **GitHub Pages:**
- [ ] Interface loads with sample data
- [ ] All 6 navigation sections work
- [ ] JSON parameter parsing works
- [ ] No JavaScript console errors

### **Full Integration:**
- [ ] All 5 profile URLs accessible
- [ ] Complete data displays in all sections
- [ ] Service variants show correctly
- [ ] ZIP code lookup works with sample data

## 🎯 **Success Indicators**

When everything is working correctly, you should see:

1. **Rich Service Data:** Services with pricing, variants, and full details
2. **Complete Technician Profiles:** Contact info, specializations, territories
3. **Detailed Policies:** Options, defaults, and descriptions
4. **Organized Service Areas:** ZIP codes grouped by branch
5. **Smooth Navigation:** All sections load instantly
6. **Professional Appearance:** Dark theme with cyberpunk styling

**If all verification steps pass, your consolidated system is ready for production!**
