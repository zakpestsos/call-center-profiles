# Enhanced Pest Control Client Profile System - Google Sheets Editing Guide

## Overview

The enhanced system now provides **full editing capability through Google Sheets** while maintaining seamless Wix integration. Each client gets their own comprehensive Google Sheet that can be edited to update their Wix profile.

## 🎯 Key Features

### ✅ **Yes, information submitted in the HTML form is fully editable via Google Sheets!**

- Each client gets their own dedicated Google Sheet
- Changes made in Google Sheets sync back to Wix profiles
- Comprehensive service details with all pest control specifics
- Detailed technician management
- Service area tracking with zip codes
- Complete policy management

## 📊 Google Sheets Structure

When a client profile is created, you get a Google Sheet with 6 tabs:

### 1. **Basic Info Tab**
- Company Name, Location, Address
- Phone, Email, Website, Business Hours
- Company Bulletin, Pests Not Covered
- **Edit column B, changes sync to Wix**

### 2. **Services Tab** - Enhanced with Full Pest Control Details
Each service includes:
- **Service Name** (e.g., "General Pest Control")
- **Category** (Standard, Specialty, Termite, Inspection)
- **Type** (Recurring, One-time, Free Inspection, Paid Inspection, Refer to Office)
- **Description** (Detailed service description)
- **Pests Covered** (List of pests this service handles)
- **Frequency** (One-time, Bi-Monthly, Quarterly, Monthly, etc.)

#### Service Details (Not every service needs this):
- **Contract** (None, 1 Year, etc.)
- **Guarantee** (None, Unlimited Retreatments, etc.)
- **Call Ahead** (Yes/No)
- **Initial Duration** (e.g., "30 Minutes")
- **Recurring Duration** (e.g., "30 Minutes", "N/A")
- **Leave During Service** (Yes/No)
- **Follow Up** (No, "14 Days", "Every 10-14 Days")
- **Prep Sheet** (No, Yes, "Refer to Home Office")
- **Price** (e.g., "$150")
- **Onboarding Notes** (Special setup instructions)

#### Inspection Services - Special Language
The system automatically generates proper agent instructions:
- **Free Inspection**: "Set up and schedule Free Inspection"
- **Paid Inspection**: "Set up and Schedule Paid Inspection"

### 3. **Technicians Tab**
- Name, Role (Technician, Inspector, Both)
- Phone, Email
- Schedule (e.g., "Mon-Fri 8-5, Sat 8-12")
- Max Stops Per Day
- Zip Codes Served (comma-separated)
- Services NOT Provided (e.g., "Termite, Commercial Only, Mosquito/Tick")

### 4. **Service Areas Tab**
- City/Region, State
- Zip Codes (comma-separated list)
- Service Radius (miles)
- Additional Fees (e.g., "$25 trip fee", "None")

### 5. **Policies Tab** - Complete Wix CMS Configuration
This tab matches the exact structure of your Wix CMS Policies table with all fields that appear on both Technician and Policies pages:

#### Service Coverage
- **Do we treat vehicles?** (Yes/No/Limited options)
- **Commercial Properties** (Yes/No/Special conditions)
- **Multi-Family Offered** (Yes/No/Special conditions for apartments/condos)
- **Trailers/Mobile Homes** (Yes/No/Special conditions)

#### Scheduling & Operations
- **Signed Contract** (Yes/No/None)
- **Returning Customers** (Special policies for returning customers)
- **Appointment Confirmations** (Yes/No/Special instructions)
- **Call Ahead** (Yes/No/Special timing requirements)
- **Max Distance** (Maximum service distance)
- **Scheduling Policy Times** (Time window policies for different service types)
- **Same Day Services** (Same day service availability)
- **Tech Skilling** (Special technician requirements)
- **After Hours Emergency** (Emergency service availability)

#### Service Policies
- **Reservices** (Reservice policy and timing requirements)
- **Set Service Type To** (Default service type for callbacks)
- **Set Subscription Type To** (Default subscription handling)

#### Payment & Financial
- **Payment Plans** (Payment plan availability)
- **Payment Types** (Accepted payment methods)
- **Past Due Period** (Past due policy)
- **Tools To Save** (Customer retention tools)
- **Cancellation Policy** (Cancellation terms and fees)

#### Additional Information
- **Additional Notes** (Special instructions or notes)
- **Branch** (Branch/location identifier)

#### Legacy Policy Fields (for compatibility)
- **Guarantee Policy**, **Payment Terms**, **Emergency Services**, **Insurance Information**

### 6. **Sync Status Tab**
- Tracks when each section was last synced to Wix
- Contains Wix Profile ID and URL
- Shows sync history and status

## 🔄 Editing Workflow

### Step 1: Create Client Profile
1. Use the HTML form to create initial profile
2. System creates both Wix profile AND editable Google Sheet
3. You receive URLs for both

