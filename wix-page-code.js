// Wix Velo Code for Profile Page
// This is ALL the code you need in Wix!

import wixLocation from 'wix-location';

$w.onReady(function () {
    loadProfile();
});

function loadProfile() {
    // Get profileId from URL path
    const url = wixLocation.url;
    const pathSegments = url.split('/').filter(segment => segment.length > 0);
    
    // Look for profileId after 'profile' in URL
    const profileIndex = pathSegments.indexOf('profile');
    const profileId = (profileIndex !== -1 && profileIndex + 1 < pathSegments.length) 
        ? pathSegments[profileIndex + 1] 
        : null;
    
    if (profileId) {
        // Build URL to your existing GitHub Pages interface
        const githubBaseUrl = 'https://YOUR-USERNAME.github.io/wix-integration/';
        const profileUrl = `${githubBaseUrl}?profileId=${encodeURIComponent(profileId)}`;
        
        // Load your existing interface in the iframe
        $w('#profileFrame').src = profileUrl;
        
        // Hide loading message
        $w('#loadingMessage').hide();
        $w('#profileFrame').show();
        
        // Update page title
        $w('#pageTitle').text = `Profile: ${profileId}`;
        
    } else {
        // No profile ID provided
        $w('#loadingMessage').text = 'No profile ID specified';
        $w('#profileFrame').hide();
    }
}

// Optional: Handle iframe loading states
$w('#profileFrame').onMessage((event) => {
    if (event.data === 'profileLoaded') {
        // Profile finished loading
        console.log('Profile loaded successfully');
    }
});

// Optional: Handle errors
function showError(message) {
    $w('#loadingMessage').text = `Error: ${message}`;
    $w('#profileFrame').hide();
}
