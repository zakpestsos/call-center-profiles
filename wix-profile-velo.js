// Wix Velo Page Code (profile-page.js)
// This code handles the dynamic profile page for call center agents

import wixData from 'wix-data';
import wixWindow from 'wix-window';
import { getGoogleSheetData } from 'backend/googlesheets';

let updates = [];
let clientData = {};

$w.onReady(function () {
    // Initialize page elements
    initializePageElements();
    
    // Get client ID from URL
    const clientId = $w("#clientParams").text || getUrlParameter('clientId');
    
    if (clientId) {
        loadClientProfile(clientId);
    } else {
        showError('No client ID provided');
    }
    
    // Setup time updates
    setupTimeUpdates();
    
    // Setup Google Sheets updates monitoring
    setupUpdatesMonitoring();
    
    // Setup event handlers
    setupEventHandlers();
});

/**
 * Initialize page elements and hide unnecessary components
 */
function initializePageElements() {
    // Hide loading elements initially
    $w("#loadingSpinner").show();
    $w("#mainContent").hide();
    $w("#errorMessage").hide();
    
    // Hide modal elements
    $w("#officeModal").hide();
    $w("#updatesModal").hide();
    
    // Hide zip lookup results
    $w("#zipResult").hide();
    $w("#zipStatusIcon").hide();
}

/**
 * Load client profile data from Wix database
 */
function loadClientProfile(clientId) {
    wixData.query('Profiles')
        .eq('profileId', clientId)
        .include(['services', 'technicians', 'serviceAreas', 'policies'])
        .find()
        .then(results => {
            if (results.items.length > 0) {
                clientData = results.items[0];
                populateProfileData();
                $w("#loadingSpinner").hide();
                $w("#mainContent").show();
            } else {
                showError('Client profile not found');
            }
        })
        .catch(error => {
            console.error('Error loading client profile:', error);
            showError('Error loading client profile');
        });
}

/**
 * Populate the page with client profile data
 */
function populateProfileData() {
    // Update header information
    $w("#companyName").text = clientData.companyName;
    $w("#locationTimezone").text = `${clientData.location || ''} • ${clientData.timezone || ''} Time`;
    
    // Update useful links
    if (clientData.website) {
        $w("#websiteLink").link = clientData.website;
        $w("#websiteLink").target = "_blank";
    }
    
    if (clientData.fieldRoutesLink) {
        $w("#fieldRoutesLink").link = clientData.fieldRoutesLink;
        $w("#fieldRoutesLink").target = "_blank";
    }
    
    // Show/hide bulletin section
    if (clientData.bulletin && clientData.bulletin.trim() !== '') {
        $w("#bulletinSection").show();
        $w("#bulletinContent").text = clientData.bulletin;
    } else {
        $w("#bulletinSection").hide();
    }
    
    // Show/hide pests not covered section
    if (clientData.pestsNotCovered && clientData.pestsNotCovered.trim() !== '') {
        $w("#pestsNotCoveredSection").show();
        $w("#pestsNotCoveredContent").text = clientData.pestsNotCovered;
    } else {
        $w("#pestsNotCoveredSection").hide();
    }
    
    // Load services data
    loadServicesData();
    
    // Load technicians data
    loadTechniciansData();
    
    // Load policies data
    loadPoliciesData();
    
    // Load service areas data
    loadServiceAreasData();
    
    // Load office information
    loadOfficeInformation();
}

/**
 * Load and display services data
 */
function loadServicesData() {
    wixData.query('Services')
        .eq('profileId', clientData._id)
        .ascending('sortOrder')
        .find()
        .then(results => {
            populateServicesRepeater(results.items);
        })
        .catch(error => {
            console.error('Error loading services:', error);
        });
}

/**
 * Populate services repeater with service data
 */
