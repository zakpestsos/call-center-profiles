/**
 * Main Google Apps Script file for Wix Client Profile Automation
 * This file contains the core functions for creating and managing client profiles
 */

/**
 * Web App Entry Point - Serves the client input form
 * This function is called when someone visits the web app URL
 */
function doGet(e) {
  try {
    Logger.log('doGet called with parameters:', e.parameter);
    
    // Test with a simple HTML first
    if (e.parameter && e.parameter.test) {
      return HtmlService.createHtmlOutput('<h1>Test Page Works!</h1><p>The web app is functioning.</p>')
        .setTitle('Test')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    // Serve the client input form
    return HtmlService.createHtmlOutputFromFile('client-input-form')
      .setTitle('Client Profile Creator')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    Logger.log('Error in doGet:', error);
    // Return detailed error information
    return HtmlService.createHtmlOutput(
      '<h1>Error Loading Form</h1>' +
      '<p><strong>Error:</strong> ' + error.toString() + '</p>' +
      '<p><strong>Stack:</strong> ' + (error.stack || 'No stack trace') + '</p>' +
      '<p><a href="?test=1">Try Test Page</a></p>'
    ).setTitle('Error');
  }
}

/**
 * Handle form submissions from the client input form
 */
function submitClientProfile(clientData) {
  try {
    Logger.log('Processing client profile submission:', clientData);
    
    // Basic validation
    if (!clientData.firstName || !clientData.lastName || !clientData.email) {
      throw new Error('First name, last name, and email are required');
    }
    
    // Create a simple response for now
    const result = {
      success: true,
      profileId: clientData.profileId || 'CLP-' + Date.now(),
      message: 'Client profile created successfully',
      clientData: clientData
    };
    
    Logger.log('Client profile created:', result);
    return result;
    
  } catch (error) {
    Logger.log('Error creating client profile:', error);
    throw new Error('Failed to create client profile: ' + error.message);
  }
}
