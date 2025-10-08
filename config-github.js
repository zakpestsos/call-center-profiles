// Configuration for GitHub Pages integration
const CONFIG = {
  GOOGLE_SHEETS: {
    MASTER_SHEET_ID: '1WId_kg8Fu0dbnpWSSQQVv-GJJibaeSu7p23PEaeePec', // Your Master Client Profiles Sheet
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbyF_rCxojGRXReDPGYjiIPuQx4PRrrz6kTIGwpt-mB7bkzw0DG4cXKv2KcO-In10M8sGw/exec' // Latest deployment v106 with CORS and FieldRoutes
  },
  GITHUB: {
    REPO_URL: 'https://zakpestsos.github.io/call-center-profiles/',
    PROFILE_URL_PATTERN: 'https://zakpestsos.github.io/call-center-profiles/?profileId='
  }
};

// Make config available globally
window.CONFIG = CONFIG;
