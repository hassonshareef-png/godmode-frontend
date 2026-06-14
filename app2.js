// Helper
function $(id) {
  return document.getElementById(id);
}

// Hide all screens, then show one
function showMode(id) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach(s => s.classList.add("hidden"));
  $(id).classList.remove("hidden");
}

// ===============================
// LOGIN
// ===============================
function login() {
  const user = $("login-user").value.trim();
  const pass = $("login-pass").value.trim();

  if (!user || !pass) {
    $("login-error").textContent = "Enter username and password.";
    return;
  }

  if (user === "admin" && pass === "8118") {
    $("login-error").textContent = "";
    showMode("home-screen");
  } else {
    $("login-error").textContent = "Incorrect username or password.";
  }
}

// ===============================
// GALAXY / LIGHT TOGGLE
// ===============================
function toggleGalaxy() {
  document.body.classList.toggle("galaxy");
  document.body.classList.toggle("light");
}

// ===============================
// FREE MODE
// ===============================
function enterFree() {
  showMode("free-mode-screen");
}

// REAL QUICK PICK GENERATOR
function generateQuickPick() {
  const picks = [];
  while (picks.length < 5) {
    const n = Math.floor(Math.random() * 39) + 1;
    if (!picks.includes(n)) picks.push(n);
  }
  alert("Generated: " + picks.join(", "));
}

// ===============================
// GOD MODE
// ===============================
function enterGod() {
  showMode("god-mode-screen");
}

// ===============================
// UNIVERSE MODE
// ===============================
function enterUniverse() {
  document.body.classList.add("universe-mode");
  showMode("universe-mode-screen");
}

function exitUniverse() {
  document.body.classList.remove("universe-mode");
  showMode("home-screen");
}

// ===============================
// DIRECTOR MODE
// ===============================
function openDirector() {
  $("director-modal").classList.remove("hidden");
}

function closeDirector() {
  $("director-modal").classList.add("hidden");
}

function unlockDirector() {
  const code = $("director-pass").value.trim();

  if (code === "8118") {
    // Unlock FX
    document.body.classList.add("director-mode", "unlock-anim");

    // Show screen
    showMode("director-mode-screen");

    // Close modal
    $("director-modal").classList.add("hidden");

    // Remove animation after it plays
    setTimeout(() => {
      document.body.classList.remove("unlock-anim");
    }, 1500);

  } else {
    alert("Incorrect passcode.");
  }
}

// DIRECTOR CONSOLE
function openDirectorConsole() {
  alert("Director Console Activated — real tools coming next.");
}

// ===============================
// UPGRADE BUTTON
// ===============================
function upgrade() {
  window.open("https://buy.stripe.com/4gMfZh8Kr19D3kUdvRc7u03", "_blank");
}

