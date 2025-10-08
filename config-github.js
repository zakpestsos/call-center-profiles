// Configuration for GitHub Pages integration
const CONFIG = {
  GOOGLE_SHEETS: {
    MASTER_SHEET_ID: '1WId_kg8Fu0dbnpWSSQQVv-GJJibaeSu7p23PEaeePec', // Your Master Client Profiles Sheet
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbwfG46Qj6HLdMfXe9TtNFkEgCPVOGYeygQEKZj6qc9Gktx9_5Qi8jQv7sxl3BAc5mop/exec' // Reverting to working deployment while fixing CORS
  },
  GITHUB: {
    REPO_URL: 'https://zakpestsos.github.io/call-center-profiles/',
    PROFILE_URL_PATTERN: 'https://zakpestsos.github.io/call-center-profiles/?profileId='
  }
};

// Make config available globally
window.CONFIG = CONFIG;
