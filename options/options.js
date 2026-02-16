const form = document.getElementById("profileForm");
const status = document.getElementById("status");

const fieldIds = [
  "firstName", "lastName", "email", "phone", 
  "position", "linkedin", "coverLetter", "gender", "workAuth"
];

// Load existing profile
chrome.storage.local.get(["profile"], (result) => {
  if (result.profile) {
    const p = result.profile;
    fieldIds.forEach(id => {
      const element = document.getElementById(id);
      if (element && p[id] !== undefined) {
        element.value = p[id];
      }
    });
  }
});

// Save profile
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const profile = {};
  fieldIds.forEach(id => {
    profile[id] = document.getElementById(id).value.trim();
  });

  chrome.storage.local.set({ profile }, () => {
    status.textContent = "Profile saved successfully!";
    status.style.color = "green";
    setTimeout(() => status.textContent = "", 2000);
  });
});