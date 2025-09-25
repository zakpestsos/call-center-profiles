/**
 * Configuration Management
 * Handles API credentials and application settings
 */

/**
 * Configuration constants
 */
const CONFIG = {
  // Wix API Settings
  WIX: {
    BASE_URL: 'https://www.wixapis.com',
    DATA_API_VERSION: 'v1',
    COLLECTIONS: {
      PROFILES: 'Profiles',
      TECHNICIANS: 'TechnicianList', 
      POLICIES: 'Policies',
      SERVICE_AREAS: 'ServiceAreas'
    }
  },
  
  // Profile URL Settings
  PROFILE: {
    BASE_URL: 'https://www.psosprofiles.com',
    ID_MIN: 1000,
    ID_MAX: 99999
  },
  
  // Sheet Settings
  SHEETS: {
    INPUT_SHEET_NAME: 'Client Input',
    TEMPLATE_SHEET_NAME: 'Template'
  },
  
  // API Rate Limiting
  RATE_LIMIT: {
    MAX_REQUESTS_PER_MINUTE: 60,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  }
};

/**
 * Sets up Wix API credentials securely
 * @param {string} siteId - Your Wix Site ID
 * @param {string} apiKey - Your Wix API Key
 * @param {string} accountId - Your Wix Account ID (optional)
 */
function setupWixCredentials(siteId, apiKey, accountId = '') {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    // Validate inputs
    if (!siteId || !apiKey) {
      throw new Error('Site ID and API Key are required');
    }
    
    // Store credentials securely
    properties.setProperties({
      'WIX_SITE_ID': siteId.trim(),
      'WIX_API_KEY': apiKey.trim(),
      'WIX_ACCOUNT_ID': accountId.trim(),
      'CREDENTIALS_SET_DATE': new Date().toISOString()
    });
    
    Logger.log('Wix credentials configured successfully');
    
    // Test the connection
    const connectionTest = testWixConnection();
    if (connectionTest) {
      Logger.log('Credentials verified successfully');
      return true;
    } else {
      throw new Error('Credential verification failed');
    }
    
  } catch (error) {
    Logger.log('Error setting up Wix credentials: ' + error.toString());
    throw error;
  }
}

/**
 * Gets Wix configuration from secure storage
 * @returns {Object} Wix configuration object
 */
function getWixConfig() {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    const config = {
      siteId: properties.getProperty('WIX_SITE_ID'),
      apiKey: properties.getProperty('WIX_API_KEY'),
      accountId: properties.getProperty('WIX_ACCOUNT_ID'),
      baseUrl: CONFIG.WIX.BASE_URL
    };
    
    // Validate that credentials exist
    if (!config.siteId || !config.apiKey) {
      throw new Error('Wix credentials not found. Please run setupWixCredentials() first.');
    }
    
    return config;
    
  } catch (error) {
    Logger.log('Error getting Wix config: ' + error.toString());
    throw error;
  }
}

/**
 * Clears stored Wix credentials
 */
function clearWixCredentials() {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    properties.deleteProperty('WIX_SITE_ID');
    properties.deleteProperty('WIX_API_KEY');
    properties.deleteProperty('WIX_ACCOUNT_ID');
    properties.deleteProperty('CREDENTIALS_SET_DATE');
    
    Logger.log('Wix credentials cleared successfully');
    
  } catch (error) {
    Logger.log('Error clearing credentials: ' + error.toString());
    throw error;
  }
}

/**
 * Gets application configuration
 * @returns {Object} Application configuration
 */
function getAppConfig() {
  return {
    ...CONFIG,
    version: '1.0.0',
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Sets up default application settings
 */
function setupDefaultSettings() {
  try {
    const properties = PropertiesService.getScriptProperties();
    
    const defaultSettings = {
      'AUTO_GENERATE_PROFILE_ID': 'true',
      'VALIDATE_DATA_BEFORE_CREATION': 'true',
      'SEND_CONFIRMATION_EMAIL': 'false',
      'LOG_LEVEL': 'INFO',
      'BACKUP_DATA': 'true'
    };
    
    // Only set if not already configured
    Object.keys(defaultSettings).forEach(key => {
      if (!properties.getProperty(key)) {
        properties.setProperty(key, defaultSettings[key]);
      }
    });
    
    Logger.log('Default settings configured');
    
  } catch (error) {
    Logger.log('Error setting up default settings: ' + error.toString());
    throw error;
  }
}

/**
 * Gets a specific application setting
 * @param {string} settingName - The setting name
 * @param {string} defaultValue - Default value if setting not found
 * @returns {string} Setting value
 */
function getSetting(settingName, defaultValue = '') {
  try {
    const properties = PropertiesService.getScriptProperties();
    return properties.getProperty(settingName) || defaultValue;
  } catch (error) {
    Logger.log(`Error getting setting ${settingName}: ${error.toString()}`);
    return defaultValue;
  }
}

/**
 * Sets a specific application setting
 * @param {string} settingName - The setting name
 * @param {string} settingValue - The setting value
 */
function setSetting(settingName, settingValue) {
  try {
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty(settingName, settingValue.toString());
    Logger.log(`Setting ${settingName} updated successfully`);
  } catch (error) {
    Logger.log(`Error setting ${settingName}: ${error.toString()}`);
    throw error;
  }
}

/**
 * Gets all application settings
 * @returns {Object} All settings
 */
function getAllSettings() {
  try {
    const properties = PropertiesService.getScriptProperties();
    return properties.getProperties();
  } catch (error) {
    Logger.log('Error getting all settings: ' + error.toString());
    return {};
  }
}

/**
 * Exports configuration for backup
 * @returns {Object} Configuration backup
 */
function exportConfiguration() {
  try {
    const settings = getAllSettings();
    
    // Remove sensitive data from export
    const safeSettings = { ...settings };
    delete safeSettings.WIX_API_KEY;
    delete safeSettings.WIX_SITE_ID;
    delete safeSettings.WIX_ACCOUNT_ID;
    
    return {
      config: safeSettings,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
  } catch (error) {
    Logger.log('Error exporting configuration: ' + error.toString());
    throw error;
  }
}

/**
 * Validates the current configuration
 * @returns {Object} Validation result
 */
function validateConfiguration() {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  try {
    // Check Wix credentials
    const config = getWixConfig();
    if (!config.siteId || !config.apiKey) {
      validation.errors.push('Wix credentials not configured');
      validation.isValid = false;
    }
    
    // Check if input sheet exists
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const inputSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.INPUT_SHEET_NAME);
    if (!inputSheet) {
      validation.warnings.push('Input sheet template not found');
    }
    
    // Test API connection
    if (validation.isValid) {
      const connectionTest = testWixConnection();
      if (!connectionTest) {
        validation.errors.push('Wix API connection failed');
        validation.isValid = false;
      }
    }
    
  } catch (error) {
    validation.errors.push(`Configuration validation error: ${error.message}`);
    validation.isValid = false;
  }
  
  return validation;
}
