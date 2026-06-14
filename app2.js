// Simple helper
function $(id) {
  return document.getElementById(id);
}

// GALAXY / LIGHT TOGGLE
function toggleGalaxy() {
  document.body.classList.toggle("galaxy");
  document.body.classList.toggle("light");
}

// DIRECTOR MODE MODAL
function openDirector() {
  const modal = $("director-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeDirector() {
  const modal = $("director-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// DIRECTOR MODE UNLOCK
function unlockDirector() {
  const input = $("director-pass");
  if (!input) return;

  const code = input.value.trim();

  if (code === "8118") {
    // Director unlocked
    alert("Director Mode unlocked.");

    // Optional: switch body to a special director class
    document.body.classList.add("director-mode");

    const modal = $("director-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
  } else {
    alert("Incorrect passcode.");
  }
}

// UPGRADE BUTTON (if you add one later)
function upgrade() {
  window.open("https://buy.stripe.com/4gMfZh8Kr19D3kUdvRc7u03", "_blank");
}
