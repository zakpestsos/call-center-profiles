// Configuration for GitHub Pages integration
const CONFIG = {
  GOOGLE_SHEETS: {
    MASTER_SHEET_ID: '1WId_kg8Fu0dbnpWSSQQVv-GJJibaeSu7p23PEaeePec', // Your Master Client Profiles Sheet
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbwCgtiTR-sdwCr4_P9ED-OF_5sNmfSzoomAh8EJ2euQD2_ljgyTky47q0DLdhByBsVZhw/exec' // New public deployment with FieldRoutes fixes
  },
  GITHUB: {
    REPO_URL: 'https://zakpestsos.github.io/call-center-profiles/',
    PROFILE_URL_PATTERN: 'https://zakpestsos.github.io/call-center-profiles/?profileId='
  }
};

// Make config available globally
window.CONFIG = CONFIG;
