(() => {
  const DEBUG = true;

  const FIELD_RULES = [
    { id: "firstName",   hints: ["first name", "fname", "given name", "first"] },
    { id: "lastName",    hints: ["last name", "lname", "family name", "last"] },
    { id: "email",       hints: ["email", "e-mail", "mail address"] },
    { id: "phone",       hints: ["phone", "mobile", "tel", "contact"] },
    { id: "position",    hints: ["position", "job title", "role"] },
    { id: "linkedin",    hints: ["linkedin", "social profile", "link"] },
    { id: "coverLetter", hints: ["cover letter", "message", "suitability"] },
    { id: "gender",      hints: ["gender", "sex", "identify"] },
    { id: "workAuth",    hints: ["authorized", "work authorization", "legally"] }
  ];

  // --- NEW: THE LISTENER ---
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "TRIGGER_AUTOFILL") {
      initAutofill();
    }
  });

  function initAutofill() {
    chrome.storage.local.get(["profile"], (result) => {
      if (!result.profile) {
        alert("Please set up your profile in extension settings.");
        return;
      }
      runAutofill(result.profile);
    });
  }

  // ... (Keep your FIELD_RULES and Messaging Listener the same)

function runAutofill(profile) {
  // 1. Updated Selector: Now includes 'select'
  const elements = Array.from(document.querySelectorAll("input, textarea, select"));
  let filledCount = 0;
  const filledFields = [];

  elements.forEach((el) => {
    const tagName = el.tagName.toLowerCase();
    const type = el.type?.toLowerCase();

    // Skip irrelevant inputs
    if (["hidden", "submit", "button", "search", "file"].includes(type)) return;

    // Metadata for matching
    const labelText = (el.labels?.[0]?.innerText || el.closest("label")?.innerText || "").toLowerCase();
    const placeholder = (el.getAttribute("placeholder") || "").toLowerCase();
    const ariaLabel = (el.getAttribute("aria-label") || "").toLowerCase();
    const nameAttr = (el.name || "").toLowerCase();
    const idAttr = (el.id || "").toLowerCase();
    const combinedSearchArea = `${labelText} ${placeholder} ${ariaLabel} ${nameAttr} ${idAttr}`;

    const matchedRule = FIELD_RULES.find(rule => 
      rule.hints.some(hint => combinedSearchArea.includes(hint))
    );

    if (matchedRule && profile[matchedRule.id]) {
      // 2. Branching Logic: Handle Select vs. Input
      if (tagName === "select") {
        fillSelectField(el, profile[matchedRule.id], matchedRule.id);
      } else {
        fillTextField(el, profile[matchedRule.id], matchedRule.id);
      }
    }
  });

  // --- NEW: SPECIALIZED SELECT HANDLER ---
  function fillSelectField(el, value, ruleId) {
    const options = Array.from(el.options);
    const lowerValue = value.toLowerCase();

    const targetOption = options.find(opt => 
      opt.value.toLowerCase() === lowerValue || 
      opt.text.toLowerCase().includes(lowerValue)
    );

    if (targetOption) {
      el.value = targetOption.value;
      triggerEvents(el);
      filledCount++;
      filledFields.push({ field: ruleId, type: 'dropdown', value: targetOption.text });
    }
  }

  function triggerEvents(el) {
  el.focus();
  
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  
  el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
  el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
  
  el.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function fillTextField(el, value, ruleId) {
    if (!value || (el.value && el.value.trim() !== "")) return;
    el.value = value;
    triggerEvents(el);
    filledCount++;
    filledFields.push({ field: ruleId, type: 'text', value: value });
  }

  showToast(`ApplySwiftly filled ${filledCount} fields`);

  if (DEBUG) {
    console.group("🚀 ApplySwiftly Debug Report");
    console.table(filledFields);
    console.groupEnd();
  }
}

  function showToast(message) {
    const existingToast = document.getElementById("apply-swiftly-toast");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.id = "apply-swiftly-toast";
    toast.innerText = message;
    Object.assign(toast.style, {
      position: "fixed", bottom: "20px", right: "20px",
      background: "#111", color: "#fff", padding: "12px 16px",
      borderRadius: "6px", zIndex: "999999", fontSize: "14px"
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
})();