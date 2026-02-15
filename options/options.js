const form = document.getElementById("profileForm");
const status = document.getElementById("status");

// Load existing profile
chrome.storage.local.get(["profile"], (result) => {
  if (result.profile) {
    const p = result.profile;
    document.getElementById("firstName").value = p.firstName || "";
    document.getElementById("lastName").value = p.lastName || "";
    document.getElementById("email").value = p.email || "";
    document.getElementById("phone").value = p.phone || "";
    document.getElementById("position").value = p.position || "";
    document.getElementById("coverLetter").value = p.coverLetter || "";
  }
});

// Save profile
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const profile = {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    position: position.value.trim(),
    coverLetter: coverLetter.value.trim()
  };

  chrome.storage.local.set({ profile }, () => {
    status.textContent = "Profile saved successfully!";
    setTimeout(() => status.textContent = "", 2000);
  });
});
