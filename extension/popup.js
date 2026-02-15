const scanBtn = document.getElementById("scanBtn");
const resultsContainer = document.getElementById("results");

scanBtn.addEventListener("click", async () => {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const activeTab = tabs[0];
  if (!activeTab || !activeTab.id) return;

  try {
    const response = await chrome.tabs.sendMessage(activeTab.id, {
      action: "scanFields"
    });

    renderResults(response.fields || []);
  } catch (err) {
    resultsContainer.innerHTML = "<p>Could not scan this page.</p>";
  }
});

function renderResults(fields) {
  if (!fields.length) {
    resultsContainer.innerHTML = "<p>No fields detected.</p>";
    return;
  }

  const list = document.createElement("ul");
  list.style.paddingLeft = "16px";

  fields.forEach((field) => {
    const item = document.createElement("li");
    item.textContent = `${field.label || "[No Label]"} (${field.type})`;
    list.appendChild(item);
  });

  resultsContainer.innerHTML = "";
  resultsContainer.appendChild(list);
}
