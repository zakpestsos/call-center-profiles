# Wix Call Center Interface Setup Guide

## Overview
This guide explains how to set up the Wix call center interface that integrates with your existing Google Apps Script form and provides a modern, efficient interface for call center agents.

## Wix Collections Setup

### 1. Profiles Collection
Main collection storing client profile information.

**Collection Name:** `Profiles`

**Fields:**
- `title` (Text) - Company name for display
- `companyName` (Text) - Company name
- `profileId` (Text) - Unique profile identifier
- `slug` (Text) - URL-friendly identifier
- `location` (Text) - Company location
- `timezone` (Text) - Company timezone
- `wixLink` (Text) - Wix website link
- `officePhone` (Text) - Office phone number
- `customerContactEmail` (Text) - Customer contact email
- `physicalAddress` (Text) - Physical address
- `mailingAddress` (Text) - Mailing address
- `officeHours` (Text) - Office hours
- `holidays` (Text) - Holidays information (JSON)
- `website` (Text) - Company website
- `fieldRoutesLink` (Text) - FieldRoutes link
- `bulletin` (Text) - Important bulletin information
- `pestsNotCovered` (Text) - Pests not covered by company
- `officeInformation` (Text) - Legacy office info (JSON)
- `services` (Text) - Legacy services data (JSON)
- `technicians` (Text) - Legacy technicians data (JSON)
- `serviceAreas` (Text) - Legacy service areas data (JSON)
- `policies` (Text) - Legacy policies data (JSON)
- `status` (Text) - Profile status (active/inactive)
- `createdDate` (Date) - Creation date
- `lastUpdated` (Date) - Last update date

### 2. Services Collection
Stores service information with complete pricing structure.

**Collection Name:** `Services`

**Fields:**
- `profileId` (Text) - Reference to profile
- `serviceName` (Text) - Service name
- `serviceDescription` (Text) - Service description
- `serviceType` (Text) - Service type (recurring/one-time/variant)
- `queueExt` (Text) - Queue extension
- `companyName` (Text) - Company name for pricing
- `productType` (Text) - Product type
- `soldAsName` (Text) - Sold as name
- `billingFrequency` (Text) - Billing frequency
- `firstPrice` (Text) - First service price
- `recurringPrice` (Text) - Recurring service price
- `sqftMin` (Text) - Minimum square footage
- `sqftMax` (Text) - Maximum square footage
- `serviceTypeDetail` (Text) - Service type detail
- `pestsCovered` (Text) - Pests covered by service
- `contractLength` (Text) - Contract length
- `guarantee` (Text) - Service guarantee
- `serviceDuration` (Text) - Service duration
- `serviceDetails` (Text) - Service details toggle
- `serviceNote` (Text) - Service notes
- `isActive` (Boolean) - Active status
- `sortOrder` (Number) - Display order
- `createdDate` (Date) - Creation date

### 3. SubServices Collection
Stores service variants with same structure as main services.

**Collection Name:** `SubServices`

**Fields:** (Same as Services collection plus:)
- `parentServiceId` (Text) - Reference to parent service

### 4. TechnicianList Collection
Stores technician information.

**Collection Name:** `TechnicianList`

**Fields:**
- `profileId` (Text) - Reference to profile
- `technicianName` (Text) - Technician name
- `role` (Text) - Role (Technician/Inspector/Both)
- `schedule` (Text) - Schedule information
- `maxStops` (Number) - Maximum stops per day
- `doesNotService` (Text) - Areas not serviced
- `phoneNumber` (Text) - Phone number
- `zipCode` (Text) - Zip code
- `additionalNotes` (Text) - Additional notes
- `sortOrder` (Number) - Display order
- `isActive` (Boolean) - Active status

### 5. Policies Collection
Stores policy information.

**Collection Name:** `Policies`

**Fields:**
- `profileId` (Text) - Reference to profile
- `policyTitle` (Text) - Policy title
- `policyContent` (Text) - Policy content
- `policyType` (Text) - Policy type (cancellation/guarantee/payment/emergency/insurance)
- `sortOrder` (Number) - Display order
- `isActive` (Boolean) - Active status

### 6. ServiceAreas Collection
Stores service area information (simplified structure).

**Collection Name:** `ServiceAreas`

**Fields:**
- `profileId` (Text) - Reference to profile
- `zipCode` (Text) - Zip code
- `branch` (Text) - Branch name
- `state` (Text) - State
- `serviceRadius` (Number) - Service radius (optional)
- `additionalInfo` (Text) - Additional information
- `isActive` (Boolean) - Active status
- `sortOrder` (Number) - Display order
- `createdDate` (Date) - Creation date

