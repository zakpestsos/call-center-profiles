# Wix Collection Setup Script
# Copy these field configurations when setting up your Wix collections

## 1. Clients Collection

**Collection Name:** Clients
**URL:** /clients

### Fields to Add:
```
Field Name: profileId
Type: Text
Required: Yes
Unique: Yes
Description: Unique identifier from Google Apps Script

Field Name: companyName  
Type: Text
Required: Yes
Description: Company name

Field Name: location
Type: Text
Required: No
Description: Company location (city, state)

Field Name: timezone
Type: Text
Required: No
Default Value: Central
Options: Pacific, Mountain, Central, Eastern
Description: Company timezone

Field Name: phone
Type: Text
Required: No
Description: Office phone number

Field Name: email
Type: Text
Required: No
Description: Office email address

Field Name: website
Type: Text
Required: No
Description: Company website URL

Field Name: address
Type: Rich Text
Required: No
Description: Physical office address

Field Name: hours
Type: Text
Required: No
Description: Office hours

Field Name: bulletin
Type: Rich Text
Required: No
Description: Important bulletin information

Field Name: pestsNotCovered
Type: Rich Text
Required: No
Description: Pests not covered by this company

Field Name: googleSheetUrl
Type: Text
Required: No
Description: Link to Google Sheet profile

Field Name: wixProfileUrl
Type: Text
Required: No
Description: Wix profile page URL

Field Name: status
Type: Text
Required: No
Default Value: ACTIVE
Options: ACTIVE, INACTIVE, PENDING
Description: Profile status

Field Name: syncStatus
Type: Text
Required: No
Default Value: PENDING
Options: PENDING, SYNCED, ERROR
Description: Sync status with Google Apps Script

Field Name: lastSyncDate
Type: Date & Time
Required: No
Description: Last sync date from Google Apps Script
```

### Collection Permissions:
- **Read:** Anyone
- **Create:** Admin
- **Update:** Admin
- **Delete:** Admin

---

## 2. Services Collection

**Collection Name:** Services

### Fields to Add:
```
Field Name: clientId
Type: Text
Required: Yes
Description: Reference to client profile (profileId)

Field Name: serviceName
Type: Text
Required: Yes
Description: Name of the service

Field Name: serviceType
Type: Text
Required: Yes
Description: Type of service (e.g., General Pest Control, Mosquito)

Field Name: frequency
Type: Text
Required: No
Description: Service frequency (Monthly, Quarterly, etc.)

Field Name: description
Type: Rich Text
Required: No
Description: Detailed service description

Field Name: pests
Type: Text
Required: No
Description: Pests covered by this service

Field Name: contract
Type: Text
Required: No
Description: Contract length

Field Name: guarantee
Type: Text
Required: No
Description: Service guarantee period

Field Name: duration
Type: Text
Required: No
Description: Service duration

Field Name: productType
Type: Text
Required: No
Description: Product type used

Field Name: billingFrequency
Type: Text
Required: No
Description: How often customer is billed

Field Name: agentNote
Type: Rich Text
Required: No
Description: Special notes for call center agents

Field Name: queueExt
Type: Text
Required: No
Description: Queue extension for this service

Field Name: pricingTiers
Type: Text
Required: No
Description: JSON string of pricing tiers

Field Name: isSubService
Type: Boolean
Required: No
Default Value: false
Description: Whether this is a sub-service

Field Name: parentServiceId
Type: Text
Required: No
Description: Parent service ID if this is a sub-service

Field Name: sortOrder
Type: Number
Required: No
Default Value: 0
Description: Display order
```

---

## 3. Technicians Collection

**Collection Name:** Technicians