function populateServicesRepeater(services) {
    $w("#servicesRepeater").data = services;
    
    $w("#servicesRepeater").onItemReady(($item, itemData) => {
        // Service card content
        $item("#serviceName").text = itemData.serviceName || '';
        $item("#serviceDescription").text = itemData.serviceDescription || '';
        
        // Service details
        $item("#firstPrice").text = itemData.firstPrice || 'N/A';
        $item("#recurringPrice").text = itemData.recurringPrice || 'N/A';
        $item("#contractLength").text = itemData.contractLength || 'N/A';
        $item("#guarantee").text = itemData.guarantee || 'N/A';
        $item("#serviceDuration").text = itemData.serviceDuration || 'N/A';
        $item("#pestsCovered").text = itemData.pestsCovered || 'N/A';
        
        // Service type styling
        if (itemData.serviceType === 'one-time') {
            $item("#serviceCard").style.borderLeftColor = '#f59e0b';
        } else if (itemData.serviceType === 'recurring') {
            $item("#serviceCard").style.borderLeftColor = '#10b981';
        } else {
            $item("#serviceCard").style.borderLeftColor = '#3b82f6';
        }
    });
}

/**
 * Load and display technicians data
 */
function loadTechniciansData() {
    wixData.query('TechnicianList')
        .eq('profileId', clientData._id)
        .ascending('sortOrder')
        .find()
        .then(results => {
            populateTechniciansRepeater(results.items);
        })
        .catch(error => {
            console.error('Error loading technicians:', error);
        });
}

/**
 * Populate technicians repeater with technician data
 */
function populateTechniciansRepeater(technicians) {
    $w("#techniciansRepeater").data = technicians;
    
    $w("#techniciansRepeater").onItemReady(($item, itemData) => {
        $item("#technicianName").text = itemData.technicianName || '';
        $item("#technicianRole").text = itemData.role || 'Technician';
        $item("#technicianSchedule").text = itemData.schedule || '';
        $item("#maxStops").text = itemData.maxStops ? `Max Stops: ${itemData.maxStops}` : '';
        $item("#technicianPhone").text = itemData.phoneNumber || '';
        $item("#technicianZip").text = itemData.zipCode || '';
        $item("#technicianNotes").text = itemData.additionalNotes || '';
        
        // Role-based styling
        if (itemData.role === 'Inspector') {
            $item("#technicianCard").style.borderLeftColor = '#8b5cf6';
        } else if (itemData.role === 'Both') {
            $item("#technicianCard").style.borderLeftColor = '#f59e0b';
        } else {
            $item("#technicianCard").style.borderLeftColor = '#10b981';
        }
    });
}

/**
 * Load and display policies data
 */
function loadPoliciesData() {
    wixData.query('Policies')
        .eq('profileId', clientData._id)
        .ascending('sortOrder')
        .find()
        .then(results => {
            populatePoliciesRepeater(results.items);
        })
        .catch(error => {
            console.error('Error loading policies:', error);
        });
}

/**
 * Populate policies repeater with policy data
 */
function populatePoliciesRepeater(policies) {
    $w("#policiesRepeater").data = policies;
    
    $w("#policiesRepeater").onItemReady(($item, itemData) => {
        $item("#policyTitle").text = itemData.policyTitle || '';
        $item("#policyContent").text = itemData.policyContent || '';
        
        // Policy type styling
        const policyTypeColors = {
            'cancellation': '#ef4444',
            'guarantee': '#10b981',
            'payment': '#3b82f6',
            'emergency': '#f59e0b',
            'insurance': '#8b5cf6'
        };
        
        const color = policyTypeColors[itemData.policyType] || '#64748b';
        $item("#policyCard").style.borderLeftColor = color;
    });
}

/**
 * Load and display service areas data
 */
function loadServiceAreasData() {
    wixData.query('ServiceAreas')
        .eq('profileId', clientData._id)
        .ascending('sortOrder')
        .find()
        .then(results => {
            populateServiceAreasRepeater(results.items);
        })
        .catch(error => {
            console.error('Error loading service areas:', error);
        });
}

/**
 * Populate service areas repeater with area data
 */
