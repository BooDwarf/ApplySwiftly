const form = document.getElementById("profileForm");
const status = document.getElementById("status");
const customFieldsContainer = document.getElementById("customFieldsContainer");
const addFieldBtn = document.getElementById("addFieldBtn");

const fieldIds = [
  "firstName", "lastName", "email", "phone", 
  "position", "linkedin", "coverLetter", "gender", "workAuth"
];

// --- 1. THE REPEATER LOGIC (New) ---

function createFieldRow(label = "", value = "") {
  const row = document.createElement("div");
  row.className = "custom-field-row";
  
  row.innerHTML = `
    <input type="text" class="cf-label" placeholder="Question (e.g. Sponsorship)" value="${label}">
    <input type="text" class="cf-value" placeholder="Your Answer" value="${value}">
    <button type="button" class="remove-btn">X</button>
  `;

  row.querySelector(".remove-btn").addEventListener("click", () => {
    row.remove();
  });

  customFieldsContainer.appendChild(row);
}

addFieldBtn.addEventListener("click", () => createFieldRow());

// --- 2. LOADING DATA ---

chrome.storage.local.get(["profile", "customFields"], (result) => {
  // Load Standard Profile
  if (result.profile) {
    const p = result.profile;
    fieldIds.forEach(id => {
      const element = document.getElementById(id);
      if (element && p[id] !== undefined) {
        element.value = p[id];
      }
    });
  }

  // Load Custom Fields (New)
  if (result.customFields && Array.isArray(result.customFields)) {
    result.customFields.forEach(cf => {
      createFieldRow(cf.label, cf.value);
    });
  }
});

// --- 3. SAVING DATA ---

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Gather Standard Profile
  const profile = {};
  fieldIds.forEach(id => {
    profile[id] = document.getElementById(id).value.trim();
  });

  // Gather Custom Fields (New)
  const customFields = [];
  const rows = document.querySelectorAll(".custom-field-row");
  rows.forEach(row => {
    const label = row.querySelector(".cf-label").value.trim();
    const value = row.querySelector(".cf-value").value.trim();
    if (label) {
      customFields.push({ label, value });
    }
  });

  // Save everything together
  chrome.storage.local.set({ profile, customFields }, () => {
    status.textContent = "Profile and Custom Questions saved!";
    status.style.color = "green";
    setTimeout(() => (status.textContent = ""), 2000);
  });
});