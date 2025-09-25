// Configuration for GitHub Pages integration
const CONFIG = {
  GOOGLE_SHEETS: {
    MASTER_SHEET_ID: '1WId_kg8Fu0dbnpWSSQQVv-GJJibaeSu7p23PEaeePec', // Your Master Client Profiles Sheet
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxLqAH53_8IS6kG68PgHM-tv3nkLtvRM1o410u0wZEdg1IdiH1EqS_o84XGDziKjTugsQ/exec' // Your deployed Apps Script Web App URL
  },
  GITHUB: {
    REPO_URL: 'https://zakpestsos.github.io/call-center-profiles/',
    PROFILE_URL_PATTERN: 'https://zakpestsos.github.io/call-center-profiles/?profileId='
  }
};

// Make config available globally
window.CONFIG = CONFIG;
