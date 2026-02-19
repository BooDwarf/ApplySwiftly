(() => {
  const DEBUG = true;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "TRIGGER_AUTOFILL") initAutofill();
  });

  async function initAutofill() {
    chrome.storage.local.get(["profile", "customFields"], (result) => {
      if (!result.profile) {
        showToast("Please set up your profile first.");
        return;
      }

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

      if (result.customFields) {
        result.customFields.forEach(cf => {
          activeRules.push({
            id: cf.label, 
            hints: [cf.label.toLowerCase()], 
            isCustom: true,
            customValue: cf.value
          });
        });
      }
      runAutofill(result.profile, activeRules);
    });
  }

  function runAutofill(profile, activeRules) {
    // Select all inputs and labels (sometimes labels are the target in JotForm)
    const inputs = Array.from(document.querySelectorAll("input, textarea, select"));
    let filledCount = 0;

    inputs.forEach((el) => {
      const type = el.type?.toLowerCase();
      if (["hidden", "submit", "button", "search", "file"].includes(type)) return;

      // 1. Identify the Question Context
      const groupContainer = el.closest('[data-component="radio"], [role="group"], .form-line');
      const questionText = (
        groupContainer?.querySelector('.form-label')?.innerText || 
        el.labels?.[0]?.innerText || 
        el.closest("label")?.innerText || ""
      ).toLowerCase();
      
      const rawSearch = `${questionText} ${el.name} ${el.id} ${el.getAttribute('placeholder') || ""}`.toLowerCase();
      const cleanSearchArea = rawSearch.replace(/[^\w\s]/g, ' ');

      const matchedRule = activeRules.find(rule => {
        return rule.hints.some(hint => {
          const hintWords = hint.split(/\s+/).filter(w => w.length > 2);
          return hintWords.every(word => cleanSearchArea.includes(word));
        });
      });

      if (matchedRule) {
        const finalValue = matchedRule.isCustom ? matchedRule.customValue : profile[matchedRule.id];
        if (!finalValue) return;
        const lowerValue = finalValue.toLowerCase().trim();

        // 2. RADIO/CHECKBOX - THE "AGGRESSIVE CONTAINER" FIX
        if (type === "radio" || type === "checkbox") {
          // JotForm specific: look at the span wrapping the radio
          const wrapper = el.closest(".form-radio-item, .form-checkbox-item, div, span");
          const choiceText = (wrapper?.innerText || "").toLowerCase();
          
          if (choiceText.includes(lowerValue) || lowerValue.includes(choiceText.trim())) {
            // Check the internal state
            el.checked = true;
            
            // Dispatch click to the visible element (the wrapper or label)
            const targetToClick = el.labels?.[0] || wrapper || el;
            targetToClick.click();
            
            triggerEvents(el);
            triggerEvents(targetToClick);
            filledCount++;
          }
        } 
        // 3. SELECTS & TEXT (Standard Logic)
        else if (el.tagName.toLowerCase() === "select") {
          const target = Array.from(el.options).find(opt => 
            opt.text.toLowerCase().includes(lowerValue) || lowerValue.includes(opt.text.toLowerCase())
          );
          if (target) {
            el.value = target.value;
            triggerEvents(el);
            filledCount++;
          }
        } 
        else if (!el.value || el.value.trim() === "") {
          el.value = finalValue;
          triggerEvents(el);
          filledCount++;
        }
      }
    });
    showToast(`ApplySwiftly filled ${filledCount} fields`);
  }

  function triggerEvents(el) {
    if (!el) return;
    el.focus();
    const events = ["input", "change", "blur", "mousedown", "mouseup", "click"];
    events.forEach(t => el.dispatchEvent(new Event(t, { bubbles: true })));
  }

  function showToast(message) {
    const existing = document.getElementById("apply-swiftly-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.id = "apply-swiftly-toast";
    toast.innerText = message;
    Object.assign(toast.style, {
      position: "fixed", bottom: "20px", right: "20px",
      background: "#333", color: "#fff", padding: "12px 20px",
      borderRadius: "8px", zIndex: "10000", fontFamily: "sans-serif"
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
})();