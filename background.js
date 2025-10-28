// background.js
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-spotlight") {
    // Send a message to the active tab to toggle the overlay
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0]) {
      
      chrome.runtime.onInstalled.addListener(() => {
  console.log("Command Line extension installed!");
});

      chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_OVERLAY" }).catch((e) => {
        // Content script might not be ready yet; ignore errors silently
        console.debug("Could not send message to tab:", e);
      });
    }
  }
});
