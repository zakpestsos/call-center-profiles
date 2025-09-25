// Simplified Velo Code - Direct to Google Apps Script (No Wix Database)
import wixLocation from 'wix-location';

$w.onReady(function () {
    console.log('=== PROFILE PAGE STARTING ===');
    
    // Get profile ID from URL
    const profileId = getProfileIdFromUrl();
    
    if (!profileId) {
        console.warn('No profile ID found, using test profile');
        loadGitHubWithProfileId('TEST001');
    } else {
        console.log('Using profile ID:', profileId);
        loadGitHubWithProfileId(profileId);
    }
});

function getProfileIdFromUrl() {
    try {
        if (wixLocation && wixLocation.url) {
            console.log('Current location URL:', wixLocation.url);
            
            // Look for /profile/ pattern in URL
            const profileMatch = wixLocation.url.match(/\/profile\/([^\/\?#]+)/);
            if (profileMatch) {
                console.log('✅ Got profile ID from URL:', profileMatch[1]);
                return profileMatch[1];
            }
        }
        
        console.log('❌ No profile ID found in URL');
        return null;
        
    } catch (error) {
        console.error('Error getting profile ID:', error);
        return null;
    }
}

function loadGitHubWithProfileId(profileId) {
    // Show loading
    if ($w('#loadingText')) {
        $w('#loadingText').text = `Loading profile: ${profileId}...`;
        $w('#loadingText').show();
    }
    if ($w('#profileFrame')) $w('#profileFrame').hide();
    if ($w('#errorText')) $w('#errorText').hide();
    
    console.log('Loading GitHub Pages with profile ID:', profileId);
    
    try {
        // Direct call to GitHub Pages with profileId
        // Your GitHub Pages app.js will call Google Apps Script to get the data
        const githubUrl = `https://zakpestsos.github.io/call-center-profiles/?profileId=${encodeURIComponent(profileId)}`;
        
        console.log('✅ GitHub URL ready:', githubUrl);
        
        // Load in iframe
        if ($w('#profileFrame')) {
            $w('#profileFrame').src = githubUrl;
            $w('#profileFrame').show();
        }
        if ($w('#loadingText')) $w('#loadingText').hide();
        
    } catch (error) {
        console.error('❌ Error loading GitHub interface:', error);
        showError('Error loading interface: ' + error.message);
    }
}

function showError(message) {
    console.error('Showing error:', message);
    if ($w('#errorText')) {
        $w('#errorText').text = message;
        $w('#errorText').show();
    }
    if ($w('#loadingText')) $w('#loadingText').hide();
    if ($w('#profileFrame')) $w('#profileFrame').hide();
}

// Optional: Listen for messages from GitHub Pages iframe
$w.onReady(function() {
    if ($w('#profileFrame')) {
        $w('#profileFrame').onMessage((event) => {
            console.log('Message from GitHub Pages:', event.data);
            
            if (event.data === 'profileLoaded') {
                console.log('✅ Profile loaded successfully in GitHub Pages');
            } else if (event.data && event.data.error) {
                console.error('❌ Error from GitHub Pages:', event.data.error);
                showError('Profile loading error: ' + event.data.error);
            }
        });
    }
});
