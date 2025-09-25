// Configuration for GitHub Pages integration
const CONFIG = {
  GOOGLE_SHEETS: {
    MASTER_SHEET_ID: 'YOUR_ACTUAL_GOOGLE_SHEET_ID', // REPLACE THIS: Get from your Google Sheet URL
    WEB_APP_URL: 'https://script.google.com/macros/s/1hnHH4JAWakQBGPaWr02eWtrkaysnV-qmZuwp1bVsZqN9j2pYobj5hI7f/exec' // Your deployed Apps Script Web App URL
  },
  GITHUB: {
    REPO_URL: 'https://zakpestsos.github.io/call-center-profiles/',
    PROFILE_URL_PATTERN: 'https://zakpestsos.github.io/call-center-profiles/?profileId='
  }
};

// Make config available globally
window.CONFIG = CONFIG;