function populateServiceAreasRepeater(serviceAreas) {
    $w("#serviceAreasRepeater").data = serviceAreas;
    
    $w("#serviceAreasRepeater").onItemReady(($item, itemData) => {
        $item("#areaName").text = itemData.cityArea || '';
        $item("#areaState").text = itemData.state || '';
        $item("#serviceRadius").text = itemData.serviceRadius ? `${itemData.serviceRadius} miles` : '';
        
        // Parse and display zip codes
        let zipCodes = [];
        try {
            zipCodes = JSON.parse(itemData.zipCodes || '[]');
        } catch (e) {
            zipCodes = [];
        }
        $item("#zipCodes").text = zipCodes.join(', ') || 'No zip codes specified';
        
        $item("#additionalFees").text = itemData.additionalFees || 'No additional fees';
    });
}

/**
 * Load office information for modal
 */
function loadOfficeInformation() {
    // Populate office information from clientData
    const officeInfo = JSON.parse(clientData.officeInformation || '{}');
    
    $w("#officePhone").text = officeInfo.officePhone || clientData.officePhone || '';
    $w("#customerEmail").text = officeInfo.customerContactEmail || '';
    $w("#physicalAddress").text = officeInfo.physicalAddress || '';
    $w("#mailingAddress").text = officeInfo.mailingAddress || '';
    $w("#officeHours").text = officeInfo.officeHours || '';
    $w("#holidays").text = officeInfo.holidays ? JSON.parse(officeInfo.holidays).join(', ') : '';
}

/**
 * Setup time updates for different time zones
 */
function setupTimeUpdates() {
    updateTimes();
    setInterval(updateTimes, 1000);
}

function updateTimes() {
    const now = new Date();
    
    // Time zone offsets (adjust for daylight saving time as needed)
    const timeZones = [
        { id: 'pacificTime', offset: -8, label: 'Pacific' },
        { id: 'mountainTime', offset: -7, label: 'Mountain' },
        { id: 'centralTime', offset: -6, label: 'Central' },
        { id: 'easternTime', offset: -5, label: 'Eastern' }
    ];
    
    timeZones.forEach(tz => {
        const time = getTimeInTimeZone(now, tz.offset);
        $w(`#${tz.id}`).text = time;
    });
}

function getTimeInTimeZone(date, offset) {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (offset * 3600000));
    
    return targetTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

/**
 * Setup Google Sheets updates monitoring
 */
function setupUpdatesMonitoring() {
    fetchUpdatesData();
    setInterval(fetchUpdatesData, 600000); // Update every 10 minutes
}

function fetchUpdatesData() {
    getGoogleSheetData()
        .then(data => {
            updates = data.slice(1).map(row => ({
                clientName: row[0],
                dateCompleted: new Date(row[1]),
                update: row[2]
            }));
            
            displayLatestUpdate();
        })
        .catch(error => {
            console.error('Error fetching updates:', error);
        });
}

function displayLatestUpdate() {
    const clientUpdates = updates.filter(update => 
        update.clientName === clientData.companyName
    );
    
    clientUpdates.sort((a, b) => b.dateCompleted - a.dateCompleted);
    
    if (clientUpdates.length > 0) {
        const latestUpdate = clientUpdates[0];
        $w("#updatedBtn").label = `Updated: ${latestUpdate.dateCompleted.toDateString()}`;
    } else {
        $w("#updatedBtn").label = "No updates found";
    }
}

/**
 * Setup event handlers for interactive elements
 */
function setupEventHandlers() {
    // Navigation links
    $w("#servicesNavLink").onClick(() => showSection('services'));
    $w("#techniciansNavLink").onClick(() => showSection('technicians'));
    $w("#policiesNavLink").onClick(() => showSection('policies'));
    $w("#areasNavLink").onClick(() => showSection('areas'));
    $w("#discountsNavLink").onClick(() => showSection('discounts'));
    
    // Office info modal
    $w("#officeInfoBtn").onClick(() => {
        $w("#officeModal").show();
    });
    
    $w("#closeOfficeModal").onClick(() => {
        $w("#officeModal").hide();
    });
    
    // Updates modal
    $w("#updatedBtn").onClick(() => {
        showUpdatesModal();
    });
    
    // Acreage converter
    $w("#convertBtn").onClick(() => {
        convertAcres();
    });
    
    // Zip code lookup
    $w("#searchZipBtn").onClick(() => {
        searchZip();
    });
    
    // Enter key for zip input
    $w("#zipInput").onKeyPress((event) => {
        if (event.key === "Enter") {
            searchZip();
        }
    });
}

