function $(id) { return document.getElementById(id); }

// Login
function login() {
  const u = $("user").value.trim();
  const p = $("pass").value.trim();

  if (!u || !p) {
    $("login-error").textContent = "Enter username and password.";
    return;
  }

  $("login-screen").classList.add("hidden");
  $("home-screen").classList.remove("hidden");
}

// Galaxy Mode
function toggleGalaxy() {
  document.body.classList.toggle("galaxy");
  document.body.classList.toggle("light");
}

// Upgrade buttons
function upgrade() {
  window.open("https://buy.stripe.com/4gMfZh8Kr19D3kUdvRc7u03", "_blank");
}

// Director Mode
function openDirector() {
  $("director-modal").classList.remove("hidden");
  $("director-error").textContent = "";
  $("director-code").value = "";
}

function closeDirector() {
  $("director-modal").classList.add("hidden");
}

function unlockDirector() {
  const code = $("director-code").value.trim();

  if (code === "8118") {
    $("director-status").textContent = "Director Mode unlocked.";
    $("director-modal").classList.add("hidden");

    // Auto-enable galaxy mode
    document.body.classList.add("galaxy");
    document.body.classList.remove("light");
  } else {
    $("director-error").textContent = "Incorrect passcode.";
  }
}
