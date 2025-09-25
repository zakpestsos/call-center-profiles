// Configuration for GitHub Pages integration
const CONFIG = {
  GOOGLE_SHEETS: {
    MASTER_SHEET_ID: 'YOUR_MASTER_SHEET_ID', // Replace with your actual master sheet ID
    WEB_APP_URL: 'YOUR_APPS_SCRIPT_WEB_APP_URL' // Replace with your deployed web app URL
  },
  GITHUB: {
    REPO_URL: 'https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/',
    PROFILE_URL_PATTERN: 'https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/?profileId='
  }
};

// Make config available globally
window.CONFIG = CONFIG;