/**
 * Show specific section and update navigation
 */
function showSection(sectionName) {
    // Hide all sections
    const sections = ['services', 'technicians', 'policies', 'areas', 'discounts'];
    sections.forEach(section => {
        $w(`#${section}Section`).hide();
        $w(`#${section}NavLink`).style.backgroundColor = '#334155';
    });
    
    // Show target section
    $w(`#${sectionName}Section`).show();
    $w(`#${sectionName}NavLink`).style.backgroundColor = '#3b82f6';
}

/**
 * Convert acres to square footage
 */
function convertAcres() {
    const acresInput = $w("#acresInput").value;
    
    if (!acresInput) {
        $w("#conversionResult").text = 'Please enter acres value';
        return;
    }
    
    const fractionPattern = /^(\d+)\s?\/\s?(\d+)$/;
    let decimal = parseFloat(acresInput);
    const match = fractionPattern.exec(acresInput);
    
    if (match) {
        const numerator = parseInt(match[1]);
        const denominator = parseInt(match[2]);
        decimal = numerator / denominator;
    }
    
    if (isNaN(decimal)) {
        $w("#conversionResult").text = 'Invalid input format';
        return;
    }
    
    const squareFootage = decimal * 43560;
    $w("#conversionResult").text = `Square Footage: ${squareFootage.toLocaleString()}`;
}

/**
 * Search zip code in service areas
 */
function searchZip() {
    const zipInput = $w("#zipInput").value.replace(/\D/g, '').trim();
    
    if (zipInput.length !== 5) {
        showZipResult('Invalid zip code format.', false);
        return;
    }
    
    // Query SpireZips collection (your existing zip code database)
    wixData.query('SpireZips')
        .eq('title', zipInput)
        .find()
        .then(results => {
            if (results.items.length > 0) {
                showZipResult(`Customer in service area. Branch: ${results.items[0].branch}`, true);
            } else {
                showZipResult('Not in service area.', false);
            }
        })
        .catch(error => {
            console.error('Error searching zip code:', error);
            showZipResult('Error processing request.', false);
        });
}

/**
 * Show zip code lookup result
 */
function showZipResult(message, isSuccess) {
    $w("#zipResult").text = message;
    $w("#zipResult").show();
    
    if (isSuccess) {
        $w("#zipStatusIcon").src = "https://static.wixstatic.com/media/greencheck.png";
        $w("#zipResult").style.color = '#10b981';
    } else {
        $w("#zipStatusIcon").src = "https://static.wixstatic.com/media/redx.png";
        $w("#zipResult").style.color = '#ef4444';
    }
    
    $w("#zipStatusIcon").show();
}

/**
 * Show updates modal with recent updates
 */
function showUpdatesModal() {
    const clientUpdates = updates.filter(update => 
        update.clientName === clientData.companyName
    );
    
    clientUpdates.sort((a, b) => b.dateCompleted - a.dateCompleted);
    const latestUpdates = clientUpdates.slice(0, 3);
    
    if (latestUpdates.length > 0) {
        $w("#updatesRepeater").data = latestUpdates;
        $w("#updatesRepeater").onItemReady(($item, itemData) => {
            $item("#updateDate").text = itemData.dateCompleted.toDateString();
            $item("#updateContent").text = itemData.update;
        });
    } else {
        $w("#updatesRepeater").data = [{
            dateCompleted: new Date(),
            update: 'No updates found for this client.'
        }];
    }
    
    $w("#updatesModal").show();
}

/**
 * Close updates modal
 */
export function closeUpdatesModal() {
    $w("#updatesModal").hide();
}

/**
 * Utility function to get URL parameters
 */
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Show error message
 */
function showError(message) {
    $w("#loadingSpinner").hide();
    $w("#errorMessage").text = message;
    $w("#errorMessage").show();
}

// Export functions for use in other modules or direct calling
export {
    loadClientProfile,
    showSection,
    convertAcres,
    searchZip,
    closeUpdatesModal
};