### Fields to Add:
```
Field Name: clientId
Type: Text
Required: Yes
Description: Reference to client profile

Field Name: name
Type: Text
Required: Yes
Description: Technician name

Field Name: company
Type: Text
Required: No
Description: Company name

Field Name: role
Type: Text
Required: No
Default Value: Technician
Options: Technician, Inspector, Both
Description: Technician role

Field Name: phone
Type: Text
Required: No
Description: Technician phone number

Field Name: schedule
Type: Text
Required: No
Description: Work schedule

Field Name: maxStops
Type: Text
Required: No
Description: Maximum stops per day

Field Name: doesNotService
Type: Text
Required: No
Description: Services technician does not perform

Field Name: additionalNotes
Type: Rich Text
Required: No
Description: Additional notes about technician

Field Name: zipCodes
Type: Text
Required: No
Description: JSON array of zip codes served

Field Name: sortOrder
Type: Number
Required: No
Default Value: 0
Description: Display order
```

---

## 4. Policies Collection

**Collection Name:** Policies

### Fields to Add:
```
Field Name: clientId
Type: Text
Required: Yes
Description: Reference to client profile

Field Name: category
Type: Text
Required: Yes
Description: Policy category (e.g., Service Coverage, Payment)

Field Name: type
Type: Text
Required: Yes
Description: Policy type identifier

Field Name: title
Type: Text
Required: Yes
Description: Policy title

Field Name: description
Type: Rich Text
Required: No
Description: Policy description

Field Name: options
Type: Text
Required: No
Description: JSON array of available options

Field Name: default
Type: Text
Required: No
Description: Default/current policy setting

Field Name: sortOrder
Type: Number
Required: No
Default Value: 0
Description: Display order within category
```

---

## 5. ServiceAreas Collection

**Collection Name:** ServiceAreas

### Fields to Add:
```
Field Name: clientId
Type: Text
Required: Yes
Description: Reference to client profile

Field Name: zip
Type: Text
Required: Yes
Description: Zip code

Field Name: city
Type: Text
Required: No
Description: City name

Field Name: state
Type: Text
Required: No
Description: State abbreviation

Field Name: branch
Type: Text
Required: No
Description: Branch name

Field Name: territory
Type: Text
Required: No
Description: Territory name

Field Name: inService
Type: Boolean
Required: No
Default Value: true
Description: Whether area is currently in service
```

---

## Quick Setup Checklist

### Phase 1: Create Collections
- [ ] Create Clients collection with all fields
- [ ] Create Services collection with all fields
- [ ] Create Technicians collection with all fields
- [ ] Create Policies collection with all fields
- [ ] Create ServiceAreas collection with all fields

### Phase 2: Set Permissions
- [ ] Set Clients collection permissions
- [ ] Set Services collection permissions
- [ ] Set Technicians collection permissions
- [ ] Set Policies collection permissions
- [ ] Set ServiceAreas collection permissions

### Phase 3: Create Dynamic Page
- [ ] Create new page in Wix Editor
- [ ] Set page URL to `/profile/[profileId]`
- [ ] Add required page elements
- [ ] Add Velo code for data loading

### Phase 4: Test Integration
- [ ] Create test data in collections
- [ ] Test profile page loading
- [ ] Test navigation between sections
- [ ] Test responsive design

### Phase 5: Connect to Google Apps Script
- [ ] Add backend sync function
- [ ] Update Google Apps Script with Wix endpoints
- [ ] Test data sync from Google Sheets to Wix
- [ ] Verify profile URLs are generated correctly

---

## Sample Data for Testing

### Test Client Record:
```json
{
  "profileId": "TEST001",
  "companyName": "Test Pest Control",
  "location": "Dallas, TX",
  "timezone": "Central",
  "phone": "(214) 555-0000",
  "email": "test@testpest.com",
  "website": "https://testpest.com",
  "bulletin": "This is a test profile for development",
  "status": "ACTIVE",
  "syncStatus": "SYNCED"
}
```

### Test Service Record:
```json
{
  "clientId": "TEST001",
  "serviceName": "General Pest Control",
  "serviceType": "Recurring",
  "frequency": "Quarterly",
  "description": "Complete pest control service",
  "pests": "Ants, Roaches, Spiders",
  "contract": "12 Months",
  "guarantee": "90 days",
  "sortOrder": 1
}
```

Use this data to test your collections and page functionality before connecting to your live Google Apps Script system.
