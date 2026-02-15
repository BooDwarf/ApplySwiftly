


(() => {
  const DEBUG = true;

  // Get profile from storage FIRST
  chrome.storage.local.get(["profile"], (result) => {
    if (!result.profile) {
      alert("Please set up your profile in extension settings.");
      return;
    }

    runAutofill(result.profile);
  });


  function runAutofill(profile) {

    const elements = Array.from(
      document.querySelectorAll("input, textarea")
    );

    let filledCount = 0;
    const filledFields = [];

    elements.forEach((el) => {
      if (!el.type) return;

      const type = el.type.toLowerCase();

      if (
        type === "hidden" ||
        type === "submit" ||
        type === "button" ||
        type === "search" ||
        type === "file"
      ) {
        return;
      }

      const labelText =
        el.labels?.[0]?.innerText ||
        el.closest("label")?.innerText ||
        el.getAttribute("aria-label") ||
        el.getAttribute("placeholder") ||
        "";

      const text = labelText.toLowerCase().trim();

      const nameAttr = (el.name || "").toLowerCase();
      const idAttr = (el.id || "").toLowerCase();

      if (!text && !nameAttr && !idAttr) return;

      // ===== MATCHING LOGIC =====

      if (
        text.includes("first name") ||
        nameAttr.includes("first") ||
        idAttr.includes("first")
      ) {
        fillField(el, profile.firstName);
      }

      else if (
        text.includes("last name") ||
        nameAttr.includes("last") ||
        idAttr.includes("last")
      ) {
        fillField(el, profile.lastName);
      }

      else if (text.includes("email") || nameAttr.includes("email")) {
        fillField(el, profile.email);
      }

      else if (
        text.includes("phone") ||
        text.includes("mobile") ||
        nameAttr.includes("phone")
      ) {
        fillField(el, profile.phone);
      }

      else if (text.includes("position")) {
        fillField(el, profile.position);
      }

      else if (text.includes("cover")) {
        fillField(el, profile.coverLetter);
      }
    });

    showToast(`ApplySwiftly filled ${filledCount} fields`);

    if (DEBUG) {
      console.group("🚀 ApplySwiftly Debug Report");
      console.log("Total fields filled:", filledCount);
      console.table(filledFields);
      console.groupEnd();
    }

    // ===== HELPERS =====

    function fillField(el, value) {
      if (!value) return;
      if (el.value && el.value.trim() !== "") return;

      el.focus();
      el.value = value;

      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));

      filledCount++;

      if (DEBUG) {
        filledFields.push({
          field:
            el.labels?.[0]?.innerText ||
            el.getAttribute("placeholder") ||
            el.name ||
            el.id ||
            "Unknown Field",
          value
        });
      }
    }

    function showToast(message) {
      const toast = document.createElement("div");
      toast.innerText = message;

      toast.style.position = "fixed";
      toast.style.bottom = "20px";
      toast.style.right = "20px";
      toast.style.background = "#111";
      toast.style.color = "#fff";
      toast.style.padding = "12px 16px";
      toast.style.borderRadius = "6px";
      toast.style.zIndex = "999999";
      toast.style.fontSize = "14px";

      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    }
  }
})();