### 7. SpireZips Collection (Existing)
Your existing zip code lookup collection.

**Collection Name:** `SpireZips`

**Fields:**
- `title` (Text) - Zip code
- `branch` (Text) - Branch name

### 8. Updates Collection (Optional)
For Google Sheets updates integration.

**Collection Name:** `Updates`

**Fields:**
- `clientName` (Text) - Client name
- `dateCompleted` (Date) - Update date
- `update` (Text) - Update content

## Wix Page Setup

### 1. Create Dynamic Profile Page
1. Create a new page in Wix Editor
2. Set page type to "Dynamic Page"
3. Connect to "Profiles" collection
4. Set URL structure: `/profile/{profileId}`

### 2. Add Page Elements
Use the provided HTML structure as a guide to create these elements in Wix:

**Header Elements:**
- Text element: `#companyName`
- Text element: `#locationTimezone`
- Button elements: `#websiteLink`, `#fieldRoutesLink`, `#officeInfoBtn`
- Button element: `#updatedBtn`

**Navigation Elements:**
- Button elements: `#servicesNavLink`, `#techniciansNavLink`, `#policiesNavLink`, `#areasNavLink`, `#discountsNavLink`

**Content Sections:**
- Container: `#bulletinSection` with text: `#bulletinContent`
- Container: `#pestsNotCoveredSection` with text: `#pestsNotCoveredContent`
- Container: `#servicesSection` with repeater: `#servicesRepeater`
- Container: `#techniciansSection` with repeater: `#techniciansRepeater`
- Container: `#policiesSection` with repeater: `#policiesRepeater`
- Container: `#areasSection` with repeater: `#serviceAreasRepeater`

**Sidebar Tools:**
- Input: `#acresInput`, Button: `#convertBtn`, Text: `#conversionResult`
- Input: `#zipInput`, Button: `#searchZipBtn`, Text: `#zipResult`, Image: `#zipStatusIcon`
- Text elements: `#pacificTime`, `#mountainTime`, `#centralTime`, `#easternTime`

**Modals:**
- Container: `#officeModal` with close button: `#closeOfficeModal`
- Container: `#updatesModal` with repeater: `#updatesRepeater`

### 3. Apply Velo Code
1. Enable Wix Velo in your site
2. Add the provided Velo code to your profile page
3. Ensure all element IDs match between HTML and Velo code

## Integration Steps

### 1. Update Google Apps Script
- Deploy the updated `wixApi.js` with new collection structures
- Test profile creation from your enhanced form
- Verify data is properly stored in all collections

### 2. Configure Wix API
- Set up Wix API credentials in Google Apps Script
- Test API connection using `testWixConnection()`
- Create sample profiles to verify collection structure

### 3. Test Call Center Interface
- Create test profiles using your Google Apps Script form
- Navigate to profile pages using URL: `yoursite.com/profile/{profileId}`
- Test all interactive elements (navigation, tools, modals)
- Verify zip code lookup functionality
- Test time zone displays

### 4. Deploy to Production
- Update existing profile URLs if needed
- Train call center agents on new interface
- Monitor performance and user feedback
- Implement any additional customizations

## Benefits for Call Center Agents

### Improved Efficiency
- Single page with all client information
- Fast navigation between sections
- Real-time tools (acreage converter, zip lookup)
- Consistent layout across all profiles

### Enhanced User Experience
- Modern, dark theme design
- Responsive layout for different screen sizes
- Quick access to essential information
- Visual indicators for important information

### Streamlined Workflow
- Direct links to external tools (FieldRoutes, websites)
- Integrated zip code validation
- Time zone display for scheduling
- Recent updates tracking

## Customization Options

### Visual Customization
- Modify colors and fonts in CSS
- Adjust layout spacing and sizing
- Add company branding elements
- Create custom icons and graphics

### Functional Customization
- Add new tools to sidebar
- Create additional navigation sections
- Implement custom reporting features
- Add search and filtering capabilities

### Integration Enhancements
- Connect to additional external systems
- Add real-time data synchronization
- Implement automated notifications
- Create dashboard analytics

## Maintenance and Updates

### Regular Tasks
- Monitor Google Sheets integration
- Update profile information as needed
- Maintain zip code database
- Review and update policies

### Performance Optimization
- Monitor page load times
- Optimize image and asset sizes
- Cache frequently accessed data
- Implement lazy loading for large datasets

### Security Considerations
- Regularly update API credentials
- Monitor access logs
- Implement user authentication if needed
- Backup profile data regularly
