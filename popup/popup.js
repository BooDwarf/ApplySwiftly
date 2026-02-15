const btn = document.getElementById("autofillBtn");

document.getElementById("autofillBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content/content.js"]
  });
});

document.getElementById("openOptions").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
