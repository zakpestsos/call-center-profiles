/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

/**
 * Utility class for common operations
 */
class Utils {
  
  /**
   * Generates a unique profile ID
   * @returns {number} Unique profile ID
   */
  static generateProfileId() {
    const min = CONFIG.PROFILE.ID_MIN;
    const max = CONFIG.PROFILE.ID_MAX;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Creates a URL-friendly slug from text
   * @param {string} text - Text to convert to slug
   * @returns {string} URL-friendly slug
   */
  static createSlug(text) {
    if (!text) return '';
    
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .substring(0, 50); // Limit length
  }
  
  /**
   * Validates email address format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email
   */
  static isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validates phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid phone
   */
  static isValidPhone(phone) {
    if (!phone) return false;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
  
  /**
   * Validates zip code format
   * @param {string} zipCode - Zip code to validate
   * @returns {boolean} True if valid zip code
   */
  static isValidZipCode(zipCode) {
    if (!zipCode) return false;
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode.toString());
  }
  
  /**
   * Cleans and formats text input
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  static cleanText(text) {
    if (!text) return '';
    return text.toString().trim().replace(/\s+/g, ' ');
  }
  
  /**
   * Formats a date for display
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  static formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  /**
   * Safely parses JSON string
   * @param {string} jsonString - JSON string to parse
   * @param {*} defaultValue - Default value if parsing fails
   * @returns {*} Parsed object or default value
   */
  static safeJsonParse(jsonString, defaultValue = null) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      Logger.log(`JSON parse error: ${error.toString()}`);
      return defaultValue;
    }
  }
  
  /**
   * Safely converts object to JSON string
   * @param {*} obj - Object to stringify
   * @param {string} defaultValue - Default value if stringify fails
   * @returns {string} JSON string or default value
   */
  static safeJsonStringify(obj, defaultValue = '{}') {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      Logger.log(`JSON stringify error: ${error.toString()}`);
      return defaultValue;
    }
  }
  
  /**
   * Delays execution for specified milliseconds
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Retries a function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxAttempts - Maximum retry attempts
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {*} Function result
   */
  static async retry(fn, maxAttempts = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        Logger.log(`Attempt ${attempt} failed: ${error.toString()}`);
        
        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await this.delay(delay);
        }
      }
    }
    
    throw lastError;
  }
  
  /**
   * Chunks an array into smaller arrays
   * @param {Array} array - Array to chunk
   * @param {number} size - Chunk size
   * @returns {Array} Array of chunks
   */
  static chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  /**
   * Removes duplicates from array
   * @param {Array} array - Array to deduplicate
   * @param {string} key - Key to use for object arrays
   * @returns {Array} Deduplicated array
   */
  static removeDuplicates(array, key = null) {
    if (!Array.isArray(array)) return [];
    
    if (key) {
      const seen = new Set();
      return array.filter(item => {
        const keyValue = item[key];
        if (seen.has(keyValue)) {
          return false;
        }
        seen.add(keyValue);
        return true;
      });
    }
    
    return [...new Set(array)];
  }
  
  /**
   * Validates required fields in an object
   * @param {Object} obj - Object to validate
   * @param {Array} requiredFields - Array of required field names
   * @returns {Object} Validation result
   */
  static validateRequiredFields(obj, requiredFields) {
    const missing = [];
    const validation = { isValid: true, missingFields: [] };
    
    requiredFields.forEach(field => {
      if (!obj[field] || obj[field].toString().trim() === '') {
        missing.push(field);
      }
    });
    
    if (missing.length > 0) {
      validation.isValid = false;
      validation.missingFields = missing;
    }
    
    return validation;
  }
  
  /**
   * Logs message with timestamp and level
   * @param {string} message - Message to log
   * @param {string} level - Log level (INFO, WARN, ERROR)
   */
  static log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    Logger.log(logMessage);
    
    // Also log to console if available
    if (typeof console !== 'undefined') {
      console.log(logMessage);
    }
  }
  
  /**
   * Creates a hash from a string (simple hash function)
   * @param {string} str - String to hash
   * @returns {number} Hash value
   */
  static simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash);
  }
  
  /**
   * Escapes HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  static escapeHtml(text) {
    if (!text) return '';
    
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    
    return text.replace(/[&<>"']/g, m => map[m]);
  }
  
  /**
   * Converts camelCase to human readable format
   * @param {string} str - camelCase string
   * @returns {string} Human readable string
   */
  static camelToHuman(str) {
    if (!str) return '';
    
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
  
  /**
   * Generates a random string
   * @param {number} length - Length of random string
   * @param {string} charset - Character set to use
   * @returns {string} Random string
   */
  static randomString(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
}

/**
 * Error handling utility
 */
class ErrorHandler {
  
  /**
   * Handles and logs errors consistently
   * @param {Error} error - Error to handle
   * @param {string} context - Context where error occurred
   * @param {boolean} rethrow - Whether to rethrow the error
   */
  static handle(error, context = 'Unknown', rethrow = true) {
    const errorMessage = `Error in ${context}: ${error.message}`;
    
    Utils.log(errorMessage, 'ERROR');
    Utils.log(`Stack trace: ${error.stack}`, 'ERROR');
    
    // Log to Google Apps Script logger
    Logger.log(errorMessage);
    
    if (rethrow) {
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Creates a user-friendly error message
   * @param {Error} error - Original error
   * @param {string} userContext - User-friendly context
   * @returns {string} User-friendly error message
   */
  static getUserMessage(error, userContext = 'processing your request') {
    const genericMessage = `An error occurred while ${userContext}. Please try again or contact support if the problem persists.`;
    
    // Don't expose technical details to users
    return genericMessage;
  }
}

// Export utilities for global access
this.Utils = Utils;
this.ErrorHandler = ErrorHandler;
