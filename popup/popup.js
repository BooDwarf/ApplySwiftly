const btn = document.getElementById("autofillBtn");

document.getElementById("autofillBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Just send a message to the content script already sitting in the tab
  chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_AUTOFILL" });
});

document.getElementById("openOptions").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});