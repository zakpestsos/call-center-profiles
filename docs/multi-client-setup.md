# Multi-Client System Setup Instructions

## Overview
Your Google Apps Script project now includes a comprehensive multi-client management system that allows you to:
- Create multiple client profiles from a centralized location
- Edit existing client data and sync changes to Wix
- Track all client profiles and their sync status
- Manage everything from one spreadsheet with multiple organized sheets

## Quick Start Guide

### Step 1: Set Up Your Multi-Client Spreadsheet

1. Open Google Apps Script: https://script.google.com
2. Find your project: "Wix Client Profile Automation"
3. In the script editor, run the function `createMultiClientSystem()`

This will create a spreadsheet called "Client Profile Input" with three organized sheets:

#### Sheet 1: Client List (Master Directory)
- **Purpose**: Central registry of all clients
- **Columns**: Client ID, Company Name, Location, Status, Profile URL, Created Date, Last Updated, Wix Profile ID, Contact Email, Contact Phone
- **Usage**: View all clients at a glance, track their status

#### Sheet 2: Input Template (Data Entry)
- **Purpose**: Template for entering new client information
- **Sections**: 
  - Basic Information (Company Name, Location, Bulletin, etc.)
  - Office Information (Address, Phone, Email, Hours, Website)
  - Services (with pricing and descriptions)
  - Technicians (with certifications and specialties)
  - Service Areas (with zip codes and fees)
  - Policies (cancellation, guarantee, payment terms)

#### Sheet 3: Profile Tracker (Status Monitoring)
- **Purpose**: Track sync status and errors
- **Columns**: Client ID, Company Name, Profile Status, Wix Sync Status, Last Sync Date, Error Messages, Action Required, Notes

### Step 2: Create Your First Client Profile

1. **Fill out the Input Template sheet** with your first client's information
   - Start with the Basic Information section
   - Complete Office Information
   - Add Services your client offers
   - List Technicians
   - Define Service Areas
   - Set Policies

2. **Run the profile creation function**
   - In Google Apps Script, run `createClientProfile()`
   - This will:
     - Read data from your Input Template
     - Generate a unique Client ID (e.g., CLIENT-001)
     - Create the Wix profile
     - Add the client to your Client List
     - Update the Profile Tracker

### Step 3: Set Up Wix API Credentials

Before creating actual profiles, you need to configure your Wix API access:

1. **Get your Wix credentials**:
   - Site ID: From your Wix dashboard
   - API Key: From Wix Developer console
   - Collection IDs: For your CMS collections

2. **Store credentials securely**:
   - In Google Apps Script, go to Project Settings → Script Properties
   - Add these properties:
     - `WIX_SITE_ID`: Your Wix site ID
     - `WIX_API_KEY`: Your Wix API key
     - `WIX_SERVICES_COLLECTION_ID`: Collection ID for services
     - `WIX_TECHNICIANS_COLLECTION_ID`: Collection ID for technicians
     - `WIX_AREAS_COLLECTION_ID`: Collection ID for service areas
     - `WIX_POLICIES_COLLECTION_ID`: Collection ID for policies

### Step 4: Test Profile Creation

1. Run `createClientProfile()` with test data
2. Check the Client List sheet for the new entry
3. Verify the Profile Tracker shows "Synced" status
4. Visit the generated profile URL to see your Wix page

## Managing Multiple Clients

### Adding New Clients
1. **Option A**: Copy the Input Template format to a new area of the sheet
2. **Option B**: Use the same Input Template area, clear it, and enter new data
3. Run `createClientProfile()` for each new client

### Editing Existing Clients
1. Find the client in your Client List sheet
2. Locate their data in the appropriate section
3. Make your edits
4. Run `handleClientDataUpdate('CLIENT-XXX')` (replace XXX with the client ID)
5. Changes will automatically sync to Wix

### Tracking Client Status
- Use the Profile Tracker sheet to monitor:
  - Which profiles are successfully synced
  - Any errors that occurred
  - When profiles were last updated
  - What actions are needed

## Advanced Features

### Bulk Operations
- Create multiple clients by setting up multiple data sections
- Run batch operations for mass updates

### Error Handling
- Check the Profile Tracker for any failed operations
- Error messages will guide you to fix issues
- Retry operations after fixing problems

### Customization
- Modify the Input Template sections to match your specific needs
- Add new service types, technician fields, or policy categories
- The system is designed to be flexible and expandable

## Troubleshooting

### Common Issues

1. **"Spreadsheet not found" error**
   - Make sure you've run `createMultiClientSystem()` first
   - Check that the spreadsheet name is exactly "Client Profile Input"

2. **"Cannot read properties of null" error**
   - Ensure your Input Template sheet has data in the expected cells
   - Check that section headers are properly formatted

3. **Wix API errors**
   - Verify your API credentials are correctly set
   - Check that your Wix site has the necessary permissions
   - Ensure collection IDs are valid

4. **Profile URL not generating**
   - Check your Wix site configuration
   - Verify the profile URL pattern in your settings

### Getting Help
- Check the Profile Tracker sheet for specific error messages
- Review the Google Apps Script execution log
- Ensure all required fields are filled out in the Input Template

## Next Steps

1. **Set up your Wix credentials** (Step 3 above)
2. **Create your first test client** to verify everything works
3. **Customize the Input Template** to match your business needs
4. **Train your team** on using the Client List and Input Template sheets
5. **Establish a workflow** for regular client data updates

Your multi-client system is now ready to streamline your pest control business client profile management!
