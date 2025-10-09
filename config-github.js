// Configuration for GitHub Pages integration
const CONFIG = {
  GOOGLE_SHEETS: {
    MASTER_SHEET_ID: '1WId_kg8Fu0dbnpWSSQQVv-GJJibaeSu7p23PEaeePec', // Your Master Client Profiles Sheet
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbw05aan_4aE9JIMuwAoxO1j0yG7tPiRc9Mqv6x9Z5rMD5utC-YOIMo9QukSuU8Bm4FqbQ/exec' // Working deployment v100 - Complete FieldRoutes button fix
  },
  GITHUB: {
    REPO_URL: 'https://zakpestsos.github.io/call-center-profiles/',
    PROFILE_URL_PATTERN: 'https://zakpestsos.github.io/call-center-profiles/?profileId='
  }
};

// Make config available globally
window.CONFIG = CONFIG;
