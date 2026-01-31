// Configuration file for Google Sheets and Wix integration
const CONFIG = {
    // Google Sheets Configuration
    GOOGLE_SHEETS: {
        // Updated with your actual Google Apps Script Web App URL
        WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbyGFqmRCOnronrHHgyKXp4ylPYG8DqBQ2CUY9bQli3IRFU0jH5pX_G8zzIDqASFsmZ_Dw/exec', // Deployment v125 - Alerts working NOW
        
        // Alternative: Direct Google Sheets API (requires API key)
        API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',
        SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',
        
        // Master profile sheet for data retrieval
        MASTER_SHEET_ID: 'YOUR_MASTER_SHEET_ID'
    },

    // Wix Configuration
    WIX: {
        // Set to true when deployed to Wix, false for local testing
        IS_WIX_ENVIRONMENT: false,
        
        // Wix CMS Collection IDs (replace with your actual collection IDs)
        COLLECTIONS: {
            CLIENTS: 'clients',
            SERVICES: 'services', 
            TECHNICIANS: 'technicians',
            POLICIES: 'policies',
            SERVICE_AREAS: 'serviceAreas'
        }
    },

    // Weather API Configuration
    WEATHER: {
        // Using Open-Meteo (free, no API key required)
        BASE_URL: 'https://api.open-meteo.com/v1/forecast',
        GEOCODING_URL: 'https://nominatim.openstreetmap.org/search'
    },

    // Default fallback data for testing
    FALLBACK_DATA: {
        companyName: "Test Company",
        location: "Dallas, TX",
        timezone: "Central",
        officeInfo: {
            phone: "(555) 123-4567",
            email: "info@testcompany.com",
            website: "https://testcompany.com",
            fieldRoutesLink: "https://fieldroutes.com",
            physicalAddress: "123 Test Street\nDallas, TX 75201",
            officeHours: "Monday-Friday: 8 AM - 5 PM"
        },
        bulletin: "Test bulletin - no live data connection",
        pestsNotCovered: "Test pests not covered list"
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
