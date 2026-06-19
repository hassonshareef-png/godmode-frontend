const UI = {
  show(screen) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screen + "-screen").classList.add("active");

    // MODE SWITCHING FOR THEME
    if (["free","pick3","pick4"].includes(screen)) {
      document.body.className = "galaxy mode-basic";
    }
    if (screen === "god") {
      document.body.className = "galaxy mode-god";
    }
    if (screen === "universe") {
      document.body.className = "galaxy mode-universe";
    }
    if (screen === "director") {
      document.body.className = "galaxy mode-director";
    }
  },

  login() {
    const u = document.getElementById("login-user").value.trim();
    const p = document.getElementById("login-pass").value.trim();

    if (!u || !p) {
      document.getElementById("login-error").textContent = "Missing credentials";
      return;
    }

    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("home-screen").classList.add("active");
    document.body.className = "galaxy mode-basic";
  },

  unlockPremium() {
    document.getElementById("premium-overlay").classList.add("hidden");
  },

  closePremium() {
    document.getElementById("premium-overlay").classList.add("hidden");
  },

  quickPick() {
    const n = Math.floor(Math.random() * 1000);
    document.getElementById("free-output").textContent = "Quick Pick: " + n;
  },

  backendPrediction(out, premium=false) {
    document.getElementById(out).textContent =
      premium ? "Premium Engine Activated..." : "Free Engine Activated...";
  },

  director() {
    const seed = document.getElementById("director-seed").value.trim();
    document.getElementById("director-output").textContent =
      "Director compiled with seed: " + seed;
  },

  pick3() {
    const v = document.getElementById("pick3-input").value.trim();
    document.getElementById("pick3-output").textContent = "Pick 3 submitted: " + v;
  },

  pick4() {
    const v = document.getElementById("pick4-input").value.trim();
    document.getElementById("pick4-output").textContent = "Pick 4 submitted: " + v;
  }
};

