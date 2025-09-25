/**
 * Ultra-minimal test - no library dependencies
 */
function doGet() {
  return HtmlService.createHtmlOutput('SUCCESS: Web app works without library issues!')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
