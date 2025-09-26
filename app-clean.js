// GitHub Pages Profile Viewer - Clean Implementation
let clientData = {};

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
    document.getElementById('companyName').textContent = clientData.companyName || 'Unknown Company';
    document.getElementById('location').textContent = clientData.location || 'Unknown Location';

    // Populate contact info
    document.getElementById('phoneNumber').textContent = clientData.officeInfo?.phone || '-';
    document.getElementById('emailAddress').textContent = clientData.officeInfo?.email || '-';
    document.getElementById('websiteUrl').innerHTML = clientData.officeInfo?.website ?
        `<a href="${clientData.officeInfo.website}" target="_blank">${clientData.officeInfo.website}</a>` : '-';
    document.getElementById('physicalAddress').textContent = clientData.officeInfo?.address || '-';
    document.getElementById('officeHours').textContent = clientData.officeInfo?.hours || '-';
    document.getElementById('bulletin').textContent = clientData.bulletin || '-';
    document.getElementById('pestsNotCovered').textContent = clientData.pestsNotCovered || '-';

    // Populate services
    populateServices();

    // Populate technicians
    populateTechnicians();

    // Populate service areas
    populateServiceAreas();

    // Show content
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}

function populateServices() {
    const servicesGrid = document.getElementById('servicesGrid');
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
    const areasGrid = document.getElementById('areasGrid');
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
    document.getElementById('services-section').classList.add('hidden');
    document.getElementById('technicians-section').classList.add('hidden');
    document.getElementById('areas-section').classList.add('hidden');
    document.getElementById('info-section').classList.add('hidden');

    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.remove('hidden');

    // Update button states
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
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
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('error').querySelector('p').textContent = message;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
});
