function getFormFields() {
  const elements = Array.from(
    document.querySelectorAll("input, textarea, select")
  );

  return elements
    .filter((el) => {
      const type = el.type;

      if (type === "hidden" || type === "submit" || type === "button") {
        return false;
      }

      if (type === "search") return false;

      if (type === "file") return false;

      return true;
    })
    .map((el) => {
      const label =
        el.labels?.[0]?.innerText ||
        el.closest("label")?.innerText ||
        el.getAttribute("aria-label") ||
        el.getAttribute("placeholder") ||
        "";

      return {
        tag: el.tagName,
        type: el.type || "",
        name: el.name || "",
        label: label.trim()
      };
    })
    .filter((field) => field.label.length > 0); // Remove empty label fields
}



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scanFields") {
    const fields = getFormFields();
    sendResponse({ fields });
  }
});
