// GitHub Pages Profile Viewer - Clean Implementation
let clientData = {};

// JSONP helper function to bypass CORS
function fetchWithJSONP(url) {
    return new Promise((resolve, reject) => {
        // Create a unique callback name
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        
        // Create the script element
        const script = document.createElement('script');
        
        // Set up the callback
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(data);
        };
        
        // Handle errors
        script.onerror = function() {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('JSONP request failed'));
        };
        
        // Set the script source
        script.src = url.replace('callback=handleProfileData', `callback=${callbackName}`);
        
        // Add to DOM to trigger the request
        document.body.appendChild(script);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                document.body.removeChild(script);
                reject(new Error('JSONP request timeout'));
            }
        }, 10000);
    });
}

// Get profile ID from URL
function getProfileIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('profileId');
}

// Load profile data from Apps Script
async function loadProfileData() {
    const profileId = getProfileIdFromUrl();

    if (!profileId) {
        showError('No profile ID provided in URL');
        return;
    }

    try {
        const apiUrl = window.CONFIG?.GOOGLE_SHEETS?.WEB_APP_URL;
        if (!apiUrl) {
            throw new Error('API URL not configured');
        }

        console.log('📊 Fetching data from Apps Script API...');
        console.log('🔗 URL:', apiUrl);
        console.log('🔍 Looking for Profile ID:', profileId);

        const response = await fetch(`${apiUrl}?profileId=${encodeURIComponent(profileId)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Data received from Apps Script:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        clientData = data;
        populateProfile();
        updateTime();
        setInterval(updateTime, 60000);

    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Error loading profile data: ' + error.message);
    }
}

function populateProfile() {
    // Update header
    const companyNameEl = document.getElementById('companyName');
    if (companyNameEl) companyNameEl.textContent = clientData.companyName || 'Unknown Company';
    
    const locationEl = document.getElementById('locationInfo');
    if (locationEl) locationEl.textContent = clientData.location || 'Unknown Location';

    // Populate contact info (check if elements exist)
    const phoneEl = document.getElementById('phoneNumber');
    if (phoneEl) phoneEl.textContent = clientData.officeInfo?.phone || '-';
    
    const emailEl = document.getElementById('emailAddress');
    if (emailEl) emailEl.textContent = clientData.officeInfo?.email || '-';
    
    const websiteEl = document.getElementById('websiteUrl');
    if (websiteEl) {
        websiteEl.innerHTML = clientData.officeInfo?.website ?
            `<a href="${clientData.officeInfo.website}" target="_blank">${clientData.officeInfo.website}</a>` : '-';
    }
    
    const addressEl = document.getElementById('physicalAddress');
    if (addressEl) addressEl.textContent = clientData.officeInfo?.address || '-';
    
    const hoursEl = document.getElementById('officeHours');
    if (hoursEl) hoursEl.textContent = clientData.officeInfo?.hours || '-';
    
    // Update info cards
    const topBulletinEl = document.getElementById('topBulletinContent');
    if (topBulletinEl) topBulletinEl.textContent = clientData.bulletin || '-';
    
    const topPestsEl = document.getElementById('topPestsNotCoveredContent');
    if (topPestsEl) topPestsEl.textContent = clientData.pestsNotCovered || '-';
    
    // Update header links
    const websiteLink = document.getElementById('websiteLink');
    if (websiteLink && clientData.officeInfo?.website) {
        websiteLink.href = clientData.officeInfo.website;
    }
    
    const fieldRoutesLink = document.getElementById('fieldRoutesLink');
    if (fieldRoutesLink && clientData.officeInfo?.website) {
        fieldRoutesLink.href = clientData.officeInfo.website;
    }

    // Populate services
    populateServices();

    // Populate technicians
    populateTechnicians();

    // Populate service areas
    populateServiceAreas();

    // Hide loading state and show sections
    const loadingStateEl = document.getElementById('loadingState');
    if (loadingStateEl) loadingStateEl.style.display = 'none';
    
    // Show services section by default
    showSection('services');
}

function populateServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) {
        console.log('servicesGrid element not found');
        return;
    }
    servicesGrid.innerHTML = '';

    if (!clientData.services || clientData.services.length === 0) {
        servicesGrid.innerHTML = '<p style="color: #94a3b8; font-style: italic;">No services defined</p>';
        return;
    }

    clientData.services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';

        serviceCard.innerHTML = `
            <h3>${service.name || 'Unnamed Service'}</h3>
            ${service.frequency ? `<div class="frequency-badge">${service.frequency}</div>` : ''}
            ${service.description ? `<p style="margin-bottom: 1rem; color: #cbd5e1;">${service.description}</p>` : ''}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
                ${service.contract ? `<div><strong>Contract:</strong> ${service.contract}</div>` : ''}
                ${service.guarantee ? `<div><strong>Guarantee:</strong> ${service.guarantee}</div>` : ''}
                ${service.duration ? `<div><strong>Duration:</strong> ${service.duration}</div>` : ''}
                ${service.serviceType ? `<div><strong>Type:</strong> ${service.serviceType}</div>` : ''}
                ${service.pests ? `<div><strong>Pests:</strong> ${service.pests}</div>` : ''}
            </div>
        `;

        servicesGrid.appendChild(serviceCard);
    });
}

function populateTechnicians() {
    const techniciansGrid = document.getElementById('techniciansGrid');
    if (!techniciansGrid) {
        console.log('techniciansGrid element not found');
        return;
    }
    techniciansGrid.innerHTML = '';

    if (!clientData.technicians || clientData.technicians.length === 0) {
        techniciansGrid.innerHTML = '<p style="color: #94a3b8; font-style: italic;">No technicians assigned</p>';
        return;
    }

    clientData.technicians.forEach(tech => {
        const techCard = document.createElement('div');
        techCard.className = 'technician-card';

        techCard.innerHTML = `
            <h3>${tech.name || 'Unnamed Technician'}</h3>
            ${tech.role ? `<p style="color: #60a5fa; margin-bottom: 1rem;"><strong>Role:</strong> ${tech.role}</p>` : ''}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
                ${tech.schedule ? `<div><strong>Schedule:</strong> ${tech.schedule}</div>` : ''}
                ${tech.maxStops ? `<div><strong>Max Stops:</strong> ${tech.maxStops}</div>` : ''}
                ${tech.phone ? `<div><strong>Phone:</strong> ${tech.phone}</div>` : ''}
                ${tech.zipCode ? `<div><strong>ZIP Code:</strong> ${tech.zipCode}</div>` : ''}
            </div>
            ${tech.doesNotService ? `<div style="margin-top: 1rem; padding: 0.75rem; background: rgba(220, 38, 38, 0.1); border: 1px solid #dc2626; border-radius: 0.5rem; color: #fca5a5;"><strong>Does NOT Service:</strong> ${tech.doesNotService}</div>` : ''}
            ${tech.notes ? `<div style="margin-top: 1rem; color: #cbd5e1;"><strong>Notes:</strong> ${tech.notes}</div>` : ''}
        `;

        techniciansGrid.appendChild(techCard);
    });
}

function populateServiceAreas() {
    const areasGrid = document.getElementById('serviceAreasGrid');
    if (!areasGrid) {
        console.log('serviceAreasGrid element not found');
        return;
    }
    areasGrid.innerHTML = '';

    if (!clientData.serviceAreas || clientData.serviceAreas.length === 0) {
        areasGrid.innerHTML = '<p style="color: #94a3b8; font-style: italic;">No service areas defined</p>';
        return;
    }

    clientData.serviceAreas.forEach(area => {
        const areaCard = document.createElement('div');
        areaCard.className = 'area-card';

        const statusColor = area.inService ? '#10b981' : '#ef4444';
        const statusText = area.inService ? 'Active' : 'Inactive';

        areaCard.innerHTML = `
            <h3>${area.zip} - ${area.city}, ${area.state}</h3>
            ${area.branch ? `<p style="color: #60a5fa; margin-bottom: 0.5rem;"><strong>Branch:</strong> ${area.branch}</p>` : ''}
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <div style="background: ${statusColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600;">
                    ${statusText}
                </div>
            </div>
            ${area.notes ? `<div style="margin-top: 1rem; color: #cbd5e1;"><strong>Notes:</strong> ${area.notes}</div>` : ''}
        `;

        areasGrid.appendChild(areaCard);
    });
}

function showSection(sectionName) {
    // Hide all sections
    const sections = ['servicesSection', 'policiesSection', 'techniciansSection', 'bulletinSection'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'none';
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) targetSection.style.display = 'block';

    // Update button states
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the correct button
    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(sectionName.toLowerCase()) ||
            (sectionName === 'technicians' && btn.textContent.toLowerCase().includes('scheduling'))) {
            btn.classList.add('active');
        }
    });
}

function updateTime() {
    const timezone = clientData.timezone || 'Central';
    const timeZoneMap = {
        'Pacific': 'America/Los_Angeles',
        'Mountain': 'America/Denver',
        'Central': 'America/Chicago',
        'Eastern': 'America/New_York'
    };

    const timeZone = timeZoneMap[timezone] || 'America/Chicago';
    const now = new Date();
    const localTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timeZone
    });

    document.getElementById('currentTime').textContent = localTime;
}

function showError(message) {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) {
        errorEl.style.display = 'block';
        const errorParagraph = errorEl.querySelector('p');
        if (errorParagraph) {
            errorParagraph.textContent = message;
        } else {
            errorEl.innerHTML = `<p>${message}</p>`;
        }
    } else {
        console.error('Error:', message);
        alert('Error: ' + message);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
});
