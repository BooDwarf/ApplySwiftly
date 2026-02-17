(() => {
  const DEBUG = true;

  // 1. Messaging Listener
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "TRIGGER_AUTOFILL") {
      initAutofill();
    }
  });

  // 2. The "Brain" - Merges Profile + Custom Fields
  async function initAutofill() {
    chrome.storage.local.get(["profile", "customFields"], (result) => {
      if (!result.profile) {
        showToast("Please set up your profile first.");
        return;
      }

      // Start with Core Rules
      let activeRules = [
        { id: "firstName",   hints: ["first name", "fname", "given name", "first"] },
        { id: "lastName",    hints: ["last name", "lname", "family name", "last"] },
        { id: "email",       hints: ["email", "e-mail", "mail address"] },
        { id: "phone",       hints: ["phone", "mobile", "tel", "contact"] },
        { id: "position",    hints: ["position", "job title", "role"] },
        { id: "linkedin",    hints: ["linkedin", "social profile", "link", "url"] },
        { id: "coverLetter", hints: ["cover letter", "message", "suitability"] },
        { id: "gender",      hints: ["gender", "sex", "identify"] },
        { id: "workAuth",    hints: ["authorized", "work authorization", "legally"] }
      ];

      // Inject Custom Rules from User
      if (result.customFields && Array.isArray(result.customFields)) {
        result.customFields.forEach(cf => {
          activeRules.push({
            id: cf.label, 
            hints: [cf.label.toLowerCase()], // The user's question is the hint
            isCustom: true,
            customValue: cf.value
          });
        });
      }

      runAutofill(result.profile, activeRules);
    });
  }

  // 3. The "Executioner" - Actually fills the page
  function runAutofill(profile, activeRules) {
    const elements = Array.from(document.querySelectorAll("input, textarea, select"));
    let filledCount = 0;
    const filledFields = [];

    elements.forEach((el) => {
      const type = el.type?.toLowerCase();
      if (["hidden", "submit", "button", "search", "file"].includes(type)) return;

      // Scan the field for clues
      const labelText = (el.labels?.[0]?.innerText || el.closest("label")?.innerText || "").toLowerCase();
      const placeholder = (el.getAttribute("placeholder") || "").toLowerCase();
      const ariaLabel = (el.getAttribute("aria-label") || "").toLowerCase();
      const nameAttr = (el.name || "").toLowerCase();
      const idAttr = (el.id || "").toLowerCase();
      const combinedSearchArea = `${labelText} ${placeholder} ${ariaLabel} ${nameAttr} ${idAttr}`;

      // FIND A MATCH
      const matchedRule = activeRules.find(rule => 
        rule.hints.some(hint => combinedSearchArea.includes(hint))
      );

      if (matchedRule) {
        // DECIDE VALUE: Is it from the main profile or a custom field?
        const finalValue = matchedRule.isCustom ? matchedRule.customValue : profile[matchedRule.id];

        if (finalValue) {
          if (el.tagName.toLowerCase() === "select") {
            fillSelectField(el, finalValue, matchedRule.id);
          } else {
            fillTextField(el, finalValue, matchedRule.id);
          }
          filledCount++;
          filledFields.push({ field: matchedRule.id, value: finalValue });
        }
      }
    });

    showToast(`ApplySwiftly filled ${filledCount} fields`);
    if (DEBUG) console.table(filledFields);
  }

  // --- HELPERS (Logic remains the same) ---

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
    }
  }

  function fillTextField(el, value, ruleId) {
    if (!value || (el.value && el.value.trim() !== "")) return;
    el.value = value;
    triggerEvents(el);
  }

  function triggerEvents(el) {
    el.focus();
    ["input", "change", "blur"].forEach(type => el.dispatchEvent(new Event(type, { bubbles: true })));
    el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
  }

  function showToast(message) {
    const existing = document.getElementById("apply-swiftly-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.id = "apply-swiftly-toast";
    toast.innerText = message;
    Object.assign(toast.style, {
      position: "fixed", bottom: "20px", right: "20px",
      background: "#333", color: "#fff", padding: "10px 20px",
      borderRadius: "8px", zIndex: "10000", fontFamily: "sans-serif"
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
})();