### Step 2: Edit in Google Sheets
1. Open the client's Google Sheet
2. Edit any information in the appropriate tabs
3. Add/remove services, technicians, service areas as needed
4. Update policies and company information

### Step 3: Sync Changes to Wix
1. Open Google Apps Script editor
2. Run: `syncUpdatesToWix("YOUR_SHEET_URL")`
3. Changes automatically update in Wix profile
4. Sync timestamps update in Sync Status tab

## 🛡️ Service Categories & Examples

### Standard Services
- General Pest Control (Quarterly, Bi-Monthly)
- Mosquito Control (March-November, Every 21 Days)
- Single Treatment (One-time)

### Specialty Services
- Stinging Insects (Hive kill only)
- Carpenter Ants
- Fire Ant Treatment
- Interior Ant Treatment
- Snake Assessment

### Termite Services
- Treatment: "Schedule Free Termite inspection"
- WDIR: "Schedule Free Termite Inspection"
- Bora Care Treatment: "Schedule Free Termite Inspection"
- Annual Warranty Inspection

### Inspection Services
- Free Inspections: "Set up and schedule Free Inspection"
- Paid Inspections: "Set up and Schedule Paid Inspection"

## 📋 Service Details Examples

### Example: General Pest Control (Quarterly)
```
Contract: None
Guarantee: Unlimited Reservices
Call Ahead: Yes
Initial Duration: 30 Minutes
Recurring Duration: 30 Minutes
Leave During Service: No
Follow up: No
Prep Sheet: No
```

### Example: Flea Treatment
```
Contract: None
Guarantee: None
Call Ahead: Yes
Initial Duration: 60 Minutes
Recurring Duration: N/A
Leave During Service: Yes
Follow up: No
Prep Sheet: Refer to Home Office
```

### Example: German Roach Treatment
```
Contract: None
Guarantee: None
Call Ahead: Yes
Initial Duration: 30 Minutes
Recurring Duration: 30 Minutes (Follow-ups)
Leave During Service: No
Follow up: Every 10-14 Days
Prep Sheet: Refer to Home Office
```

## 🎯 Services That Don't Need Full Details

Some services don't require all the service details:
- **Refer to Home Office**: Only needs basic info, no service details
- **Inspections**: Use special language instead of service details
- **Assessment Services**: Basic information sufficient

## 🏢 Master Client Tracking

The system also creates a master spreadsheet: `SOS_Master_Client_List`

### Features:
- **Client Directory**: Lists all clients with status
- **Quick Access**: Links to individual client sheets
- **Status Tracking**: Active, Pending, Inactive clients
- **Bulk Operations**: Manage multiple clients

## 🚀 Deployment Instructions

### Deploy as Web App:
1. Open Google Apps Script editor
2. Click "Deploy" > "New deployment"
3. Choose type: "Web app"
4. Description: "SOS Pest Control Enhanced Client Creator"
5. Execute as: "Me"
6. Who has access: "Anyone" (or as needed)
7. Click "Deploy"

### Test the System:
1. Run `testSystem()` in Google Apps Script
2. Check execution log for test results
3. Get deployment URL and test instructions

## 📞 Example: Complete Onboarding Sheet (Pinnacle Style)

```
Service Name: General Pest Control - Quarterly
Category: Standard
Type: Recurring Service
Description: This service provides year-round pest prevention with treatments every Quarter. The initial visit includes a complete interior and exterior treatment, flushing pests from inside the home and establishing a perimeter barrier. Eaves are swept and visible wasp nests and spiderwebs are removed. Ongoing quarterly visits focus on maintaining the exterior barrier, while interior treatments are available upon request.

Service Notes:
Contract: None
Guarantee: Unlimited Reservices
Call Ahead: Yes
Initial Duration: 30 Minutes
Recurring Duration: 30 Minutes
Leave During Service: No
Follow up: No
Prep Sheet: No

Pests Covered: Ants, Non German Cockroaches, Spiders, Silverfish, Earwigs, Crickets, Centipedes, Millipedes, Sowbugs, Scorpions
Frequency: Quarterly
```

## 🔧 Advanced Features

### Automatic Sync
- Changes in Google Sheets can trigger automatic Wix updates
- Sync status tracking prevents data conflicts
- Error handling for failed syncs

### Data Validation
- Required fields are validated
- Service categories are controlled
- Inspection language is enforced

### Backup & Recovery
- All data is preserved in Google Sheets
- Version history available in Google Sheets
- Easy recovery from accidental changes

## 💡 Best Practices

1. **Always use exact inspection language** as specified
2. **Keep service details consistent** across similar services
3. **Use master client list** for overview and management
4. **Sync regularly** to keep Wix profiles current
5. **Document special cases** in onboarding notes

This enhanced system gives you the flexibility of Google Sheets editing with the power of automated Wix profile creation and synchronization!
